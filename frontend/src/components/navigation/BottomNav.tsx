import React from 'react';
import { cn } from '@/lib/utils';
import { NavItemConfig } from '@/config/navigation';

export interface BottomNavProps {
  items: NavItemConfig[];
  activePath: string;
  onSelect: (path: string) => void;
  className?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  items,
  activePath,
  onSelect,
  className,
}) => {
  return (
    <nav
      aria-label="Mobile Navigation"
      className={cn(
        'md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#14152E]/95 backdrop-blur border-t border-[#2C2B73] px-2 py-1.5 flex items-center justify-around select-none safe-bottom',
        className
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activePath === item.path;

        return (
          <button
            key={item.path}
            type="button"
            onClick={() => onSelect(item.path)}
            className={cn(
              'flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4FF4D]',
              isActive ? 'text-[#C4FF4D]' : 'text-[#A7ABC9] hover:text-[#EEF0FA]'
            )}
          >
            <Icon
              className={cn(
                'w-5 h-5 transition-transform',
                isActive && 'scale-110 stroke-[2.5]'
              )}
            />
            <span
              className={cn(
                'text-[10px] font-medium tracking-tight mt-1 leading-none',
                isActive && 'font-bold'
              )}
            >
              {item.name}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
