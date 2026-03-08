# 🗄️ PERSON 3 — DATABASE & AI ENGINEER
## CivicPulse (Atlas Edition) — Complete Implementation Guide

> **Role:** MongoDB Atlas provisioning, geospatial queries, Claude AI prompt engineering
> **Workdir:** `World Wide Vibes Hackathon/backend/`
> **Deadline:** Monday March 9, 9:00 AM CT

---

## 1. UNDERSTANDING THE CURRENT REPO STATE

```
backend/
├── .env.example               ← Your MONGODB_URI and ANTHROPIC_API_KEY go here
├── data/
│   ├── permits_clean.json     ← READY (Person 1 generated this)
│   ├── block_scores.json      ← READY (Person 1 generated this)
│   ├── expenditures.csv       ← READY
│   └── crimes.csv             ← READY
└── scripts/
    ├── load_to_mongo.py       ← WRITTEN but needs your MONGODB_URI to actually run
    └── geo_queries.py         ← WRITTEN — geo functions ready
```

**Your two main deliverables:** `scripts/claude_prompts.py` and `scripts/claude_api.py`

---

## 2. STEP 0 — PROVISION MONGODB ATLAS

This is a one-time setup. Do it first.

### Step 1 — Create a Free Cluster
1. Go to **cloud.mongodb.com** → Sign up or Log in
2. Click **"Build a Database"** → Choose **"M0 Free"** (the free tier)
3. Provider: **AWS**, Region: **US East (N. Virginia)** for lowest latency
4. Cluster Name: `civicpulse`
5. Click **"Create"**

### Step 2 — Create a Database User
1. **Security → Database Access** → **"Add New Database User"**
2. Method: Password
3. Username: `civicpulse_user`
4. Password: make it strong (e.g., `CivicPulse2025!`), copy it
5. Role: **Atlas Admin** for hackathon speed
6. Click **"Add User"**

### Step 3 — Allow All IP Access
1. **Security → Network Access** → **"Add IP Address"**
2. Click **"Allow Access From Anywhere"** → enters `0.0.0.0/0`
3. Click **"Confirm"**

### Step 4 — Get Your Connection String
1. **Deployment → Database** → Click **"Connect"** on your cluster
2. Choose **"Connect your application"** → Driver: **Python** → Version: **3.12+**
3. Copy the string. It looks like:
   ```
   mongodb+srv://civicpulse_user:<password>@civicpulse.abc123.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password.

### Step 5 — Add to `.env`
```ini
MONGODB_URI=mongodb+srv://civicpulse_user:CivicPulse2025!@civicpulse.abc123.mongodb.net/civicpulse?retryWrites=true&w=majority
ANTHROPIC_API_KEY=sk-ant-...your-key...
```

---

## 3. STEP 1 — SEED THE DATABASE (`scripts/load_to_mongo.py`)

The script is already written. Just run it:
```bash
cd backend
python -m dotenv run -- python scripts/load_to_mongo.py
# OR if python-dotenv is installed:
python scripts/load_to_mongo.py
```

Expected output:
```
Loaded 953 permits.
Loaded 1900 crimes.
Loaded 500 expenditures.
Database loading complete.
```

### Verify in Atlas
1. Go to cloud.mongodb.com → **Deployment → Browse Collections**
2. You should see collections: `permits`, `crimes`, `expenditures`, `businesses`
3. Click on `permits` → look for the `location` field:
   ```json
   "location": { "type": "Point", "coordinates": [-86.307, 32.379] }
   ```
4. Verify indexes exist: **Deployment → Database → Browse Collections → permits → Indexes** — you should see a `2dsphere` index on `location`

---

## 4. STEP 2 — VERIFY GEO QUERIES (`scripts/geo_queries.py`)

The script is written. Test it manually:

```python
# Quick test — run from backend/ directory
from scripts.geo_queries import get_permits_near, get_crimes_near, get_expenditures_by_neighborhood

# Should return a list of permits within 1 mile of Downtown Montgomery
permits = get_permits_near(lng=-86.3077, lat=32.3792, radius_miles=1.0)
print(f"Found {len(permits)} permits near Downtown")

# Should return crimes within 0.5 miles
crimes = get_crimes_near(lng=-86.3077, lat=32.3792, radius_miles=0.5)
print(f"Found {len(crimes)} crimes nearby")

