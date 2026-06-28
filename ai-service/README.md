# YouthPay AI Service

FastAPI service for parsing Pakistani bank notifications and generating Gemini insights.

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Set `GEMINI_API_KEY` in `.env`.

## Run

```bash
python main.py
```

Or: `uvicorn youthpay.main:app --host 0.0.0.0 --port 8000`

## Deploy on Render

Use the repo root `render.yaml` blueprint, or create a Web Service with root directory `ai-service`:

- **Start:** `uvicorn youthpay.main:app --host 0.0.0.0 --port $PORT`
- **Health check:** `/health`
- **Env:** `GEMINI_API_KEY`

Point Vercel’s `PARSER_API_URL` at the Render URL (server-side only; CORS is not required for that path).

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/parse` | Parse SMS, email body, or base64 EML |
| POST | `/generate-insights` | Generate 4 AI insight cards from stats |

## Tests

```bash
pytest tests/
```
