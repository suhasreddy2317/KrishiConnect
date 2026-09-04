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
    default: 'bg-[#1D1F3D] border-[#5B5E8C]/40 text-[#A7ABC9]',
    trust: 'bg-[#2FBF8F]/15 border-[#2FBF8F]/40 text-[#2FBF8F]',
    warning: 'bg-[#F5A623]/15 border-[#F5A623]/40 text-[#F5A623]',
    error: 'bg-[#E5484D]/15 border-[#E5484D]/40 text-[#E5484D]',
    lime: 'bg-[#C4FF4D]/15 border-[#C4FF4D]/50 text-[#C4FF4D]',
    outline: 'bg-transparent border-[#5B5E8C]/60 text-[#EEF0FA]',
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
