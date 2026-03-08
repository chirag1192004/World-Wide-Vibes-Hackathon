import json
import os
import random
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="CivicPulse API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── DATA LOADING ─────────────────────────────────────────────────────────────
def load_json(path):
    try:
        with open(path) as f:
            return json.load(f)
    except Exception:
        return []

BASE = os.path.dirname(__file__)
BLOCK_SCORES = load_json(os.path.join(BASE, "data", "block_scores.json"))
BUSINESSES   = load_json(os.path.join(BASE, "data", "businesses_scraped.json")) or \
               load_json(os.path.join(BASE, "data", "businesses_fallback.json"))

# ─── HELPERS ──────────────────────────────────────────────────────────────────
NEIGHBORHOODS = [
    {"name": "Capitol Heights",    "lat": 32.3617, "lng": -86.2792, "council_member": "Council Member Robert Gambote",  "civic_health_score": 48, "infrastructure_score": 45, "permit_velocity_score": 62, "safety_score": 71, "contract_equity_score": 24, "city_spend_last_3yr": 180000,  "investment_gap": 1920000},
    {"name": "Cloverdale",         "lat": 32.3560, "lng": -86.2850, "council_member": "Council Member Oronde Mitchell", "civic_health_score": 61, "infrastructure_score": 60, "permit_velocity_score": 70, "safety_score": 65, "contract_equity_score": 50, "city_spend_last_3yr": 420000,  "investment_gap": 1680000},
    {"name": "Downtown",           "lat": 32.3792, "lng": -86.3077, "council_member": "Council Member Tracy Larkin",   "civic_health_score": 74, "infrastructure_score": 78, "permit_velocity_score": 85, "safety_score": 55, "contract_equity_score": 77, "city_spend_last_3yr": 980000,  "investment_gap": 1120000},
    {"name": "Garden District",    "lat": 32.3700, "lng": -86.3200, "council_member": "Council Member Cynthia Inniss", "civic_health_score": 91, "infrastructure_score": 95, "permit_velocity_score": 88, "safety_score": 90, "contract_equity_score": 90, "city_spend_last_3yr": 2100000, "investment_gap": 0},
    {"name": "Chisholm",           "lat": 32.3400, "lng": -86.2900, "council_member": "Council Member Charles Price",  "civic_health_score": 39, "infrastructure_score": 35, "permit_velocity_score": 45, "safety_score": 60, "contract_equity_score": 16, "city_spend_last_3yr": 95000,   "investment_gap": 2005000},
    {"name": "Old Cloverdale",     "lat": 32.3520, "lng": -86.2780, "council_member": "Council Member Oronde Mitchell", "civic_health_score": 67, "infrastructure_score": 65, "permit_velocity_score": 72, "safety_score": 75, "contract_equity_score": 55, "city_spend_last_3yr": 550000,  "investment_gap": 1550000},
]

CONTRACTS = [
    {"contract_id": "MGM-2025-0042", "category": "landscaping",    "estimated_value": 42000,  "historical_frequency": "annual",    "predicted_next": "2025-04-01", "matched_business": {"name": "Green Thumb Montgomery", "match_score": 91}},
    {"contract_id": "MGM-2025-0089", "category": "road_repair",    "estimated_value": 125000, "historical_frequency": "quarterly", "predicted_next": "2025-04-15", "matched_business": {"name": "Montgomery Asphalt Co.",  "match_score": 84}},
    {"contract_id": "MGM-2025-0031", "category": "waste_removal",  "estimated_value": 67000,  "historical_frequency": "monthly",   "predicted_next": "2025-03-28", "matched_business": {"name": "Eastside Clean Team",    "match_score": 78}},
    {"contract_id": "MGM-2025-0056", "category": "it_support",     "estimated_value": 38000,  "historical_frequency": "annual",    "predicted_next": "2025-05-01", "matched_business": {"name": "Capital City Tech",       "match_score": 72}},
    {"contract_id": "MGM-2025-0071", "category": "event_services", "estimated_value": 22000,  "historical_frequency": "seasonal",  "predicted_next": "2025-06-01", "matched_business": {"name": "River Region Events",     "match_score": 88}},
]

