"""
load_to_mongo.py — Seed MongoDB Atlas with all 4 CivicPulse collections.
Run from backend/ directory with the venv activated:
    python3 scripts/load_to_mongo.py
"""
import csv
import json
import os
from pymongo import MongoClient

# Always resolve data paths relative to THIS script file — not the cwd
SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR    = os.path.join(SCRIPTS_DIR, "..", "data")


def get_db():
    uri = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    return client.civicpulse


def load_data():
    from dotenv import load_dotenv
    load_dotenv(os.path.join(SCRIPTS_DIR, "..", ".env"))

    db = get_db()

    # ── Permits ──────────────────────────────────────────────────────────────
    if db.permits.count_documents({}) > 0:
        print("[SKIP] permits already loaded.")
    else:
        permits_path = os.path.join(DATA_DIR, "permits_clean.json")
        with open(permits_path) as f:
            permits = json.load(f)

        for p in permits:
            # MongoDB $geoNear requires [lng, lat] order
            p["location"] = {"type": "Point", "coordinates": [p["lng"], p["lat"]]}

        if permits:
            db.permits.insert_many(permits)
            db.permits.create_index([("location", "2dsphere")])
            print(f"[OK] Loaded {len(permits)} permits → permits collection.")

    # ── Crimes ───────────────────────────────────────────────────────────────
    if db.crimes.count_documents({}) > 0:
        print("[SKIP] crimes already loaded.")
    else:
        crimes_path = os.path.join(DATA_DIR, "crimes.csv")
        crimes = []
        with open(crimes_path) as f:
            for row in csv.DictReader(f):
                try:
                    lng = float(row["lng"])
                    lat = float(row["lat"])
                    row["lng"] = lng
                    row["lat"] = lat
                    row["location"] = {"type": "Point", "coordinates": [lng, lat]}
                    crimes.append(row)
                except (ValueError, KeyError):
                    continue

        if crimes:
            db.crimes.insert_many(crimes)
            db.crimes.create_index([("location", "2dsphere")])
            print(f"[OK] Loaded {len(crimes)} crimes → crimes collection.")

    # ── Expenditures ─────────────────────────────────────────────────────────
    if db.expenditures.count_documents({}) > 0:
        print("[SKIP] expenditures already loaded.")
    else:
        exp_path = os.path.join(DATA_DIR, "expenditures.csv")
        expenditures = []
        with open(exp_path) as f:
            for row in csv.DictReader(f):
                # Convert numeric fields
                for field in ("amount", "lat", "lng"):
                    if field in row:
                        try:
                            row[field] = float(row[field])
                        except (ValueError, TypeError):
                            pass
                expenditures.append(row)

        if expenditures:
            db.expenditures.insert_many(expenditures)
            print(f"[OK] Loaded {len(expenditures)} expenditure rows → expenditures collection.")

    # ── Businesses ───────────────────────────────────────────────────────────
    if db.businesses.count_documents({}) > 0:
        print("[SKIP] businesses already loaded.")
    else:
        # Try scraped first, then fallback
        scraped_path  = os.path.join(DATA_DIR, "businesses_scraped.json")
        fallback_path = os.path.join(DATA_DIR, "businesses_fallback.json")

        businesses = []
        for path in (scraped_path, fallback_path):
            if os.path.exists(path):
                with open(path) as f:
                    businesses = json.load(f)
                if businesses:
                    break

        for b in businesses:
            if "lat" in b and "lng" in b:
                b["location"] = {"type": "Point", "coordinates": [b["lng"], b["lat"]]}

        if businesses:
            db.businesses.insert_many(businesses)
            db.businesses.create_index([("location", "2dsphere")])
            print(f"[OK] Loaded {len(businesses)} businesses → businesses collection.")

    print("\n[DONE] Database loading complete.")
    print("       Collections: permits, crimes, expenditures, businesses")
    print("       All geospatial collections have 2dsphere indexes.")


if __name__ == "__main__":
    load_data()
