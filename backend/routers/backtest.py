"""
Backtest router — compiles node graphs into trading signals and runs vectorbt backtests.
"""
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
import pandas as pd
import numpy as np
import yfinance as yf

from ..models import (
    StrategyConfig, BacktestResult, RiskMetrics, Trade, YearlyReturn,
    MonthlyReturn, NarrativeInsight, EquityPoint, NodeType, StrategyNode,
)

router = APIRouter(tags=["backtest"])


def fetch_data(symbol: str, start: str, end: str, timeframe: str) -> pd.DataFrame:
    """Fetch OHLCV data from Yahoo Finance."""
    interval_map = {"1m": "1m", "5m": "5m", "1h": "1h", "1d": "1d", "1wk": "1wk"}
    interval = interval_map.get(timeframe, "1d")

    df = yf.download(symbol, start=start, end=end, interval=interval, progress=False)

    if df.empty:
        raise HTTPException(status_code=400, detail=f"No data for {symbol} ({start} to {end})")

    # Flatten multi-level columns
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    return df


# ── Indicator computation ──

def compute_sma(series: pd.Series, period: int) -> pd.Series:
    return series.rolling(window=period).mean()

def compute_ema(series: pd.Series, period: int) -> pd.Series:
    return series.ewm(span=period, adjust=False).mean()

def compute_rsi(series: pd.Series, period: int) -> pd.Series:
    delta = series.diff()
    gain = delta.clip(lower=0)
    loss = (-delta).clip(lower=0)
    avg_gain = gain.ewm(com=period - 1, adjust=False).mean()
    avg_loss = loss.ewm(com=period - 1, adjust=False).mean()
    rs = avg_gain / avg_loss
    return 100 - (100 / (1 + rs))

def compute_macd(series: pd.Series, fast: int, slow: int, signal: int) -> tuple[pd.Series, pd.Series, pd.Series]:
    ema_fast = compute_ema(series, fast)
    ema_slow = compute_ema(series, slow)
    macd_line = ema_fast - ema_slow
    signal_line = compute_ema(macd_line, signal)
    histogram = macd_line - signal_line
    return macd_line, signal_line, histogram

def compute_bollinger(series: pd.Series, period: int, stddev: float) -> tuple[pd.Series, pd.Series, pd.Series]:
    sma = compute_sma(series, period)
    std = series.rolling(window=period).std()
    upper = sma + stddev * std
    lower = sma - stddev * std
    return upper, sma, lower


# ── Graph-to-signal compiler ──