# Should return expenditures for Capitol Heights
spend = get_expenditures_by_neighborhood("Capitol Heights")
print(f"Found {len(spend)} expenditure records")
```

---

## 5. YOUR MAIN DELIVERABLE A — `scripts/claude_prompts.py`

This file holds ALL three Claude prompt templates. Create it exactly:

```python
# backend/scripts/claude_prompts.py
"""
All three Claude AI prompts for CivicPulse.
These are imported by claude_api.py and called from the /api/generate endpoint.
"""

# ─── ENTREPRENEUR PROMPTS ────────────────────────────────────────────────────
ENTREPRENEUR_SYSTEM = """
You are a commercial real estate analyst and business advisor for a civic data platform.
You write clear, direct, data-backed location prospectuses for entrepreneurs deciding
whether to open a business at a specific address in Montgomery, Alabama.

Rules you must follow:
- Never use filler phrases like "it's worth noting" or "in conclusion"
- Every sentence must contain a real data point or a clear recommendation
- Write in confident, professional English
- Format: exactly 3 paragraphs. No headers. No bullet points.
- Never exceed 220 words total.
"""

ENTREPRENEUR_USER = """
Generate a Location Prospectus for a {business_category} considering opening at
{address} in Montgomery, Alabama.

Data:
- Business Survival Score: {survival_score}/100
- Previous businesses at this address: {permit_history}
- Crime incidents within 0.5 miles (last year): {crime_count}
- Direct competitors within 1 mile: {competitor_count}
- Neighborhood investment trend: {investment_trend}
- City expenditure in this area (last 3 years): ${city_spend}

Write a 3-paragraph prospectus:
Paragraph 1: Overall viability assessment — interpret the survival score in context.
Paragraph 2: The two biggest risk factors at this specific location, with numbers.
Paragraph 3: Final recommendation — open here, open elsewhere, or open with conditions.
If elsewhere, name the top alternative address and its score.
"""

# ─── CONTRACTOR PROMPTS ─────────────────────────────────────────────────────
CONTRACTOR_SYSTEM = """
You are a government procurement specialist who helps small local businesses
win city contracts in Montgomery, Alabama. You write competitive, complete
government bid proposals in standard municipal procurement format.

Rules you must follow:
- Be specific with numbers, timelines, and deliverables — never vague
- Use the historical pricing data to set a competitive but profitable price
- Emphasize the local, community angle — judges reward local vendors
- Format: exactly 5 titled sections as specified
"""

CONTRACTOR_USER = """
Write a government bid proposal for {business_name} to win a
{contract_category} contract with the City of Montgomery, Alabama.

Business Profile:
- Business: {business_name}
- Service area: Montgomery, AL
- Industry: {business_industry}

Contract Details:
- Category: {contract_category}
- City's estimated budget: ${contract_value}
- Historical contract frequency: {frequency}
- Past vendors in this category: {past_vendors}

Write a 5-section professional bid proposal with these exact headings:
1. Cover Letter (3 sentences — personal, local, committed)
2. Scope of Work (bullet list of exactly what will be delivered)
3. Pricing Schedule (line items that total UNDER ${contract_value})
4. Timeline (week-by-week milestones for the first month)
5. Why Us (2 sentences — local community angle + proven capability)
"""

# ─── RESIDENT PROMPTS ────────────────────────────────────────────────────────
RESIDENT_SYSTEM = """
You are a civic advocacy writer who helps residents communicate with their
elected officials using hard, quantitative data. You write firm, respectful,
data-driven letters that demand accountability without being aggressive.

Rules you must follow:
- Cite specific dollar figures and percentages — they are your strongest tool
- Be respectful but not meek — the tone is a firm constituent request
- Do not editorialize or get political — let the numbers speak
- Format: exactly 4 paragraphs + a closing signature line
"""

