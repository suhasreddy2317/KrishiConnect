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

  // Detect current role from URL pathname
  const detectRole = (): UserRole => {
    if (forcedRole) return forcedRole;
    const path = location.pathname;
    if (path.startsWith('/farmer')) return 'farmer';
    if (path.startsWith('/fpo')) return 'fpo';
    if (path.startsWith('/buyer')) return 'buyer';
    if (path.startsWith('/field-agent')) return 'field-agent';
    if (path.startsWith('/admin')) return 'admin';
    return 'farmer'; // default
  };

  const currentRole = detectRole();
  const roleConfig = ROLE_CONFIGS[currentRole];
  const isFarmer = currentRole === 'farmer';

  return (
    <div className="min-h-screen flex bg-[#0A0B1C] text-[#EEF0FA]">
      {/* Desktop & Tablet Sidebar */}
      <Sidebar
        currentRole={currentRole}
        activeSubTab={activeSubTab}
        onSelectSubTab={(path) => {
          onSelectSubTab?.(path);
          setMobileMenuOpen(false);
        }}
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <TopHeader
          currentRole={currentRole}
          title={roleConfig.title}
          isMobileMenuOpen={mobileMenuOpen}
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        {/* Page Content Body (adds bottom padding on mobile if Farmer bottom nav is shown) */}
        <main
          className={cn(
            'flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6',
            isFarmer && 'pb-24 md:pb-8'
          )}
        >
          {children || <Outlet />}
        </main>

        {/* Global Compact Footer */}
        <footer className="border-t border-[#2C2B73]/60 bg-[#0A0B1C] py-4 text-xs text-[#A7ABC9] px-4 sm:px-6 lg:px-8 hidden md:block">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-3.5 h-3.5 text-[#2FBF8F]" />
              <span>KrishiConnect • Trust Ledger Operating System</span>
            </div>
            <div className="font-mono text-[11px] flex items-center space-x-4">
              <span>Theme: Trust Ledger</span>
              <span>•</span>
              <span className="text-[#C4FF4D]">Phase 1 Foundation</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Drawer Navigation for non-farmer roles or all roles */}
      <Drawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        title={`${roleConfig.shortName} Navigation`}
        description={roleConfig.tagline}
        position="right"
      >
        <div className="space-y-4">
          <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#A7ABC9] border-b border-[#2C2B73]">
            Destinations
          </div>

          <div className="space-y-1">
            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  'w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-[#2C2B73] text-[#C4FF4D] font-semibold'
                    : 'text-[#EEF0FA] hover:bg-[#14152E]'
                )
              }
            >
              <span>Platform Hub</span>
            </NavLink>

            {roleConfig.navItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeSubTab === item.path;

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
                      ? 'bg-[#2C2B73] text-[#C4FF4D] font-semibold'
                      : 'text-[#EEF0FA] hover:bg-[#14152E]'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 text-[#C4FF4D]" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#14152E] text-[#A7ABC9]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </Drawer>

      {/* Mobile Sticky Bottom Nav for Farmer (4–5 destinations max) */}
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
