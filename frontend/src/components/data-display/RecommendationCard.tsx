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
      borderColor: 'border-status-success/40',
      iconColor: 'text-white',
    },
    'SELL SOON': {
      badgeBg: 'bg-status-success/15 border border-status-success/40 text-status-success',
      textColor: 'text-status-success',
      borderColor: 'border-status-success/40',
      iconColor: 'text-status-success',
    },
    WAIT: {
      badgeBg: 'bg-status-warning/15 border border-status-warning/40 text-status-warning',
      textColor: 'text-status-warning',
      borderColor: 'border-status-warning/40',
      iconColor: 'text-status-warning',
    },
    STORE: {
      badgeBg: 'bg-surface-raised border border-border text-text-muted',
      textColor: 'text-text-muted',
      borderColor: 'border-border',
      iconColor: 'text-text-muted',
    },
    REROUTE: {
      badgeBg: 'bg-status-success/15 border border-status-success/40 text-status-success',
      textColor: 'text-status-success',
      borderColor: 'border-status-success/40',
      iconColor: 'text-status-success',
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

  const scoreColor =
    score >= 76
      ? 'text-status-success'
      : score >= 51
      ? 'text-status-warning'
      : score >= 26
      ? 'text-status-warning'
      : 'text-text-muted';

  const scoreBg =
    score >= 76
      ? 'bg-status-success/8'
      : score >= 51
      ? 'bg-status-warning/8'
      : 'bg-surface-raised';

  return (
    <div
      className={cn(
        'rounded-2xl bg-surface border border-border p-5 sm:p-7 relative overflow-hidden',
        className
      )}
      role="region"
      aria-label={t('recommendationCard.recommendedAction')}
    >
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-56 h-56 rounded-full bg-border/15 blur-3xl pointer-events-none" />

      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-surface-raised text-accent border border-border font-semibold">
            {cropName}
          </span>
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
            {t('recommendationCard.recommendedAction')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {canListen && onListen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onListen}
              aria-label={t('recommendationCard.listenToRecommendation')}
              leftIcon={<Volume2 className="w-4 h-4" />}
              className="text-text-muted hover:text-accent"
            >
              {t('recommendation.listen')}
            </Button>
          )}
          <DataFreshness timestamp={timestamp} isLive />
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

          <p className="text-sm sm:text-base text-text-main font-medium leading-relaxed">
            {headline}
          </p>

          {explanationText && (
            <p className="text-xs text-text-muted leading-relaxed">
              {explanationText}
            </p>
          )}

          {topReason && (
            <p className="text-xs text-text-muted leading-relaxed">
              <span className="font-semibold text-status-success">{topReason.title}: </span>
              <span>{topReason.description}</span>
            </p>
          )}
        </div>

        <div
          className={cn(
            'sm:border-l sm:border-border sm:pl-6 shrink-0 flex items-center sm:flex-col sm:items-end justify-between gap-2 rounded-xl p-3 sm:p-0',
            scoreBg
          )}
        >
          <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider">
            Score
          </span>
          <div className="flex items-baseline space-x-1">
            <span className={cn('text-4xl sm:text-5xl font-bold tabular-nums', scoreColor)}>
              {Math.round(score)}
            </span>
            <span className="text-sm text-text-muted font-semibold">/100</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-surface-raised border border-border">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-xs font-semibold text-text-main hover:text-accent transition-colors p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised rounded-xl"
          aria-expanded={isExpanded}
        >
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-status-success" />
            <span>
              {t('recommendationCard.why')}{' '}
              <span className="text-text-muted font-normal">
                ({reasons.length} {t('recommendationCard.drivers')})
              </span>
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-text-muted" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-4 h-4 text-text-muted" aria-hidden="true" />
          )}
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 space-y-2.5 border-t border-border pt-3">
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

      <div className="mt-5 pt-4 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {primaryActionLabel && (
          <span className="text-xs text-text-muted hidden sm:block">
            {t('recommendationCard.recommendedAction')}:
          </span>
        )}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          {primaryActionLabel && onPrimaryAction && (
            <Button
              size="lg"
              variant="primary"
              onClick={onPrimaryAction}
              className="w-full sm:w-auto"
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
              className="w-full sm:w-auto"
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
