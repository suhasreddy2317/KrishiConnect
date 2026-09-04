import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ROLE_CONFIGS, UserRole } from '@/config/navigation';
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';

export interface SidebarProps {
  currentRole: UserRole;
  activeSubTab?: string;
  onSelectSubTab?: (path: string) => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeSubTab,
  onSelectSubTab,
  className,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const roleConfig = ROLE_CONFIGS[currentRole];

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col shrink-0 border-r border-[#2C2B73] bg-[#14152E] transition-all duration-200 sticky top-0 h-screen z-30',
        isCollapsed ? 'w-18' : 'w-64',
        className
      )}
    >
      {/* Brand & Collapse Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[#2C2B73]">
        <Link to="/" className="flex items-center space-x-2.5 overflow-hidden group">
          <div className="w-8 h-8 rounded-md bg-[#2C2B73] border border-[#5B5E8C]/40 flex items-center justify-center text-[#C4FF4D] font-mono font-bold text-sm shrink-0 group-hover:border-[#C4FF4D]/60 transition-colors">
            KC
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <span className="font-semibold text-sm text-[#EEF0FA] block leading-tight tracking-tight">
                KrishiConnect
              </span>
              <span className="text-[10px] font-mono text-[#A7ABC9] block leading-none">
                Trust Ledger
              </span>
            </div>
          )}
        </Link>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1 rounded text-[#A7ABC9] hover:text-[#EEF0FA] hover:bg-[#1D1F3D] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C4FF4D]"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Current Role Identity Card */}
      {!isCollapsed && (
        <div className="p-4 mx-3 my-3 rounded-lg bg-[#1D1F3D] border border-[#5B5E8C]/30 space-y-1">
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] font-mono uppercase tracking-wider font-bold"
              style={{ color: roleConfig.accentColor }}
            >
              {roleConfig.shortName} Mode
            </span>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: roleConfig.accentColor }} />
          </div>
          <div className="text-xs font-medium text-[#EEF0FA] truncate">
            {roleConfig.title}
          </div>
          <div className="text-[11px] text-[#A7ABC9] truncate">
            {roleConfig.tagline}
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {/* Overview link back to Hub */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            cn(
              'flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-colors select-none',
              isActive
                ? 'bg-[#2C2B73] text-[#C4FF4D] border border-[#5B5E8C]/40'
                : 'text-[#A7ABC9] hover:bg-[#1D1F3D] hover:text-[#EEF0FA]'
            )
          }
          title={isCollapsed ? 'Platform Hub' : undefined}
        >
          <Layers className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Overview Hub</span>}
        </NavLink>

        <div className="pt-2 pb-1">
          {!isCollapsed && (
            <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-[#5B5E8C] font-semibold">
              Role Workspaces
            </div>
          )}
        </div>

        {roleConfig.navItems.map((item) => {
          const Icon = item.icon;
          const isSelected = activeSubTab === item.path || (!activeSubTab && item.path === roleConfig.basePath);

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => onSelectSubTab?.(item.path)}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-colors select-none text-left',
                isSelected
                  ? 'bg-[#2C2B73] text-[#C4FF4D] border border-[#5B5E8C]/40 font-semibold'
                  : 'text-[#A7ABC9] hover:bg-[#1D1F3D] hover:text-[#EEF0FA]'
              )}
            >
              <div className="flex items-center space-x-3 truncate">
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0',
                    isSelected ? 'text-[#C4FF4D]' : 'text-[#A7ABC9]'
                  )}
                />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </div>

              {!isCollapsed && item.badge && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1D1F3D] text-[#A7ABC9]">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Role Switcher / Mini Card */}
      <div className="p-3 border-t border-[#2C2B73]">
        <div
          className={cn(
            'flex items-center space-x-2.5',
            isCollapsed && 'justify-center'
          )}
        >
          <div className="w-7 h-7 rounded-full bg-[#1D1F3D] border border-[#5B5E8C]/40 flex items-center justify-center font-mono text-xs font-bold text-[#C4FF4D]">
            {roleConfig.shortName[0]}
          </div>
          {!isCollapsed && (
            <div className="truncate text-xs">
              <span className="text-[#EEF0FA] block font-medium truncate">
                Demo {roleConfig.shortName}
              </span>
              <span className="text-[10px] font-mono text-[#2FBF8F] block">
                Session Active
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
