import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { MapPin, TrendingUp, TrendingDown, ArrowRight, Truck } from 'lucide-react';
import { DataFreshness } from '@/components/status/DataFreshness';
import { Button } from '@/components/ui/Button';

export interface MarketCardProps {
  mandiName: string;
  distanceKm: number;
  commodity: string;
  modalPrice: number;
  trendPercentage: number;
  estimatedFreightPerQtl?: number;
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
        'rounded-xl bg-surface border p-4 sm:p-5 flex flex-col justify-between transition-all hover:border-primary',
        isBestRealized
          ? 'border-accent/60 ring-1 ring-accent/30'
          : 'border-border',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-border">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-semibold text-text-main tracking-tight">
              {mandiName}
            </h3>
            {isBestRealized && (
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.2 rounded-full bg-accent/15 text-accent border border-accent/40 font-bold">
                Best Net Price
              </span>
            )}
            {isNearest && !isBestRealized && (
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.2 rounded-full bg-surface-raised text-text-muted border border-border">
                Nearest
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 text-xs text-text-muted mt-1">
            <MapPin className="w-3.5 h-3.5 text-text-muted" />
            <span className="font-mono">{distanceKm} km away</span>
            <span>•</span>
            <span>{commodity}</span>
          </div>
        </div>

        <div
          className={cn(
            'flex items-center space-x-1 px-2 py-1 rounded font-mono text-xs font-semibold shrink-0 border',
            isTrendUp
              ? 'bg-status-success/15 text-status-success border-status-success/30'
              : 'bg-status-error/15 text-status-error border-status-error/30'
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

      <div className="my-4 p-3 rounded-lg bg-surface-raised flex items-center justify-between">
        <div>
          <div className="text-[11px] text-text-muted">
            {showNetPrice ? 'Net Realized (After Freight)' : 'Modal Mandi Price'}
          </div>
          <div className="flex items-baseline space-x-1.5 font-mono-data mt-0.5">
            <span className="text-2xl font-bold text-text-main">
              ₹{(showNetPrice ? netRealizedPrice : modalPrice).toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-text-muted">/ quintal</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowNetPrice(!showNetPrice)}
          className="text-xs font-mono text-accent hover:underline flex items-center space-x-1 px-2 py-1 rounded bg-border/60 border border-border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
        >
          <Truck className="w-3 h-3" />
          <span>{showNetPrice ? 'Show Gross' : 'Deduct Freight (-₹75)'}</span>
        </button>
      </div>

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
