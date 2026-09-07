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
        'rounded-xl bg-surface border border-status-error/40 p-6 sm:p-8 text-center flex flex-col items-center justify-center max-w-md mx-auto space-y-4',
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-status-error/15 border border-status-error/30 flex items-center justify-center text-status-error">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div>
        <h4 className="text-base font-semibold text-text-main">{title}</h4>
        <p className="text-xs text-text-muted mt-1.5 leading-relaxed">{message}</p>
      </div>

      {cachedTime && (
        <div className="px-3 py-1 rounded bg-surface-raised border border-border text-xs font-mono text-status-warning">
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
