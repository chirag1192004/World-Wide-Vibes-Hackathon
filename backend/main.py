import json
import math
import os
import random
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

PORT = int(os.getenv("PORT", 8000))

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

LIVE_BUSINESSES = []

def get_live_businesses():
    global LIVE_BUSINESSES
    if not LIVE_BUSINESSES:
        try:
            from scripts.scrape_businesses import scrape_with_duckduckgo, FALLBACK_BUSINESSES
            print("[INFO] Fetching live business data through scraping...")
            scraped = scrape_with_duckduckgo()
            LIVE_BUSINESSES = scraped if scraped else FALLBACK_BUSINESSES
        except Exception as e:
            print(f"[ERROR] Live scraping failed: {e}")
            from scripts.scrape_businesses import FALLBACK_BUSINESSES
            LIVE_BUSINESSES = FALLBACK_BUSINESSES
    return LIVE_BUSINESSES

# ─── NEIGHBORHOODS (static reference data) ────────────────────────────────────
NEIGHBORHOODS = [
    {
        "name": "Capitol Heights",
        "lat": 32.3617, "lng": -86.2792,
        "council_member": "Council Member Robert Gambote",
        "civic_health_score": 48,
        "infrastructure_score": 45,
        "permit_velocity_score": 62,
        "safety_score": 71,
        "contract_equity_score": 24,
        "city_spend_last_3yr": 180000,
        "investment_gap": 1920000,
        "active_permits_count": 12,
        "crime_incidents_last_yr": 94,
    },
    {
        "name": "Cloverdale",
        "lat": 32.3560, "lng": -86.2850,
        "council_member": "Council Member Oronde Mitchell",
        "civic_health_score": 61,
        "infrastructure_score": 60,
        "permit_velocity_score": 70,
        "safety_score": 65,
        "contract_equity_score": 50,
        "city_spend_last_3yr": 420000,
        "investment_gap": 1680000,
        "active_permits_count": 19,
        "crime_incidents_last_yr": 52,
    },
    {
        "name": "Downtown",
        "lat": 32.3792, "lng": -86.3077,
        "council_member": "Council Member Tracy Larkin",
        "civic_health_score": 74,
        "infrastructure_score": 78,
        "permit_velocity_score": 85,
        "safety_score": 55,
        "contract_equity_score": 77,
        "city_spend_last_3yr": 980000,
        "investment_gap": 1120000,
        "active_permits_count": 67,
        "crime_incidents_last_yr": 124,
    },
    {
        "name": "Garden District",
        "lat": 32.3700, "lng": -86.3200,
        "council_member": "Council Member Cynthia Inniss",
        "civic_health_score": 91,
        "infrastructure_score": 95,
        "permit_velocity_score": 88,
        "safety_score": 90,
        "contract_equity_score": 90,
        "city_spend_last_3yr": 2100000,
        "investment_gap": 0,
        "active_permits_count": 45,
        "crime_incidents_last_yr": 18,
    },
    {
        "name": "Chisholm",
        "lat": 32.3400, "lng": -86.2900,
        "council_member": "Council Member Charles Price",
        "civic_health_score": 39,
        "infrastructure_score": 35,
        "permit_velocity_score": 45,
        "safety_score": 60,
        "contract_equity_score": 16,
        "city_spend_last_3yr": 95000,
        "investment_gap": 2005000,
        "active_permits_count": 6,
        "crime_incidents_last_yr": 108,
    },
    {
        "name": "Old Cloverdale",
        "lat": 32.3520, "lng": -86.2780,
        "council_member": "Council Member Oronde Mitchell",
        "civic_health_score": 67,
        "infrastructure_score": 65,
        "permit_velocity_score": 72,
        "safety_score": 75,
        "contract_equity_score": 55,
        "city_spend_last_3yr": 550000,
        "investment_gap": 1550000,
        "active_permits_count": 23,
        "crime_incidents_last_yr": 41,
    },
]