RESIDENT_USER = """
Write a civic advocacy letter from a resident of {neighborhood} in
Montgomery, Alabama to their City Council Member {council_member}.

Data:
- Neighborhood's Civic Health Score: {civic_score}/100
- City infrastructure investment in {neighborhood} (last year): ${local_spend}
- City infrastructure investment in wealthiest district (last year): ${rich_spend}
- Annual investment gap: ${gap}
- Specific deficits in this neighborhood: {deficit_list}

Write a 4-paragraph letter:
Paragraph 1: Who the resident is, what they love about their neighborhood, and why they are writing.
Paragraph 2: The data — cite the exact dollar gap and what it means in practical daily terms for the street.
Paragraph 3: A single, specific, actionable ask (one clear request).
Paragraph 4: Respectful, firm, community-oriented closing.

Final line — exactly:
"Respectfully, A Resident of {neighborhood}"
"""
```

---

## 6. YOUR MAIN DELIVERABLE B — `scripts/claude_api.py`

```python
# backend/scripts/claude_api.py
"""
Single function entry point for all Claude API calls.
Imported by main.py's /api/generate endpoint.
"""
import os
import anthropic
from dotenv import load_dotenv
from scripts.claude_prompts import (
    ENTREPRENEUR_SYSTEM, ENTREPRENEUR_USER,
    CONTRACTOR_SYSTEM, CONTRACTOR_USER,
    RESIDENT_SYSTEM, RESIDENT_USER,
)

load_dotenv()

# Initialize the Anthropic client once (uses ANTHROPIC_API_KEY from env)
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

MODEL = "claude-sonnet-4-20250514"

def generate_output(mode: str, data: dict) -> str:
    """
    Generate AI output for a given mode using the corresponding prompt templates.
    
    Args:
        mode: One of "entrepreneur", "contractor", "resident"
        data: Dict with keys matching the .format() placeholders in the prompt
    
    Returns:
        Generated text string from Claude.
    
    Raises:
        ValueError: If mode is not recognized
        anthropic.APIError: If the API call fails (let main.py handle fallback)
    """
    if mode == "entrepreneur":
        system_prompt = ENTREPRENEUR_SYSTEM
        user_prompt   = ENTREPRENEUR_USER.format(**data)
    elif mode == "contractor":
        system_prompt = CONTRACTOR_SYSTEM
        user_prompt   = CONTRACTOR_USER.format(**data)
    elif mode == "resident":
        system_prompt = RESIDENT_SYSTEM
        user_prompt   = RESIDENT_USER.format(**data)
    else:
        raise ValueError(f"Unknown mode: '{mode}'. Must be entrepreneur, contractor, or resident.")
    
    # Make the API call
    message = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}]
    )
    
    return message.content[0].text


# Manual test — run this file directly to verify your API key works
if __name__ == "__main__":
    test_data = {
        "neighborhood": "Capitol Heights",
        "council_member": "Council Member Robert Gambote",
        "civic_score": 48,
        "local_spend": 180000,
        "rich_spend": 2100000,
        "gap": 1920000,
        "deficit_list": "cracked roads, broken streetlights, unmaintained parks",
    }
    print("Testing Claude API — Resident Mode...")
    print("-" * 60)
    result = generate_output("resident", test_data)
    print(result)
    print("-" * 60)
    print("[OK] Claude API is working correctly.")
```

**Test it:**
```bash
cd backend
python scripts/claude_api.py
```

Expected: A full 4-paragraph advocacy letter in your terminal.

---

## 7. WIRE INTO PERSON 1'S `main.py`

Person 1's `main.py` already imports and calls `generate_output` via:
```python
from scripts.claude_api import generate_output
```
And the geo queries via:
```python
from scripts.geo_queries import get_crimes_near
```

You don't need to modify `main.py` — just ensure your scripts are correctly saved and importable.

---

## 8. FINAL CHECKLIST

- [ ] MongoDB Atlas M0 cluster is running at `cloud.mongodb.com`
- [ ] Network Access allows `0.0.0.0/0`
- [ ] `.env` has correct `MONGODB_URI` (with password)
- [ ] `.env` has valid `ANTHROPIC_API_KEY`
- [ ] `python scripts/load_to_mongo.py` loads data without errors
- [ ] Atlas Collections: `permits`, `crimes`, `expenditures` have documents
- [ ] `2dsphere` indexes confirmed in Atlas UI under "Indexes"
- [ ] `scripts/claude_prompts.py` created with all 3 prompt pairs
- [ ] `scripts/claude_api.py` created and tested directly
- [ ] `python scripts/claude_api.py` prints a full letter (not an error)
- [ ] ✅ Tell Person 1: **"Claude and MongoDB are wired. You can import them."**
