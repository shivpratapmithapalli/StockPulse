import React from 'react';
import { Sparkles, Brain } from 'lucide-react';

interface ReasoningQuoteProps {
  reasoning: string;
  confidence: number; // 0.0 - 1.0
  type?: 'pricing' | 'reorder';
}

export const ReasoningQuote: React.FC<ReasoningQuoteProps> = ({
  reasoning,
  confidence,
  type = 'pricing',
}) => {
  const percentage = Math.round(confidence * 100);

  // Confidence category
  let confidenceColor = 'var(--teal)';
  if (percentage < 70) confidenceColor = 'var(--amber)';
  if (percentage < 50) confidenceColor = 'var(--red)';

  return (
    <div className="reasoning-quote-card">
      <div className="reasoning-header">
        <div className="reasoning-meta mono">
          <Brain size={13} className="reasoning-icon" />
          <span>{type === 'pricing' ? 'AI Pricing Hypothesis' : 'Replenishment Logic'}</span>
        </div>
        <div className="confidence-pill mono" style={{ color: confidenceColor }}>
          <Sparkles size={11} />
          <span>{percentage}% Confidence</span>
        </div>
      </div>

      <div className="confidence-bar-track">
        <div
          className="confidence-bar-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: confidenceColor,
          }}
        />
      </div>

      <blockquote className="reasoning-prose">
        &ldquo;{reasoning}&rdquo;
      </blockquote>
    </div>
  );
};
