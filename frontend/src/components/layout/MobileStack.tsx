import React from 'react';
import { cn } from '@/lib/utils';

export interface MobileStackProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'sm' | 'md' | 'lg';
}

export const MobileStack: React.FC<MobileStackProps> = ({
  spacing = 'md',
  className,
  children,
  ...props
}) => {
  const spacingStyles = {
    sm: 'space-y-3',
    md: 'space-y-5',
    lg: 'space-y-7',
  };

  return (
    <div
      className={cn('w-full flex flex-col max-w-2xl mx-auto', spacingStyles[spacing], className)}
      {...props}
    >
      {children}
    </div>
  );
};
