# CivicPulse: Person 1 (Backend & Data Engineer) Master Guide

Welcome to the **CivicPulse** backend! You are responsible for the data engine. This guide is designed so that you (or an AI agent like Claude/Cursor) can read this file and instantly know what to build next.

## Current State of Your Domain
You have already completed the Saturday deliverables. The current directory `backend/` has the following ready:
- `requirements.txt` (FastAPI, Pandas, PyMongo, Anthropic, etc.)
- Mocked CSV data in `data/`
- `scripts/clean_permits.py` (Functional, cleaning CSVs into JSON)
- `scripts/score_engine.py` (Functional, generating `block_scores.json`)
- `.env.example` is ready for your `BRIGHT_DATA_API_KEY`.

## Your Sunday Deliverables

### 1. Bright Data Scraping (`scripts/scrape_businesses.py`)
**Goal:** Scrape 50 local Montgomery businesses to match against upcoming city contracts.
**Requirements:**
- Build a Python script to hit the Bright Data API (or mock it if you don't have an active key).
- Target businesses in categories like: Landscaping, Catering, Construction, IT Services, Janitorial.
- **Fields to capture:** `name`, `address`, `lat`, `lng`, `category`, `website`.
- Output the results as a JSON array to `data/businesses_scraped.json`.
- **CRITICAL FAILSAFE:** Also create a `data/businesses_fallback.json` with 20 hardcoded, realistic Montgomery businesses. If the scraper breaks during the live demo, the backend must seamlessly swap to this file.

### 2. FastAPI Server (`main.py`)
**Goal:** Build the REST API that the React frontend will consume.
**Requirements:**
- Initialize a FastAPI app with `CORSMiddleware` (allow origins `*`).
- You will need to import the database query functions from `scripts/geo_queries.py` (built by Person 3).
- You will need to import the Claude generation function from `scripts/claude_api.py` (built by Person 3).

**Required Endpoints:**
```python
@app.get("/api/block")
# Params: lat (float), lng (float), category (str)
# Action: Return a block_analysis object containing a survival score, history, and 3 alternatives.

@app.get("/api/neighborhood")
# Params: lat (float), lng (float)
# Action: Return a neighborhood object with civic_health_scores.

@app.get("/api/contracts")
# Action: Return a list of upcoming contract_opportunity objects matched with scraped businesses.

@app.get("/api/heatmap")
# Action: Read block_scores.json (or query the DB) and return an array of {lat, lng, survival_score} for the 3D map.

@app.post("/api/generate")
# Body: { "mode": "entrepreneur"|"contractor"|"resident", "data": { ... } }
# Action: Pass the payload to Claude API and return the generated prospectus/bid/letter.
```

### 3. Execution & Testing
- Run your server with `uvicorn main:app --reload --port 8000`.
- Use the `/docs` Swagger UI to test every endpoint before telling Person 2 it is ready.
