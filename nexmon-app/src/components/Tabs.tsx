import React from 'react';

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex border-b border-nx-surface/50 bg-nx-surface/30">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200
            border-b-2 relative
            ${activeTab === tab.id ? 'text-nx-primary border-nx-primary bg-nx-primary/5' : 'text-nx-text-secondary border-transparent hover:text-nx-text-main hover:bg-nx-bg-main/50'}
          `}
        >
          <span className="w-4 h-4">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export const TabContent: React.FC<{
  activeTab: string;
  children: React.ReactNode;
  className?: string;
}> = ({ activeTab, children, className = '' }) => {
  return (
    <div className={`flex-1 overflow-hidden ${className}`} style={{ display: activeTab ? 'block' : 'none' }}>
      {children}
    </div>
  );
};
