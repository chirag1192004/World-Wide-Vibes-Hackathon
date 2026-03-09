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
        # Rename the missing key to what the prompt expects or what the data has.
        # Data provides 'crime_density_halfmile'
        prompt = ENTREPRENEUR_PROMPT.format(**data)
    elif mode == "contractor":
        prompt = CONTRACTOR_PROMPT.format(**data)
    elif mode == "resident":
        # Data provides: neighborhood, council_member, civic_health_score, city_spend_last_3yr, comparison_district -> city_spend_last_3yr, investment_gap
        # We must format to fit: neighborhood, council_member, civic_score, local_spend, rich_spend, gap
        formatted_data = {
            "neighborhood": data.get("name", "Unknown"),
            "council_member": data.get("council_member", "Unknown"),
            "civic_score": data.get("civic_health_score", 50),
            "local_spend": data.get("city_spend_last_3yr", 0),
            "rich_spend": data.get("comparison_district", {}).get("city_spend_last_3yr", 0),
            "gap": data.get("investment_gap", 0)
        }
        prompt = RESIDENT_PROMPT.format(**formatted_data)
    elif mode == "chat":
        # Accept both "question" (from frontend) and "message" (legacy)
        msg = data.get("question", data.get("message", "Hello"))
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
