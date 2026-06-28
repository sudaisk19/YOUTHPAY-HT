"""Entry point for the YouthPay AI service."""

import os

import uvicorn

from youthpay.main import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