CACHED_OUTPUTS = {
    "entrepreneur": (
        "The survival score of 61 indicates moderate commercial viability at this address. "
        "Three businesses have operated here since 2018, two closing within 14 months. Crime "
        "density in the half-mile radius sits at 14 incidents annually, below the city average of 21.\n\n"
        "The two primary risk factors are competitor saturation — three active food-service permits "
        "within 0.8 miles — and the building's history of short-tenancy cycles, suggesting structural "
        "lease issues or foot traffic limitations.\n\n"
        "Recommendation: Do not sign a multi-year lease here. If you proceed, negotiate a six-month "
        "trial. Alternatively, 456 Fairview Ave scores 84/100 with zero direct competitors in this "
        "category and a rising investment trend."
    ),
    "contractor": (
        "1. Cover Letter\n"
        "Green Thumb Montgomery is a family-operated business committed to serving the City of Montgomery "
        "with pride, reliability, and community investment.\n\n"
        "2. Scope of Work\n"
        "• Weekly mowing and edging of all designated city parcels\n"
        "• Monthly mulching of municipal flower beds\n"
        "• Seasonal planting (spring/fall cycles)\n\n"
        "3. Pricing Schedule\n"
        "Weekly maintenance (52 visits): $28,000\n"
        "Monthly mulching (12 cycles): $6,000\n"
        "Seasonal planting (2 cycles): $5,500\n"
        "TOTAL: $39,500\n\n"
        "4. Timeline\n"
        "Week 1: Site survey and crew scheduling\n"
        "Week 2: Service commencement on designated parcels\n"
        "Monthly: Progress reporting to City Facilities Manager\n\n"
        "5. Why Us\n"
        "Green Thumb Montgomery has served Montgomery property owners for 7 years, employing 12 local "
        "residents. We are ready to serve our city."
    ),
    "resident": (
        "Dear Council Member Gambote,\n\n"
        "My name is a longtime resident of Capitol Heights, a neighborhood I love for its deep roots and "
        "community spirit. I am writing today because the data reveals a troubling disparity in how our "
        "neighborhood is prioritized compared to other areas of Montgomery.\n\n"
        "Last year, Capitol Heights received $180,000 in city infrastructure investment. The Garden "
        "District, the city's wealthiest neighborhood, received $2,100,000 — nearly twelve times as much. "
        "That $1.92 million gap translates directly into cracked roads I navigate daily, streetlights "
        "that have been out for months, and parks my children cannot safely use after dark.\n\n"
        "My single, specific ask: allocate a minimum of $500,000 to Capitol Heights infrastructure in "
        "the FY2026 city budget, with a published timeline for road repair on the five worst-rated "
        "blocks identified in the city's own maintenance records.\n\n"
        "The numbers in this letter came from the city's own open data. We are not asking for anything "
        "that is not already documented as needed. We are asking for equity.\n\n"
        "Respectfully, A Resident of Capitol Heights"
    ),
    "chat": (
        "Based on Montgomery's civic data, here's what I can tell you:\n\n"
        "**Safest neighborhoods:** Garden District (safety score: 90/100) and Old Cloverdale (75/100) "
        "consistently rank highest. Capitol Heights and Chisholm have more safety concerns.\n\n"
        "**Best for business:** Downtown has the highest permit activity (85/100) and rising investment. "
        "Garden District has the most city investment ($2.1M over 3 years).\n\n"
        "**Investment gaps:** Chisholm faces the largest gap ($2M below Garden District). Capitol Heights "
        "is close behind at $1.92M. These neighborhoods need the most civic attention.\n\n"
        "**Upcoming contracts:** The city has 5 active procurement opportunities ranging from $22K "
        "(event services) to $125K (road repair). Match scores range from 72-91%.\n\n"
        "Feel free to ask me about specific neighborhoods, business types, or contracts!"
    ),
}

def nearest_hood(lat, lng):
    best = NEIGHBORHOODS[0]
    best_dist = float("inf")
    for n in NEIGHBORHOODS:
        d = (n["lat"] - lat) ** 2 + (n["lng"] - lng) ** 2
        if d < best_dist:
            best_dist = d
            best = n
    return best

