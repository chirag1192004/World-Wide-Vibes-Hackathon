# 🏛️ CIVICPULSE (ATLAS EDITION)
## Master Project Guide — Complete Reference
### "We turn open data into open doors."

> **For:** Presentations, explainer videos, pitch decks, demo walkthroughs, and onboarding contributors.
> **Hackathon:** World Wide Vibes Hackathon 2026
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

**Entry Point:** User types a Montgomery address (with MapTiler geocoding autocomplete) and selects a business category (restaurant, salon, retail, auto, cafe, gym, barbershop, clinic, pharmacy, bakery).

**What CivicPulse Does:**
1. Uses the address to query MongoDB Atlas with `$geoNear` — pulls all commercial permits within a 1-mile radius from the last 10 years
2. Calculates the **Business Survival Score (0–100)**:
   - Core formula: `(active permits / total permits opened) * 100`
   - Modified by: crime density within 0.5mi, city investment trend, competitor saturation
3. Displays a **5-Year Survival Trend Chart** showing historical viability
4. Google Gemini generates a **Location Prospectus** — a 3-paragraph data-backed brief
5. Shows the 3 highest-scoring alternative addresses for that business category
6. Users can **export the AI prospectus as a PDF** with CivicPulse branding

**Map Integration:** When the user changes the business category (e.g., Restaurant → Pharmacy), the heatmap pillars on the map dynamically shift — each industry has different viability multipliers (Pharmacy 1.2×, Gym 0.75×, etc.)

---

### 🟡 MODE 2 — THE CONTRACTOR (B2G Procurement Engine)

**Entry Point:** User lands on the Contractor mode and sees a live list of upcoming city contracts.

**What CivicPulse Does:**
1. Reads the city's historical expenditure data to identify **recurring contract patterns**
2. Cross-references these patterns with **Bright Data-scraped local business profiles** — matching by industry keyword and geography
3. Presents each contract as a card with match score, value, frequency, and predicted next award date
4. Google Gemini **auto-drafts a complete 5-section government bid proposal** for the matched local business
5. Users can **download as .txt or export as PDF**

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
4. Google Gemini drafts a **personalized advocacy letter** addressed to the user's specific council member, pre-filled with exact dollar figures
5. Users can **copy to clipboard or export as PDF**

---

## PART 3 — TECHNOLOGY STACK (Current)

