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
  const palette = roleConfig.palette;

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col shrink-0 border-r border-border bg-surface transition-all duration-200 sticky top-0 h-screen z-30',
        isCollapsed ? 'w-18' : 'w-64',
        className
      )}
    >
      <div className="h-16 px-4 flex items-center justify-between border-b border-border">
        <Link to="/" className="flex items-center space-x-2.5 overflow-hidden group">
          <div
            className="w-8 h-8 rounded-md border flex items-center justify-center font-mono font-bold text-sm shrink-0 transition-colors"
            style={{
              backgroundColor: palette.raised,
              borderColor: palette.border,
              color: palette.primary,
            }}
          >
            KC
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <span className="font-semibold text-sm text-text-main block leading-tight tracking-tight">
                KrishiConnect
              </span>
              <span className="text-[10px] font-mono text-text-muted block leading-none">
                Trust Ledger
              </span>
            </div>
          )}
        </Link>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1 rounded text-text-muted hover:text-text-main hover:bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus-ring"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {!isCollapsed && (
        <div
          className="p-4 mx-3 my-3 rounded-lg border space-y-1"
          style={{
            backgroundColor: palette.raised,
            borderColor: palette.border,
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] font-mono uppercase tracking-wider font-bold"
              style={{ color: palette.accent }}
            >
              {roleConfig.shortName} Mode
            </span>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: palette.accent }} />
          </div>
          <div className="text-xs font-medium text-text-main truncate">
            {roleConfig.title}
          </div>
          <div className="text-[11px] text-text-muted truncate">
            {roleConfig.tagline}
          </div>
        </div>
      )}

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <NavLink
          to="/"
          className={({ isActive }) =>
            cn(
              'flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-colors select-none',
              isActive
                ? 'border font-semibold'
                : 'text-text-muted hover:bg-surface-raised hover:text-text-main',
              isActive && 'border'
            )
          }
          style={({ isActive }: { isActive?: boolean }) => ({
            color: isActive ? '#FFFFFF' : undefined,
            backgroundColor: isActive ? palette.primary : undefined,
            borderColor: isActive ? palette.border : undefined,
          })}
          title={isCollapsed ? 'Platform Hub' : undefined}
        >
          <Layers className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Overview Hub</span>}
        </NavLink>

        <div className="pt-2 pb-1">
          {!isCollapsed && (
            <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-text-muted font-semibold">
              Role Workspaces
            </div>
          )}
        </div>

        {roleConfig.navItems.map((item) => {
          const Icon = item.icon;
          const isSelected = activeSubTab === item.path || (!activeSubTab && item.path === roleConfig.basePath);

          if (isSelected) {
            return (
              <div
                key={item.path}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-md text-xs font-medium transition-colors select-none text-left border font-semibold cursor-pointer"
                style={{ backgroundColor: palette.primary, color: '#FFFFFF', borderColor: palette.border }}
                onClick={() => onSelectSubTab?.(item.path)}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" style={{ color: '#FFFFFF' }} />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </div>
            );
          }

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => onSelectSubTab?.(item.path)}
              title={isCollapsed ? item.name : undefined}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-colors select-none text-left text-text-muted hover:bg-surface-raised hover:text-text-main"
            >
              <div className="flex items-center space-x-3 truncate">
                <Icon className="w-4 h-4 shrink-0 text-text-muted" />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </div>

              {!isCollapsed && item.badge && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-raised text-text-muted">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <div
          className={cn(
            'flex items-center space-x-2.5',
            isCollapsed && 'justify-center'
          )}
        >
          <div
            className="w-7 h-7 rounded-full border flex items-center justify-center font-mono text-xs font-bold"
            style={{
              backgroundColor: palette.raised,
              borderColor: palette.border,
              color: palette.primary,
            }}
          >
            {roleConfig.shortName[0]}
          </div>
          {!isCollapsed && (
            <div className="truncate text-xs">
              <span className="text-text-main block font-medium truncate">
                Demo {roleConfig.shortName}
              </span>
              <span className="text-[10px] font-mono text-status-success block">
                Session Active
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
