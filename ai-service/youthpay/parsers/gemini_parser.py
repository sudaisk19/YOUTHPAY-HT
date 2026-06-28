"""Gemini-based fallback parser for low-confidence notifications."""

import json
import logging
import os
import re

import google.generativeai as genai

logger = logging.getLogger(__name__)

SYSTEM_INSTRUCTION = (
    "You are a financial data extractor for Pakistani bank notifications. "
    "Return ONLY valid JSON. No markdown. No explanation."
)

USER_PROMPT_TEMPLATE = (
    "Extract transaction data from this Pakistani bank notification. "
    "It may contain Roman Urdu (Urdu written in English letters) or mixed language.\n\n"
    "Text: {raw_text}\n\n"
    "Return this exact JSON structure:\n"
    "{{\n"
    '  "merchant_name": string or null,\n'
    '  "amount_pkr": number or null,\n'
    '  "direction": "debit" or "credit" or null,\n'
    '  "payment_method": string or null,\n'
    '  "txn_date": ISO8601 string or null,\n'
    '  "is_roman_urdu": boolean,\n'
    '  "confidence": number between 0 and 1\n'
    "}}"
)


def _empty_gemini_result() -> dict:
    """Return an all-null Gemini failure record."""
    return {
        "merchant_name": None,
        "amount_pkr": None,
        "direction": None,
        "payment_method": None,
        "txn_date": None,
        "is_roman_urdu": False,
        "confidence": 0.0,
        "parsed_by": "gemini",
    }


def _strip_markdown_fences(text: str) -> str:
    """Remove accidental markdown code fences from Gemini output."""
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


def parse_with_gemini(raw_text: str) -> dict:
    """
    Parse a bank notification using Gemini 1.5 Flash.

    Only called when regex confidence is below 0.70. Never raises;
    on any exception returns an all-null record with confidence 0.0.

    Args:
        raw_text: Normalized notification text.

    Returns:
        Parsed fields dict with parsed_by set to "gemini".
    """
    try:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.error("GEMINI_API_KEY not set")
            return _empty_gemini_result()

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(
            "gemini-2.5-flash",
            system_instruction=SYSTEM_INSTRUCTION,
        )

        prompt = USER_PROMPT_TEMPLATE.format(raw_text=raw_text)
        response = model.generate_content(prompt)
        raw_output = _strip_markdown_fences(response.text)
        data = json.loads(raw_output)

        return {
            "merchant_name": data.get("merchant_name"),
            "amount_pkr": data.get("amount_pkr"),
            "direction": data.get("direction"),
            "payment_method": data.get("payment_method"),
            "txn_date": data.get("txn_date"),
            "is_roman_urdu": bool(data.get("is_roman_urdu", False)),
            "confidence": float(data.get("confidence", 0.0)),
            "parsed_by": "gemini",
        }
    except Exception as exc:
        logger.error("Gemini parse failed: %s", exc)
        return _empty_gemini_result()
