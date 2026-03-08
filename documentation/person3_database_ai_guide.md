# 🗄️ PERSON 3 — DATABASE & AI ENGINEER
## CivicPulse (Atlas Edition) — Complete Implementation Guide

> **Role:** MongoDB Atlas provisioning, geospatial queries, Google Gemini integration
> **Workdir:** `World Wide Vibes Hackathon/backend/`
> **Deadline:** Monday March 9, 9:00 AM CT

---

## 1. UNDERSTANDING THE CURRENT REPO STATE

```
backend/
├── .env.example               ← Your MONGODB_URI and GEMINI_API_KEY go here
├── data/
│   ├── permits_clean.json     ← READY (Person 1 generated this)
│   ├── block_scores.json      ← READY (Person 1 generated this)
│   ├── expenditures.csv       ← READY
│   └── crimes.csv             ← READY
└── scripts/
    ├── load_to_mongo.py       ← Needs your MONGODB_URI to actually run
    ├── geo_queries.py         ← Geo functions ready
    ├── gemini_prompts.py      ← [TODO: You create this]
    └── gemini_api.py          ← [TODO: You create this]
```

**Your two main deliverables:** `scripts/gemini_prompts.py` and `scripts/gemini_api.py`, plus setting up MongoDB.

---

## 2. STEP 0 — PROVISION MONGODB ATLAS

1. Go to **cloud.mongodb.com** → Create an **"M0 Free"** cluster.
2. Name it `civicpulse`.
3. Create a Database User (`civicpulse_user` + password).
4. Network Access: Allow `0.0.0.0/0`.
5. Get Connection String and add to `.env`:
   ```ini
   MONGODB_URI=mongodb+srv://civicpulse_user:<password>@civicpulse.abc123.mongodb.net/civicpulse?retryWrites=true&w=majority
   GEMINI_API_KEY=AIzaSyA...your-key...
   ```

---

## 3. STEP 1 — SEED THE DATABASE

Run the existing load script:
```bash
cd backend
python scripts/load_to_mongo.py
```
Verify in Atlas that collections `permits`, `crimes`, and `expenditures` exist and have `2dsphere` indexes.

---

## 4. YOUR MAIN DELIVERABLE A — `scripts/gemini_prompts.py`

This file holds ALL FOUR Gemini prompt templates. Create it exactly:

```python
# backend/scripts/gemini_prompts.py
"""
All four Gemini AI prompts for CivicPulse (Entrepreneur, Contractor, Resident, Chat).
"""

ENTREPRENEUR_PROMPT = """
You are a commercial real estate analyst. Generate a Location Prospectus for a {business_category} considering opening at {address} in Montgomery, Alabama.

Data:
- Business Survival Score: {survival_score}/100
- Previous businesses at this address: {permit_history}
- Crime incidents within 0.5 miles: {crime_count}
- Neighborhood investment trend: {investment_trend}

Write exactly 3 short paragraphs. Be direct. Cite numbers. Conclude with a clear recommendation (open here, negotiate trial lease, or open elsewhere).
"""

CONTRACTOR_PROMPT = """
Write a government bid proposal for {business_name} to win a {contract_category} contract with the City of Montgomery, Alabama.

City's estimated budget: ${contract_value}

Write a 5-section professional bid proposal with these exact headings:
1. Cover Letter (3 sentences — personal, local, committed)
2. Scope of Work (bullet list)
3. Pricing Schedule (line items that total UNDER ${contract_value})
4. Timeline
5. Why Us
"""

RESIDENT_PROMPT = """
Write a civic advocacy letter from a resident of {neighborhood} in Montgomery, Alabama to their City Council Member {council_member}.

Data:
- Civic Health Score: {civic_score}/100
- City infrastructure investment in {neighborhood}: ${local_spend}
- City infrastructure investment in wealthiest district: ${rich_spend}
- Investment gap: ${gap}

Write a 4-paragraph letter demanding budget equity. Be respectful but firm. Close with "Respectfully, A Resident of {neighborhood}".
"""

CHAT_PROMPT = """
You are 'Atlas AI', a civic intelligence assistant for Montgomery, Alabama.
You hold data on local business survival scores, neighborhood infrastructure equity, safety, and city procurement contracts.

User's message: "{message}"

Context Data (if applicable):
{context}

Respond conversationally, helpfully, and concisely (under 4 sentences). Use the provided data to answer their question. If the data doesn't answer it, politely state that you focus mainly on Montgomery civic data.
"""
```

---

## 5. YOUR MAIN DELIVERABLE B — `scripts/gemini_api.py`

```python
# backend/scripts/gemini_api.py
"""
Single function entry point for Gemini AI calls.
Imported by main.py's /api/generate endpoint.
"""
import os
import google.generativeai as genai
from dotenv import load_dotenv
from scripts.gemini_prompts import (
    ENTREPRENEUR_PROMPT, CONTRACTOR_PROMPT, 
    RESIDENT_PROMPT, CHAT_PROMPT
)

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')

def generate_output(mode: str, data: dict) -> str:
    if mode == "entrepreneur":
        prompt = ENTREPRENEUR_PROMPT.format(**data)
    elif mode == "contractor":
        prompt = CONTRACTOR_PROMPT.format(**data)
    elif mode == "resident":
        prompt = RESIDENT_PROMPT.format(**data)
    elif mode == "chat":
        # Ensure message and context default to empty strings if missing
        msg = data.get("message", "Hello")
        ctx = data.get("context", "General context.")
        prompt = CHAT_PROMPT.format(message=msg, context=ctx)
    else:
        raise ValueError(f"Unknown mode: '{mode}'.")
    
    response = model.generate_content(prompt)
    return response.text

if __name__ == "__main__":
    print("Testing Gemini API...")
    res = generate_output("chat", {"message": "What is the safest neighborhood?"})
    print(res)
```

---

## 6. FINAL CHECKLIST

- [ ] MongoDB Atlas running, indexed, loaded
- [ ] `.env` has valid `MONGODB_URI` and `GEMINI_API_KEY`
- [ ] `scripts/gemini_prompts.py` includes the `CHAT_PROMPT`
- [ ] `scripts/gemini_api.py` uses `google-generativeai` package
- [ ] Tell Person 1: **"Gemini and MongoDB are wired. You can import them."**