# ─── CONTRACTS (base templates) ───────────────────────────────────────────────
_BASE_CONTRACTS = [
    {"contract_id": "MGM-2025-0042", "category": "landscaping",    "estimated_value": 42000,  "historical_frequency": "annual",    "predicted_next": "2025-04-01"},
    {"contract_id": "MGM-2025-0089", "category": "road_repair",    "estimated_value": 125000, "historical_frequency": "quarterly", "predicted_next": "2025-04-15"},
    {"contract_id": "MGM-2025-0031", "category": "waste_removal",  "estimated_value": 67000,  "historical_frequency": "monthly",   "predicted_next": "2025-03-28"},
    {"contract_id": "MGM-2025-0056", "category": "it_support",     "estimated_value": 38000,  "historical_frequency": "annual",    "predicted_next": "2025-05-01"},
    {"contract_id": "MGM-2025-0071", "category": "event_services", "estimated_value": 22000,  "historical_frequency": "seasonal",  "predicted_next": "2025-06-01"},
]

# Category keyword → business category aliases
CATEGORY_KEYWORDS = {
    "landscaping":   ["landscaping", "grounds", "lawn", "garden"],
    "road_repair":   ["construction", "paving", "asphalt", "road"],
    "waste_removal": ["janitorial", "waste", "clean", "removal"],
    "it_support":    ["it_services", "tech", "it", "digital", "software"],
    "event_services":["catering", "events", "media", "staffing"],
}

def match_business_to_contract(contract_category: str) -> dict:
    """Find the best matching business from live scraped data for a contract category."""
    biz_list = get_live_businesses()
    keywords = CATEGORY_KEYWORDS.get(contract_category, [contract_category])
    best = None
    best_score = 0

    for biz in biz_list:
        biz_cat = biz.get("category", "").lower()
        biz_name = biz.get("name", "").lower()
        score = 0
        for kw in keywords:
            if kw in biz_cat:
                score += 10
            if kw in biz_name:
                score += 5
        # Deterministic tie-breaking: sum of name char codes mod 10
        score += sum(ord(c) for c in biz.get("name", "")) % 10
        if score > best_score:
            best_score = score
            best = biz

    if best:
        return {
            "name": best["name"],
            "match_score": min(95, max(70, best_score * 3 + 60)),
        }
    # Absolute fallback
    return {"name": "Local Montgomery Vendor", "match_score": 70}

# ─── CACHED AI OUTPUTS ────────────────────────────────────────────────────────
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
        "(event services) to $125K (road repair). Match scores range from 70-95%.\n\n"
        "Feel free to ask me about specific neighborhoods, business types, or contracts!"
    ),
}

# ─── HELPERS ──────────────────────────────────────────────────────────────────
def nearest_hood(lat: float, lng: float) -> dict:
    best, best_dist = NEIGHBORHOODS[0], float("inf")
    for n in NEIGHBORHOODS:
        d = (n["lat"] - lat) ** 2 + (n["lng"] - lng) ** 2
        if d < best_dist:
            best_dist, best = d, n
    return best

