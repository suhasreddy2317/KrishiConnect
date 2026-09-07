import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onClear, onChange, placeholder = 'Search commodities, mandis, lots...', ...props }, ref) => {
    const hasValue = Boolean(value);

    return (
      <div className="relative flex items-center w-full">
        <div className="absolute left-3 text-text-muted pointer-events-none flex items-center">
          <Search className="w-4 h-4" />
        </div>

        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-label="Search"
          className={cn(
            'w-full h-10 pl-9 pr-9 bg-surface text-text-main text-sm rounded-md border border-border transition-all placeholder:text-text-muted',
            'hover:border-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent',
            className
          )}
          {...props}
        />

        {hasValue && onClear && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className="absolute right-3 text-text-muted hover:text-text-main transition-colors p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
