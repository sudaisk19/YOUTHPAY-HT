"""Merchant name alias normalizer."""

MERCHANT_ALIASES: dict[str, str] = {
    "in drive": "inDrive",
    "indrive": "inDrive",
    "k.f.c": "KFC",
    "kfc": "KFC",
    "naya pay": "NayaPay",
    "nayapay": "NayaPay",
    "jazz cash": "JazzCash",
    "jazzco": "JazzCash",
    "liberty books": "Liberty Books",
    "liberty book": "Liberty Books",
    "miniso lucky": "MINISO",
    "miniso": "MINISO",
    "wb hema": "WB by Hema",
    "wb by hema": "WB by Hema",
    "atrium cine": "Atrium Cinema",
    "atrium cinema": "Atrium Cinema",
    "coffee wagon": "Coffee Wagon",
}


def normalize_merchant(raw_name: str) -> str:
    """
    Normalize a merchant name to its canonical display form.

    Args:
        raw_name: Raw extracted merchant name.

    Returns:
        Canonical merchant name from alias map, or title-cased input.
    """
    if not raw_name:
        return raw_name

    lower = raw_name.strip().lower()
    if lower in MERCHANT_ALIASES:
        return MERCHANT_ALIASES[lower]

    return raw_name.strip().title()
