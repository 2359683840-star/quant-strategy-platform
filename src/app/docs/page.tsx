export default function DocsPage() {
  return (
    <div className="min-h-full">
      <div className="max-w-3xl mx-auto px-8 py-10">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">Product Documentation</h1>
        <p className="text-sm text-[var(--muted)] mb-10">
          Design rationale, user personas, and key decisions behind QuantForge.
        </p>

        <Section title="User Personas">
          <Persona
            name="Retail Trader (Primary)"
            goal="Validate trading ideas quickly without learning Python or hiring a developer."
            pain="Has strategy ideas but can't code. Existing tools require programming or are too rigid."
            scenario="Drag node → configure parameters → run backtest → iterate. From idea to result in under 10 minutes."
          />
          <Persona
            name="Quant Researcher (Secondary)"
            goal="Rapidly prototype strategies before implementing in production."
            pain="Jupyter notebooks are flexible but lack visual structure for communicating ideas to team."
            scenario="Use visual editor to sketch strategy logic, get quick feedback, then export to Python for production refinement."
          />
        </Section>

        <Section title="Competitive Landscape">
          <ComparisonTable />
        </Section>

        <Section title="Design Decisions">
          <Decision
            title="Node-based editor over form-based configuration"
            why="A form works for simple buy/sell rules, but falls apart when strategies have conditional logic, multi-timeframe analysis, or portfolio-level rules. Nodes handle complexity through composition — each node does one thing well."
          />
          <Decision
            title="Narrative backtest results over raw metrics"
            why="Traders don't just need numbers — they need to understand why a strategy succeeds or fails. A 30% drawdown is alarming; knowing it happened during a specific market regime turns it into actionable insight."
          />
          <Decision
            title="Template marketplace as primary onboarding path"
            why="Blank-canvas editors intimidate new users. Proven templates lower the activation barrier and create a community flywheel — users learn from others, then contribute their own."
          />
          <Decision
            title="Dark financial-terminal aesthetic"
            why="The visual language signals 'professional trading tool' rather than 'generic SaaS'. Dark UI reduces eye strain during extended analysis sessions and makes data visualizations pop."
          />
        </Section>

        <Section title="Architecture Overview">
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--muted)] leading-relaxed">
              <span className="text-[var(--foreground)] font-semibold">Frontend:</span> Next.js 16 + ReactFlow (strategy editor) + TradingView lightweight-charts (financial charts) + Recharts (analytics). Deployed on Vercel.
            </div>
            <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--muted)] leading-relaxed">
              <span className="text-[var(--foreground)] font-semibold">Backend:</span> Python FastAPI + vectorbt (backtest engine) + yfinance (data). Strategy configs serialized as JSON, sent to backend for execution.
            </div>
            <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--muted)] leading-relaxed">
              <span className="text-[var(--foreground)] font-semibold">Data Flow:</span> Editor → JSON strategy config → POST /api/backtest → vectorbt execution → BacktestResult JSON → Narrative rendering on frontend.
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-base font-semibold text-[var(--foreground)] mb-4 pb-2 border-b border-[var(--border)]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Persona({ name, goal, pain, scenario }: { name: string; goal: string; pain: string; scenario: string }) {
  return (
    <div className="mb-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]/30">
      <h3 className="text-sm font-semibold text-[var(--accent)] mb-2">{name}</h3>
      <div className="space-y-2 text-xs">
        <div><span className="text-[var(--muted)]">Goal:</span> <span className="text-[var(--foreground)]">{goal}</span></div>
        <div><span className="text-[var(--muted)]">Pain:</span> <span className="text-[var(--foreground)]">{pain}</span></div>
        <div><span className="text-[var(--muted)]">Scenario:</span> <span className="text-[var(--foreground)]">{scenario}</span></div>
      </div>
    </div>
  );
}

function Decision({ title, why }: { title: string; why: string }) {
  return (
    <div className="mb-3 p-3 rounded-lg bg-[var(--surface)]/50">
      <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">{title}</h3>
      <p className="text-xs text-[var(--muted)] leading-relaxed">{why}</p>
    </div>
  );
}

function ComparisonTable() {
  const rows = [
    { name: "QuantForge", strategy: "Visual node-based", backtest: "One-click", learning: "Low", collaboration: "Templates + Community" },
    { name: "QuantConnect", strategy: "Python/C# code", backtest: "Cloud-based", learning: "High", collaboration: "Forum + shared code" },
    { name: "TradingView", strategy: "Pine Script", backtest: "Built-in", learning: "Medium", collaboration: "Script sharing" },
    { name: "Backtrader", strategy: "Python only", backtest: "Local", learning: "High", collaboration: "None" },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th className="text-left py-2 px-3 text-[var(--muted)] font-medium">Platform</th>
            <th className="text-left py-2 px-3 text-[var(--muted)] font-medium">Strategy</th>
            <th className="text-left py-2 px-3 text-[var(--muted)] font-medium">Backtest</th>
            <th className="text-left py-2 px-3 text-[var(--muted)] font-medium">Learning Curve</th>
            <th className="text-left py-2 px-3 text-[var(--muted)] font-medium">Community</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className={`border-b border-[var(--border)] ${r.name === "QuantForge" ? "bg-[var(--accent)]/5" : ""}`}>
              <td className={`py-2.5 px-3 ${r.name === "QuantForge" ? "text-[var(--accent)] font-semibold" : "text-[var(--foreground)]"}`}>
                {r.name}
              </td>
              <td className="py-2.5 px-3 text-[var(--muted)]">{r.strategy}</td>
              <td className="py-2.5 px-3 text-[var(--muted)]">{r.backtest}</td>
              <td className="py-2.5 px-3 text-[var(--muted)]">{r.learning}</td>
              <td className="py-2.5 px-3 text-[var(--muted)]">{r.collaboration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
