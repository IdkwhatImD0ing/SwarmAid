from swarm import Swarm, Agent
from swarm.types import Result
from dotenv import load_dotenv
import os
load_dotenv()
from openai import OpenAI
openai_client = OpenAI()
import math
import heapq
from typing import Dict, List, Tuple

# Initialize the Swarm client
client = Swarm()

dispatch_agent_instructions = """
You are a Dispatch Agent responsible dispatching announcements to the corresponding locations.

You will be a list of elements in the format:
(Origin, Destination, Category, [Items])
This is already in the context variables, simply call the send_dispatch_multiple function.

Your task is to call the function to dispatch all the messages to the users.
"""

# Define the instructions for the Supply Agent
supply_agent_instructions = """
You are a Supply Agent responsible for processing surplus and in demand items for a food sharing network.

You will answer user queries about what items are available at a given location, or what items are needed at a given location.
The user will tell you what the location is and what items they have or need.
1. Parse the string into individual item categories such as fruits, vegetables, meat, etc. Use this for groups.
    - If its a food item, try your best to categorize it.
    - Valid categories are: fruits, vegetables, grains, dairy, meat, seafood, baked goods.
    - For example, if the user says they need poultry, this should be parsed into the category "meat".
    - If the user says they have strawberries and apples, this should be parsed into the category "fruits".
2. Use the food_mapping to map each item to its category, this should be empty if the type is demand.
3. Transfer the structured data to the Logistics Agent.

When calling save_items, make sure to always include the groups parameter.
"""

logistics_agent_instructions = """
You are a Logistics Agent responsible for coordinating the delivery of surplus items to demand locations.

You will be given a dictionary of locations, each with their surplus and demand data. This is already in the context variables, simply call the logistics_agent_match function.
Your task is to use the given functions to calculate the optimal routes and distances for the deliveries.
Then explain the results in a friendly and engaging manner.

If there are no assignments found, explain to the user that there were no surplus, or demand found. And their supply/demand will be added to the database.
"""


