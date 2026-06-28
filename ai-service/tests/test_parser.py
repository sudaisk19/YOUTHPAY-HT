import os

import pytest

from youthpay.parsers.gemini_parser import parse_with_gemini
from youthpay.parsers.normalizer import normalize
from youthpay.parsers.regex_parser import parse as regex_parse
from youthpay.utils.categorizer import categorize
from youthpay.utils.duplicate_detector import detect_duplicates
from youthpay.utils.merchant_normalizer import normalize_merchant

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
requires_gemini = pytest.mark.skipif(
    not GEMINI_API_KEY,
    reason="GEMINI_API_KEY not set — Gemini tests require a live API key",
)


def _full_parse(raw_text: str, source: str = "") -> dict:
    text = normalize(raw_text)
    regex_fields, confidence = regex_parse(text, source)

    merchant = regex_fields.get("merchant_name")
    if merchant:
        merchant = normalize_merchant(merchant)
        regex_fields["merchant_name"] = merchant

    regex_fields["category"] = categorize(merchant or "")

    if confidence < 0.70:
        gemini_fields = parse_with_gemini(text)
        if gemini_fields.get("confidence", 0.0) > 0.0:
            merged = dict(regex_fields)
            for key, value in gemini_fields.items():
                if key == "parsed_by":
                    continue
                if value is not None:
                    merged[key] = value
            merged["parsed_by"] = "gemini"
            merchant = merged.get("merchant_name")
            if merchant:
                merged["merchant_name"] = normalize_merchant(merchant)
            merged["category"] = categorize(merged.get("merchant_name") or "")
            return merged

    return regex_fields


def test_english_debit_jazzcash_kfc():
    text = (
        "Your JazzCash account has been debited PKR 1,596 at KFC DHA on "
        "01-Jun-2026 at 3:42 PM. Available balance: PKR 8,404."
    )
    result = _full_parse(text, source="JazzCash")

    assert result["amount_pkr"] == 1596.0
    assert result["direction"] == "debit"
    assert result["payment_method"] == "JazzCash"
    assert result["category"] == "Food"
    assert result["parsed_by"] == "regex"
    assert result["confidence"] >= 0.70


def test_english_credit_meezan_allowance():
    text = (
        "PKR 10,000 credited to your Meezan account from Pocket Money "
        "on 01-Jun-2026."
    )
    result = _full_parse(text, source="Meezan")

    assert result["amount_pkr"] == 10000.0
    assert result["direction"] == "credit"
    assert result["payment_method"] == "Meezan"
    assert result["category"] == "Allowance"
    assert result["parsed_by"] == "regex"


@requires_gemini
def test_roman_urdu_hbl_indrive():
    text = (
        "Apkay HBL account se PKR 521 ka transaction hua hai inDrive "
        "ko 03-Jun-2026 ko. Baqi balance: PKR 7,883."
    )
    result = _full_parse(text, source="HBL")

    assert result["amount_pkr"] == 521.0
    assert result["is_roman_urdu"] is True
    assert result["parsed_by"] == "gemini"


@requires_gemini
def test_mixed_language_nayapay_indrive():
    text = "NayaPay se PKR 533 send kiye gaye to inDrive on 02-Jun-2026."
    result = _full_parse(text, source="NayaPay")

    assert result["amount_pkr"] == 533.0
    assert result["merchant_name"] == "inDrive"
    assert result["payment_method"] == "NayaPay"
    assert result["parsed_by"] == "gemini"


def test_duplicate_detection():
    text_a = "JazzCash debit PKR 521 at inDrive 03-Jun-2026 14:28"
    text_b = "HBL debit PKR 521 at inDrive 03-Jun-2026 14:30"

    parsed_a = regex_parse(normalize(text_a), source="JazzCash")[0]
    parsed_b = regex_parse(normalize(text_b), source="HBL")[0]

    parsed_a["merchant_name"] = normalize_merchant(parsed_a["merchant_name"] or "")
    parsed_b["merchant_name"] = normalize_merchant(parsed_b["merchant_name"] or "")

    batch = [parsed_a, parsed_b]
    result = detect_duplicates(batch, existing=[])

    duplicates = [t for t in result if t.get("is_duplicate")]
    assert len(duplicates) == 1
    assert result[0]["is_duplicate"] is False
    assert result[1]["is_duplicate"] is True
