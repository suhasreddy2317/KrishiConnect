import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface StepItem {
  id: string;
  label: string;
  sublabel?: string;
  status: 'complete' | 'current' | 'pending';
}

export interface StatusStepsProps {
  steps: StepItem[];
  className?: string;
}

export const StatusSteps: React.FC<StatusStepsProps> = ({ steps, className }) => {
  return (
    <div className={cn('w-full', className)}>
      <div className="hidden sm:flex items-center justify-between w-full">
        {steps.map((step, idx) => {
          const isComplete = step.status === 'complete';
          const isCurrent = step.status === 'current';
          const isLast = idx === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center text-center max-w-[140px]">
                <div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-xs select-none transition-all',
                    isComplete && 'bg-status-success text-background',
                    isCurrent &&
                      'bg-accent text-background ring-4 ring-accent/20',
                    step.status === 'pending' &&
                      'bg-surface-raised text-text-muted border border-border'
                  )}
                >
                  {isComplete ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <span
                  className={cn(
                    'mt-2 text-xs font-medium tracking-tight',
                    isCurrent ? 'text-accent font-semibold' : isComplete ? 'text-text-main' : 'text-text-muted'
                  )}
                >
                  {step.label}
                </span>

                {step.sublabel && (
                  <span className="text-[10px] font-mono text-text-muted mt-0.5">
                    {step.sublabel}
                  </span>
                )}
              </div>

              {!isLast && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-3 mb-6 transition-colors',
                    isComplete ? 'bg-status-success' : 'bg-border'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="sm:hidden space-y-4 pl-4 relative">
        <div className="absolute top-3 bottom-3 left-[27px] w-0.5 bg-border" />

        {steps.map((step, idx) => {
          const isComplete = step.status === 'complete';
          const isCurrent = step.status === 'current';

          return (
            <div key={step.id} className="relative flex items-start space-x-3">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs shrink-0 select-none z-10',
                  isComplete && 'bg-status-success text-background',
                  isCurrent &&
                    'bg-accent text-background ring-4 ring-accent/20',
                  step.status === 'pending' &&
                    'bg-surface-raised text-text-muted border border-border'
                )}
              >
                {isComplete ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              <div className="pt-0.5 space-y-0.5">
                <div
                  className={cn(
                    'text-xs font-medium',
                    isCurrent ? 'text-accent font-semibold' : isComplete ? 'text-text-main' : 'text-text-muted'
                  )}
                >
                  {step.label}
                </div>
                {step.sublabel && (
                  <div className="text-[10px] font-mono text-text-muted">
                    {step.sublabel}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
