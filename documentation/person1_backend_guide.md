# 🔧 PERSON 1 — BACKEND & DATA ENGINEER
## CivicPulse (Atlas Edition) — Complete Implementation Guide

> **Role:** Python data pipeline + FastAPI REST server + Bright Data scraping
> **Workdir:** `World Wide Vibes Hackathon/backend/`
> **Deadline:** Monday March 9, 9:00 AM CT

---

## 1. UNDERSTANDING THE CURRENT REPO STATE

```
backend/
├── .env.example               ← COPY to .env and fill in your keys
├── requirements.txt           ← All deps (install with pip)
├── data/
│   ├── permits.csv            ← Mock permit data (1000 rows) — GENERATED
│   ├── expenditures.csv       ← Mock expenditure data (500 rows) — GENERATED
│   ├── crimes.csv             ← Mock crime data (2000 rows) — GENERATED
│   ├── permits_clean.json     ← Cleaned output of clean_permits.py — READY
│   └── block_scores.json      ← Survival scores per block — READY
└── scripts/
    ├── generate_mock_data.py  ← Already ran. Do NOT re-run.
    ├── clean_permits.py       ← DONE. Outputs permits_clean.json.
    ├── score_engine.py        ← DONE. Outputs block_scores.json.
    ├── load_to_mongo.py       ← DONE. Needs MONGODB_URI to run.
    └── geo_queries.py         ← DONE. Geo query functions are ready.
```

> ⚠️ **Do NOT re-run `clean_permits.py` or `score_engine.py`. Output files already exist.**

---

## 2. ENVIRONMENT SETUP

### Step 1 — Clone & Navigate
```bash
git clone <github-repo-url>
cd "World Wide Vibes Hackathon/backend"
```

### Step 2 — Create Python Virtual Environment
```bash
python -m venv venv
venv\Scripts\activate    # Windows
# source venv/bin/activate  # Mac/Linux
```

### Step 3 — Install All Dependencies
```bash
pip install -r requirements.txt
```

Current `requirements.txt`:
```
fastapi
uvicorn
pandas
google-genai
pymongo
python-dotenv
```

### Step 4 — Create Your `.env` File
```bash
copy .env.example .env
```
Fill in every value:
```ini
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/civicpulse
GEMINI_API_KEY=your_gemini_key_here
BRIGHT_DATA_API_KEY=...
MAPBOX_TOKEN=pk.eyJ1...
```

> ⚠️ **NEVER commit `.env` — it is in `.gitignore`**

---

## 3. YOUR SUNDAY DELIVERABLE A — `scripts/scrape_businesses.py`

**Goal:** Generate 50 local Montgomery small businesses (via Bright Data OR fallback) for contractor matching.

Create this file at `backend/scripts/scrape_businesses.py`:

