# CivicPulse (Atlas Edition) - Executive Master Guide
**"We turn open data into open doors."**

This is the central source of truth for the entire CivicPulse architecture, business model, and project structure. This document contains all details necessary for generating presentation decks, explainer videos, and overall project context.

## 1. Project Overview & Vision
CivicPulse is an AI-powered civic economic intelligence platform built specifically for the City of Montgomery, Alabama, for the Atlas Vibe Coding Hackathon 2026. 

**The Core Premise:** 
Cities sit on terabytes of open data (permits, crime, budgets). Currently, this data is locked in raw CSVs on obscure portals. CivicPulse ingests this data, cross-correlates it geographically in MongoDB Atlas, and visualizes it as a real-time 3D engine. It democratizes this data for three specific user demographics to solve three distinct socioeconomic problems.

## 2. The Three-Pronged Problem & Solution
| User Demographic | The Problem | The CivicPulse Solution |
|---|---|---|
| **The Entrepreneur** | 50% of new businesses fail within 5 years. Location choice is based on intuition rather than historical permit and demographic data. | **Predictive Site Selection:** Types an address. System checks 10-year permit history, crime radius, and competitor density via `$geoNear` to output a definitive "Business Survival Score (0-100)" and an AI-generated lease prospectus. |
| **The Contractor** | 80% of city vendor contracts go to the same 20 dominant players because local shops lack visibility and proposal-writing resources. | **B2G Procurement Engine:** Scrapes local small businesses (Bright Data) and cross-references them with historic expenditure cycles to predict upcoming bids. Claude AI automatically drafts a 5-part government bid proposal for the user. |
| **The Resident** | Systemic neighborhood neglect is felt by residents but hard to quantify or prove to politicians. | **Civic Equity Tracker:** Clicks a map. System calculates a "Civic Health Score" (split into infrastructure, safety, permits, contracts), compares it to wealthy districts, and prints an AI-drafted, data-backed advocacy letter addressed to their council member. |

## 3. Technology Stack & Data Architecture
The project utilizes a modern, decoupled Monorepo architecture.

**Frontend (The Visual Engine):**
- **Framework:** React 18, Vite, Tailwind CSS v3.
- **Mapping:** Mapbox GL JS (rendering the dark-mode streets).
- **3D Visualization:** Three.js / Mapbox Extrusions (rendering the glowing green/yellow/red data pillars based on survival scores).

**Backend (The Intelligence Engine):**
- **Server:** Python 3.11, FastAPI, Uvicorn.
- **Data Engineering:** Pandas (cleaning CSVs into strictly typed JSON).

**Database & AI Layer:**
- **Database:** MongoDB Atlas M0 cluster. Crucial dependency: Utilizing the geospatial `2dsphere` index and `$geoNear` aggregations for blazing fast radius-based analytics.
- **AI Generation:** Anthropic Claude (claude-sonnet-4).
- **Web Scraping:** Bright Data (matching real local biz to contracts).

## 4. The Data Contract
All aspects of the application abide by a strict JSON format ensuring the Python data cleaning, MongoDB queries, FastAPI endpoints, and React state all speak the same language. Concepts like `survival_score`, `civic_health_score`, and `investment_trend` are the standard metrics.

## 5. The Business Model (For Pitch Decks)
CivicPulse isn't just a hack. It's a B2B/B2G SaaS.
1. **Tier 1 (Free / Public):** Residents access the Civic Equity map to hold officials accountable.
2. **Tier 2 (B2B SaaS - $79/mo):** Local entrepreneurs and contractors subscribe for Predictive Site Selection and automated bid generation.
3. **Tier 3 (Enterprise B2G - $25k/yr):** White-labeled software licensed directly to City Halls across the country to improve vendor diversity programs, fulfilling their ESG and DEI initiatives.

## 6. How to Use this Repository (For Agents & Devs)
This project is broken down into three independent, parallel workstreams:
1. **Person 1 (Backend Engineer):** Works in `backend/` and `scripts/`. Builds the clean data pipelines, FastApi routes, and Bright Data scrapers. *See `documentation/person1_backend_guide.md`.*
2. **Person 2 (Frontend Engineer):** Works in `civicpulse/`. Builds the UI, Mapbox components, and HTTP fetch requests. *See `documentation/person2_frontend_guide.md`.*
3. **Person 3 (Database & AI):** Works in `backend/`. Sets up MongoDB Atlas clusters, builds `$geoNear` Python queries, and crafts the Claude API prompts. *See `documentation/person3_database_ai_guide.md`.*

By keeping state in the Single Source of Truth (task.md) and working independently from these guides, the team can ship the entire product in under 48 hours for the Monday deadline.