def compile_signals(df: pd.DataFrame, nodes: list[StrategyNode], edges: list) -> pd.DataFrame:
    """
    Compile the node graph into buy/sell signals.

    For v1, supports a simplified data flow:
    - Data nodes produce the base price series
    - Indicator nodes compute technical indicators
    - Signal nodes compare series and generate boolean signals
    - Logic nodes combine signals
    - Action nodes map to final entry/exit columns
    """
    signals = pd.DataFrame(index=df.index)
    series_store: dict[str, pd.Series] = {"close": df["Close"], "open": df["Open"], "high": df["High"], "low": df["Low"], "volume": df["Volume"]}

    # Topological sort
    in_degree: dict[str, int] = {n.id: 0 for n in nodes}
    adj: dict[str, list[str]] = {n.id: [] for n in nodes}
    for e in edges:
        adj[e.source].append(e.target)
        if e.target in in_degree:
            in_degree[e.target] += 1

    order: list[str] = []
    queue = [nid for nid, deg in in_degree.items() if deg == 0]
    while queue:
        u = queue.pop(0)
        order.append(u)
        for v in adj.get(u, []):
            if v in in_degree:
                in_degree[v] -= 1
                if in_degree[v] == 0:
                    queue.append(v)

    node_map = {n.id: n for n in nodes}

    for nid in order:
        node = node_map.get(nid)
        if not node:
            continue

        if node.type == NodeType.INDICATOR:
            label_lower = node.label.lower()
            close = series_store.get("close", df["Close"])
            if "sma" in label_lower:
                p = int(node.params.get("period", 20))
                series_store[nid] = compute_sma(close, p)
            elif "ema" in label_lower:
                p = int(node.params.get("period", 20))
                series_store[nid] = compute_ema(close, p)
            elif "rsi" in label_lower:
                p = int(node.params.get("period", 14))
                series_store[nid] = compute_rsi(close, p)
            elif "macd" in label_lower:
                fast = int(node.params.get("fast", 12))
                slow = int(node.params.get("slow", 26))
                sig = int(node.params.get("signal", 9))
                macd_line, signal_line, histogram = compute_macd(close, fast, slow, sig)
                series_store[f"{nid}_macd"] = macd_line
                series_store[f"{nid}_signal"] = signal_line
                series_store[f"{nid}_hist"] = histogram
            elif "bollinger" in label_lower:
                p = int(node.params.get("period", 20))
                s = float(node.params.get("stddev", 2))
                upper, mid, lower = compute_bollinger(close, p, s)
                series_store[f"{nid}_upper"] = upper
                series_store[f"{nid}_mid"] = mid
                series_store[f"{nid}_lower"] = lower

        elif node.type == NodeType.SIGNAL:
            # Find predecessor series
            inputs = [e.source for e in edges if e.target == nid]
            a = series_store.get(inputs[0] if len(inputs) > 0 else "close", df["Close"])
            b = series_store.get(inputs[1] if len(inputs) > 1 else "close", df["Close"])
            label_lower = node.label.lower()

            if "cross above" in label_lower:
                prev_a, prev_b = a.shift(1), b.shift(1)
                signals[nid] = (a > b) & (prev_a <= prev_b)
            elif "cross below" in label_lower:
                prev_a, prev_b = a.shift(1), b.shift(1)
                signals[nid] = (a < b) & (prev_a >= prev_b)
            elif "greater than" in label_lower:
                threshold = float(node.params.get("threshold", 0))
                signals[nid] = a > threshold if threshold != 0 else a > b
            elif "less than" in label_lower:
                threshold = float(node.params.get("threshold", 0))
                signals[nid] = a < threshold if threshold != 0 else a < b

        elif node.type == NodeType.LOGIC:
            inputs = [e.source for e in edges if e.target == nid]
            s_list = [signals[s].fillna(False) for s in inputs if s in signals.columns]
            if s_list:
                combined = s_list[0]
                for s in s_list[1:]:
                    if node.label == "AND":
                        combined = combined & s
                    elif node.label == "OR":
                        combined = combined | s
                    elif node.label == "NOT":
                        combined = ~combined
                signals[nid] = combined

        elif node.type == NodeType.ACTION:
            inputs = [e.source for e in edges if e.target == nid]
            if inputs and inputs[0] in signals.columns:
                if "buy" in node.label.lower():
                    signals["entry"] = signals[inputs[0]].fillna(False)
                    signals["entry_signal"] = signals[inputs[0]].fillna(False)
                elif "sell" in node.label.lower():
                    signals["exit"] = signals[inputs[0]].fillna(False)
                    signals["exit_signal"] = signals[inputs[0]].fillna(False)

    return signals


# ── Signal → trades ──

def signals_to_trades(df: pd.DataFrame, signals: pd.DataFrame) -> list[Trade]:
    """Convert entry/exit signals to a list of trades."""
    trades: list[Trade] = []

    entry_col = "entry" if "entry" in signals.columns else None
    exit_col = "exit" if "exit" in signals.columns else None

    if entry_col is None:
        return trades

    entry_dates = signals.index[signals[entry_col].fillna(False)]
    exit_dates = signals.index[signals[exit_col].fillna(False)] if exit_col else pd.DatetimeIndex([])

    pos = None
    for i, (date, row) in enumerate(df.iterrows()):
        if pos is None and signals.loc[date, entry_col]:
            pos = {"entry_date": date, "entry_price": float(row["Close"])}
        elif pos is not None and exit_col and signals.loc[date, exit_col]:
            exit_price = float(row["Close"])
            pnl = exit_price - pos["entry_price"]
            pnl_pct = pnl / pos["entry_price"]
            holding_days = (pd.Timestamp(date) - pd.Timestamp(pos["entry_date"])).days
            trades.append(Trade(
                entry_date=str(pos["entry_date"]).split("T")[0],
                exit_date=str(date).split("T")[0],
                side="long",
                entry_price=pos["entry_price"],
                exit_price=exit_price,
                pnl=round(pnl, 4),
                pnl_pct=round(pnl_pct * 100, 2),
                holding_days=holding_days,
            ))
            pos = None

    return trades


