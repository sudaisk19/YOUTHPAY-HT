"""Regex-based parser for Pakistani bank SMS/email notifications."""

import re
from typing import Optional

from dateutil import parser as date_parser


DEBIT_KEYWORDS = [
    "debited",
    "deducted",
    "paid",
    "sent",
    "withdrawn",
    "katay",
    "gaye",
    "transfer out",
]

CREDIT_KEYWORDS = [
    "credited",
    "received",
    "deposited",
    "aaya",
    "mila",
    "added",
    "transfer in",
]

AMOUNT_PATTERN = re.compile(
    r"(?:Rs\.?|PKR)\s*([\d,]+(?:\.\d{1,2})?)",
    re.IGNORECASE,
)

MERCHANT_PATTERNS = [
    re.compile(r"at\s+([A-Za-z0-9 &'\-]{2,30})", re.IGNORECASE),
    re.compile(r"to\s+([A-Za-z0-9 &'\-]{2,30})", re.IGNORECASE),
    re.compile(r"from\s+([A-Za-z0-9 &'\-]{2,30})", re.IGNORECASE),
    re.compile(r"merchant[:\s]+([A-Za-z0-9 &'\-]{2,30})", re.IGNORECASE),
]

DATE_PATTERNS = [
    re.compile(
        r"\b(\d{1,2}-[A-Za-z]{3}-\d{4}(?:\s+(?:at\s+)?\d{1,2}:\d{2}(?:\s*[AP]M)?)?)\b",
        re.IGNORECASE,
    ),
    re.compile(
        r"\b(\d{1,2}/\d{1,2}/\d{4}(?:\s+\d{1,2}:\d{2})?)\b"
    ),
    re.compile(r"\b(\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2})?)\b"),
]

PAYMENT_METHOD_RULES: list[tuple[list[str], str]] = [
    (["jazzcash", "jazzco"], "JazzCash"),
    (["nayapay", "naya pay"], "NayaPay"),
    (["easypaisa"], "Easypaisa"),
    (["meezan"], "Meezan"),
    (["hbl"], "HBL"),
    (["ubl"], "UBL"),
    (["alfalah"], "Alfalah"),
    (["atm withdrawal", "via atm"], "ATM"),
    ([" atm ", "atm "], "ATM"),
    (["ibft"], "IBFT"),
    ([" qr ", "qr "], "QR"),
]


def _extract_amount(text: str) -> Optional[float]:
    """Extract PKR amount from notification text."""
    match = AMOUNT_PATTERN.search(text)
    if not match:
        return None
    raw = match.group(1).replace(",", "")
    return float(raw)


def _extract_direction(text: str) -> Optional[str]:
    """Detect debit or credit direction from keyword presence."""
    lower = text.lower()
    for keyword in DEBIT_KEYWORDS:
        if keyword in lower:
            return "debit"
    for keyword in CREDIT_KEYWORDS:
        if keyword in lower:
            return "credit"
    return None


def _clean_merchant(raw: str) -> str:
    """Strip trailing prepositions, dates, times, and punctuation from merchant match."""
    cleaned = raw.strip()
    # Strip trailing date/time fragments accidentally captured in merchant group.
    cleaned = re.sub(
        r"\s+\d{1,2}-[A-Za-z]{3}-\d{4}.*$",
        "",
        cleaned,
        flags=re.IGNORECASE,
    )
    cleaned = re.sub(r"\s+\d{1,2}/\d{1,2}/\d{4}.*$", "", cleaned)
    cleaned = re.sub(r"\s+\d{4}-\d{2}-\d{2}.*$", "", cleaned)
    cleaned = re.sub(
        r"\s+(on|at|for|via|from|to|in|the|a|an)\s*$",
        "",
        cleaned,
        flags=re.IGNORECASE,
    )
    cleaned = cleaned.strip(" .,;:'\"-")
    return cleaned


def _extract_merchant(text: str, direction: Optional[str]) -> Optional[str]:
    """Extract merchant name using ordered regex patterns."""
    patterns = list(MERCHANT_PATTERNS)
    # For credit transactions, prefer "from" before "to".
    if direction == "credit":
        patterns = [patterns[0], patterns[2], patterns[1], patterns[3]]

    for idx, pattern in enumerate(patterns):
        # Original index 2 is "from" — only apply when direction is credit.
        original_idx = MERCHANT_PATTERNS.index(pattern)
        if original_idx == 2 and direction != "credit":
            continue
        match = pattern.search(text)
        if match:
            merchant = _clean_merchant(match.group(1))
            if merchant and not re.match(
                r"^(your|my|the)\s", merchant, re.IGNORECASE
            ):
                return merchant
    return None


def _extract_payment_method(source: str, body: str) -> Optional[str]:
    """Detect payment method from source/sender first, then body."""
    combined = f"{source} {body}".lower()
    for keywords, method in PAYMENT_METHOD_RULES:
        for keyword in keywords:
            if keyword in combined:
                return method
    return None


def _extract_date(text: str) -> Optional[str]:
    """Extract transaction date and return ISO 8601 string."""
    for pattern in DATE_PATTERNS:
        match = pattern.search(text)
        if match:
            try:
                parsed = date_parser.parse(match.group(1), dayfirst=True)
                return parsed.isoformat()
            except (ValueError, OverflowError):
                continue
    return None


def _compute_confidence(
    amount: Optional[float],
    direction: Optional[str],
    merchant: Optional[str],
) -> float:
    """Score parse confidence: amount +0.40, direction +0.35, merchant +0.25."""
    score = 0.0
    if amount is not None:
        score += 0.40
    if direction is not None:
        score += 0.35
    if merchant is not None:
        score += 0.25
    return min(score, 1.0)


def parse(raw_text: str, source: str = "") -> tuple[dict, float]:
    """
    Parse a bank notification using regex only.

    Args:
        raw_text: Normalized notification text.
        source: Optional source/sender string for payment method detection.

    Returns:
        Tuple of (fields dict, confidence float).
        Confidence below 0.70 should trigger Gemini fallback.
    """
    amount = _extract_amount(raw_text)
    direction = _extract_direction(raw_text)
    merchant = _extract_merchant(raw_text, direction)
    payment_method = _extract_payment_method(source, raw_text)
    txn_date = _extract_date(raw_text)
    confidence = _compute_confidence(amount, direction, merchant)

    fields = {
        "merchant_name": merchant,
        "amount_pkr": amount,
        "direction": direction,
        "payment_method": payment_method,
        "txn_date": txn_date,
        "is_roman_urdu": False,
        "confidence": confidence,
        "parsed_by": "regex",
    }
    return fields, confidence
