import React from 'react';
import { cn } from '@/lib/utils';

export interface DataPanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
}

export const DataPanel: React.FC<DataPanelProps> = ({
  title,
  subtitle,
  badge,
  actions,
  footer,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-xl bg-surface border border-border overflow-hidden flex flex-col',
        className
      )}
      {...props}
    >
      <div className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-raised/40">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-semibold text-text-main tracking-tight">
              {title}
            </h3>
            {badge}
          </div>
          {subtitle && (
            <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
          )}
        </div>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      <div className="p-4 sm:p-5 flex-1">{children}</div>

      {footer && (
        <div className="p-3 sm:px-5 border-t border-border bg-surface-raised/30 flex items-center justify-between text-xs text-text-muted">
          {footer}
        </div>
      )}
    </div>
  );
};
