import React from 'react';
import { cn } from '@/lib/utils';
import { Clock, AlertCircle } from 'lucide-react';

export interface DataFreshnessProps {
  timestamp: string;
  source?: string;
  isLive?: boolean;
  isStale?: boolean;
  className?: string;
}

export const DataFreshness: React.FC<DataFreshnessProps> = ({
  timestamp,
  source,
  isLive = false,
  isStale = false,
  className,
}) => {
  return (
    <div
      className={cn(
        'inline-flex items-center space-x-1.5 text-[11px] font-mono select-none',
        isStale ? 'text-status-warning' : 'text-text-muted',
        className
      )}
    >
      {isLive ? (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
        </span>
      ) : isStale ? (
        <AlertCircle className="w-3 h-3 text-status-warning" />
      ) : (
        <Clock className="w-3 h-3 text-text-muted" />
      )}

      <span>
        {isStale ? 'Stale feed: ' : 'as of '}
        <span className="text-current font-medium">{timestamp}</span>
      </span>

      {source && (
        <>
          <span className="text-text-muted">•</span>
          <span className="text-text-muted">{source}</span>
        </>
      )}
    </div>
  );
};
