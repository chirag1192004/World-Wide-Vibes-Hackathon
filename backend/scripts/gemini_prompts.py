# backend/scripts/gemini_prompts.py
"""
All four Gemini AI prompts for CivicPulse (Entrepreneur, Contractor, Resident, Chat).
"""

ENTREPRENEUR_PROMPT = """
You are a commercial real estate analyst. Generate a Location Prospectus for a {business_category} considering opening at {address} in Montgomery, Alabama.

Data:
- Business Survival Score: {survival_score}/100
- Previous businesses at this address: {permit_history}
- Crime incidents within 0.5 miles: {crime_density_halfmile}
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
