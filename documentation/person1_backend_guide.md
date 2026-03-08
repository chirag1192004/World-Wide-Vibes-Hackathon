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
    ├── geo_queries.py         ← DONE. Geo query functions are ready.
    ├── load_to_mongo.py       ← [TODO: Person 3 handles this]
    ├── gemini_prompts.py      ← [TODO: Person 3 handles this]
    └── gemini_api.py          ← [TODO: Person 3 handles this]
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

### Step 3 — Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4 — Create Your `.env` File
```bash
copy .env.example .env
```
Fill in your keys:
```ini
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/civicpulse
GEMINI_API_KEY=your_gemini_key_here
BRIGHT_DATA_API_KEY=...
```

> ⚠️ **NEVER commit `.env`!**

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
    {"name": "Green Thumb Montgomery",    "address": "88 Oak Park Dr",     "lat": 32.365, "lng": -86.279, "category": "landscaping",  "website": "greenthumbmgm.com"},
    {"name": "Capital City Caterers",     "address": "210 Dexter Ave",     "lat": 32.379, "lng": -86.307, "category": "catering",      "website": "capitalcitycatering.com"},
    {"name": "Montgomery IT Solutions",   "address": "400 Bell St",        "lat": 32.370, "lng": -86.295, "category": "it_services",   "website": "mgmit.com"},
    {"name": "River Region Plumbing",     "address": "752 Madison Ave",    "lat": 32.361, "lng": -86.284, "category": "plumbing",      "website": "riverregionplumbing.com"},
    # Add 16 more here to reach 20
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
    # Always write fallback first
    with open("../data/businesses_fallback.json", "w") as f:
        json.dump(FALLBACK_BUSINESSES, f, indent=2)
    print(f"[OK] Wrote fallback businesses.")

    scraped = scrape_with_bright_data()
    output = scraped if scraped else FALLBACK_BUSINESSES
    print(f"[OK] Using {'live' if scraped else 'fallback'} data ({len(output)} businesses).")

    with open("../data/businesses_scraped.json", "w") as f:
        json.dump(output, f, indent=2)
    print("[OK] Saved to data/businesses_scraped.json")

if __name__ == "__main__":
    main()
```

---

## 4. YOUR SUNDAY DELIVERABLE B — `main.py` (FastAPI Server)

> Note: The frontend uses Next.js and depends on these exactly named endpoints. Do not change the JSON structure.
> 
> **Important Updates:**
> 1. The `/api/heatmap` endpoint accepts an optional `category` query param, used to multiply base block scores based on business type (e.g., pharmacy 1.2x, gym 0.75x).
> 2. The `/api/generate` endpoint supports 4 modes: `entrepreneur`, `contractor`, `resident`, AND `chat` (for the floating AI assistant).

Create/update `backend/main.py`:

```python
# backend/main.py
import json, os, random
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="CivicPulse API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ─── Load flat JSON data ────────────────────────────────────────────────────
def load_json(path):
    try:
        with open(path) as f: return json.load(f)
    except: return []

BASE = os.path.dirname(__file__)
BLOCK_SCORES = load_json(os.path.join(BASE, "data", "block_scores.json"))
BUSINESSES   = load_json(os.path.join(BASE, "data", "businesses_scraped.json")) or \
               load_json(os.path.join(BASE, "data", "businesses_fallback.json"))

MOCK_CONTRACTS = [
    {"contract_id": "MGM-2025-0042", "category": "landscaping",  "estimated_value": 42000,  "historical_frequency": "annual",    "predicted_next": "2025-04-01"},
    {"contract_id": "MGM-2025-0089", "category": "road_repair",  "estimated_value": 125000, "historical_frequency": "quarterly", "predicted_next": "2025-04-15"},
]

NEIGHBORHOODS = [
    {"name": "Capitol Heights", "lat": 32.3617, "lng": -86.2792, "council_member": "Council Member Robert Gambote", "civic_health_score": 48, "city_spend_last_3yr": 180000},
    {"name": "Garden District", "lat": 32.3700, "lng": -86.3200, "council_member": "Council Member Cynthia Inniss", "civic_health_score": 91, "city_spend_last_3yr": 2100000}, 
]

# ─── Endpoints ───────────────────────────────────────────────────────────────
@app.get("/")
def root(): return {"status": "CivicPulse API running", "version": "1.0.0"}

@app.get("/api/heatmap")
def heatmap(category: str = Query(None)):
    """Return map layer data. Multiplies score based on business category."""
    multipliers = {
        "restaurant": 1.0, "cafe": 1.05, "bakery": 0.95,
        "salon": 0.9, "barbershop": 0.85, "retail": 1.1,
        "auto": 0.8, "gym": 0.75, "clinic": 1.15, "pharmacy": 1.2,
    }
    m = multipliers.get(category, 1.0) if category else 1.0

    return [{"lat": b["lat"], "lng": b["lng"], "survival_score": min(100, max(0, int(b.get("survival_score", 50) * m)))} for b in BLOCK_SCORES]

@app.get("/api/block")
def block(lat: float = Query(...), lng: float = Query(...), category: str = Query("restaurant")):
    """Block-level analysis for Entrepreneur mode."""
    # (Implementation here: lookup nearest block in BLOCK_SCORES, lookup nearest hood, calculate trend, mock crime)
    # See earlier codebase for full logic. The frontend expects lat, lng, survival_score, permit_history, top_3_alternatives, etc.
    pass

@app.get("/api/neighborhood")
def neighborhood(lat: float = Query(...), lng: float = Query(...)):
    """Neighborhood data for Resident mode."""
    # (Implementation here: return nearest hood data + a comparison_district (Garden District))
    pass

@app.get("/api/contracts")
def contracts():
    """Upcoming contracts matched to local businesses for Contractor mode."""
    # Attach matched_business info from BUSINESSES to each contract
    pass

class GenReq(BaseModel):
    mode: str
    data: dict

CACHED_OUTPUTS = {
    "entrepreneur": "The survival score indicates moderate commercial viability...",
    "contractor": "1. Cover Letter\nGreen Thumb Montgomery is a family-operated business...",
    "resident": "Dear Council Member Gambote,\n\nI am writing today regarding...",
    "chat": "Based on Montgomery's civic data, the safest neighborhoods are...",
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
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## 5. FINAL HANDOFF CHECKLIST
- [ ] `businesses_scraped.json` or ` businesses_fallback.json` exists
- [ ] `python -m uvicorn main:app` starts with 0 errors
- [ ] Post to `/api/generate` with `{"mode": "chat", "data": {"message": "hello"}}` returns the fallback cached message
- [ ] Tell Person 2: **Backend is live at `localhost:8000`**
