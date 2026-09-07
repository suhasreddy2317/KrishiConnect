import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'trust' | 'warning' | 'error' | 'lime' | 'outline';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  icon,
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center font-mono uppercase tracking-wider rounded-full border select-none font-semibold';

  const variantStyles = {
    default: 'bg-surface-raised border-border text-text-muted',
    trust: 'bg-status-success/15 border-status-success/40 text-status-success',
    warning: 'bg-status-warning/15 border-status-warning/40 text-status-warning',
    error: 'bg-status-error/15 border-status-error/40 text-status-error',
    lime: 'bg-accent/15 border-accent/40 text-accent',
    outline: 'bg-transparent border-border text-text-main',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </span>
  );
};
