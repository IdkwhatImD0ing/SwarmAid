db = {
    "locations": {
        # Suppliers
        "Kroger": {
            "surplus": ["fruits", "dairy"],
            "surplus_mapping": {
                "fruits": ["strawberry", "apple"],
                "dairy": ["milk", "cheese"]
            },
            "data": {
                "lat": 42.315701,
                "lon": -83.192711,
                "address": "15255 Michigan Ave, Dearborn, MI 48126"
            }
        },
        "Cinnabon": {
            "surplus": ["grains", "baked goods"],
            "surplus_mapping": {
                "grains": ["bread", "rice"],
                "baked goods": ["muffins", "cookies"]
            },
            "data": {
                "lat": 42.3167159,
                "lon": -83.2228552,
                "address": "18900 Michigan Ave G118, Dearborn, MI 48126"
            }
        },
        "Redford Fish & Seafood Market": {
            "surplus": ["seafood"],
            "surplus_mapping": {
                "seafood": ["salmon", "shrimp"]
            },
            "data": {
                "lat": 42.3571096,
                "lon": -83.2760451,
                "address": "24050 Joy Rd, Redford Charter Twp, MI 48239"
            }
        },
        
        # Demanders
        "Helping Hand - Food Pantry": {
            "demand": [],
            "data": {
                "lat": 42.312950,
                "lon": -83.273697,
                "address": "24110 Cherry Hill St, Dearborn, MI 48128"
            }
        },
        "Journey To Housing": {
            "demand": [],
            "data": {
                "lat": 42.334370,
                "lon": -83.289870,
                "address": "6466 N Evangeline St, Dearborn Heights, MI 48127"
            }
        },
        "All Saints Soup Kitchen and Food Pantry": {
            "demand": [],
            "data": {
                "lat": 42.339380,
                "lon": -83.135820,
                "address": "Inside the Lower Level of the PAL building, 6945 Wagner St, Detroit, MI 48210"
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