# ── Risk metrics ──

def compute_metrics(equity: pd.Series, trades: list[Trade]) -> RiskMetrics:
    """Compute standard risk/return metrics from an equity curve."""
    if len(equity) < 2:
        return RiskMetrics(total_return=0, annual_return=0, sharpe_ratio=0, max_drawdown=0, calmar_ratio=0, win_rate=0, avg_win=0, avg_loss=0, profit_factor=0)

    returns = equity.pct_change().dropna()
    total_return = (equity.iloc[-1] / equity.iloc[0] - 1) if equity.iloc[0] != 0 else 0

    # Annualized return (252 trading days)
    n_days = len(returns)
    annual_return = (1 + total_return) ** (252 / max(n_days, 1)) - 1 if n_days > 0 else 0

    # Sharpe ratio
    rf_daily = 0.03 / 252
    excess = returns - rf_daily
    sharpe = float(excess.mean() / excess.std() * np.sqrt(252)) if excess.std() > 0 else 0

    # Max drawdown
    peak = equity.expanding().max()
    drawdown = (equity - peak) / peak
    max_dd = float(drawdown.min())

    # Calmar
    calmar = float(annual_return / abs(max_dd)) if max_dd != 0 else 0

    # Win rate
    wins = [t for t in trades if t.pnl > 0]
    losses = [t for t in trades if t.pnl <= 0]
    win_rate = len(wins) / len(trades) if trades else 0

    avg_win = sum(t.pnl for t in wins) / len(wins) if wins else 0
    avg_loss = sum(t.pnl for t in losses) / len(losses) if losses else 0

    gross_profit = sum(t.pnl for t in wins)
    gross_loss = abs(sum(t.pnl for t in losses))
    profit_factor = gross_profit / gross_loss if gross_loss != 0 else 0

    return RiskMetrics(
        total_return=round(total_return * 100, 2),
        annual_return=round(annual_return * 100, 2),
        sharpe_ratio=round(sharpe, 2),
        max_drawdown=round(max_dd * 100, 2),
        calmar_ratio=round(calmar, 2),
        win_rate=round(win_rate * 100, 1),
        avg_win=round(avg_win, 4),
        avg_loss=round(avg_loss, 4),
        profit_factor=round(profit_factor, 2),
    )


# ── Narrative insights ──

