**Problem Title:** Supply Chain Optimization with Multiple Items

**Problem Description:**

You are given a set of **Provider** positions and **Recipient** positions on a 2D plane. Each provider has a certain number of different items, and each recipient requires specific quantities of these items. There are unique weighted edges between every provider and every recipient, representing the cost to transport items along that edge.

Your task is to determine the minimum total transportation cost required to fulfill all recipients' item demands using the providers' available items. Each item must be transported from a provider to a recipient via a path such that all recipients receive all the items they require. The transportation must ensure that the total cost is minimized.

**Detailed Description:**

- You are given two lists:

  - **Providers**: An array of providers, where each provider is represented as a tuple `(Px, Py, [i₁, i₂, ..., iₖ])`. `(Px, Py)` denotes the provider's position on a 2D plane, and `[i₁, i₂, ..., iₖ]` represents the number of each type of item the provider has.

  - **Recipients**: An array of recipients, where each recipient is represented as a tuple `(Rx, Ry, [d₁, d₂, ..., dₖ])`. `(Rx, Ry)` denotes the recipient's position on a 2D plane, and `[d₁, d₂, ..., dₖ]` represents the number of each type of item the recipient requires.

- **Edges**: There is an edge between every provider and every recipient. The cost to transport items along an edge is the Euclidean distance between the provider and the recipient multiplied by a unique weight specific to that edge.

- **Objective**: Assign paths from providers to recipients for each item such that:

  1. All recipients receive the exact number of each item they require.

  2. The total transportation cost is minimized.

**Constraints:**

- `1 <= Number of Providers, Number of Recipients <= 100`
- `1 <= Number of Item Types (k) <= 10`
- `0 <= i₁, i₂, ..., iₖ <= 1000` for each provider
- `0 <= d₁, d₂, ..., dₖ <= 1000` for each recipient
- Each edge's weight is a unique positive integer.
- It is guaranteed that the total supply of each item across all providers is at least the total demand for that item across all recipients.

**Input Format:**

- **providers**: A list of providers, each represented as `[Px, Py, i₁, i₂, ..., iₖ]`.
- **recipients**: A list of recipients, each represented as `[Rx, Ry, d₁, d₂, ..., dₖ]`.
- **weights**: A 2D list where `weights[p][r]` represents the unique weight of the edge between the `p-th` provider and the `r-th` recipient.

**Output Format:**

Return a single integer representing the minimum total transportation cost required to fulfill all recipients' demands.

**Example:**

```python
# Example Input:
providers = [
    [0, 0, 5, 10],  # Provider 0 at (0,0) with 5 of item1 and 10 of item2
    [2, 2, 10, 5]   # Provider 1 at (2,2) with 10 of item1 and 5 of item2
]
recipients = [
    [1, 1, 8, 7],   # Recipient 0 at (1,1) needs 8 of item1 and 7 of item2
    [3, 3, 7, 8]    # Recipient 1 at (3,3) needs 7 of item1 and 8 of item2
]
weights = [
    [1, 2],  # Weights from Provider 0 to Recipient 0 and 1
    [3, 4]   # Weights from Provider 1 to Recipient 0 and 1
]

# Example Output:
Total Cost =  (distance(0,0)-(1,1)) * 1 * 8 + (distance(0,0)-(1,1)) * 1 * 7 +
              (distance(2,2)-(3,3)) * 4 * 7 + (distance(2,2)-(3,3)) * 4 * 8
              = (√2) * 1 * 15 + (√2) * 4 * 15
              = 15√2 + 60√2
              = 75√2 ≈ 106.066

# Explanation:
Items are optimally distributed from providers to recipients minimizing the total transportation cost.
```

**Note:**

- The Euclidean distance between two points `(x1, y1)` and `(x2, y2)` is calculated as `√((x2 - x1)^2 + (y2 - y1)^2)`.
- Since the output should be an integer, you may round the total cost to the nearest integer.

**Function Signature:**

```python
def minimumTransportationCost(providers: List[List[int]], recipients: List[List[int]], weights: List[List[int]]) -> int:
    pass
```

**Follow-up:**

Can you optimize your solution to handle larger inputs where the number of providers and recipients can be up to `500` each?
