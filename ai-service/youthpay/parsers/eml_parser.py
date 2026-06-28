"""Parser for base64-encoded .eml email files."""

import base64
import email
from email import policy
from email.parser import BytesParser

from youthpay.parsers.normalizer import normalize


def parse_eml(eml_base64: str) -> dict[str, str]:
    """
    Parse a base64-encoded .eml file and extract structured fields.

    Prefers text/plain parts over text/html. If only HTML is available,
    strips tags via normalizer before returning the body.

    Args:
        eml_base64: Base64-encoded raw .eml content.

    Returns:
        Dict with keys: subject, sender, date, body.
    """
    raw_bytes = base64.b64decode(eml_base64)
    message = BytesParser(policy=policy.default).parsebytes(raw_bytes)

    subject = str(message.get("subject", "") or "")
    sender = str(message.get("from", "") or "")
    date = str(message.get("date", "") or "")

    plain_parts: list[str] = []
    html_parts: list[str] = []

    if message.is_multipart():
        for part in message.walk():
            content_type = part.get_content_type()
            if content_type == "text/plain":
                payload = part.get_payload(decode=True)
                if payload:
                    plain_parts.append(
                        payload.decode("utf-8", errors="replace")
                    )
            elif content_type == "text/html":
                payload = part.get_payload(decode=True)
                if payload:
                    html_parts.append(
                        payload.decode("utf-8", errors="replace")
                    )
    else:
        payload = message.get_payload(decode=True)
        if payload:
            decoded = payload.decode("utf-8", errors="replace")
            if message.get_content_type() == "text/html":
                html_parts.append(decoded)
            else:
                plain_parts.append(decoded)

    if plain_parts:
        body = " ".join(plain_parts)
    elif html_parts:
        body = normalize(" ".join(html_parts))
    else:
        body = ""

    return {
        "subject": subject,
        "sender": sender,
        "date": date,
        "body": normalize(body),
    }
