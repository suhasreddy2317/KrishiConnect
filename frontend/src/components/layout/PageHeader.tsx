import React from 'react';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  roleBadge?: React.ReactNode;
  statusBadge?: React.ReactNode;
  primaryAction?: React.ReactNode;
  secondaryActions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  roleBadge,
  statusBadge,
  primaryAction,
  secondaryActions,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border',
        className
      )}
    >
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text-main">
            {title}
          </h1>
          {roleBadge}
          {statusBadge}
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-text-muted max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {(primaryAction || secondaryActions) && (
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          {secondaryActions}
          {primaryAction}
        </div>
      )}
    </div>
  );
};
