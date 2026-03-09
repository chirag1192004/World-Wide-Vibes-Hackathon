"""
Gemini AI interface for CivicPulse.
Uses google-genai (the new SDK) — from google import genai
Single entry point: generate_output(mode, data) -> str
Falls back silently; main.py catches any exception and uses cached output.
"""

import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

from scripts.gemini_prompts import (
    ENTREPRENEUR_SYSTEM, ENTREPRENEUR_USER,
    CONTRACTOR_SYSTEM,   CONTRACTOR_USER,
    RESIDENT_SYSTEM,     RESIDENT_USER,
)

load_dotenv()

# ─── Configure SDK ─────────────────────────────────────────────────────────────
_api_key = os.getenv("GEMINI_API_KEY", "")
MODEL_NAME = "gemini-2.0-flash-lite"


def _get_client() -> genai.Client:
    """Return a configured genai.Client. Raises if no API key."""
    if not _api_key:
        raise RuntimeError("GEMINI_API_KEY not set")
    return genai.Client(api_key=_api_key)


def _build_prompt(system_prompt: str, user_prompt: str) -> str:
    """Combine system + user prompt into a single string."""
    return f"{system_prompt.strip()}\n\n---\n\n{user_prompt.strip()}"


# ─── Mode-specific prompt builders ────────────────────────────────────────────
def _entrepreneur_prompt(data: dict) -> str:
    history = data.get("permit_history", [])
    if isinstance(history, list):
        history_str = ", ".join(
            f"{p.get('business_name', 'Unknown')} ({p.get('status', '')})"
            for p in history
        ) or "no prior businesses on record"
    else:
        history_str = str(history)

    alts = data.get("top_3_alternatives", [])
    alt_str = "; ".join(
        f"{a.get('address', '')}: {a.get('survival_score', 0)}/100"
        for a in alts
    ) if alts else "not available"

    user_content = ENTREPRENEUR_USER.format(
        business_category=data.get("business_category", "business"),
        address=data.get("address", "Montgomery, AL"),
        survival_score=data.get("survival_score", "N/A"),
        permit_history=history_str,
        crime_count=data.get("crime_density_halfmile", "N/A"),
        competitor_count=data.get("competitor_count", "N/A"),
        investment_trend=data.get("investment_trend", "unknown"),
        city_spend=data.get("city_spend_last_3yr", "N/A"),
    )
    return _build_prompt(ENTREPRENEUR_SYSTEM, user_content)


def _contractor_prompt(data: dict) -> str:
    past_vendors: list = data.get("past_vendors", [])
    past_vendors_str = (
        ", ".join(str(v) for v in past_vendors) if past_vendors else "various local vendors"
    )

    user_content = CONTRACTOR_USER.format(
        business_name=data.get("business_name", "Your Business"),
        contract_category=data.get("contract_category", "general services"),
        business_industry=data.get("business_industry", data.get("contract_category", "service provider")),
        contract_value=data.get("contract_value", "50,000"),
        frequency=data.get("frequency", "annual"),
        past_vendors=past_vendors_str,
    )
    return _build_prompt(CONTRACTOR_SYSTEM, user_content)


def _resident_prompt(data: dict) -> str:
    deficit_list: list = data.get("deficit_list", [])
    if isinstance(deficit_list, list):
        deficit_str = "; ".join(str(d) for d in deficit_list) or "infrastructure underinvestment"
    else:
        deficit_str = str(deficit_list)

    user_content = RESIDENT_USER.format(
        neighborhood=data.get("neighborhood", "this neighborhood"),
        council_member=data.get("council_member", "City Council Member"),
        civic_score=data.get("civic_score", data.get("civic_health_score", "N/A")),
        local_spend=data.get("local_spend", data.get("city_spend_last_3yr", "N/A")),
        rich_spend=data.get("rich_spend", "2,100,000"),
        gap=data.get("gap", data.get("investment_gap", "N/A")),
        deficit_list=deficit_str,
    )
    return _build_prompt(RESIDENT_SYSTEM, user_content)


_CHAT_CONTEXT = """
You are CivicPulse AI, a civic data assistant for Montgomery, Alabama.
You have real data about 6 neighborhoods: Capitol Heights, Cloverdale, Downtown,
Garden District, Chisholm, and Old Cloverdale.
Key facts:
- Garden District has the highest investment ($2.1M / 3yr) and civic score (91/100).
- Chisholm has the largest investment gap ($2M below Garden District).
- Downtown has the highest permit velocity (85/100) — best for new businesses.
- 5 city contracts open: landscaping ($42K), road repair ($125K),
  waste removal ($67K), IT support ($38K), event services ($22K).
Answer concisely. Use specific numbers. Suggest next steps.
""".strip()


def _chat_prompt(data: dict) -> str:
    question = data.get("message", data.get("question", "Tell me about Montgomery civic data."))
    return f"{_CHAT_CONTEXT}\n\nUser question: {question}"


# ─── Public entry point ────────────────────────────────────────────────────────
PROMPT_BUILDERS = {
    "entrepreneur": _entrepreneur_prompt,
    "contractor":   _contractor_prompt,
    "resident":     _resident_prompt,
    "chat":         _chat_prompt,
}


def generate_output(mode: str, data: dict) -> str:
    """
    Generate AI text for the given mode + data dict.
    Raises on any error so main.py can fall back to cached output.
    """
    builder = PROMPT_BUILDERS.get(mode)
    if builder is None:
        raise ValueError(f"Unknown mode: {mode!r}. Expected: {list(PROMPT_BUILDERS)}")

    prompt = builder(data)
    client = _get_client()

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.7,
            max_output_tokens=600,
        ),
    )

    return response.text.strip()