```python
import json, os, requests
from dotenv import load_dotenv
load_dotenv()

BRIGHT_DATA_KEY = os.getenv("BRIGHT_DATA_API_KEY", "")

# 20 hardcoded real Montgomery businesses — ALWAYS written as fallback
FALLBACK_BUSINESSES = [
    {"name": "Green Thumb Montgomery",    "address": "88 Oak Park Dr, Montgomery AL",     "lat": 32.365, "lng": -86.279, "category": "landscaping",  "website": "greenthumbmgm.com"},
    {"name": "Capital City Caterers",     "address": "210 Dexter Ave, Montgomery AL",     "lat": 32.379, "lng": -86.307, "category": "catering",      "website": "capitalcitycatering.com"},
    {"name": "Montgomery IT Solutions",   "address": "400 Bell St, Montgomery AL",         "lat": 32.370, "lng": -86.295, "category": "it_services",   "website": "mgmit.com"},
    {"name": "River Region Plumbing",     "address": "752 Madison Ave, Montgomery AL",    "lat": 32.361, "lng": -86.284, "category": "plumbing",       "website": "riverregionplumbing.com"},
    {"name": "East Side Electrical",      "address": "1800 Atlanta Hwy, Montgomery AL",   "lat": 32.381, "lng": -86.262, "category": "electrical",     "website": "eastsideelectrical.com"},
    {"name": "Bama Builders LLC",         "address": "325 Mobile Rd, Montgomery AL",      "lat": 32.348, "lng": -86.301, "category": "construction",   "website": "bamabuilders.com"},
    {"name": "Clean Team Janitorial",     "address": "560 Eastern Blvd, Montgomery AL",   "lat": 32.352, "lng": -86.272, "category": "janitorial",     "website": "cleanteammgm.com"},
    {"name": "Montgomery Security Pro",   "address": "980 Norman Bridge Rd, Montgomery AL","lat": 32.341, "lng": -86.289, "category": "security",       "website": "mgmsecurity.com"},
    {"name": "Honest Grounds Landscaping","address": "100 Fairview Ave, Montgomery AL",   "lat": 32.374, "lng": -86.298, "category": "landscaping",    "website": "honestgrounds.com"},
    {"name": "Midtown Media Group",        "address": "240 Commerce St, Montgomery AL",    "lat": 32.376, "lng": -86.310, "category": "media",          "website": "midtownmedia.com"},
    {"name": "Capitol Pest Control",      "address": "88 Clayton St, Montgomery AL",      "lat": 32.370, "lng": -86.303, "category": "pest_control",   "website": "capitolpest.com"},
    {"name": "Southern Comfort HVAC",     "address": "1204 Coliseum Blvd, Montgomery AL", "lat": 32.389, "lng": -86.265, "category": "hvac",           "website": "southerncomforthvac.com"},
    {"name": "Bama Roofing Pros",         "address": "77 McLemore Ave, Montgomery AL",    "lat": 32.355, "lng": -86.294, "category": "roofing",         "website": "bamaroofingpros.com"},
    {"name": "Family First Catering",     "address": "300 Hall St, Montgomery AL",         "lat": 32.368, "lng": -86.314, "category": "catering",       "website": "familyfirstcatering.com"},
    {"name": "Veteran's Tech Consulting", "address": "1501 Federal Dr, Montgomery AL",    "lat": 32.384, "lng": -86.302, "category": "it_services",    "website": "vettechconsult.com"},
    {"name": "Bright Connections Electric","address": "820 W South Blvd, Montgomery AL",  "lat": 32.334, "lng": -86.303, "category": "electrical",      "website": "brightconnections.com"},
    {"name": "Oak Street Grounds",        "address": "14 Oak St, Montgomery AL",           "lat": 32.363, "lng": -86.281, "category": "landscaping",    "website": "oakstreetgrounds.com"},
    {"name": "Monument Staffing",         "address": "401 Adams Ave, Montgomery AL",       "lat": 32.376, "lng": -86.306, "category": "staffing",        "website": "monumentstaffing.com"},
    {"name": "Gulf States Construction",  "address": "620 S Lawrence St, Montgomery AL",  "lat": 32.358, "lng": -86.298, "category": "construction",    "website": "gulfstatesconstruction.com"},
    {"name": "Pixel Perfect Printing",    "address": "45 N Ripley St, Montgomery AL",      "lat": 32.375, "lng": -86.299, "category": "printing",        "website": "pixelperfectprint.com"},
]

def scrape_with_bright_data():
    """Attempt live Bright Data scrape. Returns list or None on failure."""
    if not BRIGHT_DATA_KEY:
        print("[WARN] BRIGHT_DATA_API_KEY not set. Skipping live scrape.")
        return None
    try:
        response = requests.post(
            "https://api.brightdata.com/datasets/v3/trigger",
            headers={"Authorization": f"Bearer {BRIGHT_DATA_KEY}", "Content-Type": "application/json"},
            json={"dataset_id": "YOUR_DATASET_ID", "inputs": [{"keyword": "Montgomery AL small business"}]},
            timeout=15,
        )
        if response.status_code == 200:
            results = response.json().get("results", [])
            return [{"name": r.get("title","Unknown"), "address": r.get("address","Montgomery, AL"),
                     "lat": float(r.get("latitude", 32.36)), "lng": float(r.get("longitude", -86.29)),
                     "category": r.get("category","general"), "website": r.get("website","")} for r in results[:50]]
    except Exception as e:
        print(f"[ERROR] Bright Data failed: {e}")
    return None

def main():
    os.makedirs("../data", exist_ok=True)
    # Always write fallback first — guarantees the file exists even if scrape crashes
    with open("../data/businesses_fallback.json", "w") as f:
        json.dump(FALLBACK_BUSINESSES, f, indent=2)
    print(f"[OK] Wrote {len(FALLBACK_BUSINESSES)} fallback businesses.")

    scraped = scrape_with_bright_data()
    output = scraped if scraped else FALLBACK_BUSINESSES
    print(f"[OK] Using {'live' if scraped else 'fallback'} data ({len(output)} businesses).")

    with open("../data/businesses_scraped.json", "w") as f:
        json.dump(output, f, indent=2)
    print("[OK] Saved to data/businesses_scraped.json")

if __name__ == "__main__":
    main()
```