def survival_data(lat, lng):
    """Return survival score, history and alt recommendations from flat JSON."""
    if BLOCK_SCORES:
        best = min(BLOCK_SCORES, key=lambda b: (b["lat"] - lat) ** 2 + (b["lng"] - lng) ** 2)
        score = best.get("survival_score", random.randint(45, 85))
        history = best.get("history", [])[:5]
    else:
        score = random.randint(45, 85)
        history = [
            {"year": 2021, "business_name": "Sample Shop", "permit_type": "commercial", "status": "expired_closed"},
            {"year": 2023, "business_name": "Corner Cafe",  "permit_type": "commercial", "status": "active"},
        ]

    alts = [
        {"address": "456 Fairview Ave, Montgomery AL", "survival_score": 84},
        {"address": "789 Atlanta Hwy, Montgomery AL",  "survival_score": 81},
        {"address": "321 Mobile Rd, Montgomery AL",    "survival_score": 79},
    ]
    return score, history, alts

# ─── ENDPOINTS ────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "CivicPulse API running", "version": "1.0.0"}

@app.get("/api/heatmap")
def heatmap(category: str = Query(None)):
    """Return all block scores for the map layer, optionally filtered by business category."""
    # Category multipliers simulate different viability per industry
    category_multipliers = {
        "restaurant": 1.0, "cafe": 1.05, "bakery": 0.95,
        "salon": 0.9, "barbershop": 0.85, "retail": 1.1,
        "auto": 0.8, "gym": 0.75, "clinic": 1.15, "pharmacy": 1.2,
    }
    multiplier = category_multipliers.get(category, 1.0) if category else 1.0

    if BLOCK_SCORES:
        return [
            {
                "lat": b["lat"],
                "lng": b["lng"],
                "survival_score": min(100, max(0, int(b["survival_score"] * multiplier))),
            }
            for b in BLOCK_SCORES
        ]
    # Fallback: scatter mock data around Montgomery
    mock = []
    for i in range(60):
        raw = random.randint(20, 95)
        mock.append({
            "lat": 32.3617 + (random.random() - 0.5) * 0.1,
            "lng": -86.2964 + (random.random() - 0.5) * 0.1,
            "survival_score": min(100, max(0, int(raw * multiplier))),
        })
    return mock

@app.get("/api/block")
def block(lat: float = Query(...), lng: float = Query(...), category: str = Query("restaurant")):
    """Block-level analysis for Entrepreneur mode."""
    score, history, alts = survival_data(lat, lng)
    hood = nearest_hood(lat, lng)
    trend = "rising" if score >= 65 else ("stable" if score >= 45 else "declining")

    try:
        from scripts.geo_queries import get_crimes_near
        crimes = get_crimes_near(lng, lat, 0.5)
        crime_count = len(crimes)
    except Exception:
        crime_count = 14

    return {
        "address": f"{round(lat, 4)}, {round(lng, 4)} — Montgomery AL",
        "lat": lat, "lng": lng,
        "survival_score": score,
        "business_category": category,
        "permit_history": history,
        "crime_density_halfmile": crime_count,
        "competitor_count": random.randint(1, 5),
        "investment_trend": trend,
        "city_spend_last_3yr": hood.get("city_spend_last_3yr", 200000),
        "top_3_alternatives": alts,
    }

@app.get("/api/neighborhood")
def neighborhood(lat: float = Query(...), lng: float = Query(...)):
    """Neighborhood data for Resident mode."""
    hood = nearest_hood(lat, lng)
    garden = next(n for n in NEIGHBORHOODS if n["name"] == "Garden District")
    return {
        **hood,
        "comparison_district": {
            "name": garden["name"],
            "city_spend_last_3yr": garden["city_spend_last_3yr"],
        },
    }

@app.get("/api/contracts")
def contracts():
    """Upcoming contracts for Contractor mode."""
    return CONTRACTS

class GenReq(BaseModel):
    mode: str
    data: dict

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
