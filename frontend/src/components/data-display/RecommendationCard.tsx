import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  Clock,
  Warehouse,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Volume2,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DataFreshness } from '@/components/status/DataFreshness';
import { useLanguage } from '@/i18n/LanguageContext';

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
  onListen?: () => void;
  onAction?: (intent: 'sell' | 'store' | 'wait', actionHint: string | null) => void;
  canListen?: boolean;
  isSpeaking?: boolean;
  voiceAvailable?: boolean;
  className?: string;
}

const VERDICT_EXPLANATION_KEY: Record<RecommendationVerdict, string> = {
  'SELL NOW': 'sellNowExplanation',
  'SELL SOON': 'sellSoonExplanation',
  WAIT: 'waitExplanation',
  STORE: 'storeExplanation',
    REROUTE: 'rerouteExplanation',
};

const VERDICT_ICON: Record<RecommendationVerdict, React.ElementType> = {
  'SELL NOW': TrendingUp,
  'SELL SOON': Clock,
  WAIT: Clock,
  STORE: Warehouse,
  REROUTE: ArrowUpRight,
};

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  verdict,
  score,
  headline,
  reasons,
  cropName,
  timestamp,
  onPrimaryAction,
  primaryActionLabel,
  onListen,
  onAction,
  canListen = true,
  isSpeaking = false,
  voiceAvailable = true,
  className,
}) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  const verdictStyles: Record<
    RecommendationVerdict,
    { badgeBg: string; textColor: string; borderColor: string; iconColor: string }
  > = {
    'SELL NOW': {
      badgeBg: 'bg-status-success text-white',
      textColor: 'text-status-success',
      borderColor: 'border-status-success/60',
      iconColor: 'text-white',
    },
    'SELL SOON': {
      badgeBg: 'bg-status-success/30 border border-status-success/60 text-white',
      textColor: 'text-status-success',
      borderColor: 'border-status-success/60',
      iconColor: 'text-white',
    },
    WAIT: {
      badgeBg: 'bg-status-warning/30 border border-status-warning/60 text-white',
      textColor: 'text-status-warning',
      borderColor: 'border-status-warning/60',
      iconColor: 'text-white',
    },
    STORE: {
      badgeBg: 'bg-white/90 border border-white/30 text-card-bg',
      textColor: 'text-card-bg',
      borderColor: 'border-white/30',
      iconColor: 'text-card-bg',
    },
    REROUTE: {
      badgeBg: 'bg-status-success/30 border border-status-success/60 text-white',
      textColor: 'text-status-success',
      borderColor: 'border-status-success/60',
      iconColor: 'text-white',
    },
  };

  const style = verdictStyles[verdict];
  const VerdictIcon = VERDICT_ICON[verdict];

  const explanationKey = VERDICT_EXPLANATION_KEY[verdict];
  const explanationText = explanationKey ? t(`recommendationCard.${explanationKey}`) : '';

  const positiveReasons = reasons.filter(r => r.impact === 'positive');
  const topReason = positiveReasons[0];

  const getVerdictLocalized = (): string => {
    const key = `recommendationCard.${verdict.toLowerCase().replace(/\s+/g, '')}`;
    const localized = t(`recommendationCard.${verdict.toLowerCase().replace(/\s+/g, '')}`);
    if (localized !== key) return localized;
    return verdict;
  };

  const handleAskQuestion = useCallback(() => {
    onAction?.('sell', null);
  }, [onAction]);

  const scoreBg =
    score >= 75
      ? 'bg-status-success/20'
      : score >= 50
      ? 'bg-status-warning/20'
      : 'bg-status-error/20';

  return (
    <div
      className={cn(
        'rounded-2xl border p-5 sm:p-7 relative overflow-hidden',
        'bg-[#143F1C] border-[#1E5A28]/50',
        className
      )}
      role="region"
      aria-label={t('recommendationCard.recommendedAction')}
    >
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-56 h-56 rounded-full bg-[#1E5A28]/40 blur-3xl pointer-events-none" />

      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#1E5A28]/50 text-accent border border-white/10 font-semibold">
            {cropName}
          </span>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#B9E4BC]/80">
            {t('recommendationCard.recommendedAction')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {canListen && onListen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onListen}
              aria-label={isSpeaking ? t('voiceAssistant.stopListening') : t('recommendationCard.listenToRecommendation')}
              leftIcon={isSpeaking ? undefined : <Volume2 className="w-4 h-4" />}
               className="text-[#B9E4BC]/80 hover:text-accent"
              title={voiceAvailable ? undefined : t('recommendationCard.voiceNotAvailable')}
            >
              {isSpeaking ? t('voiceAssistant.stopListening') : t('recommendation.listen')}
            </Button>
          )}
          <DataFreshness timestamp={timestamp} isLive className="text-[#B9E4BC]/80" />
        </div>
      </div>

      <div className="my-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2.5 flex-1 min-w-0">
          <div
            className={cn(
              'inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-mono text-sm sm:text-base font-bold tracking-wider shadow-sm',
              style.badgeBg
            )}
            aria-label={`${t('recommendationCard.recommendedAction')}: ${getVerdictLocalized()}`}
          >
            <VerdictIcon className={cn('w-4 h-4 stroke-[2.5]', style.iconColor)} />
            <span>{getVerdictLocalized()}</span>
          </div>

          <p className="text-sm sm:text-base text-[#F0FDF4] font-medium leading-relaxed">
            {headline}
          </p>

          {explanationText && (
            <p className="text-xs text-[#B9E4BC]/80 leading-relaxed">
              {explanationText}
            </p>
          )}

          {topReason && (
            <p className="text-xs text-[#B9E4BC]/80 leading-relaxed">
              <span className="font-semibold text-accent">{topReason.title}: </span>
              <span>{topReason.description}</span>
            </p>
          )}
        </div>

        <div
          className={cn(
            'sm:border-l sm:border-white/10 sm:pl-6 shrink-0 flex items-center sm:flex-col sm:items-end justify-between gap-2 rounded-xl p-3 sm:p-0 bg-[#1E5A28]/20',
            scoreBg
          )}
        >
          <span className="text-[11px] font-mono text-[#B9E4BC]/70 uppercase tracking-wider">
            {t('recommendationCard.score')}
          </span>
          <div className="flex items-baseline space-x-1">
            <span className="text-4xl sm:text-5xl font-bold tabular-nums text-white">
              {Math.round(score)}
            </span>
            <span className="text-sm text-[#B9E4BC]/80 font-semibold">/100</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-[#1E5A28]/25 border border-white/10">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-xs font-semibold text-[#F0FDF4] hover:text-accent transition-colors p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-card-surface rounded-xl"
          aria-expanded={isExpanded}
        >
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-status-success" />
            <span>
              {t('recommendationCard.why')}{' '}
              <span className="text-[#B9E4BC]/70 font-normal">
                ({reasons.length} {t('recommendationCard.drivers')})
              </span>
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-[#B9E4BC]/60" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#B9E4BC]/60" aria-hidden="true" />
          )}
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 space-y-2.5 border-t border-white/10 pt-3">
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
                  aria-hidden="true"
                />
                <div>
                  <span className="font-semibold text-[#F0FDF4]">
                    {reason.title}:{' '}
                  </span>
                  <span className="text-[#B9E4BC]/80">{reason.description}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {primaryActionLabel && (
          <span className="text-xs text-[#B9E4BC]/80 hidden sm:block">
            {t('recommendationCard.recommendedAction')}:
          </span>
        )}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          {primaryActionLabel && onPrimaryAction && (
            <Button
              size="lg"
              onClick={onPrimaryAction}
              className="w-full sm:w-auto bg-white hover:bg-gray-100 text-card-bg font-semibold"
              aria-label={`${t('recommendationCard.recommendedAction')}: ${primaryActionLabel}`}
            >
              {primaryActionLabel}
            </Button>
          )}
          {onAction && (
            <Button
              id="recommendation-ask-question-button"
              size="lg"
              variant="secondary"
              onClick={handleAskQuestion}
              leftIcon={<MessageSquare className="w-4 h-4" />}
              className="w-full sm:w-auto bg-[#1E5A28]/40 border border-white/20 text-[#F0FDF4] hover:bg-[#1E5A28]/60 hover:border-white/30"
              aria-label={t('recommendationCard.askQuestion')}
            >
              {t('recommendationCard.askQuestion')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
