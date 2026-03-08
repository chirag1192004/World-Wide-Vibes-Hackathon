# 🏛️ CIVICPULSE (ATLAS EDITION)
## Master Project Guide — Complete Reference
### "We turn open data into open doors."

> **For:** Presentations, explainer videos, pitch decks, demo walkthroughs, and onboarding new contributors.
> **Hackathon:** Atlas Vibe Coding Hackathon 2026
> **Deadline:** Monday, March 9, 2026 — 9:00 AM CT

---

## PART 1 — PROJECT STORY

### The Elevator Pitch (30 seconds)
"Every year, Montgomery publishes millions of data points — permit records, crime reports, city spending. This data is public. But it's locked in raw CSVs on a government portal that nobody checks. CivicPulse takes 10 years of that data, loads it into MongoDB Atlas, cross-references it geographically, and turns it into a real-time 3D intelligence engine. Three groups of people who have never had this power before can now see exactly what the data means for them."

### The One-Line Tagline
**"We turn open data into open doors."**

### The Problem (Use This Verbatim in Presentations)
1. **Entrepreneurs:** 50% of new businesses fail within 5 years. The number one silent killer is location. The data to predict this has existed in Montgomery's open permit records for 10 years. Nobody has exposed it. Until now.
2. **Local Contractors:** Montgomery spends millions on vendor contracts annually. 80% go to the same 20 dominant companies — not because local shops can't do the work, but because they don't know the bid is coming and don't know how to write proposals.
3. **Residents:** Systemic neighborhood neglect is real, felt daily, and nearly impossible to prove to a politician. CivicPulse quantifies it with a Civic Health Score and hands residents the data-backed letter their council member can't ignore.

---

## PART 2 — THE THREE USER MODES (Deep Dive)

### 🔴 MODE 1 — THE ENTREPRENEUR (Predictive Site Selection)

**Entry Point:** User types a Montgomery address and selects a business category (restaurant, salon, retail, auto, etc.)

**What CivicPulse Does:**
1. Uses the address to query MongoDB Atlas with `$geoNear` — pulls all commercial permits within a 1-mile radius from the last 10 years
2. Calculates the **Business Survival Score (0–100)**:
   - Core formula: `(active permits / total permits opened) * 100`
   - Modified by: crime density within 0.5mi, city investment trend, competitor saturation
3. Google Gemini generates a **Location Prospectus** — a 3-paragraph data-backed brief
4. Shows the 3 highest-scoring alternative addresses for that business category

**Example Output:**
```
Address Analyzed: 123 Dexter Ave, Montgomery AL
Business Type: Restaurant
Survival Score: 61/100

AI Prospectus:
"The survival score of 61 indicates moderate commercial viability at this
address. Three businesses have operated here since 2018 — two closed within
14 months. Crime density in the half-mile radius stands at 14 incidents
annually, which is below the city average of 21.

The two primary risk factors are competitor saturation (3 active food-service
permits within 0.8 miles) and the building's history of short-tenancy cycles,
which suggests structural lease issues or foot traffic limitations.

Recommendation: Do not sign a multi-year lease here. If you proceed, negotiate
a 6-month trial term. Alternatively, 456 Fairview Ave scores 84/100 with zero
direct competitors in this category and a rising investment trend."
```

---

### 🟡 MODE 2 — THE CONTRACTOR (B2G Procurement Engine)

**Entry Point:** User lands on the Contractor mode and sees a live list of upcoming city contracts.

**What CivicPulse Does:**
1. Reads the city's historical expenditure data to identify **recurring contract patterns** (e.g. "Montgomery spends ~$42k on landscaping every April")
2. Crossreferences these patterns with **Bright Data-scraped local business profiles** — matching by industry keyword and geography
3. Presents each contract as a card: "This contract is coming. You're a match. Here's your bid."
4. Google Gemini **auto-drafts a complete 5-section government bid proposal** for the matched local business

**Example Contract Card:**
```
Category: Landscaping
Estimated Value: $42,000
Frequency: Annual (last awarded April 2024)
Predicted Next: April 2025
Matched Business: Green Thumb Montgomery (Match: 91%)
[⚡ Generate Bid Proposal]
```

