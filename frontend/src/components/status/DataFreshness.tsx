import React from 'react';
import { cn } from '@/lib/utils';
import { Clock, AlertCircle } from 'lucide-react';

export interface DataFreshnessProps {
  timestamp: string; // e.g. "10 mins ago" or "Today, 08:45 AM"
  source?: string; // e.g. "Agmarknet APMC", "Direct Buyer Quote"
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
        isStale ? 'text-[#F5A623]' : 'text-[#A7ABC9]',
        className
      )}
    >
      {isLive ? (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C4FF4D] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C4FF4D]" />
        </span>
      ) : isStale ? (
        <AlertCircle className="w-3 h-3 text-[#F5A623]" />
      ) : (
        <Clock className="w-3 h-3 text-[#5B5E8C]" />
      )}

      <span>
        {isStale ? 'Stale feed: ' : 'as of '}
        <span className="text-[#EEF0FA]">{timestamp}</span>
      </span>

      {source && (
        <>
          <span className="text-[#5B5E8C]">•</span>
          <span className="text-[#A7ABC9]">{source}</span>
        </>
      )}
    </div>
  );
};
