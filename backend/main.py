"""
QuantForge Backend — FastAPI + vectorbt backtest engine.

Receives strategy configs as JSON, executes backtests,
returns structured results including equity curves, trades,
and pre-computed narrative insights.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import backtest

app = FastAPI(
    title="QuantForge API",
    description="Backtest engine for the QuantForge visual strategy platform",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(backtest.router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok", "service": "QuantForge Backend"}
