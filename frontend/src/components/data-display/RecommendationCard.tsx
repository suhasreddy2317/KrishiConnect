import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  Clock,
  Warehouse,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DataFreshness } from '@/components/status/DataFreshness';

export type RecommendationVerdict =
  | 'SELL NOW'
  | 'SELL SOON'
  | 'WAIT'
  | 'STORE'
  | 'REROUTE';

export interface ExplanationFactor {
  title: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface RecommendationCardProps {
  verdict: RecommendationVerdict;
  score: number;
  headline: string;
  reasons: ExplanationFactor[];
  cropName: string;
  timestamp: string;
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
  className?: string;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  verdict,
  score,
  headline,
  reasons,
  cropName,
  timestamp,
  onPrimaryAction,
  primaryActionLabel = 'List Produce Lot',
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const verdictStyles: Record<
    RecommendationVerdict,
    { badgeBg: string; text: string; icon: React.ElementType }
  > = {
    'SELL NOW': {
      badgeBg: 'bg-accent text-background',
      text: 'text-accent',
      icon: TrendingUp,
    },
    'SELL SOON': {
      badgeBg: 'bg-accent/20 text-accent border border-accent/40',
      text: 'text-accent',
      icon: Clock,
    },
    WAIT: {
      badgeBg: 'bg-status-warning/20 text-status-warning border border-status-warning/40',
      text: 'text-status-warning',
      icon: Clock,
    },
    STORE: {
      badgeBg: 'bg-border text-text-main border border-border',
      text: 'text-text-main',
      icon: Warehouse,
    },
    REROUTE: {
      badgeBg: 'bg-status-success/20 text-status-success border border-status-success/40',
      text: 'text-status-success',
      icon: ArrowUpRight,
    },
  };

  const style = verdictStyles[verdict];
  const VerdictIcon = style.icon;

  return (
    <div
      className={cn(
        'rounded-2xl bg-surface border border-border p-5 sm:p-7 relative overflow-hidden transition-all',
        className
      )}
    >
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-56 h-56 rounded-full bg-border/20 blur-3xl pointer-events-none" />

      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-surface-raised text-accent border border-border font-semibold">
            {cropName}
          </span>
          <span className="text-xs text-text-muted">Decision Engine Signal</span>
        </div>

        <DataFreshness timestamp={timestamp} isLive />
      </div>

      <div className="my-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2">
            <span
              className={cn(
                'px-3 py-1 rounded-md font-mono text-sm sm:text-base font-bold tracking-wider flex items-center space-x-1.5 shadow-sm',
                style.badgeBg
              )}
            >
              <VerdictIcon className="w-4 h-4 stroke-[2.5]" />
              <span>{verdict}</span>
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-semibold text-text-main tracking-tight leading-snug">
            {headline}
          </h3>
          <p className="text-xs sm:text-sm text-text-muted">
            Sale Window algorithm recommends action based on 30-day velocity.
          </p>
        </div>

        <div className="sm:border-l sm:border-border sm:pl-6 shrink-0 flex items-center sm:flex-col sm:items-end justify-between">
          <div className="text-[11px] font-mono text-text-muted uppercase tracking-wider mb-1">
            Sale Window Score
          </div>
          <div className="flex items-baseline space-x-1 font-mono-data">
            <span className="text-4xl sm:text-5xl font-bold text-accent">
              {score}
            </span>
            <span className="text-sm text-text-muted font-semibold">/100</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-surface-raised border border-border p-4 space-y-3">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-xs font-semibold text-text-main hover:text-accent transition-colors focus-visible:outline-none"
        >
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-status-success" />
            <span>Why this recommendation? ({reasons.length} key market drivers)</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-text-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-text-muted" />
          )}
        </button>

        {isExpanded && (
          <div className="pt-2 space-y-2.5 border-t border-border animate-in fade-in duration-150">
            {reasons.map((reason, idx) => (
              <div key={idx} className="flex items-start space-x-2.5 text-xs">
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                    reason.impact === 'positive'
                      ? 'bg-status-success'
                      : reason.impact === 'negative'
                      ? 'bg-status-error'
                      : 'bg-status-warning'
                  )}
                />
                <div>
                  <span className="font-semibold text-text-main">
                    {reason.title}:{' '}
                  </span>
                  <span className="text-text-muted">{reason.description}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {onPrimaryAction && (
        <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-text-muted hidden sm:block">
            Take immediate action based on this intelligence:
          </span>
          <Button
            size="lg"
            variant="primary"
            onClick={onPrimaryAction}
            className="w-full sm:w-auto"
          >
            {primaryActionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