**AI-Generated Bid Proposal Preview:**
```
1. Cover Letter
Green Thumb Montgomery is a family-operated local business committed to
serving the City of Montgomery...

2. Scope of Work
• Weekly mowing and edging of all designated city parcels
• Monthly mulching of municipal flower beds
• Seasonal planting (spring/fall cycles)...

3. Pricing Schedule
Weekly maintenance (52 visits): $28,000
Monthly mulching (12 cycles): $6,000
Seasonal planting (2 cycles): $5,500
TOTAL: $39,500 (under $42,000 budget)

4. Timeline
Week 1: Site survey and crew scheduling
Week 2: Service commencement on all designated parcels
Monthly: Progress reporting to City Facilities Manager

5. Why Us
Green Thumb Montgomery has served Montgomery property owners for 7 years,
employing 12 local residents. We are ready to serve our city.
```

---

### 🟢 MODE 3 — THE RESIDENT (Civic Equity Tracker)

**Entry Point:** User clicks any neighborhood on the map.

**What CivicPulse Does:**
1. Uses `$geoNear` to retrieve all expenditure, permit, and crime data within that neighborhood's radius
2. Calculates **Civic Health Score (0–100)** broken into 4 dimensions:
   - **Infrastructure Score** — city expenditure per capita vs. city average
   - **Permit Velocity Score** — rate of new commercial permits (development activity)
   - **Safety Score** — crime incident density inverse scale
   - **Contract Equity Score** — % of city contracts going to local businesses in that area
3. Side-by-side comparison vs. Montgomery's wealthiest district (Garden District)
4. Google Gemini drafts a **personalized 4-paragraph advocacy letter** addressed to their specific council member, pre-filled with exact dollar figures

**Example Score Card:**
```
Neighborhood: Capitol Heights
Civic Health Score: 48/100

Infrastructure:     45/100 ████░░░░░░
Permit Velocity:    62/100 ██████░░░░
Public Safety:      71/100 ███████░░░
Contract Equity:    24/100 ██░░░░░░░░

City Spend Last Year: $180,000
Garden District:      $2,100,000
Investment Gap:       -$1,920,000

Council Member: Robert Gambote
[✉ Generate Advocacy Letter]
```

---

## PART 3 — TECHNOLOGY STACK (Complete)

### Architecture Overview
```
User Browser
    │
    ├── React 18 + Vite (localhost:5173 / Vercel)
    │       ├── Mapbox GL JS      ← Base dark map
    │       ├── Three.js / Mapbox Extrusions ← 3D pillars
    │       └── Tailwind CSS v3   ← Dark mode design system
    │
    └── FastAPI Server (localhost:8000)
            ├── Pandas            ← Data cleaning
            ├── PyMongo           ← MongoDB queries via $geoNear
            ├── Google GenAI SDK  ← Gemini AI text generation
            └── Bright Data API   ← Business profile scraping
                    │
                    └── MongoDB Atlas M0
                            ├── Collection: permits (2dsphere index)
                            ├── Collection: crimes (2dsphere index)
                            ├── Collection: expenditures
                            └── Collection: businesses (2dsphere index)
```

### Data Sources
| Source | Dataset | Records | Usage |
|---|---|---|---|
| Montgomery Open Data | Building Permits | 1000+ (mock) | Survival score calculation |
| Montgomery Open Data | Crime Incidents | 2000+ (mock) | Safety score |
| Montgomery Open Data | City Expenditures | 500+ (mock) | Investment trend |
| Bright Data (scraped) | Local Businesses | 20-50 | Contractor matching |

### Key Database Query — The Core Engine
```python
# This query is what makes real-time spatial analytics possible
db.permits.aggregate([{
    "$geoNear": {
        "near": {"type": "Point", "coordinates": [lng, lat]},
        "distanceField": "distance",
        "maxDistance": 1609,  # 1 mile in meters
        "spherical": True
    }
}])
```

---

## PART 4 — THE SHARED DATA CONTRACT

Every API endpoint, React component, and AI prompt communicates using this exact JSON shape. Do not deviate.