def generate_insights(metrics: RiskMetrics, yearly: list[YearlyReturn], trades: list[Trade], equity: pd.Series, symbol: str) -> list[NarrativeInsight]:
    """Rule-based narrative insight generation — no AI needed for v1."""
    insights: list[NarrativeInsight] = []

    # Overall performance
    if metrics.total_return > 0:
        insights.append(NarrativeInsight(
            type="positive",
            title="Positive total return",
            description=f"The strategy returned {metrics.total_return}% over the period, outperforming a simple buy-and-hold in directional moves.",
        ))
    else:
        insights.append(NarrativeInsight(
            type="warning",
            title="Negative total return",
            description=f"The strategy lost {abs(metrics.total_return)}% overall. Consider adding market regime filters or adjusting exit rules.",
        ))

    # Sharpe
    if metrics.sharpe_ratio > 1:
        insights.append(NarrativeInsight(type="positive", title="Strong risk-adjusted returns", description=f"Sharpe ratio of {metrics.sharpe_ratio} indicates returns are commensurate with the risk taken."))
    elif metrics.sharpe_ratio < 0.5:
        insights.append(NarrativeInsight(type="warning", title="Low risk-adjusted returns", description=f"Sharpe ratio of {metrics.sharpe_ratio} suggests returns don't justify the volatility."))

    # Max drawdown
    if metrics.max_drawdown < -20:
        insights.append(NarrativeInsight(type="warning", title="Severe drawdown", description=f"Maximum drawdown of {metrics.max_drawdown}% is significant. Consider adding stop-loss logic to limit downside."))

    # Yearly analysis
    if yearly:
        best_year = max(yearly, key=lambda y: y.return_value)
        worst_year = min(yearly, key=lambda y: y.return_value)
        if worst_year.return_value < 0:
            insights.append(NarrativeInsight(
                type="neutral",
                title=f"Worst year: {worst_year.year}",
                description=f"The strategy lost {abs(worst_year.return_value)}% in {worst_year.year}. Check if this aligns with a bear market — if so, the strategy may need trend filters.",
            ))
        if best_year.return_value > 20:
            insights.append(NarrativeInsight(
                type="positive",
                title=f"Best year: {best_year.year}",
                description=f"The strategy gained {best_year.return_value}% in {best_year.year}. Determine whether this was driven by a strong bull market or genuine alpha.",
            ))

    # Win rate
    if metrics.win_rate > 50:
        insights.append(NarrativeInsight(type="info", title="Above-50% win rate", description=f"{metrics.win_rate}% of trades were profitable. Average win: ${metrics.avg_win:.2f}, average loss: ${abs(metrics.avg_loss):.2f}."))
    elif trades:
        insights.append(NarrativeInsight(type="neutral", title="Below-50% win rate", description=f"Only {metrics.win_rate}% of trades were profitable. But if the profit factor ({metrics.profit_factor}) is above 1, winners are large enough to offset losses."))

    return insights


# ── Route ──

@router.post("/backtest", response_model=BacktestResult)
def run_backtest(config: StrategyConfig):
    # 1. Fetch data
    df = fetch_data(config.symbol, config.start_date, config.end_date, config.timeframe)

    # 2. Compile signals from graph
    signals = compile_signals(df, config.nodes, config.edges)

    # 3. Convert signals to trades
    trades = signals_to_trades(df, signals)

    # 4. Compute equity curve
    equity = pd.Series(100.0, index=df.index)
    if trades:
        for t in trades:
            exit_idx = df.index[df.index >= pd.Timestamp(t.exit_date)]
            if len(exit_idx) > 0:
                idx = exit_idx[0]
                pct = t.pnl / t.entry_price
                loc = df.index.get_loc(idx)
                equity.iloc[loc:] = equity.iloc[loc] * (1 + pct)

    # 5. Metrics
    metrics = compute_metrics(equity, trades)

    # 6. Yearly / monthly returns
    yearly_returns: list[YearlyReturn] = []
    monthly_returns: list[MonthlyReturn] = []
    if len(equity) > 1:
        annual_ret = equity.resample("YE").last().pct_change().dropna()
        for date, val in annual_ret.items():
            yearly_returns.append(YearlyReturn(year=date.year, return_value=round(float(val) * 100, 2)))
        monthly_ret = equity.resample("ME").last().pct_change().dropna()
        for date, val in monthly_ret.items():
            monthly_returns.append(MonthlyReturn(year=date.year, month=date.month, return_value=round(float(val) * 100, 2)))

    # 7. Insights
    insights = generate_insights(metrics, yearly_returns, trades, equity, config.symbol)

    # 8. Equity / drawdown curves
    equity_curve = [
        EquityPoint(date=str(idx).split("T")[0], value=round(float(v), 2))
        for idx, v in equity.items()
    ]
    peak = equity.expanding().max()
    dd = ((equity - peak) / peak * 100).fillna(0)
    drawdown_curve = [
        EquityPoint(date=str(idx).split("T")[0], value=round(float(v), 2))
        for idx, v in dd.items()
    ]

    return BacktestResult(
        id=uuid.uuid4().hex[:12],
        strategy_id=config.name or "untitled",
        equity_curve=equity_curve,
        drawdown_curve=drawdown_curve,
        trades=trades,
        metrics=metrics,
        yearly_returns=yearly_returns,
        monthly_returns=monthly_returns,
        insights=insights,
    )


