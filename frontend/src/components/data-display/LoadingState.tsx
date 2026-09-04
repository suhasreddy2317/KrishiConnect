import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  variant?: 'skeleton' | 'spinner' | 'card';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading verified market data...',
  variant = 'spinner',
  className,
}) => {
  if (variant === 'spinner') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center p-12 text-center space-y-3',
          className
        )}
      >
        <Loader2 className="w-8 h-8 animate-spin text-[#C4FF4D]" />
        <span className="text-xs font-mono text-[#A7ABC9]">{message}</span>
      </div>
    );
  }

  // Skeleton variant for card lists
  return (
    <div className={cn('space-y-4 animate-pulse', className)}>
      <div className="h-28 rounded-xl bg-[#14152E] border border-[#2C2B73]/60 p-5 space-y-3">
        <div className="h-4 w-1/3 bg-[#1D1F3D] rounded" />
        <div className="h-8 w-1/2 bg-[#1D1F3D] rounded" />
        <div className="h-3 w-1/4 bg-[#1D1F3D] rounded" />
      </div>
      <div className="h-28 rounded-xl bg-[#14152E] border border-[#2C2B73]/60 p-5 space-y-3">
        <div className="h-4 w-1/4 bg-[#1D1F3D] rounded" />
        <div className="h-8 w-2/3 bg-[#1D1F3D] rounded" />
        <div className="h-3 w-1/3 bg-[#1D1F3D] rounded" />
      </div>
    </div>
  );
};
