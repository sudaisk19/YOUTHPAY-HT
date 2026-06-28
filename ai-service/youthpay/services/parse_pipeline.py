import logging

from youthpay.models.schemas import ParseResponse
from youthpay.parsers.eml_parser import parse_eml
from youthpay.parsers.gemini_parser import parse_with_gemini
from youthpay.parsers.normalizer import normalize
from youthpay.parsers.regex_parser import parse as regex_parse
from youthpay.utils.categorizer import categorize
from youthpay.utils.merchant_normalizer import normalize_merchant

logger = logging.getLogger(__name__)


def _merge_results(regex_fields: dict, gemini_fields: dict) -> dict:
    merged = dict(regex_fields)
    for key, value in gemini_fields.items():
        if key == "parsed_by":
            continue
        if value is not None:
            merged[key] = value
    merged["parsed_by"] = "gemini"
    return merged


def run_parse_pipeline(raw_text: str, source: str, input_type: str) -> ParseResponse:
    try:
        text = raw_text

        if input_type == "eml_base64":
            eml_data = parse_eml(raw_text)
            text = eml_data.get("body", "")
            if not source:
                source = eml_data.get("sender", "")

        text = normalize(text)
        regex_fields, confidence = regex_parse(text, source)

        merchant = regex_fields.get("merchant_name")
        if merchant:
            merchant = normalize_merchant(merchant)
            regex_fields["merchant_name"] = merchant

        category = categorize(merchant or "")
        regex_fields["category"] = category

        if confidence < 0.70:
            gemini_fields = parse_with_gemini(text)
            if gemini_fields.get("confidence", 0.0) > 0.0:
                merged = _merge_results(regex_fields, gemini_fields)
                merchant = merged.get("merchant_name")
                if merchant:
                    merged["merchant_name"] = normalize_merchant(merchant)
                merged["category"] = categorize(merged.get("merchant_name") or "")
                return ParseResponse(**merged)
            logger.warning("Gemini fallback failed, returning regex result")

        return ParseResponse(**regex_fields)

    except Exception as exc:
        logger.error("Parse pipeline error: %s", exc)
        return ParseResponse(confidence=0.0, parsed_by="regex")
