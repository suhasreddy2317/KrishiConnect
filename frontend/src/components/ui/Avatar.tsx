import React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps {
  name: string;
  role?: string;
  size?: 'sm' | 'md' | 'lg';
  status?: 'online' | 'offline' | 'busy';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  role,
  size = 'md',
  status,
  className,
}) => {
  const getInitials = (n: string) => {
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const statusColors = {
    online: 'bg-status-success',
    offline: 'bg-text-muted',
    busy: 'bg-status-warning',
  };

  return (
    <div className="relative inline-flex shrink-0">
      <div
        className={cn(
          'rounded-md bg-primary border border-border flex items-center justify-center font-mono font-semibold text-white select-none',
          sizeStyles[size],
          className
        )}
        title={role ? `${name} (${role})` : name}
      >
        {getInitials(name)}
      </div>

      {status && (
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background',
            statusColors[status]
          )}
        />
      )}
    </div>
  );
};