@router.get("/backtest/sample")
def get_sample_result():
    """Return a mock backtest result for demo purposes."""
    import random
    random.seed(42)
    dates = pd.date_range("2020-01-01", "2024-12-31", freq="D")

    equity = [100.0]
    for i in range(1, len(dates)):
        change = np.random.normal(0.0003, 0.012)
        equity.append(equity[-1] * (1 + change))

    trades = []
    for i in range(50):
        entry_idx = random.randint(50, len(dates) - 30)
        exit_idx = entry_idx + random.randint(5, 60)
        if exit_idx >= len(dates):
            exit_idx = len(dates) - 1
        entry_p = equity[entry_idx]
        exit_p = equity[exit_idx]
        pnl = exit_p - entry_p
        trades.append(Trade(
            entry_date=str(dates[entry_idx]).split("T")[0],
            exit_date=str(dates[exit_idx]).split("T")[0],
            side="long",
            entry_price=round(entry_p, 2),
            exit_price=round(exit_p, 2),
            pnl=round(pnl, 2),
            pnl_pct=round(pnl / entry_p * 100, 2),
            holding_days=(dates[exit_idx] - dates[entry_idx]).days,
        ))

    eq = pd.Series(equity, index=dates)
    peak = eq.expanding().max()
    dd = ((eq - peak) / peak * 100).fillna(0)

    return BacktestResult(
        id="sample",
        strategy_id="sample_strategy",
        equity_curve=[EquityPoint(date=str(d).split("T")[0], value=round(v, 2)) for d, v in zip(dates[::5], equity[::5])],
        drawdown_curve=[EquityPoint(date=str(d).split("T")[0], value=round(float(v), 2)) for d, v in zip(dates[::5], dd[::5])],
        trades=trades,
        metrics=RiskMetrics(total_return=42.5, annual_return=8.3, sharpe_ratio=1.15, max_drawdown=-18.7, calmar_ratio=0.44, win_rate=54.0, avg_win=3.2, avg_loss=-2.1, profit_factor=1.8),
        yearly_returns=[
            YearlyReturn(year=2020, return_value=15.2, benchmark=16.3),
            YearlyReturn(year=2021, return_value=22.8, benchmark=26.9),
            YearlyReturn(year=2022, return_value=-12.5, benchmark=-19.4),
            YearlyReturn(year=2023, return_value=18.3, benchmark=24.2),
            YearlyReturn(year=2024, return_value=8.7, benchmark=10.1),
        ],
        monthly_returns=[],
        insights=[
            NarrativeInsight(type="positive", title="Positive total return", description="The strategy returned 42.5% over the period, outperforming a simple buy-and-hold in directional moves."),
            NarrativeInsight(type="positive", title="Strong risk-adjusted returns", description="Sharpe ratio of 1.15 indicates returns are commensurate with the risk taken."),
            NarrativeInsight(type="warning", title="2022 drawdown", description="The strategy lost 12.5% in 2022 during the bear market. While better than the S&P 500 (-19.4%), adding a trend filter could further reduce drawdowns."),
            NarrativeInsight(type="info", title="Above-50% win rate", description="54% of trades were profitable. Average win: $3.20, average loss: $2.10. Profit factor of 1.8 means winners significantly outweigh losers."),
            NarrativeInsight(type="neutral", title="Market regime analysis", description="The strategy performs best in trending markets (2020-2021, 2023) and struggles in sideways/choppy conditions. Consider adding a volatility filter."),
        ],
    )
