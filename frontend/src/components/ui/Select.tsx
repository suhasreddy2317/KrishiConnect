import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, AlertCircle } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      options,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-medium text-[#EEF0FA] tracking-wide"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full h-11 px-3 pr-10 bg-[#14152E] text-[#EEF0FA] text-sm rounded-md border appearance-none transition-all disabled:opacity-50 disabled:cursor-not-allowed',
              'focus:outline-none focus:border-[#C4FF4D] focus:ring-1 focus:ring-[#C4FF4D]',
              error
                ? 'border-[#E5484D] focus:border-[#E5484D] focus:ring-[#E5484D]'
                : 'border-[#2C2B73] hover:border-[#5B5E8C]',
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="bg-[#14152E] text-[#EEF0FA]"
              >
                {opt.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3 text-[#A7ABC9] pointer-events-none flex items-center">
            <ChevronDown className="w-4 h-4" />
          </div>
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

Select.displayName = 'Select';
