import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  cachedTime?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to fetch real-time market stream',
  message = 'Network connection is intermittent or feed service is temporarily responding slowly.',
  cachedTime,
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-xl bg-[#14152E] border border-[#E5484D]/40 p-6 sm:p-8 text-center flex flex-col items-center justify-center max-w-md mx-auto space-y-4',
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-[#E5484D]/15 border border-[#E5484D]/30 flex items-center justify-center text-[#E5484D]">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div>
        <h4 className="text-base font-semibold text-[#EEF0FA]">{title}</h4>
        <p className="text-xs text-[#A7ABC9] mt-1.5 leading-relaxed">{message}</p>
      </div>

      {cachedTime && (
        <div className="px-3 py-1 rounded bg-[#1D1F3D] border border-[#5B5E8C]/30 text-xs font-mono text-[#F5A623]">
          Showing cached offline data as of: {cachedTime}
        </div>
      )}

      {onRetry && (
        <Button
          size="sm"
          variant="secondary"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Retry Connection
        </Button>
      )}
    </div>
  );
};
