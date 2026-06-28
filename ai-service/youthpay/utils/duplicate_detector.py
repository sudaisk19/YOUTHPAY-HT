"""Duplicate transaction detector for parsed notification batches."""

from datetime import timedelta
from typing import Optional

from dateutil import parser as date_parser

from youthpay.utils.merchant_normalizer import normalize_merchant


def _parse_date(date_str: Optional[str]):
    """Parse an ISO or common date string into a datetime object."""
    if not date_str:
        return None
    try:
        return date_parser.parse(date_str)
    except (ValueError, OverflowError, TypeError):
        return None


def _is_duplicate_pair(a: dict, b: dict) -> bool:
    """
    Check if two transactions are duplicates.

    Same normalized merchant, same amount, and txn_date within 5 minutes.
    """
    merchant_a = normalize_merchant(a.get("merchant_name") or "").lower()
    merchant_b = normalize_merchant(b.get("merchant_name") or "").lower()

    if not merchant_a or merchant_a != merchant_b:
        return False

    amount_a = a.get("amount_pkr")
    amount_b = b.get("amount_pkr")
    if amount_a is None or amount_b is None or amount_a != amount_b:
        return False

    date_a = _parse_date(a.get("txn_date"))
    date_b = _parse_date(b.get("txn_date"))
    if date_a is None or date_b is None:
        return False

    return abs(date_a - date_b) <= timedelta(minutes=5)


def detect_duplicates(
    batch: list[dict],
    existing: list[dict],
) -> list[dict]:
    """
    Mark later duplicate transactions in a batch.

    Compares each transaction against all others in the batch and against
    existing transactions from Next.js. The LATER transaction is marked
    is_duplicate=True.

    Args:
        batch: Current batch of parsed transactions.
        existing: Previously parsed transactions passed from Next.js.

    Returns:
        Batch list with is_duplicate field added to each item.
    """
    all_txns = existing + batch
    result = []

    for i, txn in enumerate(batch):
        txn_copy = dict(txn)
        txn_copy["is_duplicate"] = False
        my_idx = len(existing) + i
        my_date = _parse_date(txn.get("txn_date"))

        for j, other in enumerate(all_txns):
            if j == my_idx:
                continue

            if not _is_duplicate_pair(txn, other):
                continue

            other_date = _parse_date(other.get("txn_date"))

            # Mark this txn duplicate if the other one is earlier.
            if j < my_idx:
                if my_date and other_date:
                    if my_date >= other_date:
                        txn_copy["is_duplicate"] = True
                        break
                else:
                    txn_copy["is_duplicate"] = True
                    break

        result.append(txn_copy)

    return result
