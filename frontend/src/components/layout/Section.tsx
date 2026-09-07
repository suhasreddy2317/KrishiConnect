import React from 'react';
import { cn } from '@/lib/utils';

export interface SectionProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({
  title,
  description,
  action,
  children,
  className,
  ...props
}) => {
  const hasHeader = title || description || action;

  return (
    <section className={cn('space-y-4', className)} {...props}>
      {hasHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-text-main tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-text-muted mt-0.5">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
};