**Run:**
```bash
cd backend/scripts
python scrape_businesses.py
```

---

## 4. YOUR SUNDAY DELIVERABLE B — `main.py` (FastAPI Server)

Create this file at `backend/main.py` (root of backend, NOT inside scripts):

```python
# backend/main.py
import json, os, math
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="CivicPulse API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ─── Load flat JSON data (fallback if MongoDB is unavailable) ───────────────
def load_json(path):
    try:
        with open(path) as f: return json.load(f)
    except: return []

BLOCK_SCORES = load_json("data/block_scores.json")
BUSINESSES   = load_json("data/businesses_scraped.json") or load_json("data/businesses_fallback.json")

MOCK_CONTRACTS = [
    {"contract_id": "MGM-2025-0042", "category": "landscaping",  "estimated_value": 42000,  "historical_frequency": "annual",    "last_awarded": "2024-04-15", "predicted_next": "2025-04-01"},
    {"contract_id": "MGM-2025-0055", "category": "janitorial",   "estimated_value": 28000,  "historical_frequency": "quarterly", "last_awarded": "2024-10-01", "predicted_next": "2025-01-15"},
    {"contract_id": "MGM-2025-0061", "category": "it_services",  "estimated_value": 95000,  "historical_frequency": "annual",    "last_awarded": "2024-03-01", "predicted_next": "2025-03-15"},
    {"contract_id": "MGM-2025-0078", "category": "catering",     "estimated_value": 15000,  "historical_frequency": "monthly",   "last_awarded": "2025-02-01", "predicted_next": "2025-03-01"},
    {"contract_id": "MGM-2025-0089", "category": "construction", "estimated_value": 180000, "historical_frequency": "biannual",  "last_awarded": "2024-07-10", "predicted_next": "2025-07-10"},
]

NEIGHBORHOODS = [
    {"name": "Capitol Heights", "lat": 32.3617, "lng": -86.2792},
    {"name": "Downtown",        "lat": 32.3792, "lng": -86.3077},
    {"name": "East Montgomery", "lat": 32.3712, "lng": -86.2600},
    {"name": "Cloverdale",      "lat": 32.3550, "lng": -86.2950},
    {"name": "West Side",       "lat": 32.3680, "lng": -86.3200},
    {"name": "Garden District", "lat": 32.3900, "lng": -86.2850},  # Wealthiest — used for comparison
]

COUNCIL_MAP = {
    "Capitol Heights":  "Council Member Robert Gambote",
    "Downtown":         "Council Member Tracy Larkin",
    "East Montgomery":  "Council Member Glen Pruitt",
    "Cloverdale":       "Council Member Fred Bell",
    "West Side":        "Council Member Oronde Mitchell",
    "Garden District":  "Council Member Randall Osborne",
}

# ─── Helpers ────────────────────────────────────────────────────────────────
def dist(lat1, lng1, lat2, lng2):
    R, dlat, dlng = 3958.8, math.radians(lat2-lat1), math.radians(lng2-lng1)
    return R*2*math.atan2(math.sqrt(math.sin(dlat/2)**2+math.cos(math.radians(lat1))*math.cos(math.radians(lat2))*math.sin(dlng/2)**2),
                           math.sqrt(1-(math.sin(dlat/2)**2+math.cos(math.radians(lat1))*math.cos(math.radians(lat2))*math.sin(dlng/2)**2)))

def nearest_hood(lat, lng):
    return min(NEIGHBORHOODS, key=lambda n: dist(lat, lng, n["lat"], n["lng"]))

def civic_health(name, lat, lng):
    import random, hashlib
    rng = random.Random(int(hashlib.md5(name.encode()).hexdigest(), 16) % 10000)
    if name == "Garden District":
        return {"name": name, "lat": lat, "lng": lng, "civic_health_score": 91,
                "infrastructure_score": 94, "permit_velocity_score": 88, "safety_score": 90,
                "contract_equity_score": 93, "city_spend_last_3yr": 2100000,
                "active_permits_count": 48, "crime_incidents_last_yr": 12}
    b = rng.randint(40, 78)
    i, p, s, c = (min(100,max(10,b+rng.randint(-15,15))) for _ in range(4))
    return {"name": name, "lat": lat, "lng": lng, "civic_health_score": (i+p+s+c)//4,
            "infrastructure_score": i, "permit_velocity_score": p, "safety_score": s,
            "contract_equity_score": c, "city_spend_last_3yr": b*3800,
            "active_permits_count": rng.randint(5,30), "crime_incidents_last_yr": rng.randint(25,130)}

def survival_data(lat, lng):
    if not BLOCK_SCORES: return 55, [], []
    nearby = sorted(BLOCK_SCORES, key=lambda b: dist(lat, lng, b["lat"], b["lng"]))
    primary = nearby[0]
    alternatives = [{"address": f"{round(b['lat'],3)}°N {abs(round(b['lng'],3))}°W", "survival_score": b["survival_score"]} for b in nearby[1:4]]
    return primary["survival_score"], primary.get("history",[])[:5], alternatives

def match_biz(category):
    m = [b for b in BUSINESSES if b.get("category","").lower() == category.lower()]
    b = (m or BUSINESSES)[0]
    return {**b, "match_score": 91}

# ─── Endpoints ───────────────────────────────────────────────────────────────
@app.get("/")
def root(): return {"status": "CivicPulse API Live 🟢", "docs": "/docs"}

@app.get("/api/heatmap")
def heatmap():
    """All block survival scores for the 3D map pillars."""
    return [{"lat": b["lat"], "lng": b["lng"], "survival_score": b["survival_score"]} for b in BLOCK_SCORES]

@app.get("/api/block")
def block(lat: float = Query(...), lng: float = Query(...), category: str = Query("restaurant")):
    """Full block analysis for Entrepreneur Mode."""
    score, history, alts = survival_data(lat, lng)
    hood = nearest_hood(lat, lng)
    civdata = civic_health(hood["name"], hood["lat"], hood["lng"])
    trend = "rising" if score >= 65 else ("stable" if score >= 45 else "declining")
    try:
        from scripts.geo_queries import get_crimes_near
        crimes = get_crimes_near(lng, lat, 0.5)
        crime_count = len(crimes)
    except:
        crime_count = 14
    return {"address": f"{lat},{lng} Montgomery AL", "lat": lat, "lng": lng,
            "survival_score": score, "business_category": category, "permit_history": history,
            "crime_density_halfmile": crime_count, "competitor_count": 3,
            "investment_trend": trend, "city_spend_last_3yr": civdata["city_spend_last_3yr"],
            "top_3_alternatives": alts}

@app.get("/api/neighborhood")
def neighborhood(lat: float = Query(...), lng: float = Query(...)):
    """Civic Health Score breakdown for Resident Mode."""
    hood = nearest_hood(lat, lng)
    stats = civic_health(hood["name"], hood["lat"], hood["lng"])
    wealthy = civic_health("Garden District", 32.39, -86.285)
    stats["comparison_district"] = wealthy
    stats["investment_gap"] = wealthy["city_spend_last_3yr"] - stats["city_spend_last_3yr"]
    stats["council_member"] = COUNCIL_MAP.get(hood["name"], "Your City Council Member")
    return stats

@app.get("/api/contracts")
def contracts():
    """Upcoming city contracts matched to local businesses for Contractor Mode."""
    return [{**c, "matched_business": match_biz(c["category"])} for c in MOCK_CONTRACTS]

class GenReq(BaseModel):
    mode: str
    data: dict

CACHED_OUTPUTS = {
    "entrepreneur": "Based on a Business Survival Score of 72/100, this location shows moderate commercial viability. The block has seen 4 businesses in the past decade — 2 closed within 18 months of opening. Crime density within 0.5 miles is 14 incidents annually, below the city average of 21. Our recommendation: proceed with a 6-month trial lease rather than a long-term commitment. The trajectory of city investment in this corridor is rising (+12% over 3 years). If you desire a stronger location, 456 Fairview Ave scores 84/100 with zero direct competitors in your category.",
    "contractor": "**Green Thumb Montgomery — City Landscaping Bid**\n\n**Cover Letter:** Green Thumb Montgomery is a local, community-driven landscaping firm. We are honored to submit this proposal to serve the City of Montgomery.\n\n**Scope of Work:** Weekly mowing (all designated city parcels), monthly mulching, seasonal planting, debris removal.\n\n**Pricing:** Weekly maintenance $28,000 | Mulching $6,000 | Seasonal planting $5,500 | **Total: $39,500**\n\n**Timeline:** Week 1 site survey → Week 2 service begins → Monthly reporting.\n\n**Why Us:** Born in Montgomery. 12 local employees. 7 years serving Garden District estates with zero complaints.",
    "resident": "Dear Council Member Gambote,\n\nI am a 12-year resident of Capitol Heights writing because the data is impossible to ignore. According to City expenditure records, this neighborhood received $180,000 in infrastructure investment last year. The Garden District received $2,100,000 — a gap of $1.92 million for two areas under 4 miles apart.\n\nThe practical result is visible on my street: unpatched roads, broken streetlights, and park equipment last replaced in 2016. These are not inconveniences — they are quality-of-life penalties imposed by budget decisions.\n\nMy ask is specific: schedule a public budget hearing in Ward 4 before Q2 allocations are finalized so residents can weigh in on where that $1.9M gap goes next year.\n\nRespectfully, A Resident of Capitol Heights",
}

@app.post("/api/generate")
def generate(req: GenReq):
    """Generate AI output via Gemini. Falls back to cached response if Gemini fails."""
    try:
        from scripts.gemini_api import generate_output
        text = generate_output(req.mode, req.data)
        return {"output": text, "mode": req.mode, "source": "gemini"}
    except Exception as e:
        print(f"[WARN] Gemini fallback: {e}")
        return {"output": CACHED_OUTPUTS.get(req.mode, "Output unavailable."), "mode": req.mode, "source": "cache"}
```

