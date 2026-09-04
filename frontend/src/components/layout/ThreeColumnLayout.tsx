import React from 'react';
import { cn } from '@/lib/utils';

export interface ThreeColumnLayoutProps {
  left: React.ReactNode;
  middle: React.ReactNode;
  right: React.ReactNode;
  className?: string;
}

export const ThreeColumnLayout: React.FC<ThreeColumnLayoutProps> = ({
  left,
  middle,
  right,
  className,
}) => {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-12 gap-6 items-start',
        className
      )}
    >
      <div className="md:col-span-3 space-y-6">{left}</div>
      <div className="md:col-span-5 lg:col-span-6 space-y-6">{middle}</div>
      <div className="md:col-span-4 lg:col-span-3 space-y-6">{right}</div>
    </div>
  );
};
