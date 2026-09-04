import React from 'react';
import { cn } from '@/lib/utils';

export interface TwoColumnLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
  ratio?: '50-50' | '60-40' | '70-30';
  className?: string;
}

export const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({
  left,
  right,
  ratio = '60-40',
  className,
}) => {
  const ratioStyles = {
    '50-50': 'lg:grid-cols-2',
    '60-40': 'lg:grid-cols-12 [&>*:first-child]:lg:col-span-7 [&>*:last-child]:lg:col-span-5',
    '70-30': 'lg:grid-cols-12 [&>*:first-child]:lg:col-span-8 [&>*:last-child]:lg:col-span-4',
  };

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-6 items-start',
        ratioStyles[ratio],
        className
      )}
    >
      <div className="space-y-6">{left}</div>
      <div className="space-y-6">{right}</div>
    </div>
  );
};
