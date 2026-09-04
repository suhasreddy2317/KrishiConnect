import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  position?: 'bottom' | 'right';
  footer?: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  position = 'bottom',
  footer,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isBottom = position === 'bottom';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0A0B1C]/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Surface: Topsoil (#1D1F3D) */}
      <div
        className={cn(
          'relative bg-[#1D1F3D] border-[#5B5E8C]/40 text-[#EEF0FA] shadow-2xl z-10 flex flex-col',
          isBottom
            ? 'mt-auto w-full max-h-[85vh] rounded-t-2xl border-t p-6 animate-in slide-in-from-bottom duration-200'
            : 'ml-auto h-full w-full max-w-md border-l p-6 animate-in slide-in-from-right duration-200'
        )}
      >
        {/* Drag handle for mobile bottom sheet */}
        {isBottom && (
          <div className="w-12 h-1.5 bg-[#5B5E8C]/50 rounded-full mx-auto mb-4" />
        )}

        {/* Header */}
        <div className="flex items-start justify-between pb-3 mb-3 border-b border-[#2C2B73]">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-[#EEF0FA]">{title}</h2>
            {description && (
              <p className="text-xs text-[#A7ABC9] mt-0.5">{description}</p>
            )}
          </div>
          <IconButton
            icon={<X className="w-5 h-5" />}
            aria-label="Close sheet"
            size="sm"
            onClick={onClose}
          />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 py-2">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="pt-4 mt-auto border-t border-[#2C2B73] flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
