import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-[#EEF0FA] tracking-wide"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-[#A7ABC9] pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full h-11 px-3 bg-[#14152E] text-[#EEF0FA] text-sm rounded-md border transition-all placeholder:text-[#5B5E8C] disabled:opacity-50 disabled:cursor-not-allowed',
              'focus:outline-none focus:border-[#C4FF4D] focus:ring-1 focus:ring-[#C4FF4D]',
              error
                ? 'border-[#E5484D] focus:border-[#E5484D] focus:ring-[#E5484D]'
                : 'border-[#2C2B73] hover:border-[#5B5E8C]',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 text-[#A7ABC9] flex items-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="flex items-center space-x-1 text-xs text-[#E5484D]">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-xs text-[#A7ABC9]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
