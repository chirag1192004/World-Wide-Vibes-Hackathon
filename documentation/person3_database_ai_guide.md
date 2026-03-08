# CivicPulse: Person 3 (Database & AI) Master Guide

Welcome to the data logic and AI brain of **CivicPulse**! You are responsible for the MongoDB spatial queries and configuring the Claude AI prompts. 

## Current State of Your Domain
You have already completed the Saturday deliverables. The current directory `backend/scripts/` has the following ready:
- `load_to_mongo.py` (Script to load JSON/CSV, format into GeoJSON Points, and apply `2dsphere` indexes).
- `geo_queries.py` (Functions written to execute `$geoNear` aggregations for points radius and exact queries).
- `.env.example` is ready for the `MONGODB_URI` and `ANTHROPIC_API_KEY`.

## Your Sunday Deliverables

### 1. Database Provisioning & Execution
**Goal:** Ensure the cloud database is live and seeded.
**Requirements:**
- Go to cloud.mongodb.com and deploy an M0 Free Cluster named `civicpulse`.
- Whitelist IP `0.0.0.0/0` (allow from anywhere) for hackathon speed.
- Add your connection string to the backend `.env` file as `MONGODB_URI`.
- Execute `python scripts/load_to_mongo.py` to seed the permits, crimes, and expenditures data into Atlas. Ensure the `2dsphere` indexes build successfully.

### 2. Claude AI Prompts (`scripts/claude_prompts.py`)
**Goal:** Define the exact system and user prompt templates that will turn the raw JSON data score into flowing, context-rich prose.
**Requirements:**
- Create strings for `ENTREPRENEUR_SYSTEM`, `CONTRACTOR_SYSTEM`, and `RESIDENT_SYSTEM`.
- Create the user prompts formatted to expect injected dictionary kwargs.
- **Entrepreneur Prompt:** Needs to evaluate the survival score, compare against alternatives, and recommend a lease decision in 3 paragraphs.
- **Contractor Prompt:** Needs to output a government standard 5-section proposal using business matched data and budget estimations.
- **Resident Prompt:** Needs to output a forceful but polite 4-paragraph advocacy letter comparing their neighborhood's health score and investment gap to the wealthiest district.

### 3. Claude API Integration (`scripts/claude_api.py`)
**Goal:** Provide a clean wrapper function that Person 1's FastAPI server can import.
**Requirements:**
- Use the `anthropic` Python SDK.
- Create a `generate_output(mode: str, data: dict) -> str` function.
- Map the `mode` parameter to the correct System/User prompts built in step 2.
- Execute the call using `claude-sonnet-4-20250514`.
- Return the raw markdown string text.

Once complete, sync with Person 1 so they can import `generate_output` and `geo_queries` into `main.py`.
