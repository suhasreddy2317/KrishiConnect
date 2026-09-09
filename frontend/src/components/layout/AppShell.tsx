import React, { useState } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { UserRole, ROLE_CONFIGS } from '@/config/navigation';
import { Sidebar } from '@/components/navigation/Sidebar';
import { TopHeader } from '@/components/navigation/TopHeader';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Drawer } from '@/components/ui/Drawer';
import { Activity } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n/LanguageContext';

export interface AppShellProps {
  forcedRole?: UserRole;
  activeSubTab?: string;
  onSelectSubTab?: (path: string) => void;
  children?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  forcedRole,
  activeSubTab,
  onSelectSubTab,
  children,
}) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  const detectRole = (): UserRole => {
    if (forcedRole) return forcedRole;
    const path = location.pathname;
    if (path.startsWith('/farmer')) return 'farmer';
    if (path.startsWith('/fpo')) return 'fpo';
    if (path.startsWith('/buyer')) return 'buyer';
    if (path.startsWith('/field-agent')) return 'field-agent';
    if (path.startsWith('/admin')) return 'admin';
    return 'farmer';
  };

  const currentRole = detectRole();
  const roleConfig = ROLE_CONFIGS[currentRole];
  const isFarmer = currentRole === 'farmer';
  const palette = roleConfig.palette;

  const translatedTitle = isFarmer && roleConfig.title === 'Farmer Workspace'
    ? t('nav.farmerWorkspace')
    : roleConfig.title;
  const translatedTagline = isFarmer && roleConfig.tagline === 'Decision-first crop selling & trust verification'
    ? t('nav.farmerTerminal')
    : roleConfig.tagline;

  return (
    <div
      data-role={currentRole}
      className={cn(
        'min-h-screen flex bg-background text-text-main',
      )}
    >
      <Sidebar
        currentRole={currentRole}
        activeSubTab={activeSubTab}
        onSelectSubTab={(path) => {
          onSelectSubTab?.(path);
          setMobileMenuOpen(false);
        }}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader
          currentRole={currentRole}
          title={translatedTitle}
          isMobileMenuOpen={mobileMenuOpen}
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        <main
          className={cn(
            'flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6',
            isFarmer && 'pb-24 md:pb-8'
          )}
        >
          {children || <Outlet />}
        </main>

        <footer className="border-t border-border bg-background py-4 text-xs text-text-muted px-4 sm:px-6 lg:px-8 hidden md:block">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-3.5 h-3.5 text-status-success" />
              <span>KrishiConnect • Trust Ledger Operating System</span>
            </div>
          </div>
        </footer>
      </div>

      <Drawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        title={isFarmer ? t('nav.farmerMode') : `${roleConfig.shortName} Navigation`}
        description={translatedTagline}
        position="right"
      >
        <div className="space-y-4">
          <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-text-muted border-b border-border">
            {t('nav.destinations')}
          </div>

          <div className="space-y-1">
            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  'w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-accent font-semibold'
                    : 'text-text-main hover:bg-surface-raised'
                )
              }
            >
              <span>{t('nav.platformHub')}</span>
            </NavLink>

            {roleConfig.navItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeSubTab === item.path;
              const label = item.nameKey ? t(item.nameKey) : item.name;

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => {
                    onSelectSubTab?.(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors text-left',
                    isSelected
                      ? 'bg-primary text-accent font-semibold'
                      : 'text-text-main hover:bg-surface-raised'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" style={{ color: isSelected ? palette.accent : undefined }} />
                    <span>{label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-raised text-text-muted">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </Drawer>

      {isFarmer && roleConfig.bottomNavItems && (
        <BottomNav
          items={roleConfig.bottomNavItems}
          activePath={activeSubTab || roleConfig.basePath}
          onSelect={(path) => onSelectSubTab?.(path)}
        />
      )}
    </div>
  );
};
