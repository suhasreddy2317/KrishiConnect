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
      return 0.9;
    case 'completed':
      return 1.0;
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

function evalCubicBezier(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  t: number
) {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  return {
    x:
      mt2 * mt * p0.x +
      3 * mt2 * t * p1.x +
      3 * mt * t2 * p2.x +
      t2 * t * p3.x,
    y:
      mt2 * mt * p0.y +
      3 * mt2 * t * p1.y +
      3 * mt * t2 * p2.y +
      t2 * t * p3.y,
  };
}

function evalCubicBezierDerivative(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  t: number
) {
  const mt = 1 - t;
  return {
    x: 3 * mt * mt * (p1.x - p0.x) + 6 * mt * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x),
    y: 3 * mt * mt * (p1.y - p0.y) + 6 * mt * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y),
  };
}

type Point = { x: number; y: number };

const routeSegments = [
  {
    start: { x: 35, y: 155 } as Point,
    cp1: { x: 35, y: 100 } as Point,
    cp2: { x: 88, y: 80 } as Point,
    end: { x: 158, y: 80 } as Point,
  },
  {
    start: { x: 158, y: 80 } as Point,
    cp1: { x: 228, y: 80 } as Point,
    cp2: { x: 298, y: 55 } as Point,
    end: { x: 333, y: 65 } as Point,
  },
  {
    start: { x: 333, y: 65 } as Point,
    cp1: { x: 369, y: 75 } as Point,
    cp2: { x: 439, y: 100 } as Point,
    end: { x: 465, y: 155 } as Point,
  },
];

const pathStr = `M 35 155 C 35 100, 88 80, 158 80 C 228 80, 298 55, 333 65 C 369 75, 439 100, 465 155`;

function getPositionOnRoute(t: number): Point {
  const segCount = routeSegments.length;
  const clampedT = Math.max(0, Math.min(1, t));
  const segFloat = clampedT * segCount;
  const segIdx = Math.min(Math.floor(segFloat), segCount - 1);
  const localT = segFloat - segIdx;
  const seg = routeSegments[segIdx];
  return evalCubicBezier(seg.start, seg.cp1, seg.cp2, seg.end, localT);
}

function getTangentOnRoute(t: number): Point {
  const segCount = routeSegments.length;
  const clampedT = Math.max(0, Math.min(1, t));
  const segFloat = clampedT * segCount;
  const segIdx = Math.min(Math.floor(segFloat), segCount - 1);
  const localT = segFloat - segIdx;
  const seg = routeSegments[segIdx];
  return evalCubicBezierDerivative(seg.start, seg.cp1, seg.cp2, seg.end, localT);
}

function getVehiclePositionOnRoute(t: number) {
  const pos = getPositionOnRoute(t);
  const deriv = getTangentOnRoute(t);
  const angle = Math.atan2(deriv.y, deriv.x) * (180 / Math.PI);
  return { ...pos, angle };
}

function getWaypointPositions(): Point[] {
  return [0.33, 0.5, 0.67].map((t) => getPositionOnRoute(t));
}

function getPinPath(cx: number, cy: number, size: number): string {
  return `M ${cx} ${cy + size} C ${cx - size * 0.4} ${cy + size * 0.7}, ${cx - size * 0.8} ${cy - size * 0.2}, ${cx - size * 0.8} ${cy - size * 0.6} C ${cx - size * 0.8} ${cy - size * 1.2}, ${cx - size * 0.4} ${cy - size * 1.4}, ${cx} ${cy - size * 1.4} C ${cx + size * 0.4} ${cy - size * 1.4}, ${cx + size * 0.8} ${cy - size * 1.2}, ${cx + size * 0.8} ${cy - size * 0.6} C ${cx + size * 0.8} ${cy - size * 0.2}, ${cx + size * 0.4} ${cy + size * 0.7}, ${cx} ${cy + size} Z`;
}