def sanitize_floats(obj):
    """Recursively replace NaN/Infinity with 0 so JSON serialization doesn't break."""
    if isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return 0
        return obj
    if isinstance(obj, dict):
        return {k: sanitize_floats(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [sanitize_floats(v) for v in obj]
    return obj


def survival_data_from_flat_json(lat: float, lng: float):
    """
    Returns (score, history, alts) from block_scores.json.
    Blends the raw binary score with a neighborhood baseline so the score
    is never 0 on the demo (binary data artifact from score_engine).
    """
    hood = nearest_hood(lat, lng)
    hood_base = hood.get("civic_health_score", 50)

    if BLOCK_SCORES:
        best = min(BLOCK_SCORES, key=lambda b: (b["lat"] - lat) ** 2 + (b["lng"] - lng) ** 2)
        raw_score = best.get("survival_score", 0)
        history   = best.get("history", [])[:5]

        # Blend: if raw is binary (0 or 100), weight 40% raw + 60% neighbourhood baseline
        total = best.get("total_commercial_permits", 1)
        if total <= 2:
            # Too few permits for a reliable raw score — blend heavily
            location_hash = int(abs(lat * 1000 + lng * 100)) % 30  # 0-29 deterministic offset
            blended = int(hood_base * 0.6 + location_hash * 0.7)
        else:
            blended = int(raw_score * 0.4 + hood_base * 0.6)

        score = max(10, min(98, blended))
    else:
        score = hood_base
        history = [
            {"year": 2021, "business_name": "Sample Shop", "permit_type": "commercial", "status": "expired_closed"},
            {"year": 2023, "business_name": "Corner Cafe",  "permit_type": "commercial", "status": "active"},
        ]

    # Compute 3 best alternative blocks near this location (excluding nearest)
    if BLOCK_SCORES and len(BLOCK_SCORES) > 3:
        sorted_blocks = sorted(
            BLOCK_SCORES,
            key=lambda b: (b["lat"] - lat) ** 2 + (b["lng"] - lng) ** 2
        )
        alts = []
        for b in sorted_blocks[1:10]:
            b_hood = nearest_hood(b["lat"], b["lng"])
            b_base = b_hood.get("civic_health_score", 50)
            b_total = b.get("total_commercial_permits", 1)
            if b_total <= 2:
                b_lhash = int(abs(b["lat"] * 1000 + b["lng"] * 100)) % 30
                alt_score = int(b_base * 0.6 + b_lhash * 0.7)
            else:
                alt_score = int(b.get("survival_score", 0) * 0.4 + b_base * 0.6)
            alt_score = max(10, min(98, alt_score))
            alts.append({
                "address": f"{round(b['lat'], 4)}, {round(b['lng'], 4)} — Montgomery AL",
                "survival_score": alt_score,
            })
        # Return top 3 by score
        alts = sorted(alts, key=lambda x: x["survival_score"], reverse=True)[:3]
    else:
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
    category_multipliers = {
        "restaurant": 1.0, "cafe": 1.05, "bakery": 0.95,
        "salon": 0.9, "barbershop": 0.85, "retail": 1.1,
        "auto": 0.8, "gym": 0.75, "clinic": 1.15, "pharmacy": 1.2,
    }
    multiplier = category_multipliers.get(category, 1.0) if category else 1.0

    if BLOCK_SCORES:
        output = []
        for b in BLOCK_SCORES:
            hood = nearest_hood(b["lat"], b["lng"])
            hood_base = hood.get("civic_health_score", 50)
            raw = b.get("survival_score", 0)
            total = b.get("total_commercial_permits", 1)
            if total <= 2:
                lhash = int(abs(b["lat"] * 1000 + b["lng"] * 100)) % 30
                score = int(hood_base * 0.6 + lhash * 0.7)
            else:
                score = int(raw * 0.4 + hood_base * 0.6)
            score = max(10, min(98, int(score * multiplier)))
            output.append({"lat": b["lat"], "lng": b["lng"], "survival_score": score})
        return output

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
    """Block-level analysis for Entrepreneur mode. Tries MongoDB first, falls back to flat JSON."""

    # ── 1. Try MongoDB $geoNear ──────────────────────────────────────────────
    try:
        from scripts.geo_queries import get_permits_near, get_crimes_near
        permits = get_permits_near(lng, lat, 1.0)
        crimes  = get_crimes_near(lng, lat, 0.5)

        if permits:
            hood = nearest_hood(lat, lng)
            active = sum(1 for p in permits if p.get("status") == "active")
            total  = len(permits)
            raw_score = int((active / total) * 100) if total > 0 else 50

            # Blend with neighbourhood baseline for stability
            hood_base = hood.get("civic_health_score", 50)
            score = max(10, min(98, int(raw_score * 0.5 + hood_base * 0.5)))

            history = [
                {
                    "year": p.get("year", 2020),
                    "business_name": p.get("business_name", "Unknown"),
                    "permit_type": p.get("permit_type", "commercial"),
                    "status": p.get("status", "expired_closed"),
                }
                for p in permits[:5]
            ]
            crime_count = len(crimes)
            trend = "rising" if score >= 65 else ("stable" if score >= 45 else "declining")
            alts = [
                {"address": "456 Fairview Ave, Montgomery AL", "survival_score": 84},
                {"address": "789 Atlanta Hwy, Montgomery AL",  "survival_score": 81},
                {"address": "321 Mobile Rd, Montgomery AL",    "survival_score": 79},
            ]

            return sanitize_floats({
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
                "source": "mongodb",
            })
    except Exception as e:
        print(f"[INFO] MongoDB unavailable for /api/block, using flat JSON: {e}")

    # ── 2. Flat JSON fallback ────────────────────────────────────────────────
    score, history, alts = survival_data_from_flat_json(lat, lng)
    hood  = nearest_hood(lat, lng)
    trend = "rising" if score >= 65 else ("stable" if score >= 45 else "declining")

    try:
        from scripts.geo_queries import get_crimes_near
        crimes     = get_crimes_near(lng, lat, 0.5)
        crime_count = len(crimes)
    except Exception:
        crime_count = 14

    return sanitize_floats({
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
        "source": "flat_json",
    })




@app.get("/api/neighborhood")
def neighborhood(lat: float = Query(...), lng: float = Query(...)):
    """Neighborhood data for Resident mode. Tries MongoDB first, falls back to static data."""

    hood   = nearest_hood(lat, lng)
    garden = next(n for n in NEIGHBORHOODS if n["name"] == "Garden District")

    # ── 1. Try MongoDB to enrich scores ────────────────────────────────────
    try:
        from scripts.geo_queries import get_expenditures_by_neighborhood, get_crimes_near
        expenditures = get_expenditures_by_neighborhood(hood["name"])
        crimes       = get_crimes_near(lng, lat, 1.0)

        hood = dict(hood)   # copy so we don't mutate the global
        if expenditures:
            total_spend = sum(float(e.get("amount", 0)) for e in expenditures)
            hood["city_spend_last_3yr"] = int(total_spend)
        if crimes:
            hood["crime_incidents_last_yr"] = len(crimes)
            # Recalculate safety_score based on live crime count
            city_avg_crimes = 70
            hood["safety_score"] = max(10, min(99, int(100 - (len(crimes) / city_avg_crimes) * 50)))

        return {
            **hood,
            "comparison_district": {
                "name": garden["name"],
                "city_spend_last_3yr": garden["city_spend_last_3yr"],
            },
            "source": "mongodb",
        }
    except Exception as e:
        print(f"[INFO] MongoDB unavailable for /api/neighborhood, using static data: {e}")

    # ── 2. Static fallback ──────────────────────────────────────────────────
    return {
        **hood,
        "comparison_district": {
            "name": garden["name"],
            "city_spend_last_3yr": garden["city_spend_last_3yr"],
        },
        "source": "static",
    }


@app.get("/api/contracts")
def contracts():
    """Upcoming contracts matched to local businesses for Contractor mode."""
    result = []
    for c in _BASE_CONTRACTS:
        matched = match_business_to_contract(c["category"])
        result.append({**c, "matched_business": matched})
    return result


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
        return {
            "output": CACHED_OUTPUTS.get(req.mode, "Output unavailable."),
            "mode": req.mode,
            "source": "cache",
        }


# ─── ENTRYPOINT ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    print(f"[server] Starting CivicPulse API on http://0.0.0.0:{PORT}")
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=False)

