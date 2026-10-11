import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { OverviewPage } from '../overview/OverviewPage';
import { SectionPlaceholder } from '../placeholders/SectionPlaceholder';
import { NAV_ITEMS } from '../../constants/navigation';
import type { NavItemId } from '../../types';
import { MeterIntelligencePage } from '../meters/MeterIntelligencePage';

interface AppShellProps {
  activeItem: NavItemId;
  onSelectItem: (id: NavItemId) => void;
  onReturnToLanding: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeItem,
  onSelectItem,
  onReturnToLanding,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const currentNav = NAV_ITEMS.find((item) => item.id === activeItem) || NAV_ITEMS[0];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050B14] text-slate-100 font-sans antialiased">
      {/* Enterprise Collapsible Left Sidebar */}
      <Sidebar
        activeItem={activeItem}
        onSelectItem={onSelectItem}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onReturnToLanding={onReturnToLanding}
      />

      {/* Main App Container */}
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Dynamic Main Content Region */}
        <main className="flex-1 overflow-hidden relative flex flex-col">
          {activeItem === 'overview' ? (
  <OverviewPage />
) : activeItem === 'meter-intelligence' ? (
  <MeterIntelligencePage />
) : (
  <SectionPlaceholder
    item={currentNav}
    onBackToOverview={() => onSelectItem('overview')}
  />

          )}
        </main>
      </div>
    </div>
  );
};
