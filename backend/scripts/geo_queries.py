import os
from pymongo import MongoClient

def get_db():
    uri = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
    client = MongoClient(uri)
    return client.civicpulse

def get_permits_near(lng: float, lat: float, radius_miles: float = 1.0):
    db = get_db()
    radius_meters = radius_miles * 1609.34
    return list(db.permits.aggregate([{
        "$geoNear": {
            "near": {"type": "Point", "coordinates": [lng, lat]},
            "distanceField": "distance",
            "maxDistance": radius_meters,
            "spherical": True
        }
    }]))

def get_crimes_near(lng: float, lat: float, radius_miles: float = 0.5):
    db = get_db()
    radius_meters = radius_miles * 1609.34
    return list(db.crimes.aggregate([{
        "$geoNear": {
            "near": {"type": "Point", "coordinates": [lng, lat]},
            "distanceField": "distance",
            "maxDistance": radius_meters,
            "spherical": True
        }
    }]))

def get_expenditures_by_neighborhood(neighborhood_name: str):
    db = get_db()
    return list(db.expenditures.find({"neighborhood": neighborhood_name}))
