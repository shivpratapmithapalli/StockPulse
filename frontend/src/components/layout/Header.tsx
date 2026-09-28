import React from 'react';
import { RefreshCw, Cpu, BookOpen, Sparkles } from 'lucide-react';
import type { StrategyType } from '../../types/strategy';
import { useToast } from '../../hooks/useToast';

interface HeaderProps {
  activeStrategy: StrategyType;
  onStrategyChange: (strategy: StrategyType) => Promise<unknown>;
  isStrategySwitching: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  onManualRefresh: () => void;
  onOpenSimModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeStrategy,
  onStrategyChange,
  isStrategySwitching,
  isSyncing,
  lastSyncedAt,
  onManualRefresh,
  onOpenSimModal,
}) => {
  const { success, error } = useToast();

  const handleToggleStrategy = async (strategy: StrategyType) => {
    if (strategy === activeStrategy || isStrategySwitching) return;
    try {
      await onStrategyChange(strategy);
      success(
        `Active pricing engine switched to ${strategy === 'AI' ? 'AI Advisor (Gemini/Groq)' : 'Rule-Based Deterministic Engine'}`,
        'Strategy Switched'
      );
    } catch {
      error('Failed to change strategy configuration', 'Config Error');
    }
  };

  return (
    <header className="masthead-wrapper">
      <div className="masthead">
        {/* Left: Branding & Editorial Headings */}
        <div className="masthead-brand">
          <div className="masthead-kicker mono">
            <span className="kicker-tag">StockPulse</span>
            <span className="kicker-sep">/</span>
            <span>Enterprise Merchandising Console</span>
          </div>
          <h1 className="masthead-title">
            <em>AI</em> Inventory &amp; Dynamic Pricing
          </h1>
          <p className="masthead-tagline sans">
            Autonomous commerce signals paired with human-in-the-loop oversight.
          </p>
        </div>

        {/* Right: Controls & Live Sync */}
        <div className="masthead-controls">
          {/* Simulation Quick Launcher */}
          <button
            type="button"
            onClick={onOpenSimModal}
            className="btn-demo-sim mono"
            title="Simulate sales or inventory depletion to test the agentic loop"
          >
            <Sparkles size={14} className="sim-sparkle-icon" />
            <span>Simulate Sale Demo</span>
          </button>

          {/* Strategy Switcher Toggle */}
          <div className="strategy-toggle-box" role="radiogroup" aria-label="Engine Strategy Switcher">
            <div className="strategy-toggle-header">
              <span className="strategy-toggle-label mono">Engine Strategy</span>
              {isStrategySwitching && <span className="mono text-xs opacity-75">Updating...</span>}
            </div>
            <div className="strategy-segmented-control">
              <button
                type="button"
                role="radio"
                aria-checked={activeStrategy === 'RULE_BASED'}
                disabled={isStrategySwitching}
                onClick={() => handleToggleStrategy('RULE_BASED')}
                className={`segmented-item mono ${activeStrategy === 'RULE_BASED' ? 'active' : ''}`}
              >
                <BookOpen size={13} />
                <span>Rule-Based</span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={activeStrategy === 'AI'}
                disabled={isStrategySwitching}
                onClick={() => handleToggleStrategy('AI')}
                className={`segmented-item mono ${activeStrategy === 'AI' ? 'active ai-active' : ''}`}
              >
                <Cpu size={13} />
                <span>AI [LLM]</span>
              </button>
            </div>
          </div>

          {/* Live Sync Badge & Refresh */}
          <div className="sync-box">
            <div className="sync-status">
              <span className="sync-dot pulse-dot" />
              <span className="sync-text mono">
                Live Sync 3s
              </span>
            </div>
            <button
              type="button"
              onClick={onManualRefresh}
              className="sync-refresh-btn"
              title={
                lastSyncedAt
                  ? `Last checked at ${lastSyncedAt.toLocaleTimeString()}. Click to refresh now.`
                  : 'Click to refresh'
              }
              aria-label="Refresh data"
            >
              <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
