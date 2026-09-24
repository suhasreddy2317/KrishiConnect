import React from 'react';
import { Truck } from 'lucide-react';
import { StatusBadge } from '@/components/status/StatusBadge';
import { cn } from '@/lib/utils';

export interface BackendShipment {
  id: number;
  transaction_id: number;
  pickup_location: string;
  delivery_location: string;
  transporter_name: string | null;
  vehicle_number: string | null;
  estimated_pickup: string | null;
  estimated_delivery: string | null;
  actual_pickup: string | null;
  actual_delivery: string | null;
  status: string;
  created_at: string;
  updated_at: string | null;
}

interface ShipmentMapProps {
  shipment: BackendShipment;
  className?: string;
}

function getVehiclePosition(status: string): number {
  switch (status) {
    case 'pending':
    case 'confirmed':
      return 0.1;
    case 'dispatched':
      return 0.22;
    case 'in_transit':
      return 0.5;
    case 'delivered':
      return 0.85;
    case 'payment_pending':
      return 0.85;
    case 'completed':
      return 0.85;
    case 'disputed':
      return 0.5;
    default:
      return 0.5;
  }
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'pending':
    case 'confirmed':
      return {
        label: 'Awaiting Dispatch',
        routeColor: '#7B9B80',
        routeDash: '8 5',
        vehicleColor: '#B45309',
        vehicleBg: 'rgba(180,83,9,0.2)',
        pickupColor: '#B45309',
        destColor: '#065F46',
        bgTint: '#F5F9F2',
        borderTint: 'rgba(180,83,9,0.3)',
      };
    case 'dispatched':
      return {
        label: 'Dispatched',
        routeColor: '#15803D',
        routeDash: 'none',
        vehicleColor: '#14532D',
        vehicleBg: 'rgba(20,83,45,0.2)',
        pickupColor: '#15803D',
        destColor: '#064E3B',
        bgTint: '#F2F8F1',
        borderTint: 'rgba(21,128,61,0.3)',
      };
    case 'in_transit':
      return {
        label: 'In Transit',
        routeColor: '#15803D',
        routeDash: 'none',
        vehicleColor: '#14532D',
        vehicleBg: 'rgba(20,83,45,0.2)',
        pickupColor: '#15803D',
        destColor: '#064E3B',
        bgTint: '#F2F8F1',
        borderTint: 'rgba(21,128,61,0.3)',
      };
    case 'delivered':
      return {
        label: 'Delivered',
        routeColor: '#15803D',
        routeDash: 'none',
        vehicleColor: '#14532D',
        vehicleBg: 'rgba(20,83,45,0.2)',
        pickupColor: '#15803D',
        destColor: '#064E3B',
        bgTint: '#F2F8F1',
        borderTint: 'rgba(21,128,61,0.3)',
      };
    case 'payment_pending':
      return {
        label: 'Payment Pending',
        routeColor: '#15803D',
        routeDash: 'none',
        vehicleColor: '#14532D',
        vehicleBg: 'rgba(20,83,45,0.2)',
        pickupColor: '#15803D',
        destColor: '#B45309',
        bgTint: '#FDFBF5',
        borderTint: 'rgba(180,83,9,0.3)',
      };
    case 'completed':
      return {
        label: 'Completed',
        routeColor: '#15803D',
        routeDash: 'none',
        vehicleColor: '#14532D',
        vehicleBg: 'rgba(20,83,45,0.2)',
        pickupColor: '#15803D',
        destColor: '#064E3B',
        bgTint: '#F2F8F1',
        borderTint: 'rgba(21,128,61,0.3)',
      };
    case 'disputed':
      return {
        label: 'Disputed',
        routeColor: '#B91C1C',
        routeDash: '8 5',
        vehicleColor: '#991B1B',
        vehicleBg: 'rgba(153,27,27,0.2)',
        pickupColor: '#991B1B',
        destColor: '#991B1B',
        bgTint: '#FDF5F5',
        borderTint: 'rgba(153,27,27,0.3)',
      };
    default:
      return {
        label: status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        routeColor: '#7B9B80',
        routeDash: '8 5',
        vehicleColor: '#374151',
        vehicleBg: 'rgba(55,65,54,0.2)',
        pickupColor: '#374151',
        destColor: '#065F46',
        bgTint: '#F7F9F5',
        borderTint: 'rgba(55,65,54,0.3)',
      };
  }
}

