"""Gemini-based spending insights generator for Pakistani teens."""

import json
import logging
import os
import re

import google.generativeai as genai

logger = logging.getLogger(__name__)

SYSTEM_INSTRUCTION = (
    "You are a financial coach for Pakistani teenagers. "
    "Write in simple, friendly English a 15-year-old can understand. "
    "Return ONLY a JSON array. No markdown. No explanation."
)

USER_PROMPT_TEMPLATE = (
    "Based on these spending stats for a Pakistani teenager, generate exactly "
    "4 insight cards. Use PKR amounts. Keep each body under 20 words. "
    "Be specific and actionable.\n\n"
    "Stats: {stats_json}\n\n"
    "Return this exact format:\n"
    "[\n"
    "  {{\n"
    '    "type": "alert" | "tip" | "positive" | "behavioral",\n'
    '    "icon": "coffee" | "transport" | "food" | "money" | '
    '"star" | "warning" | "chart",\n'
    '    "title": "short title under 5 words",\n'
    '    "body": "specific insight under 20 words with PKR amounts"\n'
    "  }}\n"
    "]"
)

FALLBACK_INSIGHTS = [
    {
        "type": "tip",
        "icon": "money",
        "title": "Track your spending",
        "body": "Connect more accounts to see your full financial picture.",
    },
    {
        "type": "tip",
        "icon": "chart",
        "title": "Review weekly totals",
        "body": "Check your spending every Sunday to stay within your weekly budget.",
    },
    {
        "type": "positive",
        "icon": "star",
        "title": "Good job saving",
        "body": "Keeping track of expenses is the first step to saving more PKR.",
    },
    {
        "type": "behavioral",
        "icon": "warning",
        "title": "Watch weekend spending",
        "body": "Weekend spending is often higher. Plan ahead to avoid overspending.",
    },
]


def _strip_markdown_fences(text: str) -> str:
    """Remove accidental markdown code fences from Gemini output."""
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


def generate_insights(stats: dict) -> list[dict]:
    """
    Generate exactly 4 AI insight cards from spending statistics.

    Never raises. On any failure returns hardcoded fallback insights.

    Args:
        stats: TransactionStats dict serialized from the request.

    Returns:
        List of exactly 4 insight card dicts.
    """
    try:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.error("GEMINI_API_KEY not set")
            return FALLBACK_INSIGHTS

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(
            "gemini-2.5-flash",
            system_instruction=SYSTEM_INSTRUCTION,
        )

        stats_json = json.dumps(stats, indent=2)
        prompt = USER_PROMPT_TEMPLATE.format(stats_json=stats_json)
        response = model.generate_content(prompt)
        raw_output = _strip_markdown_fences(response.text)
        insights = json.loads(raw_output)

        if not isinstance(insights, list) or len(insights) != 4:
            logger.error("Gemini returned unexpected insight count")
            return FALLBACK_INSIGHTS

        valid_types = {"alert", "tip", "positive", "behavioral"}
        valid_icons = {
            "coffee", "transport", "food", "money", "star", "warning", "chart"
        }
        for card in insights:
            if card.get("type") not in valid_types:
                card["type"] = "tip"
            if card.get("icon") not in valid_icons:
                card["icon"] = "chart"

        return insights
    except Exception as exc:
        logger.error("Gemini insights generation failed: %s", exc)
        return FALLBACK_INSIGHTS
