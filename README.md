# CivicPulse — Atlas Edition

> **World Wide Vibes Hackathon 2025** · Montgomery, Alabama

Turn open civic data into open doors for **entrepreneurs**, **contractors**, and **residents**.

---

## What It Is

CivicPulse transforms 10 years of Montgomery, AL city permit, crime, and expenditure data into:

| Mode | What it does |
|------|-------------|
| 🏢 **Entrepreneur** | AI site selection — survival scores, permit history, competitor density, location prospectus |
| 📄 **Contractor** | B2G procurement — upcoming city contracts, match scores, auto-generated bid proposals |
| 🏘 **Resident** | Civic equity dashboard — investment gap analysis, council advocacy letters |

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16, Tailwind 4, Framer Motion, MapTiler SDK |
| Backend | FastAPI + uvicorn, Python 3.9+ |
| AI | **Gemini 2.0 Flash Lite** via `google-genai` |
| Data | City permits CSV, crime CSV, expenditures CSV → flat JSON |
| DB (optional) | MongoDB Atlas (M0 free tier) |
| Web scraping | Bright Data (graceful fallback to 20 hardcoded businesses) |

---

## Datasets

- `backend/data/permits.csv` — 10 years of commercial permit history
- `backend/data/crimes.csv` — Crime incident log by coordinates
- `backend/data/expenditures.csv` — City budget expenditure by neighborhood
- `backend/data/block_scores.json` — Pre-scored business survival index per block
- `backend/data/businesses_scraped.json` — Montgomery small businesses (Bright Data / fallback)

---

## Running Locally

### 1. Backend

```bash
cd backend
# Copy env and fill in your keys
cp .env.example .env
# GEMINI_API_KEY=...   ← required for live AI
# MONGODB_URI=...      ← optional (falls back to flat JSON)
# BRIGHT_DATA_API_KEY= ← optional (falls back to 20 local businesses)

# Start server (auto-creates venv + installs deps)
bash start_backend.sh
# or with hot-reload:
bash start_backend.sh --reload
```

Server runs at **http://localhost:8000**

### 2. Frontend

```bash
cd hackethon_frontend
# .env.local is pre-configured to point at localhost:8000
npm install
npm run dev
```

App runs at **http://localhost:3000**

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health check |
| GET | `/api/heatmap?category=restaurant` | Block survival scores for map layer |
| GET | `/api/block?lat=&lng=&category=` | Block-level analysis |
| GET | `/api/neighborhood?lat=&lng=` | Neighborhood equity data |
| GET | `/api/contracts` | Upcoming city contracts |
| POST | `/api/generate` | `{mode, data}` → Gemini AI output |

All endpoints fall back to cached responses if Gemini is unavailable.

---

## MongoDB Atlas (Optional)

1. Create free M0 cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Get connection string → paste into `backend/.env` as `MONGODB_URI`
3. Run `python3 scripts/load_to_mongo.py` (from activated venv)
4. Verify `2dsphere` indexes are created

The backend automatically falls back to flat JSON if MongoDB is unreachable — zero demo risk.

---

## Deployment

```bash
# Frontend → Vercel
cd hackethon_frontend && npm run build
# Connect GitHub repo to Vercel, set NEXT_PUBLIC_API_BASE_URL to your backend URL

# Backend → Railway / Render (or any server with Python 3.10+)
# Set env vars: GEMINI_API_KEY, MONGODB_URI, BRIGHT_DATA_API_KEY
```

---

Built with ❤️ at **World Wide Vibes Hackathon** · Montgomery, AL
