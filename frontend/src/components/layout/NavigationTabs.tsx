import React from 'react';
import { Eye, Layers } from 'lucide-react';

export type ActiveTab = 'FLOOR' | 'CEILING';

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
        {/* Tab 1: Review Pane */}
        <button
          type="button"
          onClick={() => onChangeTab('FLOOR')}
          className={`nav-tab-item mono ${activeTab === 'FLOOR' ? 'active' : ''}`}
          aria-selected={activeTab === 'FLOOR'}
          role="tab"
        >
          <Eye size={15} />
          <span>Review Pane</span>
          {pendingCount > 0 ? (
            <span className="nav-tab-count badge-accent mono">{pendingCount}</span>
          ) : (
            <span className="nav-tab-count badge-gray mono">0</span>
          )}
        </button>

        {/* Tab 2: Product Catalog */}
        <button
          type="button"
          onClick={() => onChangeTab('CEILING')}
          className={`nav-tab-item mono ${activeTab === 'CEILING' ? 'active' : ''}`}
          aria-selected={activeTab === 'CEILING'}
          role="tab"
        >
          <Layers size={15} />
          <span>Product Catalog</span>
          <span className="nav-tab-count badge-gray mono">{catalogCount}</span>
        </button>
      </div>
    </nav>
  );
};
