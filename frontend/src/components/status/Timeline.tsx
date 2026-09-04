import React from 'react';
import { cn } from '@/lib/utils';
import { Check, Clock, AlertCircle } from 'lucide-react';

export interface TimelineItem {
  id: string;
  actor: string;
  role: string;
  amount?: string; // e.g. "₹2,450 / qtl" in mono
  description: string;
  timestamp: string;
  status?: 'accepted' | 'pending' | 'countered' | 'rejected';
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ items, className }) => {
  return (
    <div className={cn('relative pl-6 space-y-6', className)}>
      {/* Vertical line connecting nodes */}
      <div className="absolute top-2 bottom-2 left-2.5 w-0.5 bg-[#2C2B73]" />

      {items.map((item, index) => {
        const isLatest = index === items.length - 1;

        const statusDot = {
          accepted: 'bg-[#2FBF8F] border-[#0A0B1C] text-[#0A0B1C]',
          pending: 'bg-[#C4FF4D] border-[#0A0B1C] text-[#0A0B1C] lime-glow-subtle',
          countered: 'bg-[#F5A623] border-[#0A0B1C] text-[#0A0B1C]',
          rejected: 'bg-[#E5484D] border-[#0A0B1C] text-[#EEF0FA]',
        }[item.status || 'pending'];

        return (
          <div key={item.id} className="relative group">
            {/* Status Dot */}
            <div
              className={cn(
                'absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] z-10 transition-transform group-hover:scale-110',
                statusDot
              )}
            >
              {item.status === 'accepted' ? (
                <Check className="w-3 h-3 stroke-[3]" />
              ) : item.status === 'rejected' ? (
                <AlertCircle className="w-3 h-3 stroke-[3]" />
              ) : (
                <Clock className="w-3 h-3 stroke-[2.5]" />
              )}
            </div>

            {/* Content card */}
            <div className="rounded-lg bg-[#14152E] border border-[#2C2B73] p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-[#EEF0FA]">
                    {item.actor}
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.2 rounded bg-[#1D1F3D] text-[#A7ABC9] border border-[#5B5E8C]/30">
                    {item.role}
                  </span>
                </div>

                <div className="flex items-center space-x-3 font-mono text-xs">
                  {item.amount && (
                    <span className="font-bold text-[#C4FF4D] text-sm">
                      {item.amount}
                    </span>
                  )}
                  <span className="text-[#A7ABC9]">{item.timestamp}</span>
                </div>
              </div>

              <p className="text-xs text-[#A7ABC9] leading-relaxed">
                {item.description}
              </p>

              {isLatest && (
                <div className="text-[11px] font-mono text-[#C4FF4D] pt-1">
                  • Latest Transaction Term
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
