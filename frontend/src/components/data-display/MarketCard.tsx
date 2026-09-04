import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { MapPin, TrendingUp, TrendingDown, ArrowRight, Truck } from 'lucide-react';
import { DataFreshness } from '@/components/status/DataFreshness';
import { Button } from '@/components/ui/Button';

export interface MarketCardProps {
  mandiName: string;
  distanceKm: number;
  commodity: string;
  modalPrice: number; // in ₹/qtl
  trendPercentage: number; // e.g. +3.4 or -1.2
  estimatedFreightPerQtl?: number; // transport cost
  source?: string;
  timestamp: string;
  isNearest?: boolean;
  isBestRealized?: boolean;
  onSelectMandi?: () => void;
  className?: string;
}

export const MarketCard: React.FC<MarketCardProps> = ({
  mandiName,
  distanceKm,
  commodity,
  modalPrice,
  trendPercentage,
  estimatedFreightPerQtl = 75,
  source = 'Agmarknet APMC',
  timestamp,
  isNearest = false,
  isBestRealized = false,
  onSelectMandi,
  className,
}) => {
  const [showNetPrice, setShowNetPrice] = useState(false);

  const netRealizedPrice = modalPrice - estimatedFreightPerQtl;
  const isTrendUp = trendPercentage >= 0;

  return (
    <div
      className={cn(
        'rounded-xl bg-[#14152E] border p-4 sm:p-5 flex flex-col justify-between transition-all hover:border-[#5B5E8C]',
        isBestRealized
          ? 'border-[#C4FF4D]/60 ring-1 ring-[#C4FF4D]/30'
          : 'border-[#2C2B73]',
        className
      )}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#2C2B73]/60">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-semibold text-[#EEF0FA] tracking-tight">
              {mandiName}
            </h3>
            {isBestRealized && (
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.2 rounded-full bg-[#C4FF4D]/15 text-[#C4FF4D] border border-[#C4FF4D]/40 font-bold">
                Best Net Price
              </span>
            )}
            {isNearest && !isBestRealized && (
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.2 rounded-full bg-[#1D1F3D] text-[#A7ABC9] border border-[#5B5E8C]/30">
                Nearest
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 text-xs text-[#A7ABC9] mt-1">
            <MapPin className="w-3.5 h-3.5 text-[#5B5E8C]" />
            <span className="font-mono">{distanceKm} km away</span>
            <span>•</span>
            <span>{commodity}</span>
          </div>
        </div>

        {/* 7-Day Trend Pill */}
        <div
          className={cn(
            'flex items-center space-x-1 px-2 py-1 rounded font-mono text-xs font-semibold shrink-0',
            isTrendUp
              ? 'bg-[#2FBF8F]/15 text-[#2FBF8F] border border-[#2FBF8F]/30'
              : 'bg-[#E5484D]/15 text-[#E5484D] border border-[#E5484D]/30'
          )}
        >
          {isTrendUp ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5" />
          )}
          <span>{isTrendUp ? `+${trendPercentage}%` : `${trendPercentage}%`}</span>
        </div>
      </div>

      {/* Center Price Display */}
      <div className="my-4 p-3 rounded-lg bg-[#1D1F3D] flex items-center justify-between">
        <div>
          <div className="text-[11px] text-[#A7ABC9]">
            {showNetPrice ? 'Net Realized (After Freight)' : 'Modal Mandi Price'}
          </div>
          <div className="flex items-baseline space-x-1.5 font-mono-data mt-0.5">
            <span className="text-2xl font-bold text-[#EEF0FA]">
              ₹{(showNetPrice ? netRealizedPrice : modalPrice).toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-[#A7ABC9]">/ quintal</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowNetPrice(!showNetPrice)}
          className="text-xs font-mono text-[#C4FF4D] hover:underline flex items-center space-x-1 px-2 py-1 rounded bg-[#2C2B73]/60 border border-[#5B5E8C]/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C4FF4D]"
        >
          <Truck className="w-3 h-3" />
          <span>{showNetPrice ? 'Show Gross' : 'Deduct Freight (-₹75)'}</span>
        </button>
      </div>

      {/* Footer Info & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <DataFreshness timestamp={timestamp} source={source} />

        {onSelectMandi && (
          <Button
            size="sm"
            variant="outline"
            onClick={onSelectMandi}
            rightIcon={<ArrowRight className="w-3 h-3" />}
          >
            Route to this Mandi
          </Button>
        )}
      </div>
    </div>
  );
};
