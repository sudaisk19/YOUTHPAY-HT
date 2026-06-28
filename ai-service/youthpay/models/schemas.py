"""Pydantic request/response models for the YouthPay AI service."""

from typing import Literal, Optional

from pydantic import BaseModel, Field


PaymentMethod = Literal[
    "JazzCash",
    "NayaPay",
    "Meezan",
    "HBL",
    "UBL",
    "Alfalah",
    "Easypaisa",
    "Card",
    "IBFT",
    "ATM",
    "QR",
    "Wallet",
    "other",
]

Direction = Literal["debit", "credit"]
ParsedBy = Literal["regex", "gemini"]
InputType = Literal["sms", "email_body", "eml_base64"]
InsightType = Literal["alert", "tip", "positive", "behavioral"]
InsightIcon = Literal[
    "coffee",
    "transport",
    "food",
    "money",
    "star",
    "warning",
    "chart",
]


class ParseRequest(BaseModel):
    """Request body for POST /parse."""

    raw_text: str
    source: str
    input_type: InputType


class ParseResponse(BaseModel):
    """Unified parse result returned by POST /parse."""

    merchant_name: Optional[str] = None
    amount_pkr: Optional[float] = None
    direction: Optional[Direction] = None
    payment_method: Optional[PaymentMethod] = None
    txn_date: Optional[str] = None
    category: Optional[str] = None
    is_roman_urdu: bool = False
    confidence: float = 0.0
    parsed_by: ParsedBy = "regex"


class MerchantStat(BaseModel):
    """Top merchant aggregate for insight generation."""

    name: str
    total: float
    count: int


class TransactionStats(BaseModel):
    """Spending statistics passed from Next.js for insight generation."""

    category_totals: dict[str, float] = Field(default_factory=dict)
    daily_totals: dict[str, float] = Field(default_factory=dict)
    top_merchants: list[MerchantStat] = Field(default_factory=list)
    weekend_ratio: float = 0.0
    total_spent: float = 0.0
    total_received: float = 0.0
    duplicate_count: int = 0


class InsightsRequest(BaseModel):
    """Request body for POST /generate-insights."""

    user_id: str
    stats: TransactionStats


class InsightCard(BaseModel):
    """Single AI-generated insight card."""

    type: InsightType
    icon: InsightIcon
    title: str
    body: str


class InsightsResponse(BaseModel):
    """Response body for POST /generate-insights."""

    insights: list[InsightCard]


class HealthResponse(BaseModel):
    """Response body for GET /health."""

    status: str = "ok"