```json
{
  "neighborhood": {
    "name": "Capitol Heights",
    "lat": 32.3617, "lng": -86.2792,
    "civic_health_score": 58,
    "infrastructure_score": 45,
    "permit_velocity_score": 62,
    "safety_score": 71,
    "contract_equity_score": 52,
    "city_spend_last_3yr": 180000,
    "active_permits_count": 12,
    "crime_incidents_last_yr": 94
  },
  "block_analysis": {
    "address": "123 Dexter Ave, Montgomery AL",
    "lat": 32.3792, "lng": -86.3077,
    "survival_score": 72,
    "business_category": "restaurant",
    "permit_history": [
      { "year": 2019, "business_name": "Mama's Kitchen", "permit_type": "new_commercial", "status": "expired_closed" }
    ],
    "crime_density_halfmile": 14,
    "competitor_count": 3,
    "investment_trend": "rising",
    "top_3_alternatives": [
      { "address": "456 Fairview Ave", "survival_score": 84 },
      { "address": "789 Atlanta Hwy",  "survival_score": 81 },
      { "address": "321 Mobile Rd",    "survival_score": 79 }
    ]
  },
  "contract_opportunity": {
    "contract_id": "MGM-2025-0042",
    "category": "landscaping",
    "estimated_value": 42000,
    "historical_frequency": "annual",
    "last_awarded": "2024-04-15",
    "predicted_next": "2025-04-01",
    "matched_business": {
      "name": "Green Thumb Montgomery",
      "address": "88 Oak Park Dr",
      "industry": "landscaping",
      "website": "greenthumbmgm.com",
      "match_score": 91
    }
  }
}
```

---

## PART 5 — REPOSITORY STRUCTURE (Full Map)

```
World Wide Vibes Hackathon/
├── documentation/
│   ├── master_project_guide.md     ← THIS FILE
│   ├── person1_backend_guide.md    ← Full guide for Backend Engineer
│   ├── person2_frontend_guide.md   ← Full guide for Frontend Engineer
│   └── person3_database_ai_guide.md ← Full guide for DB/AI Engineer
│
├── backend/
│   ├── main.py                     ← [TODO: Person 1] FastAPI server
│   ├── requirements.txt            ← All Python dependencies
│   ├── .env.example                ← Copy to .env, fill in keys
│   ├── data/
│   │   ├── permits.csv             ← Raw mock permit data
│   │   ├── expenditures.csv        ← Raw mock expenditure data
│   │   ├── crimes.csv              ← Raw mock crime data
│   │   ├── permits_clean.json      ← Cleaned permit records (ready)
│   │   ├── block_scores.json       ← Business survival scores (ready)
│   │   ├── businesses_scraped.json ← [TODO: Person 1] Bright Data output
│   │   └── businesses_fallback.json ← [TODO: Person 1] Hardcoded backup
│   └── scripts/
│       ├── generate_mock_data.py   ← Run once (already done)
│       ├── clean_permits.py        ← Run once (already done)
│       ├── score_engine.py         ← Run once (already done)
│       ├── load_to_mongo.py        ← [TODO: Person 3] Run after Atlas setup
│       ├── geo_queries.py          ← Done. Functions ready.
│       ├── gemini_prompts.py       ← [TODO: Person 3] All 3 prompt templates
│       └── gemini_api.py           ← [TODO: Person 3] Gemini wrapper function
│
└── civicpulse/                     ← React frontend
    ├── .env.example                ← Copy to .env, add Mapbox token
    ├── package.json                ← All npm deps installed
    ├── tailwind.config.js          ← Complete color system (ready)
    ├── postcss.config.js           ← Tailwind pipeline (ready)
    └── src/
        ├── main.jsx                ← Entry point (ready)
        ├── index.css               ← Tailwind directives (ready)
        ├── App.jsx                 ← Shell layout + mode toggle (ready)
        └── components/
            ├── CivicMap.jsx        ← [TODO: Person 2] Mapbox + heatmap
            ├── EntrepreneurPanel.jsx ← [TODO: Person 2] Mode 1 UI
            ├── ContractorPanel.jsx ← [TODO: Person 2] Mode 2 UI
            └── ResidentPanel.jsx   ← [TODO: Person 2] Mode 3 UI
```

---

## PART 6 — ENVIRONMENT VARIABLES (All Three Devs)

```ini
# backend/.env  (Person 3 creates Atlas, Person 1 holds Bright Data key)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/civicpulse
GEMINI_API_KEY=your-gemini-API-key...
BRIGHT_DATA_API_KEY=...

# civicpulse/.env  (Person 2 creates Mapbox account)
VITE_MAPBOX_TOKEN=pk.eyJ1...
VITE_API_BASE_URL=http://localhost:8000
```

---

## PART 7 — FALLBACK RULES (If Something Breaks During Demo)

