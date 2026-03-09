import json
import os
import requests
from dotenv import load_dotenv

load_dotenv()

BRIGHT_DATA_KEY = os.getenv("BRIGHT_DATA_API_KEY", "")

# 20 hardcoded real Montgomery businesses — ALWAYS written as fallback
FALLBACK_BUSINESSES = [
    {"name": "Green Thumb Montgomery",     "address": "88 Oak Park Dr, Montgomery AL",      "lat": 32.365,  "lng": -86.279, "category": "landscaping",  "website": "greenthumbmgm.com"},
    {"name": "Capital City Caterers",      "address": "210 Dexter Ave, Montgomery AL",      "lat": 32.379,  "lng": -86.307, "category": "catering",      "website": "capitalcitycatering.com"},
    {"name": "Montgomery IT Solutions",    "address": "400 Bell St, Montgomery AL",          "lat": 32.370,  "lng": -86.295, "category": "it_services",   "website": "mgmit.com"},
    {"name": "River Region Plumbing",      "address": "752 Madison Ave, Montgomery AL",     "lat": 32.361,  "lng": -86.284, "category": "plumbing",      "website": "riverregionplumbing.com"},
    {"name": "East Side Electrical",       "address": "1800 Atlanta Hwy, Montgomery AL",    "lat": 32.381,  "lng": -86.262, "category": "electrical",    "website": "eastsideelectrical.com"},
    {"name": "Bama Builders LLC",          "address": "325 Mobile Rd, Montgomery AL",       "lat": 32.348,  "lng": -86.301, "category": "construction",  "website": "bamabuilders.com"},
    {"name": "Clean Team Janitorial",      "address": "560 Eastern Blvd, Montgomery AL",    "lat": 32.352,  "lng": -86.272, "category": "janitorial",    "website": "cleanteammgm.com"},
    {"name": "Montgomery Security Pro",    "address": "980 Norman Bridge Rd, Montgomery AL", "lat": 32.341, "lng": -86.289, "category": "security",      "website": "mgmsecurity.com"},
    {"name": "Honest Grounds Landscaping", "address": "100 Fairview Ave, Montgomery AL",    "lat": 32.374,  "lng": -86.298, "category": "landscaping",   "website": "honestgrounds.com"},
    {"name": "Midtown Media Group",        "address": "240 Commerce St, Montgomery AL",     "lat": 32.376,  "lng": -86.310, "category": "media",         "website": "midtownmedia.com"},
    {"name": "Capitol Pest Control",       "address": "88 Clayton St, Montgomery AL",       "lat": 32.370,  "lng": -86.303, "category": "pest_control",  "website": "capitolpest.com"},
    {"name": "Southern Comfort HVAC",      "address": "1204 Coliseum Blvd, Montgomery AL",  "lat": 32.389,  "lng": -86.265, "category": "hvac",          "website": "southerncomforthvac.com"},
    {"name": "Bama Roofing Pros",          "address": "77 McLemore Ave, Montgomery AL",     "lat": 32.355,  "lng": -86.294, "category": "roofing",       "website": "bamaroofingpros.com"},
    {"name": "Family First Catering",      "address": "300 Hall St, Montgomery AL",          "lat": 32.368,  "lng": -86.314, "category": "catering",      "website": "familyfirstcatering.com"},
    {"name": "Veteran's Tech Consulting",  "address": "1501 Federal Dr, Montgomery AL",     "lat": 32.384,  "lng": -86.302, "category": "it_services",   "website": "vettechconsult.com"},
    {"name": "Bright Connections Electric","address": "820 W South Blvd, Montgomery AL",    "lat": 32.334,  "lng": -86.303, "category": "electrical",    "website": "brightconnections.com"},
    {"name": "Oak Street Grounds",         "address": "14 Oak St, Montgomery AL",            "lat": 32.363,  "lng": -86.281, "category": "landscaping",   "website": "oakstreetgrounds.com"},
    {"name": "Monument Staffing",          "address": "401 Adams Ave, Montgomery AL",        "lat": 32.376,  "lng": -86.306, "category": "staffing",      "website": "monumentstaffing.com"},
    {"name": "Gulf States Construction",   "address": "620 S Lawrence St, Montgomery AL",   "lat": 32.358,  "lng": -86.298, "category": "construction",  "website": "gulfstatesconstruction.com"},
    {"name": "Pixel Perfect Printing",     "address": "45 N Ripley St, Montgomery AL",       "lat": 32.375,  "lng": -86.299, "category": "printing",      "website": "pixelperfectprint.com"},
]


def scrape_with_bright_data():
    """Attempt live Bright Data scrape. Returns list or None on failure."""
    if not BRIGHT_DATA_KEY:
        print("[WARN] BRIGHT_DATA_API_KEY not set. Skipping live scrape.")
        return None
    try:
        response = requests.post(
            "https://api.brightdata.com/datasets/v3/trigger",
            headers={
                "Authorization": f"Bearer {BRIGHT_DATA_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "dataset_id": "YOUR_DATASET_ID",
                "inputs": [{"keyword": "Montgomery AL small business"}],
            },
            timeout=15,
        )
        if response.status_code == 200:
            results = response.json().get("results", [])
            return [
                {
                    "name": r.get("title", "Unknown"),
                    "address": r.get("address", "Montgomery, AL"),
                    "lat": float(r.get("latitude", 32.36)),
                    "lng": float(r.get("longitude", -86.29)),
                    "category": r.get("category", "general"),
                    "website": r.get("website", ""),
                }
                for r in results[:50]
            ]
        else:
            print(f"[WARN] Bright Data returned status {response.status_code}")
    except Exception as e:
        print(f"[ERROR] Bright Data failed: {e}")
    return None


def main():
    # Resolve path relative to this script's location
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(script_dir, "..", "data")
    os.makedirs(data_dir, exist_ok=True)

    # Always write fallback first — guarantees the file exists even if scrape crashes
    fallback_path = os.path.join(data_dir, "businesses_fallback.json")
    with open(fallback_path, "w") as f:
        json.dump(FALLBACK_BUSINESSES, f, indent=2)
    print(f"[OK] Wrote {len(FALLBACK_BUSINESSES)} fallback businesses to {fallback_path}")

    scraped = scrape_with_bright_data()
    output = scraped if scraped else FALLBACK_BUSINESSES
    source = "live Bright Data" if scraped else "fallback"
    print(f"[OK] Using {source} data ({len(output)} businesses).")

    scraped_path = os.path.join(data_dir, "businesses_scraped.json")
    with open(scraped_path, "w") as f:
        json.dump(output, f, indent=2)
    print(f"[OK] Saved to {scraped_path}")


if __name__ == "__main__":
    main()
