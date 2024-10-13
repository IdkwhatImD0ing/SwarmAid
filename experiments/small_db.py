db = {
    "locations": {
        # Suppliers
        "Grocery Store A": {
            "data": {
                "lat": 40.712776,
                "lon": -74.005974,
                "address": "123 Main St, New York, NY 10001"
            }
        },
        "Bakery B": {
            "data": {
                "lat": 42.652580,
                "lon": -73.756232,
                "address": "456 Country Rd, Albany, NY 12207"
            }
        },
        "Seafood Market C": {

            "data": {
                "lat": 42.886448,
                "lon": -78.878372,
                "address": "789 Market St, Buffalo, NY 14202"
            }
        },
        
        # Demanders
        "Soup Kitchen X": {
            "data": {
                "lat": 40.717054,
                "lon": -73.984472,
                "address": "321 Charity Ave, New York, NY 10002"
            }
        },
        "Homeless Shelter Y": {
            "data": {
                "lat": 42.652580,
                "lon": -73.756232,
                "address": "654 Support St, Albany, NY 12205"
            }
        },
        "Community Kitchen Z": {
            "data": {
                "lat": 42.886448,
                "lon": -78.878372,
                "address": "987 Hope Rd, Buffalo, NY 14203"
            }
        }
    }
}

def get_db():
    return db

def set_db(new_db):
    global db
    db = new_db 
    return True

