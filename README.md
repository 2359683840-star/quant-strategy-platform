# QuantForge — Visual Quantitative Strategy Platform

A no-code platform for building, backtesting, and sharing quantitative trading strategies. Designed for product-led growth with a visual strategy editor, narrative backtest results, and a template marketplace.

**Built in 1 month** as a resume project targeting quantitative strategy / product management roles.

## Product Vision

Build & backtest quantitative strategies without writing code. Drag, connect, and backtest. From idea to equity curve in minutes.

### Core Modules

| Module | Description | Product Rationale |
|---|---|---|
| **Strategy Editor** | Node-based visual editor where users compose strategies by connecting data → indicators → signals → actions | Node orchestration is a B2B product design high-order skill |
| **Backtest Results** | Narrative presentation of results — not just charts but "why the strategy failed in 2022" | Decision support > data dashboard |
| **Template Marketplace** | Community templates with ratings, usage counts, and categories | Demonstrates PM understanding of growth loops and UGC |

### Key Product Decisions

1. **Node-based editor over form-based config** — Forms work for simple rules but fall apart with conditional logic. Nodes handle complexity through composition.

2. **Narrative results over raw metrics** — A 30% drawdown is alarming; knowing it happened during a bear market turns it into actionable insight.

3. **Template marketplace as activation path** — Blank canvases intimidate. Proven templates lower the barrier and create a community flywheel.

4. **Dark financial-terminal aesthetic** — Signals "professional trading tool" and reduces eye strain during extended analysis.

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript | Production-grade, Vercel deployment |
| Styling | Tailwind CSS v4 | Dark theme, utility-first, rapid iteration |
| Strategy Editor | @xyflow/react (ReactFlow v12) | Industry standard for node-based UIs |
| Financial Charts | lightweight-charts (TradingView) | Professional candlestick/equity curves |
| Analytics Charts | Recharts | Yearly returns, heatmaps, metrics |
| State | Zustand | Lightweight, editor-friendly |
| Backend | Python FastAPI | Python ecosystem for quant libraries |
| Backtest Engine | vectorbt | Fast, modern, good for prototyping |
| Data | yfinance | Free, covers all major markets |

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+

### Frontend
```bash
npm install
cp .env.local.example .env.local  # Edit API URL if needed
npm run dev                         # http://localhost:3000
```

### Backend
```bash
cd backend
pip install -r requirements.txt
cd .. && uvicorn backend.main:app --reload --port 8000
```

## Project Structure

```
quant-strategy-platform/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing (value prop + featured templates)
│   │   ├── editor/page.tsx       # Strategy editor (ReactFlow canvas)
│   │   ├── backtest/[id]/page.tsx # Narrative backtest results
│   │   ├── templates/page.tsx    # Template marketplace
│   │   └── docs/page.tsx         # PRD summary + design decisions
│   ├── components/
│   │   ├── layout/Sidebar.tsx
│   │   ├── editor/
│   │   │   ├── NodePanel.tsx     # Draggable node palette
│   │   │   ├── NodeConfigPanel.tsx # Parameter editing
│   │   │   └── nodes/BaseNode.tsx  # Custom ReactFlow node
│   │   └── backtest/
│   │       ├── EquityCurveChart.tsx  # TradingView chart wrapper
│   │       ├── RiskMetricsCard.tsx   # Metric cards grid
│   │       └── YearlyReturns.tsx     # Recharts + heatmap
│   └── lib/
│       ├── types.ts              # Full TypeScript type system
│       ├── store.ts              # Zustand editor state
│       ├── api.ts                # Backend API client
│       └── constants.ts          # Node palette + sample templates
├── backend/
│   ├── main.py                   # FastAPI app
│   ├── models.py                 # Pydantic models (strategy protocol)
│   └── routers/backtest.py       # Graph compiler + vectorbt engine
└── README.md
```

## Architecture

```
┌─────────────────┐     JSON      ┌──────────────────┐
│  Next.js Editor  │ ──────────→  │  FastAPI Backend  │
│  (ReactFlow)     │ ←──────────  │  (vectorbt)       │
└─────────────────┘   BacktestResult └──────────────────┘
```

1. User builds strategy visually → JSON config
2. POST /api/backtest → Python compiles graph into signals → vectorbt runs backtest
3. Response includes equity curve, drawdown, trades, metrics, and pre-computed narrative insights
4. Frontend renders TradingView charts + Recharts + insight cards

## Deployment

- **Frontend**: [Vercel](https://vercel.com) — connect GitHub repo, auto-deploy
- **Backend**: [Railway](https://railway.app) — point to `backend/`, set start command to `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

## License

MIT
