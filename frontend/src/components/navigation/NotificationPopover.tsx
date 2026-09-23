import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  CheckCheck,
  X,
  TrendingUp,
  ShoppingBag,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole, ROLE_CONFIGS } from '@/config/navigation';

export interface DemoNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  category: 'market' | 'quality' | 'order' | 'governance' | 'task';
}

const DEFAULT_NOTIFICATIONS: Record<UserRole, DemoNotification[]> = {
  farmer: [
    {
      id: 'n-farm-1',
      title: 'MSP Rate Update',
      message: 'Mandi price for Sharbati Wheat updated to ₹2,450/qtl in Bhopal Mandi (+₹75/qtl).',
      time: '10m ago',
      unread: true,
      category: 'market',
    },
    {
      id: 'n-farm-2',
      title: 'Quality Verification Complete',
      message: 'Field Agent Anita approved your 35 Qtl Soybean batch with Grade-A certification.',
      time: '1h ago',
      unread: true,
      category: 'quality',
    },
    {
      id: 'n-farm-3',
      title: 'Buyer Purchase Offer',
      message: 'AgroPure Foods submitted a purchase intent for Lot #WM-204 at ₹2,500/qtl.',
      time: '3h ago',
      unread: false,
      category: 'order',
    },
    {
      id: 'n-farm-4',
      title: 'Weather Advisory',
      message: 'Moderate rain forecast for your district over next 36 hours. Ensure harvested crops are sheltered.',
      time: '1d ago',
      unread: false,
      category: 'market',
    },
  ],
  buyer: [
    {
      id: 'n-buy-1',
      title: 'Certified Lot Available',
      message: '45 MT Geotagged Organic Wheat from Narmada Valley FPO is ready for procurement.',
      time: '15m ago',
      unread: true,
      category: 'order',
    },
    {
      id: 'n-buy-2',
      title: 'Trust Ledger Settlement',
      message: 'Smart contract escrow released for Contract #KC-892 after mandi weight verification.',
      time: '2h ago',
      unread: true,
      category: 'governance',
    },
    {
      id: 'n-buy-3',
      title: 'Price Movement Alert',
      message: 'Mustard seed mandi index dropped 1.8% in Western Rajasthan cluster.',
      time: '5h ago',
      unread: false,
      category: 'market',
    },
    {
      id: 'n-buy-4',
      title: 'Quality Assurance Update',
      message: 'Lab test results verified for Mustard Seed lot #MS-108 (Moisture: 7.2%).',
      time: '1d ago',
      unread: false,
      category: 'quality',
    },
  ],
  fpo: [
    {
      id: 'n-fpo-1',
      title: 'Batch Aggregation Milestone',
      message: '18 farmer members pooled 62 MT Maize, achieving target volume for institutional buyer.',
      time: '20m ago',
      unread: true,
      category: 'order',
    },
    {
      id: 'n-fpo-2',
      title: 'Payout Dispatched',
      message: 'Direct bank transfer of ₹6,20,000 initiated for 14 member farmers across Cluster B.',
      time: '2h ago',
      unread: true,
      category: 'governance',
    },
    {
      id: 'n-fpo-3',
      title: 'Procurement Bid Received',
      message: 'Adani Agri Logistics placed a bulk procurement inquiry for 200 MT Grade-1 Wheat.',
      time: '4h ago',
      unread: false,
      category: 'order',
    },
    {
      id: 'n-fpo-4',
      title: 'Warehouse Allocation',
      message: 'Warehouse Block C reserved at Central Cold Storage for perishable produce.',
      time: '1d ago',
      unread: false,
      category: 'market',
    },
  ],
  'field-agent': [
    {
      id: 'n-fa-1',
      title: 'New Farm Verification Task',
      message: 'Farm visit assigned: Geotag & verify 3.5 acres of Soybean for Farmer Ramesh Patil (Dhar).',
      time: '5m ago',
      unread: true,
      category: 'task',
    },
    {
      id: 'n-fa-2',
      title: 'Soil Test Sample Delivered',
      message: 'Sample #ST-442 received by Sehore District Soil Testing Laboratory. Report expected in 24h.',
      time: '1h ago',
      unread: true,
      category: 'quality',
    },
    {
      id: 'n-fa-3',
      title: 'Farmer Callback Request',
      message: 'Farmer Dinesh Kumar requested inspection rescheduled to 4:00 PM today.',
      time: '3h ago',
      unread: false,
      category: 'task',
    },
    {
      id: 'n-fa-4',
      title: 'Route Optimization',
      message: 'Updated inspection route ready: 4 pending farm visits sequenced for lowest travel time.',
      time: '1d ago',
      unread: false,
      category: 'task',
    },
  ],
  admin: [
    {
      id: 'n-adm-1',
      title: 'Governance Node Check',
      message: 'All 5 Trust Ledger validator nodes operational with zero consensus discrepancies.',
      time: '30m ago',
      unread: true,
      category: 'governance',
    },
    {
      id: 'n-adm-2',
      title: 'Price Anomaly Flagged',
      message: '14% intraday deviation flagged in Indore Potato mandi. Audit log recorded.',
      time: '2h ago',
      unread: true,
      category: 'market',
    },
    {
      id: 'n-adm-3',
      title: 'FPO Onboarding Review',
      message: 'Malwa Kisan Producer Company documents submitted for KYC and mandi license check.',
      time: '4h ago',
      unread: false,
      category: 'governance',
    },
    {
      id: 'n-adm-4',
      title: 'Automated System Snapshot',
      message: 'Market transaction snapshots & verifiable credentials archived to encrypted storage.',
      time: '1d ago',
      unread: false,
      category: 'governance',
    },
  ],
};

export interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onUnreadCountChange?: (count: number) => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  isOpen,
  onClose,
  currentRole,
  onUnreadCountChange,
}) => {
  const [notifications, setNotifications] = useState<DemoNotification[]>(
    () => DEFAULT_NOTIFICATIONS[currentRole] || DEFAULT_NOTIFICATIONS.farmer
  );
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const popoverRef = useRef<HTMLDivElement>(null);

  // Update notifications when role changes
  useEffect(() => {
    const list = DEFAULT_NOTIFICATIONS[currentRole] || DEFAULT_NOTIFICATIONS.farmer;
    setNotifications(list);
  }, [currentRole]);

  // Sync unread count with parent
  const unreadCount = notifications.filter((n) => n.unread).length;
  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
  }, [unreadCount, onUnreadCountChange]);

  // Handle Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredNotifications = filter === 'unread'
    ? notifications.filter((n) => n.unread)
    : notifications;

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unread: !item.unread } : item))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const getCategoryIcon = (category: DemoNotification['category']) => {
    switch (category) {
      case 'market':
        return <TrendingUp className="w-3.5 h-3.5 text-accent" />;
      case 'quality':
        return <ShieldCheck className="w-3.5 h-3.5 text-status-success" />;
      case 'order':
        return <ShoppingBag className="w-3.5 h-3.5 text-primary" />;
      case 'task':
        return <MapPin className="w-3.5 h-3.5 text-status-warning" />;
      case 'governance':
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-status-info" />;
    }
  };

  const palette = ROLE_CONFIGS[currentRole].palette;

  return (
    <>
      {/* Backdrop for click outside */}
      <div
        className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[0.5px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Popover Card */}
      <div
        ref={popoverRef}
        role="dialog"
        aria-label="Notifications panel"
        className={cn(
          'fixed inset-x-3 top-16 sm:absolute sm:top-full sm:right-0 sm:left-auto sm:mt-2',
          'w-auto sm:w-96 max-w-[calc(100vw-1.5rem)] sm:max-w-[calc(100vw-2rem)] rounded-xl bg-surface border border-border shadow-2xl z-50 overflow-hidden flex flex-col max-h-[82vh] animate-in fade-in zoom-in-95 duration-100'
        )}
      >
        {/* Header */}
        <div className="p-3 border-b border-border bg-surface-raised flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded-md bg-surface text-text-main border border-border">
              <Bell className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-xs sm:text-sm text-text-main tracking-tight">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span
                    className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold"
                    style={{ backgroundColor: palette.raised, color: palette.darkText }}
                  >
                    {unreadCount} new
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                title="Mark all as read"
                className="px-2 py-1 rounded text-[11px] font-medium text-text-muted hover:text-text-main hover:bg-surface transition-colors flex items-center space-x-1"
              >
                <CheckCheck className="w-3 h-3" />
                <span className="hidden xs:inline">Mark read</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close notifications"
              className="p-1 rounded-md text-text-muted hover:text-text-main hover:bg-surface transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Sub-header */}
        <div className="px-3 py-1.5 bg-surface border-b border-border flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={cn(
                'px-2 py-0.5 rounded text-[11px] font-mono transition-colors',
                filter === 'all'
                  ? 'bg-primary text-white font-semibold'
                  : 'text-text-muted hover:text-text-main'
              )}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={cn(
                'px-2 py-0.5 rounded text-[11px] font-mono transition-colors',
                filter === 'unread'
                  ? 'bg-primary text-white font-semibold'
                  : 'text-text-muted hover:text-text-main'
              )}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider hidden xs:inline">
            {ROLE_CONFIGS[currentRole].shortName} Feed
          </span>
        </div>

        {/* List of Notifications */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/60">
          {filteredNotifications.length === 0 ? (
            <div className="py-8 px-4 text-center">
              <div className="w-10 h-10 rounded-full bg-surface-raised flex items-center justify-center mx-auto mb-2 text-text-muted">
                <CheckCircle2 className="w-5 h-5 text-status-success" />
              </div>
              <p className="text-xs font-semibold text-text-main">All caught up!</p>
              <p className="text-[11px] text-text-muted mt-0.5">
                {filter === 'unread'
                  ? 'No unread notifications at this time.'
                  : 'No notifications available.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleToggleRead(notif.id)}
                className={cn(
                  'group p-3 transition-colors cursor-pointer relative flex items-start space-x-3',
                  notif.unread
                    ? 'bg-surface-raised/60 hover:bg-surface-raised'
                    : 'bg-surface hover:bg-surface-raised/40'
                )}
              >
                {/* Category Icon */}
                <div
                  className="mt-0.5 p-1.5 rounded-lg border flex-shrink-0"
                  style={{
                    backgroundColor: palette.raised,
                    borderColor: palette.border,
                  }}
                >
                  {getCategoryIcon(notif.category)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4
                      className={cn(
                        'text-xs tracking-tight truncate',
                        notif.unread ? 'font-bold text-text-main' : 'font-medium text-text-muted'
                      )}
                    >
                      {notif.title}
                    </h4>
                    <span className="text-[10px] font-mono text-text-muted whitespace-nowrap ml-2">
                      {notif.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2">
                    {notif.message}
                  </p>
                </div>

                {/* Unread dot / Dismiss button on hover */}
                <div className="flex items-center space-x-1 absolute right-2.5 top-3">
                  {notif.unread && (
                    <span
                      className="w-2 h-2 rounded-full ring-2 ring-surface"
                      style={{ backgroundColor: palette.accent }}
                      title="Unread"
                    />
                  )}
                  <button
                    type="button"
                    onClick={(e) => handleDismiss(notif.id, e)}
                    title="Dismiss"
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-text-muted hover:text-text-main transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-surface-raised/70 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
          <span className="text-[10px] font-mono">
            KrishiConnect • Live Feed
          </span>
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[10px] font-mono text-text-muted hover:text-status-error transition-colors"
            >
              Clear feed
            </button>
          )}
        </div>
      </div>
    </>
  );
};