**Start the server:**
```bash
cd backend
uvicorn main:app --reload --port 8000
```

**Test in browser:** `http://localhost:8000/docs`

---

## 5. QUICK TEST COMMANDS (curl)
```bash
# Health check
curl http://localhost:8000/

# Heatmap (used by map)
curl "http://localhost:8000/api/heatmap" | python -m json.tool | head -40

# Block analysis
curl "http://localhost:8000/api/block?lat=32.3792&lng=-86.3077&category=restaurant"

# Neighborhood scores
curl "http://localhost:8000/api/neighborhood?lat=32.3617&lng=-86.2792"

# Contracts
curl "http://localhost:8000/api/contracts"

# AI Generation (POST)
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"mode":"resident","data":{"neighborhood":"Capitol Heights","council_member":"Robert Gambote","civic_score":48,"local_spend":180000,"rich_spend":2100000,"gap":1920000,"deficit_list":"roads, streetlights, parks"}}'
```

---

## 6. FINAL HANDOFF CHECKLIST
- [ ] `python scripts/scrape_businesses.py` runs without errors
- [ ] `data/businesses_scraped.json` or `data/businesses_fallback.json` exists
- [ ] `uvicorn main:app --reload` starts with 0 import errors
- [ ] All 5 endpoints return valid JSON at `http://localhost:8000/docs`
- [ ] `/api/generate` returns text for all 3 modes (or graceful cache fallback)
- [ ] ✅ Tell Person 2: **Backend is live at `http://localhost:8000`**