export const ShipmentMap: React.FC<ShipmentMapProps> = ({ shipment, className }) => {
  const statusConfig = getStatusConfig(shipment.status);
  const vehiclePos = getVehiclePosition(shipment.status);
  const isDisputed = shipment.status === 'disputed';
  const isPaymentPending = shipment.status === 'payment_pending';
  const isComplete = shipment.status === 'completed' || shipment.status === 'delivered';

  const mapWidth = 340;
  const mapHeight = 170;
  const paddingX = 36;
  const routeY = 60;

  const pickupX = paddingX;
  const destX = mapWidth - paddingX;
  const vehicleX = paddingX + (destX - paddingX) * vehiclePos;

  const formatEta = (dateStr: string | null): string => {
    if (!dateStr) return 'ETA updating';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    if (diffMs <= 0) return 'ETA passed';
    const diffDays = Math.floor(diffMs / 86400000);
    const diffHours = Math.floor((diffMs % 86400000) / 3600000);
    if (diffDays > 0) return `${diffDays}d ${diffHours}h remaining`;
    if (diffHours > 0) return `${diffHours}h remaining`;
    const diffMins = Math.floor((diffMs % 3600000) / 60000);
    return `${diffMins}m remaining`;
  };

  const formatLocation = (loc: string, maxLen: number = 14) => {
    return loc.length > maxLen ? loc.slice(0, maxLen - 1) + '…' : loc;
  };

  return (
    <div
      className={cn('rounded-xl border overflow-hidden', className)}
      style={{
        background: statusConfig.bgTint,
        borderColor: statusConfig.borderTint,
      }}
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Truck className="w-3.5 h-3.5 text-text-main" />
          <span className="text-xs font-semibold text-text-main tracking-tight">Shipment Tracking</span>
        </div>
        <StatusBadge
          status={
            isComplete
              ? 'completed'
              : shipment.status === 'pending' || shipment.status === 'confirmed'
              ? 'pending-verification'
              : isDisputed
              ? 'dispute'
              : 'active'
          }
          label={statusConfig.label}
          size="sm"
        />
      </div>

      <div className="px-4 py-3">
        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="w-full h-auto"
          style={{ maxHeight: '180px', display: 'block' }}
        >
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill={statusConfig.routeColor} />
            </marker>
          </defs>

          <line
            x1={pickupX}
            y1={routeY}
            x2={destX}
            y2={routeY}
            stroke={statusConfig.routeColor}
            strokeWidth="2.5"
            strokeDasharray={statusConfig.routeDash}
            markerEnd={statusConfig.routeDash === 'none' ? 'url(#arrowhead)' : undefined}
            opacity="0.9"
          />

          <circle cx={pickupX} cy={routeY} r="6" fill={statusConfig.pickupColor} opacity="0.25" />
          <rect
            x={pickupX - 7}
            y={routeY - 12}
            width="14"
            height="14"
            rx="3"
            fill={statusConfig.pickupColor}
            opacity="1"
          />
          <text
            x={pickupX}
            y={routeY + 4}
            textAnchor="middle"
            fill="#fff"
            style={{ fontSize: '8px', fontWeight: 'bold', fontFamily: 'IBM Plex Sans, sans-serif' }}
          >
            F
          </text>

          <circle cx={destX} cy={routeY} r="6" fill={statusConfig.destColor} opacity="0.25" />
          <rect
            x={destX - 7}
            y={routeY - 12}
            width="14"
            height="14"
            rx="3"
            fill={statusConfig.destColor}
            opacity="1"
          />
          <text
            x={destX}
            y={routeY + 4}
            textAnchor="middle"
            fill="#fff"
            style={{ fontSize: '8px', fontWeight: 'bold', fontFamily: 'IBM Plex Sans, sans-serif' }}
          >
            B
          </text>

          <rect
            x={vehicleX - 12}
            y={routeY - 14}
            width="24"
            height="24"
            rx="12"
            fill={statusConfig.vehicleColor}
            opacity="0.25"
          />
          <g transform={`translate(${vehicleX - 7}, ${routeY - 9})`}>
            <rect x="0" y="2" width="10" height="7" rx="1.5" fill={statusConfig.vehicleColor} opacity="1" />
            <circle cx="2.5" cy="9.5" r="2" fill={statusConfig.vehicleColor} opacity="1" />
            <circle cx="7.5" cy="9.5" r="2" fill={statusConfig.vehicleColor} opacity="1" />
          </g>

          {isDisputed && (
            <g transform={`translate(${vehicleX - 6}, ${routeY - 30})`}>
              <polygon points="6,0 12,10 0,10" fill="#B91C1C" opacity="0.9" />
              <text x="6" y="7.5" textAnchor="middle" fill="#fff" style={{ fontSize: '7px', fontWeight: 'bold' }}>!</text>
            </g>
          )}

          {isPaymentPending && (
            <g transform={`translate(${vehicleX - 7}, ${routeY - 28})`}>
              <rect x="0" y="0" width="14" height="14" rx="4" fill="#B45309" opacity="0.9" />
              <text x="7" y="10" textAnchor="middle" fill="#fff" style={{ fontSize: '9px', fontWeight: 'bold' }}>₹</text>
            </g>
          )}

          <text
            x={pickupX}
            y={routeY + 26}
            textAnchor="middle"
            fill="#374151"
            style={{ fontSize: '9px', fontFamily: 'IBM Plex Mono, monospace' }}
          >
            {formatLocation(shipment.pickup_location)}
          </text>

          <text
            x={destX}
            y={routeY + 26}
            textAnchor="middle"
            fill="#374151"
            style={{ fontSize: '9px', fontFamily: 'IBM Plex Mono, monospace' }}
          >
            {formatLocation(shipment.delivery_location)}
          </text>
        </svg>
      </div>

      <div className="px-4 pb-3 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-text-muted font-mono">Shipment #{shipment.id}</span>
          <span className="text-text-muted font-mono">TXN-{shipment.transaction_id}</span>
        </div>

        {shipment.transporter_name && (
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-text-muted">Carrier</span>
            <span className="text-text-main">{shipment.transporter_name}</span>
          </div>
        )}

        {shipment.vehicle_number && (
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-text-muted">Vehicle</span>
            <span className="text-text-main font-mono">{shipment.vehicle_number}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-text-muted">ETA</span>
          <span className="text-text-main font-mono">{formatEta(shipment.estimated_delivery)}</span>
        </div>

        {shipment.estimated_delivery && (
          <div className="flex items-center justify-between text-[10px] text-text-muted">
            <span>Est. Delivery</span>
            <span>{new Date(shipment.estimated_delivery).toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  );
};