export const ShipmentMap: React.FC<ShipmentMapProps> = ({ shipment, className }) => {
  const statusConfig = getStatusConfig(shipment.status);
  const vehiclePos = getVehiclePosition(shipment.status);
  const isDisputed = shipment.status === 'disputed';
  const isPaymentPending = shipment.status === 'payment_pending';
  const isComplete = shipment.status === 'completed' || shipment.status === 'delivered';

  const mapWidth = 500;
  const mapHeight = 210;
  const pickupX = 35;
  const destX = 465;
  const pickupY = 155;
  const destY = 155;

  const vehicleOnRoute = getVehiclePositionOnRoute(vehiclePos);
  const vehicleX = vehicleOnRoute.x;
  const vehicleY = vehicleOnRoute.y;
  const vehicleAngle = vehicleOnRoute.angle;
  const waypoints = getWaypointPositions();

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

      <div className="px-4 py-3 flex justify-center">
        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="w-auto h-auto"
          style={{ maxHeight: '280px', maxWidth: '100%', display: 'block' }}
        >
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill={statusConfig.routeColor} />
            </marker>
          </defs>

          <g opacity="0.35">
            <path
              d="M 35 175 Q 120 168 220 175 Q 320 182 420 175 L 420 205 L 35 205 Z"
              fill="#EBF2E5"
              stroke="#C8D4BB"
              strokeWidth="0.5"
              opacity="0.3"
            />
            <path
              d="M 220 170 Q 320 163 420 170 L 420 205 L 220 205 Z"
              fill="#F3EBE0"
              stroke="#D0C4B0"
              strokeWidth="0.5"
              opacity="0.25"
            />
            <path
              d="M 35 165 Q 120 158 220 165 L 220 185 L 35 185 Z"
              fill="#EBF2E5"
              stroke="#C8D4BB"
              strokeWidth="0.5"
              opacity="0.15"
            />
          </g>

          <g opacity="0.07">
            <circle cx="100" cy="188" r="4" fill="#8BA873" />
            <path
              d="M100 185 L100 181 M97 188 L93 188 M103 188 L107 188"
              stroke="#8BA873"
              strokeWidth="0.8"
            />
            <circle cx="320" cy="192" r="3.5" fill="#8BA873" />
            <path
              d="M320 189 L320 185 M317 192 L313 192 M323 192 L327 192"
              stroke="#8BA873"
              strokeWidth="0.8"
            />
            <circle cx="380" cy="186" r="3" fill="#8BA873" />
            <path
              d="M380 183 L380 179 M377 186 L373 186 M383 186 L387 186"
              stroke="#8BA873"
              strokeWidth="0.8"
            />
          </g>

          <g opacity="0.05" stroke="#B0B8A0" strokeWidth="0.5" fill="none">
            <line x1="130" y1="170" x2="130" y2="200" />
            <line x1="250" y1="170" x2="250" y2="200" />
            <line x1="360" y1="170" x2="360" y2="200" />
            <line x1="35" y1="180" x2="420" y2="180" />
            <line x1="35" y1="190" x2="420" y2="190" />
          </g>

          <path
            d={pathStr}
            fill="none"
            stroke="#6B7258"
            strokeWidth="14"
            strokeLinecap="round"
            opacity="0.07"
          />

          <path
            d={pathStr}
            fill="none"
            stroke="#9BA888"
            strokeWidth="10"
            strokeLinecap="round"
            opacity="0.85"
          />

          {statusConfig.routeDash !== 'none' && (
            <path
              d={pathStr}
              fill="none"
              stroke="#7B9B80"
              strokeWidth="3"
              strokeDasharray={statusConfig.routeDash}
              strokeLinecap="round"
              opacity="0.5"
            />
          )}

          <path
            d={pathStr}
            fill="none"
            stroke={statusConfig.routeColor}
            strokeWidth="10"
            pathLength="100"
            strokeDasharray={`${vehiclePos * 100} 100`}
            strokeLinecap="round"
            opacity={isDisputed ? 0.75 : 0.8}
          />

          <path
            d={pathStr}
            fill="none"
            stroke="#C5CCBA"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.35"
          />

          <path
            d={pathStr}
            fill="none"
            stroke="#E8E8E0"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            strokeLinecap="round"
            opacity="0.6"
          />

          {waypoints.map((wp, i) => (
            <g key={i} transform={`translate(${wp.x}, ${wp.y})`}>
              <circle cx="0" cy="0" r="2" fill="#8BA888" opacity="0.55" />
              <circle cx="0" cy="0" r="3.5" fill="none" stroke="#8BA888" strokeWidth="0.5" opacity="0.25" />
            </g>
          ))}

          <g transform={`translate(${pickupX}, ${pickupY})`}>
            <path
              d={getPinPath(0, 0, 8)}
              fill={statusConfig.pickupColor}
              opacity="0.9"
            />
            <circle cx="0" cy="-2.5" r="1.8" fill="white" opacity="0.9" />
            <text
              x="0"
              y="20"
              textAnchor="middle"
              fill="#6B7280"
              style={{ fontSize: '7px', fontWeight: 'bold', letterSpacing: '0.5px', fontFamily: 'IBM Plex Sans, sans-serif' }}
            >
              PICKUP
            </text>
          </g>

          <g transform={`translate(${destX}, ${destY})`}>
            <path
              d={getPinPath(0, 0, 8)}
              fill={statusConfig.destColor}
              opacity="0.9"
            />
            <circle cx="0" cy="-2.5" r="1.8" fill="white" opacity="0.9" />
            <text
              x="0"
              y="20"
              textAnchor="middle"
              fill="#6B7280"
              style={{ fontSize: '7px', fontWeight: 'bold', letterSpacing: '0.5px', fontFamily: 'IBM Plex Sans, sans-serif' }}
            >
              DESTINATION
            </text>
          </g>

          <g transform={`translate(${vehicleX}, ${vehicleY}) rotate(${vehicleAngle})`}>
            <ellipse cx="0" cy="7" rx="11" ry="2.2" fill="#000" opacity="0.08" />

            <rect x="-10" y="-8" width="10" height="10" rx="1" fill="#F5F5F5" stroke="#D0D0D0" strokeWidth="0.3" />
            <line x1="-7" y1="-4" x2="-7" y2="1.5" stroke="#C0C0C0" strokeWidth="0.5" />
            <rect x="-9" y="-2" width="3" height="2" rx="0.3" fill="#E0E0E0" opacity="0.7" />
            <rect x="-5" y="-1" width="4" height="2.5" rx="0.6" fill="#7EB8DA" opacity="0.9" />

            <rect x="0" y="-7.5" width="10" height="10.5" rx="1.8" fill="#1E293B" />

            <rect x="2" y="-7" width="5" height="4.5" rx="0.9" fill="#7EB8DA" opacity="0.9" />
            <rect x="3.5" y="-5.5" width="2" height="2" rx="0.3" fill="white" opacity="0.15" />

            <rect x="-12" y="2" width="6" height="1.2" rx="0.6" fill="#888" />

            <circle cx="8" cy="-1.5" r="1" fill="#E8C170" />
            <ellipse cx="6" cy="-1.5" rx="3" ry="1.2" fill="#E8C170" opacity="0.08" />

            <rect x="-10" y="-2.5" width="1.5" height="1.5" rx="0.3" fill="#CC3333" opacity="0.85" />

            <circle cx="-4" cy="5" r="2.2" fill="#2A2A2A" />
            <circle cx="-4" cy="5" r="0.8" fill="#666" />
            <circle cx="4" cy="5" r="2.2" fill="#2A2A2A" />
            <circle cx="4" cy="5" r="0.8" fill="#666" />
          </g>

          {isDisputed && (
            <g transform={`translate(${vehicleX}, ${vehicleY - 28})`}>
              <polygon points="0,0 12,10 0,20" fill="#B91C1C" opacity="0.9" />
              <text x="6" y="15" textAnchor="middle" fill="#fff" style={{ fontSize: '8px', fontWeight: 'bold' }}>!</text>
            </g>
          )}

          {isPaymentPending && (
            <g transform={`translate(${vehicleX}, ${vehicleY - 30})`}>
              <rect x="0" y="0" width="14" height="14" rx="4" fill="#B45309" opacity="0.9" />
              <text x="7" y="11" textAnchor="middle" fill="#fff" style={{ fontSize: '9px', fontWeight: 'bold' }}>₹</text>
            </g>
          )}

          <text
            x={pickupX}
            y={pickupY + 34}
            textAnchor="middle"
            fill="#374151"
            style={{ fontSize: '8px', fontFamily: 'IBM Plex Mono, monospace' }}
          >
            {formatLocation(shipment.pickup_location)}
          </text>

          <text
            x={destX}
            y={destY + 34}
            textAnchor="middle"
            fill="#374151"
            style={{ fontSize: '8px', fontFamily: 'IBM Plex Mono, monospace' }}
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
