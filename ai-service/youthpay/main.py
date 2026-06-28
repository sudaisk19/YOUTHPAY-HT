import logging

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from youthpay.models.schemas import (
    HealthResponse,
    InsightCard,
    InsightsRequest,
    InsightsResponse,
    ParseRequest,
    ParseResponse,
)
from youthpay.services.insights_generator import FALLBACK_INSIGHTS, generate_insights
from youthpay.services.parse_pipeline import run_parse_pipeline

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="YouthPay AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/parse", response_model=ParseResponse)
def parse_notification(request: ParseRequest) -> ParseResponse:
    return run_parse_pipeline(
        raw_text=request.raw_text,
        source=request.source,
        input_type=request.input_type,
    )


@app.post("/generate-insights", response_model=InsightsResponse)
def generate_insights_endpoint(request: InsightsRequest) -> InsightsResponse:
    stats_dict = request.stats.model_dump()
    raw_insights = generate_insights(stats_dict)
    try:
        insights = [InsightCard(**card) for card in raw_insights]
    except Exception as exc:
        logger.error("Insight validation failed: %s", exc)
        insights = [InsightCard(**card) for card in FALLBACK_INSIGHTS]
    return InsightsResponse(insights=insights)


@app.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    return HealthResponse(status="ok")
