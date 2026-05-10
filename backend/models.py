"""
Pydantic models for strategy config and backtest results.

These define the protocol between the frontend strategy editor
and the Python backtest engine.
"""
from pydantic import BaseModel
from typing import Optional
from enum import Enum


class NodeType(str, Enum):
    DATA = "data"
    INDICATOR = "indicator"
    SIGNAL = "signal"
    LOGIC = "logic"
    ACTION = "action"
    OUTPUT = "output"


class StrategyNode(BaseModel):
    id: str
    type: NodeType
    label: str
    params: dict[str, float | str | bool] = {}


class StrategyEdge(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None


class StrategyConfig(BaseModel):
    name: str
    description: str = ""
    symbol: str
    timeframe: str = "1d"
    start_date: str
    end_date: str
    nodes: list[StrategyNode]
    edges: list[StrategyEdge]


class Trade(BaseModel):
    entry_date: str
    exit_date: str
    side: str  # "long" or "short"
    entry_price: float
    exit_price: float
    pnl: float
    pnl_pct: float
    holding_days: int


class RiskMetrics(BaseModel):
    total_return: float
    annual_return: float
    sharpe_ratio: float
    max_drawdown: float
    calmar_ratio: float
    win_rate: float
    avg_win: float
    avg_loss: float
    profit_factor: float


class YearlyReturn(BaseModel):
    year: int
    return_value: float
    benchmark: float = 0.0


class MonthlyReturn(BaseModel):
    year: int
    month: int
    return_value: float


class NarrativeInsight(BaseModel):
    type: str  # "warning" | "positive" | "neutral" | "info"
    title: str
    description: str


class EquityPoint(BaseModel):
    date: str
    value: float


class BacktestResult(BaseModel):
    id: str
    strategy_id: str
    equity_curve: list[EquityPoint]
    drawdown_curve: list[EquityPoint]
    trades: list[Trade]
    metrics: RiskMetrics
    yearly_returns: list[YearlyReturn]
    monthly_returns: list[MonthlyReturn]
    insights: list[NarrativeInsight]