### Architecture Overview
```
User Browser
    │
    ├── Next.js 15 + TypeScript (localhost:3005 / Vercel)
    │       ├── MapTiler SDK       ← 3D map with data pillars
    │       ├── Recharts           ← Trend visualization charts
    │       ├── Framer Motion      ← Page & component animations
    │       ├── Sonner             ← Toast notifications
    │       ├── jsPDF              ← PDF export
    │       ├── Radix UI           ← Accessible primitives
    │       └── Tailwind CSS v4    ← Dark mode design system
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
| Montgomery Open Data | Building Permits | 1000+ | Survival score calculation |
| Montgomery Open Data | Crime Incidents | 2000+ | Safety score |
| Montgomery Open Data | City Expenditures | 500+ | Investment trend |
| Bright Data (scraped) | Local Businesses | 20-50 | Contractor matching |

---

## PART 4 — THE SHARED DATA CONTRACT

Every API endpoint, React component, and AI prompt communicates using this exact JSON shape.

```json
{
  "neighborhood": {
    "name": "Capitol Heights",
    "lat": 32.3617, "lng": -86.2792,
    "civic_health_score": 48,
    "infrastructure_score": 45,
    "permit_velocity_score": 62,
    "safety_score": 71,
    "contract_equity_score": 24,
    "city_spend_last_3yr": 180000,
    "investment_gap": 1920000,
    "council_member": "Council Member Robert Gambote"
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
    "city_spend_last_3yr": 420000,
    "top_3_alternatives": [
      { "address": "456 Fairview Ave, Montgomery AL", "survival_score": 84 },
      { "address": "789 Atlanta Hwy, Montgomery AL",  "survival_score": 81 },
      { "address": "321 Mobile Rd, Montgomery AL",    "survival_score": 79 }
    ]
  },
  "contract_opportunity": {
    "contract_id": "MGM-2025-0042",
    "category": "landscaping",
    "estimated_value": 42000,
    "historical_frequency": "annual",
    "predicted_next": "2025-04-01",
    "matched_business": {
      "name": "Green Thumb Montgomery",
      "match_score": 91
    }
  }
}
```

---

## PART 5 — REPOSITORY STRUCTURE (Current)

```
World Wide Vibes Hackathon/
├── documentation/
│   ├── master_project_guide.md      ← THIS FILE
│   ├── person1_backend_guide.md     ← Backend Engineer guide
│   ├── person2_frontend_guide.md    ← Frontend Engineer guide (DONE)
│   └── person3_database_ai_guide.md ← DB/AI Engineer guide
│
├── backend/                          ← FastAPI (Person 1 + Person 3)
│   ├── main.py                       ← ✅ API server (running, all endpoints work)
│   ├── requirements.txt              ← Python deps
│   ├── .env.example                  ← Copy to .env, fill in keys
│   ├── data/
│   │   ├── permits.csv               ← Raw permit data
│   │   ├── crimes.csv                ← Raw crime data
│   │   ├── expenditures.csv          ← Raw expenditure data
│   │   ├── permits_clean.json        ← ✅ Cleaned permit records
│   │   └── block_scores.json         ← ✅ Pre-computed survival scores
│   └── scripts/
│       ├── generate_mock_data.py     ← ✅ Already run
│       ├── clean_permits.py          ← ✅ Already run
│       ├── score_engine.py           ← ✅ Already run
│       ├── geo_queries.py            ← ✅ Spatial query functions
│       ├── load_to_mongo.py          ← [TODO: Person 3] Load data into Atlas
│       └── gemini_api.py             ← [TODO: Person 3] Gemini wrapper
│
└── hackethon_frontend/               ← Next.js 15 (Person 2 — DONE)
    ├── app/
    │   ├── page.tsx                   ← ✅ Animated landing page
    │   ├── layout.tsx                 ← ✅ Root layout + theme provider
    │   ├── globals.css                ← ✅ Design system + animations
    │   └── app/
    │       ├── page.tsx               ← ✅ Dashboard (all 3 modes + map)
    │       └── layout.tsx             ← ✅ Dashboard layout wrapper
    ├── components/
    │   ├── civic-map.tsx              ← ✅ MapTiler 3D map + heatmap
    │   ├── entrepreneur-panel.tsx     ← ✅ Mode 1 (autocomplete + trend chart)
    │   ├── contractor-panel.tsx       ← ✅ Mode 2 (contract cards + bid gen)
    │   ├── resident-panel.tsx         ← ✅ Mode 3 (civic equity + letter gen)
    │   ├── ai-chat.tsx                ← ✅ Floating AI assistant
    │   ├── address-autocomplete.tsx   ← ✅ MapTiler geocoding search
    │   ├── onboarding-tour.tsx        ← ✅ 3-step first-visit tour
    │   ├── skeleton-cards.tsx         ← ✅ Loading state skeletons
    │   ├── score-ring.tsx             ← ✅ Animated score visualization
    │   └── ui/                        ← Radix UI primitives (shadcn)
    ├── lib/
    │   ├── utils.ts                   ← ✅ Tailwind merge utility
    │   ├── mock-data.ts               ← ✅ Type defs + fallback data
    │   └── export-pdf.ts              ← ✅ PDF export utility
    └── package.json                   ← All npm deps installed
```

> ⚠️ **The old `civicpulse/` directory (Vite + Mapbox) is DEPRECATED. Delete it. All frontend work is in `hackethon_frontend/`.**

---

## PART 6 — ENVIRONMENT VARIABLES

```ini
# backend/.env  (Person 3 creates Atlas, Person 1 holds Bright Data key)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/civicpulse
GEMINI_API_KEY=your-gemini-api-key...
BRIGHT_DATA_API_KEY=...

