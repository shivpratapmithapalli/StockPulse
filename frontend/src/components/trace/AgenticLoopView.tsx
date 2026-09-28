import React from 'react';
import { Eye, Brain, Zap, ShieldCheck, Cpu } from 'lucide-react';
import type { StrategyType } from '../../types/strategy';

interface AgenticLoopViewProps {
  activeStrategy: StrategyType;
  pendingCount: number;
  totalProducts: number;
}

export const AgenticLoopView: React.FC<AgenticLoopViewProps> = ({
  activeStrategy,
  pendingCount,
  totalProducts,
}) => {
  return (
    <section className="agentic-trace-view animate-fade-in" aria-label="Agentic Loop Trace">
      <div className="section-rule">
        <span className="section-rule-label mono">
          Architecture Visualization · 4-Phase Reactive Commerce Loop
        </span>
        <div className="section-rule-line" />
      </div>

      <div className="trace-intro-card">
        <h3 className="trace-intro-title">
          Autonomous Intelligence with Human Sovereignty
        </h3>
        <p className="trace-intro-prose text-ink2">
          StockPulse combines asynchronous event-driven reactivity with strict human-in-the-loop validation.
          Every stock decrement or demand surge ripples through the 4-phase loop:
        </p>
      </div>

      {/* 4-Phase Grid */}
      <div className="phases-grid">
        {/* Phase 1: OBSERVE */}
        <div className="phase-card">
          <div className="phase-card-top mono">
            <span className="phase-step-tag">Phase 01</span>
            <span className="phase-step-name text-accent">OBSERVE</span>
          </div>
          <div className="phase-card-icon text-accent">
            <Eye size={28} />
          </div>
          <h4 className="phase-heading">Reactive Signal Ingestion</h4>
          <p className="phase-detail">
            Every customer checkout (<code className="mono">POST /orders</code>) decrements inventory in &lt;15ms. The Spring event publisher emits an <code className="mono">InventorySignalEvent</code>.
          </p>
          <div className="phase-metrics mono text-xs">
            <span>Monitoring: {totalProducts} SKUs</span>
          </div>
        </div>

        {/* Phase 2: REASON */}
        <div className="phase-card">
          <div className="phase-card-top mono">
            <span className="phase-step-tag">Phase 02</span>
            <span className="phase-step-name text-teal">REASON</span>
          </div>
          <div className="phase-card-icon text-teal">
            <Brain size={28} />
          </div>
          <h4 className="phase-heading">Pluggable Commerce Engine</h4>
          <p className="phase-detail">
            Background worker processes triggers (<code className="mono">INVENTORY_LOW</code> or <code className="mono">DEMAND_SPIKE</code>). Active advisor:{' '}
            <strong>{activeStrategy === 'AI' ? 'AI LLM Advisor' : 'Rule-Based Deterministic'}</strong> analyzes velocity and scarcity.
          </p>
          <div className="phase-metrics mono text-xs">
            <Cpu size={12} className="inline mr-1 text-teal" />
            <span>Active: {activeStrategy}</span>
          </div>
        </div>

        {/* Phase 3: ACT */}
        <div className="phase-card">
          <div className="phase-card-top mono">
            <span className="phase-step-tag">Phase 03</span>
            <span className="phase-step-name text-amber">ACT</span>
          </div>
          <div className="phase-card-icon text-amber">
            <Zap size={28} />
          </div>
          <h4 className="phase-heading">Structured Proposal Generation</h4>
          <p className="phase-detail">
            Advisor computes suggested price delta and recommended reorder quantity along with confidence scores (0–100%) and natural language rationale.
          </p>
          <div className="phase-metrics mono text-xs">
            <span>Persisted as PENDING</span>
          </div>
        </div>

        {/* Phase 4: CHECKPOINT */}
        <div className="phase-card phase-card-highlight">
          <div className="phase-card-top mono">
            <span className="phase-step-tag">Phase 04</span>
            <span className="phase-step-name text-green">CHECKPOINT</span>
          </div>
          <div className="phase-card-icon text-green">
            <ShieldCheck size={28} />
          </div>
          <h4 className="phase-heading">Human Merchandiser Review</h4>
          <p className="phase-detail">
            Suggestions land on <strong>The Floor</strong>. Merchandising managers retain final authority to Accept or Dismiss with one click.
          </p>
          <div className="phase-metrics mono text-xs">
            <span className="font-semibold text-accent">{pendingCount} Awaiting Review</span>
          </div>
        </div>
      </div>

      {/* Safety Invariants Callout */}
      <div className="invariants-callout">
        <div className="invariants-header mono">
          <ShieldCheck size={16} className="text-teal" />
          <span>Built-In Safety Invariants &amp; Guardrails</span>
        </div>
        <ul className="invariants-list text-sm">
          <li>
            <strong>Deterministic Fallback:</strong> If the AI service experiences latency or error, the engine seamlessly defaults to rule-based algorithms.
          </li>
          <li>
            <strong>Sanity Caps:</strong> AI price increases are capped at 3x current price, and margins are preserved above margin floor.
          </li>
          <li>
            <strong>Optimistic Reconcile:</strong> Merchandiser actions apply locally in &lt;50ms and reconcile with backend via live sync.
          </li>
        </ul>
      </div>
    </section>
  );
};
