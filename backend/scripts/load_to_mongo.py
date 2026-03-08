import json
import os
from pymongo import MongoClient

def load_data():
    uri = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
    client = MongoClient(uri)
    db = client.civicpulse
    
    # Check if we need to load or if it's already loaded to prevent duplicate loads during testing
    if db.permits.count_documents({}) > 0:
        print("Data already loaded. Skipping.")
        return

    # Load Permits
    with open('../data/permits_clean.json', 'r') as f:
        permits = json.load(f)
        
    for p in permits:
        # MongoDB expects [lng, lat] for 2dsphere
        p["location"] = {"type": "Point", "coordinates": [p["lng"], p["lat"]]}
    
    if permits:
        db.permits.insert_many(permits)
        db.permits.create_index([("location", "2dsphere")])
        
    print(f"Loaded {len(permits)} permits.")

    # Load Crimes
    crimes = []
    import csv
    with open('../data/crimes.csv', 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row['lng'] and row['lat']:
                row["location"] = {"type": "Point", "coordinates": [float(row["lng"]), float(row["lat"])]}
                crimes.append(row)
    if crimes:
        db.crimes.insert_many(crimes)
        db.crimes.create_index([("location", "2dsphere")])
        
    print(f"Loaded {len(crimes)} crimes.")
    
    # Load Expenditures
    expenditures = []
    with open('../data/expenditures.csv', 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            expenditures.append(row)
    if expenditures:
        db.expenditures.insert_many(expenditures)
        
    # Create businesses collection index just in case for later
    db.businesses.create_index([("location", "2dsphere")])

    print("Database loading complete.")

if __name__ == "__main__":
    load_data()
