import React from 'react';
import { Eye, Layers, GitCommit } from 'lucide-react';

export type ActiveTab = 'FLOOR' | 'CEILING' | 'TRACE';

interface NavigationTabsProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  pendingCount: number;
  catalogCount: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onChangeTab,
  pendingCount,
  catalogCount,
}) => {
  return (
    <nav className="nav-tabs-wrapper" aria-label="Console Navigation">
      <div className="nav-tabs-bar">
        {/* Tab 1: The Floor */}
        <button
          type="button"
          onClick={() => onChangeTab('FLOOR')}
          className={`nav-tab-item mono ${activeTab === 'FLOOR' ? 'active' : ''}`}
          aria-selected={activeTab === 'FLOOR'}
          role="tab"
        >
          <Eye size={15} />
          <span>The Floor · Merchandising Review</span>
          {pendingCount > 0 ? (
            <span className="nav-tab-count badge-accent mono">{pendingCount}</span>
          ) : (
            <span className="nav-tab-count badge-gray mono">0</span>
          )}
        </button>

        {/* Tab 2: The Ceiling */}
        <button
          type="button"
          onClick={() => onChangeTab('CEILING')}
          className={`nav-tab-item mono ${activeTab === 'CEILING' ? 'active' : ''}`}
          aria-selected={activeTab === 'CEILING'}
          role="tab"
        >
          <Layers size={15} />
          <span>The Ceiling · Product Catalog</span>
          <span className="nav-tab-count badge-gray mono">{catalogCount}</span>
        </button>

        {/* Tab 3: Agentic Loop Trace */}
        <button
          type="button"
          onClick={() => onChangeTab('TRACE')}
          className={`nav-tab-item mono ${activeTab === 'TRACE' ? 'active' : ''}`}
          aria-selected={activeTab === 'TRACE'}
          role="tab"
        >
          <GitCommit size={15} />
          <span>Agentic Loop Architecture</span>
        </button>
      </div>
    </nav>
  );
};
