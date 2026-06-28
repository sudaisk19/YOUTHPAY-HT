"""Keyword-based transaction categorizer (no AI)."""

CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "Food": [
        "kfc",
        "mcdonalds",
        "burger",
        "pizza",
        "food",
        "restaurant",
        "cafe",
        "dhaba",
        "biryani",
        "school cafet",
        "wb by hema",
    ],
    "Transport": [
        "indrive",
        "in drive",
        "yango",
        "uber",
        "careem",
        "fuel",
        "petrol",
        "cng",
    ],
    "Lifestyle": [
        "miniso",
        "outfitters",
        "khaadi",
        "zara",
        "h&m",
        "shopping",
    ],
    "Utilities": [
        "easyload",
        "jazz load",
        "telenor load",
        "ufone",
        "zong",
        "bill",
        "electricity",
        "gas",
        "water",
    ],
    "Education": [
        "liberty book",
        "books",
        "stationery",
        "academy",
        "tuition",
        "fee",
    ],
    "Beauty": [
        "bagallery",
        "wb by hema",
        "salon",
        "parlour",
        "nykaa",
    ],
    "Entertainment": [
        "cinema",
        "atrium",
        "nueplex",
        "cinepax",
        "netflix",
        "youtube",
    ],
    "Coffee": [
        "coffee wagon",
        "espresso",
        "starbucks",
        "gloria jeans",
        "coffee",
    ],
    "Allowance": [
        "pocket money",
        "allowance",
        "monthly",
        "salary",
    ],
}


def categorize(merchant_name: str) -> str:
    """
    Categorize a transaction by merchant name keyword lookup.

    Args:
        merchant_name: Normalized merchant name string.

    Returns:
        Category string, or "Other" if no keyword matches.
    """
    if not merchant_name:
        return "Other"

    lower = merchant_name.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        for keyword in keywords:
            if keyword in lower:
                return category
    return "Other"
