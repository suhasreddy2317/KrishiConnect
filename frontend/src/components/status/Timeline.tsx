import React from 'react';
import { cn } from '@/lib/utils';
import { Check, Clock, AlertCircle } from 'lucide-react';

export interface TimelineItem {
  id: string;
  actor: string;
  role: string;
  amount?: string;
  description: string;
  timestamp: string;
  status?: 'accepted' | 'pending' | 'countered' | 'rejected';
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ items, className }) => {
  return (
    <div className={cn('relative pl-6 space-y-6', className)}>
      <div className="absolute top-2 bottom-2 left-2.5 w-0.5 bg-border" />

      {items.map((item, index) => {
        const isLatest = index === items.length - 1;

        const statusDot = {
          accepted: 'bg-status-success border-background text-background',
          pending: 'bg-accent border-background text-background',
          countered: 'bg-status-warning border-background text-background',
          rejected: 'bg-status-error border-background text-text-main',
        }[item.status || 'pending'];

        return (
          <div key={item.id} className="relative group">
            <div
              className={cn(
                'absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] z-10 transition-transform group-hover:scale-110',
                statusDot
              )}
            >
              {item.status === 'accepted' ? (
                <Check className="w-3 h-3 stroke-[3]" />
              ) : item.status === 'rejected' ? (
                <AlertCircle className="w-3 h-3 stroke-[3]" />
              ) : (
                <Clock className="w-3 h-3 stroke-[2.5]" />
              )}
            </div>

            <div className="rounded-lg bg-surface border border-border p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-text-main">
                    {item.actor}
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.2 rounded bg-surface-raised text-text-muted border border-border">
                    {item.role}
                  </span>
                </div>

                <div className="flex items-center space-x-3 font-mono text-xs">
                  {item.amount && (
                    <span className="font-bold text-accent text-sm">
                      {item.amount}
                    </span>
                  )}
                  <span className="text-text-muted">{item.timestamp}</span>
                </div>
              </div>

              <p className="text-xs text-text-muted leading-relaxed">
                {item.description}
              </p>

              {isLatest && (
                <div className="text-[11px] font-mono text-accent pt-1">
                  • Latest Transaction Term
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