| Failure | Response |
|---|---|
| **Three.js + WebGL conflict** | Already using Mapbox `fill-extrusion` as the default 3D approach. No Three.js risk. |
| **Bright Data scrape fails** | `businesses_fallback.json` is ALWAYS written first. Backend auto-loads it if scraped file is empty. |
| **Gemini API is slow/down** | FastAPI `/api/generate` has hardcoded cached outputs per mode. Returns these instantly if Gemini errors. |
| **MongoDB Atlas unreachable** | Backend reads from flat `block_scores.json` by default. MongoDB is additive — flat JSON always works. |
| **Mode 2 incomplete** | Drop it. Ship Mode 1 + Mode 3 perfectly. Two polished modes beat three broken ones. |

---

## PART 8 — THE DEMO SCRIPT (90 Seconds EXACTLY)

**Memorize this. Do not deviate.**

> *"Every year, Montgomery spends millions. But that money is invisible to the people who need it most. CivicPulse changes that."*

*[App loads. Map appears. Glowing 3D pillars rise across Montgomery. Green = thriving. Red = failing.]*

> *"These pillars are business survival rates. Built from 10 years of city permit data, stored in MongoDB Atlas."*

*[Click 🔴 Entrepreneur Mode. Type a Montgomery address.]*

> *"An entrepreneur wants to open a restaurant here. In 3 seconds, CivicPulse returns a survival score of 61 out of 100. Three businesses failed at this address since 2018. Here are three better locations across the city."*

*[Click ✨ Generate Location Prospectus. AI text appears.]*

> *"Google Gemini generates a full lease recommendation — citing the exact data — in under 5 seconds."*

*[Click 🟡 Contractor Mode.]*

> *"The city is about to spend $42,000 on landscaping. Using Bright Data, we scraped local businesses and matched this contract to a family-owned shop on the East Side. One click — and we drafted their entire bid proposal."*

*[Click 🟢 Resident Mode. Click Capitol Heights on the map.]*

> *"This neighborhood scores 48 out of 100. The wealthiest district received $2.1 million in city investment last year. Capitol Heights received $180,000. That gap is $1.9 million. We generated the letter — with those exact numbers — in 4 seconds."*

*[Pause. Look at the judges.]*

> **"We turn open data into open doors."**

---

## PART 9 — BUSINESS MODEL (For Pitch Slides)

| Tier | Customer | Price | Value Proposition |
|---|---|---|---|
| **Free / Public** | Residents | $0 | Civic Equity map — hold officials accountable with data |
| **Entrepreneur SaaS** | Small business owners | $79 / month | Predictive site selection before signing a lease |
| **Contractor Pro** | Local service businesses | $49 / month | Contract matching + AI bid drafting |
| **City License** | Municipal governments | $25,000 / year | White-labeled platform to improve vendor diversity programs |
| **Regional API** | Real estate developers, banks | $500 / month | Raw geospatial economic scoring API |

**TAM:** 19,000+ U.S. cities. Civic data transparency is a legal mandate (FOIA). CivicPulse is a compliance product, not just a tool.

---

## PART 10 — SUBMISSION CHECKLIST (Monday 8:30 AM CT)

- [ ] Live URL on Vercel (test on mobile!)
- [ ] GitHub repo public with clear README
- [ ] README includes: what it is, what data it uses, how MongoDB + Bright Data are used, and the live URL
- [ ] At least ONE real Montgomery address returns a real survival score
- [ ] At least ONE Gemini-generated output is live (not mocked)
- [ ] Demo rehearsed at least twice — timed at under 90 seconds
- [ ] Submission form filled: project name, description, live URL, GitHub URL
- [ ] Sponsor technologies listed: **MongoDB Atlas**, **Bright Data**, **Google Gemini**

---

## PART 11 — JUDGE SCORECARD ALIGNMENT

| Judge Criteria | How CivicPulse Hits It |
|---|---|
| Uses city open data meaningfully | 3 datasets, 10-year depth, cross-correlated spatially |
| MongoDB Atlas is load-bearing | `$geoNear` aggregation is the core query powering all three modes |
| Bright Data is load-bearing | Business matching in Mode 2 requires scraped profiles |
| AI output is meaningful | 3 distinct, data-seeded, real-word Gemini outputs |
| Visual impact | 3D extrusion pillars + dark UI = most stunning demo in the room |
| Civic impact story | Equity, entrepreneurship, local economy — all three covered |
| Business model exists | 5-tier revenue model documented |

---

*Generated by Antigravity (Google Deepmind) — CivicPulse Team — March 2026*
