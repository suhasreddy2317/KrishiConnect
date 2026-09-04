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
  score: number; // 0-100
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
      badgeBg: 'bg-[#C4FF4D] text-[#0A0B1C]',
      text: 'text-[#C4FF4D]',
      icon: TrendingUp,
    },
    'SELL SOON': {
      badgeBg: 'bg-[#C4FF4D]/20 text-[#C4FF4D] border border-[#C4FF4D]/40',
      text: 'text-[#C4FF4D]',
      icon: Clock,
    },
    WAIT: {
      badgeBg: 'bg-[#F5A623]/20 text-[#F5A623] border border-[#F5A623]/40',
      text: 'text-[#F5A623]',
      icon: Clock,
    },
    STORE: {
      badgeBg: 'bg-[#5B5E8C]/30 text-[#EEF0FA] border border-[#5B5E8C]',
      text: 'text-[#EEF0FA]',
      icon: Warehouse,
    },
    REROUTE: {
      badgeBg: 'bg-[#2FBF8F]/20 text-[#2FBF8F] border border-[#2FBF8F]/40',
      text: 'text-[#2FBF8F]',
      icon: ArrowUpRight,
    },
  };

  const style = verdictStyles[verdict];
  const VerdictIcon = style.icon;

  return (
    <div
      className={cn(
        'rounded-2xl bg-[#14152E] border border-[#2C2B73] p-5 sm:p-7 relative overflow-hidden transition-all',
        className
      )}
    >
      {/* Background ambient glow accent */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-56 h-56 rounded-full bg-[#2C2B73]/20 blur-3xl pointer-events-none" />

      {/* Header with Crop Name and Freshness */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#2C2B73]/60">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#1D1F3D] text-[#C4FF4D] border border-[#5B5E8C]/30 font-semibold">
            {cropName}
          </span>
          <span className="text-xs text-[#A7ABC9]">Decision Engine Signal</span>
        </div>

        <DataFreshness timestamp={timestamp} isLive />
      </div>

      {/* Core Verdict & Score Row */}
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

          <h3 className="text-xl sm:text-2xl font-semibold text-[#EEF0FA] tracking-tight leading-snug">
            {headline}
          </h3>
          <p className="text-xs sm:text-sm text-[#A7ABC9]">
            Sale Window algorithm recommends action based on 30-day velocity.
          </p>
        </div>

        {/* Big Sale Window Score Widget */}
        <div className="sm:border-l sm:border-[#2C2B73] sm:pl-6 shrink-0 flex items-center sm:flex-col sm:items-end justify-between">
          <div className="text-[11px] font-mono text-[#A7ABC9] uppercase tracking-wider mb-1">
            Sale Window Score
          </div>
          <div className="flex items-baseline space-x-1 font-mono-data">
            <span className="text-4xl sm:text-5xl font-bold text-[#C4FF4D]">
              {score}
            </span>
            <span className="text-sm text-[#5B5E8C] font-semibold">/100</span>
          </div>
        </div>
      </div>

      {/* Plain Language Explanations (Expandable) */}
      <div className="rounded-xl bg-[#1D1F3D] border border-[#5B5E8C]/30 p-4 space-y-3">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-xs font-semibold text-[#EEF0FA] hover:text-[#C4FF4D] transition-colors focus-visible:outline-none"
        >
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#2FBF8F]" />
            <span>Why this recommendation? ({reasons.length} key market drivers)</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-[#A7ABC9]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#A7ABC9]" />
          )}
        </button>

        {isExpanded && (
          <div className="pt-2 space-y-2.5 border-t border-[#2C2B73]/80 animate-in fade-in duration-150">
            {reasons.map((reason, idx) => (
              <div key={idx} className="flex items-start space-x-2.5 text-xs">
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                    reason.impact === 'positive'
                      ? 'bg-[#2FBF8F]'
                      : reason.impact === 'negative'
                      ? 'bg-[#E5484D]'
                      : 'bg-[#F5A623]'
                  )}
                />
                <div>
                  <span className="font-semibold text-[#EEF0FA]">
                    {reason.title}:{' '}
                  </span>
                  <span className="text-[#A7ABC9]">{reason.description}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Primary Action Button */}
      {onPrimaryAction && (
        <div className="mt-6 pt-4 border-t border-[#2C2B73]/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-[#A7ABC9] hidden sm:block">
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
