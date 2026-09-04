import React from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  count?: number | string;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
}) => {
  return (
    <div
      role="tablist"
      className={cn(
        'flex items-center space-x-1 border-b border-[#2C2B73] overflow-x-auto no-scrollbar',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center space-x-2 px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4FF4D]',
              isActive
                ? 'border-[#C4FF4D] text-[#C4FF4D] bg-[#14152E]/50'
                : 'border-transparent text-[#A7ABC9] hover:text-[#EEF0FA] hover:bg-[#14152E]/30'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'font-mono text-[11px] px-1.5 py-0.2 rounded-full border',
                  isActive
                    ? 'bg-[#C4FF4D]/15 border-[#C4FF4D]/40 text-[#C4FF4D]'
                    : 'bg-[#1D1F3D] border-[#5B5E8C]/30 text-[#A7ABC9]'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
