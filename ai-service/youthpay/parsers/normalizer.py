"""Text normalization utilities for bank notification parsing."""

import re


def normalize(text: str) -> str:
    """
    Normalize raw notification text into clean plain text.

    Strips HTML tags, decodes bytes with UTF-8 then latin-1 fallback,
    collapses whitespace variants, and trims leading/trailing space.

    Args:
        text: Raw input text or bytes-like string content.

    Returns:
        Cleaned plain text string suitable for regex/Gemini parsing.
    """
    if isinstance(text, bytes):
        try:
            text = text.decode("utf-8")
        except UnicodeDecodeError:
            text = text.decode("latin-1", errors="replace")
    elif not isinstance(text, str):
        text = str(text)

    # Strip HTML tags using regex only (no BeautifulSoup).
    text = re.sub(r"<[^>]+>", " ", text)

    # Collapse all whitespace variants into a single space.
    text = re.sub(r"[\n\r\t]+", " ", text)
    text = re.sub(r"\s{2,}", " ", text)

    return text.strip()