# hackethon_frontend does NOT need a .env
# MapTiler API key is hardcoded in civic-map.tsx and address-autocomplete.tsx
# API base URL is hardcoded as http://localhost:8000 in all panel components
```

---

## PART 7 — WHAT'S DONE vs. WHAT'S LEFT

### ✅ Person 2 (Frontend) — COMPLETE
- Animated landing page with 3D CSS globe
- Full dashboard with 3 modes, map, and side panels
- MapTiler 3D map with dynamic heatmap pillars
- Address autocomplete with MapTiler Geocoding
- AI Chat Assistant (floating bubble)
- PDF export on all AI outputs
- Trend charts (5-year survival history)
- Toast notifications across all panels
- Keyboard shortcuts (1/2/3 mode switching)
- Onboarding tour (3-step first visit)
- Loading skeletons

### 🔧 Person 1 (Backend) — TODO
- [ ] Create `scripts/gemini_api.py` — the Gemini wrapper (currently uses cached fallback responses)
- [ ] Set up Bright Data scraping to populate `data/businesses_scraped.json`
- [ ] Create `data/businesses_fallback.json` with 10–20 hardcoded Montgomery businesses
- [ ] Wire MongoDB into `main.py` endpoints (currently uses flat JSON files)
- [ ] Test all API endpoints with real data

### 🔧 Person 3 (Database + AI) — TODO
- [ ] Provision MongoDB Atlas M0 cluster with database `civicpulse`
- [ ] Create collections: `permits`, `crimes`, `expenditures`, `businesses`
- [ ] Add `2dsphere` indexes on geospatial fields
- [ ] Run `scripts/load_to_mongo.py` to seed data
- [ ] Write Gemini prompt templates for all 4 modes (entrepreneur, contractor, resident, chat)
- [ ] Test `$geoNear` queries return correct spatial results

---

## PART 8 — FALLBACK RULES (If Something Breaks During Demo)

| Failure | Response |
|---|---|
| **Gemini API is slow/down** | Backend `/api/generate` has hardcoded cached outputs per mode. Returns these instantly if Gemini errors. |
| **MongoDB Atlas unreachable** | Backend reads from flat `block_scores.json` by default. MongoDB is additive — flat JSON always works. |
| **Bright Data scrape fails** | If `businesses_scraped.json` is empty/missing, backend loads `businesses_fallback.json`. |
| **MapTiler down** | Very unlikely. API key is embedded. Falls back to placeholder text. |

---

## PART 9 — THE DEMO SCRIPT (90 Seconds)

> *"Every year, Montgomery spends millions. But that money is invisible to the people who need it most. CivicPulse changes that."*

*[Landing page loads. Animated globe. "Enter the Atlas" button.]*

> *"These pillars are business survival rates. Built from 10 years of city permit data, stored in MongoDB Atlas."*

*[Dashboard loads. 3D Map. Green = thriving. Red = failing.]*

> *"An entrepreneur wants to open a restaurant here. In 3 seconds, CivicPulse returns a survival score of 61 out of 100. Three businesses failed at this address since 2018. Here are three better locations across the city."*

*[Click ✨ Generate Location Prospectus. AI text appears. Export PDF.]*

> *"Google Gemini generates a full lease recommendation — citing the exact data — in under 5 seconds."*

*[Press '2' — Contractor Mode]*

> *"The city is about to spend $42,000 on landscaping. Using Bright Data, we scraped local businesses and matched this contract to a family-owned shop. One click — and we drafted their entire bid proposal."*

*[Press '3' — Resident Mode. Click Capitol Heights on the map.]*

> *"This neighborhood scores 48 out of 100. The wealthiest district received $2.1 million in city investment. Capitol Heights received $180,000. That gap is $1.9 million. The advocacy letter was generated — with those exact numbers — in 4 seconds."*

*[Open the AI Chat bubble. Ask: "What's the safest neighborhood for a pharmacy?"]*

> **"We turn open data into open doors."**

---

## PART 10 — SUBMISSION CHECKLIST (Monday 8:30 AM CT)

- [x] Frontend complete — landing page + dashboard with all 3 modes
- [x] Frontend features — AI Chat, PDF export, autocomplete, trend charts, toasts, onboarding
- [ ] Backend Gemini integration live (not using cached fallbacks)
- [ ] MongoDB Atlas provisioned and seeded
- [ ] At least ONE real Montgomery address returns a real survival score from MongoDB
- [ ] At least ONE Gemini-generated output is live (not cached)
- [ ] Bright Data scraping produces real business data
- [ ] Live URL on Vercel (test on mobile!)
- [ ] GitHub repo public with clear README
- [ ] Demo rehearsed — under 90 seconds
- [ ] Submission form filled: project name, description, live URL, GitHub URL
- [ ] Sponsor technologies listed: **MongoDB Atlas**, **Bright Data**, **Google Gemini**

---

*CivicPulse Team — Atlas Edition — March 2026*