class AgentSwarm:

    def __init__(self, db, manager, websocket):
        self.db = db
        self.manager = manager
        self.websocket = websocket
        self.dispatch_agent = Agent(
            name="Dispatch Agent",
            instructions=dispatch_agent_instructions,
            functions=[self.send_dispatch_multiple]
        )
        self.logistics_agent = Agent(
            name="Logistics Agent",
            instructions=logistics_agent_instructions,
            functions=[self.logistics_agent_match]
        )
        self.supply_agent = Agent(
            name="Supply Agent",
            instructions=supply_agent_instructions,
            functions=[self.save_items]
        )

    def run(self, messages, stream=False):
        
        response = client.run(
            agent=self.supply_agent,
            messages=messages,
            stream=stream
        )
        return response

    def send_dispatch_multiple(self, context_variables):
        """
        This function sends dispatch messages to the origin and destination for each dispatch in the context variables.
        It already sends twice per dispatch, so no need to call it twice.

        Args:
            None

        Returns:
            str: A message indicating that all dispatch messages have been sent.
        """
        context_variables = self.db
        for dispatch in context_variables["dispatchs"]:
            self.send_dispatch(context_variables, dispatch)
            
        # Remove the 'dispatchs' array after dispatching
        if "dispatchs" in self.db:
            del self.db["dispatchs"]

        return "Finished dispatching all items."

    def send_dispatch(self, context_variables, dispatch):
        origin, destination, category, items = dispatch
        
        sending_prompt = f"""
        Write a friendly text message to the {origin} location, notifying them that {destination} will be coming to pick up {items} of {category} from them. They should be prepared to package the items neatly.
        """
        
        receiving_prompt = f"""
        Write a friendly text message to the {destination} location, notifying them the {origin} location has extra food of {category} that they can use. They have {items} available. They should be prepared to send someone to pick it up.
        
        Origin location: {context_variables["locations"][origin]["data"]["address"]}
        """
        
        sending_completion = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": sending_prompt}],
            temperature=0.8
        )
        
        print(sending_completion.choices[0].message.content)
        
        receiving_completion = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": receiving_prompt}],
            temperature=0.8
        )   
        
        print(receiving_completion.choices[0].message.content)
        return True
    
    def logistics_agent_match(self) -> Tuple[List[Tuple[str, str, str, List[str]]], 
           Dict[str, Dict[str, List[str]]], 
           Dict[str, List[str]]]:
        """
        Match suppliers to demanders based on category and proximity.

        Args:
            locations: Dictionary containing suppliers and demanders data.

        Returns:
            assignments: List of tuples (supplier, demander, category, list of items assigned).
            remaining_supplies: Dictionary of suppliers with their remaining surplus_mapping.
            remaining_demands: Dictionary of demanders with their remaining unmet categories.
        """
        suppliers = {}
        demanders = {}
        demand_centers = {}  # category: list of demanders
        
        locations = self.db
        # Separate suppliers and demanders
        for name, info in locations["locations"].items():
            if "surplus_mapping" in info:
                suppliers[name] = {
                    "surplus_mapping": {k: v.copy() for k, v in info["surplus_mapping"].items()},
                    "data": info["data"].copy()
                }
            elif "demand" in info:
                # Count the number of demands per category
                demand_count = {}
                for category in info["demand"]:
                    if category in demand_count:
                        demand_count[category] += 1
                    else:
                        demand_count[category] = 1
                    # Populate demand_centers
                    if category in demand_centers:
                        demand_centers[category].append(name)
                    else:
                        demand_centers[category] = [name]
                demanders[name] = {
                    "demand_count": demand_count.copy(),
                    "data": info["data"].copy()
                }
        
        # Initialize priority queue
        # Each entry is (distance, demander_name, supplier_name, category)
        pq = []
        
        # Populate the priority queue
        for category, demander_list in demand_centers.items():
            for demander in demander_list:
                if demander not in demanders:
                    continue  # Skip if demander not in dataset
                if category not in demanders[demander]["demand_count"]:
                    continue  # Skip if demander doesn't need this category
                for supplier, s_info in suppliers.items():
                    if category in s_info["surplus_mapping"]:
                        distance = calculate_distance(
                            demanders[demander]["data"]["lat"],
                            demanders[demander]["data"]["lon"],
                            suppliers[supplier]["data"]["lat"],
                            suppliers[supplier]["data"]["lon"]
                        )
                        heapq.heappush(pq, (distance, demander, supplier, category))
        
        assignments = []  # List to store assignments
        
        # Process the priority queue
        while pq:
            distance, demander, supplier, category = heapq.heappop(pq)
            
            # Check if the supplier still has surplus in this category
            if category not in suppliers[supplier]["surplus_mapping"] or not suppliers[supplier]["surplus_mapping"][category]:
                continue  # No surplus left in this category
            
            # Check if the demander still needs this category
            if category not in demanders[demander]["demand_count"] or demanders[demander]["demand_count"][category] <= 0:
                continue  # Demand already fulfilled
            
            # Determine how many items can be assigned
            quantity_available = len(suppliers[supplier]["surplus_mapping"][category])
            quantity_needed = demanders[demander]["demand_count"][category]
            assigned_quantity = min(quantity_available, quantity_needed)
            
            # Assign specific items
            assigned_items = suppliers[supplier]["surplus_mapping"][category][:assigned_quantity]
            
            # Record the assignment
            assignments.append((supplier, demander, category, assigned_items))
            
            # Update supplier's surplus
            suppliers[supplier]["surplus_mapping"][category] = suppliers[supplier]["surplus_mapping"][category][assigned_quantity:]
            if not suppliers[supplier]["surplus_mapping"][category]:
                del suppliers[supplier]["surplus_mapping"][category]  # Remove category if no items left
            
            # Update demander's needs
            demanders[demander]["demand_count"][category] -= assigned_quantity
            if demanders[demander]["demand_count"][category] == 0:
                del demanders[demander]["demand_count"][category]  # Remove category if demand fulfilled
        
        # Prepare remaining supplies
        remaining_supplies = {}
        for supplier, s_info in suppliers.items():
            if s_info["surplus_mapping"]:
                remaining_supplies[supplier] = s_info["surplus_mapping"]
        
        # Prepare remaining demands
        remaining_demands = {}
        for demander, d_info in demanders.items():
            if d_info["demand_count"]:
                remaining_demands[demander] = list(d_info["demand_count"].keys())
            
        if len(assignments) ==  0:
            return Result(
                value="No assignments found.",
            )
            
        for assignment in assignments:
            supplier, demander, category, items = assignment

            # Remove items from supplier's surplus_mapping
            if supplier in self.db["locations"]:
                if "surplus_mapping" in self.db["locations"][supplier]:
                    # Remove the assigned items
                    current_items = self.db["locations"][supplier]["surplus_mapping"].get(category, [])
                    updated_items = current_items[assigned_quantity:]
                    if updated_items:
                        self.db["locations"][supplier]["surplus_mapping"][category] = updated_items
                    else:
                        # If no items left in category, remove the category
                        del self.db["locations"][supplier]["surplus_mapping"][category]
                # Optionally, remove the category from 'surplus' if 'surplus_mapping' is empty for that category
                if "surplus" in self.db["locations"][supplier]:
                    if category in self.db["locations"][supplier]["surplus"]:
                        # Remove the category from 'surplus' if no items remain
                        if category not in self.db["locations"][supplier]["surplus_mapping"]:
                            self.db["locations"][supplier]["surplus"].remove(category)

            # Remove items from demander’s demand
            if demander in self.db["locations"]:
                if "demand" in self.db["locations"][demander]:
                    # Remove the assigned category as many times as items were assigned
                    for _ in range(len(items)):
                        try:
                            self.db["locations"][demander]["demand"].remove(category)
                        except ValueError:
                            # In case the category isn't present enough times
                            pass

        self.db['dispatchs'] = assignments
        return Result(
            value=f"Assignments: {assignments}, Remaining Supplies: {remaining_supplies}, Remaining Demands: {remaining_demands}",
            agent=self.dispatch_agent
        )


    def save_items(self, context_variables, location_name: str, type: str, groups: list[str], food_mapping: dict = {}):
        """
        Processes and saves surplus or demand data for a given location.
        
        Args:
            location_name (str): The name of the location sending the surplus or demand.
            type (str): The type of data being sent; either "supply" for surplus or "demand" for deficit.
            groups (list of str): List of item categories being sent (e.g., ["fruits", "vegetables", "meat"]). Do not include the item names here. Instead categorize the items in the item names.
            food_mapping (dict, optional): A dictionary mapping each category to its items
                                            (e.g., {"fruits": ["strawberry", "apple"], "vegetables": ["carrot"], "meat": ["beef"]}).
                                            Required if type is "supply"; should be empty if type is "demand".
        """
        # Validate type
        if type not in ["supply", "demand"]:
            return "Invalid type provided. Must be either 'supply' or 'demand'."
        
        # Validate food_mapping based on type
        if type == "supply" and not food_mapping:
            return "food_mapping must be provided for type 'supply'."
        if type == "demand" and food_mapping:
            return "food_mapping should be empty for type 'demand'."
        
        # Validate groups as list of strings and allowed values
        allowed_categories = ["fruits", "vegetables", "grains", "dairy", "meat", "seafood", "baked goods"]
        if not isinstance(groups, list) or not all(isinstance(item, str) and item in allowed_categories for item in groups):
            return "Groups must be a list of allowed category strings."
        
        context_variables = self.db
        
        # Initialize location in context_variables if not present
        if 'locations' not in context_variables:
            context_variables['locations'] = {}
        
        if location_name not in context_variables['locations']:
            context_variables['locations'][location_name] = {}
            
        # Now, based on the type, we update the context variables accordingly
        if type == "supply":
            if "surplus" in context_variables['locations'][location_name]:
                context_variables['locations'][location_name]["surplus"].extend(groups)
            else:
                context_variables['locations'][location_name]["surplus"] = groups

            if "surplus_mapping" in context_variables['locations'][location_name]:
                context_variables['locations'][location_name]["surplus_mapping"].update(food_mapping)
            else:
                context_variables['locations'][location_name]["surplus_mapping"] = food_mapping
        
        if type == "demand":
            if "demand" in context_variables['locations'][location_name]:
                context_variables['locations'][location_name]["demand"].extend(groups)
            else:
                context_variables['locations'][location_name]["demand"] = groups
            
        return Result(
            value=f"Parsed {type} data for Location {location_name}: {groups}",
            agent=self.logistics_agent
        )


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the Euclidean distance between two geographical points.
    
    Args:
        lat1, lon1: Latitude and Longitude of the first point.
        lat2, lon2: Latitude and Longitude of the second point.
    
    Returns:
        Euclidean distance as a float.
    """
    return math.sqrt((lat1 - lat2) ** 2 + (lon1 - lon2) ** 2)