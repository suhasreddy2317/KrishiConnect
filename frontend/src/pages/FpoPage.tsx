import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { MobileStack } from '@/components/layout/MobileStack';
import { Section } from '@/components/layout/Section';
import { DashboardGrid } from '@/components/layout/DashboardGrid';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/status/StatusBadge';
import { SyncStatus } from '@/components/status/SyncStatus';
import { DataFreshness } from '@/components/status/DataFreshness';
import { AlertBanner } from '@/components/status/AlertBanner';
import { MetricCard } from '@/components/data-display/MetricCard';
import { Table } from '@/components/data-display/Table';
import { LoadingState } from '@/components/data-display/LoadingState';
import { ErrorState } from '@/components/data-display/ErrorState';
import { EmptyState } from '@/components/data-display/EmptyState';
import { Users, Layers, Building2, Coins, Plus, Activity, BarChart3, ShieldCheck } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';

interface BackendLot {
  id: number;
  crop: string;
  commodity_id: number | null;
  quantity_kg: number;
  unit: string;
  quality_grade: string;
  moisture_percent: number | null;
  harvest_date: string | null;
  location: string | null;
  expected_price_per_kg: number | null;
  status: string;
  farmer_id: number;
}

interface BackendDemand {
  id: number;
  commodity_id: number;
  required_quantity: number;
  unit: string;
  minimum_grade: string | null;
  delivery_location: string | null;
  required_by: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

interface BackendOffer {
  id: number;
  demand_id: number;
  lot_id: number;
  buyer_id: number;
  farmer_id: number;
  quantity: number;
  offered_price: number;
  pickup_window: string;
  payment_terms: string;
  message: string | null;
  status: string;
  parent_offer_id: number | null;
  round: number;
  expires_at: string;
  created_at: string;
  updated_at: string | null;
}

interface BackendPayment {
  id: number;
  transaction_id: number;
  amount: number;
  payment_method: string | null;
  status: string;
  reference: string | null;
  initiated_at: string | null;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string | null;
}

interface BackendCommodity {
  id: number;
  name: string;
  variety: string | null;
  unit: string;
  is_perishable: boolean;
  perishability_profile: string | null;
  grading_parameters: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface MemberActivity {
  name: string;
  action: string;
  time: string;
  crop: string;
}

const formatRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hr${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatExpiry = (expiresAt: string, status: string): string => {
  if (!expiresAt || status === 'accepted' || status === 'rejected' || status === 'expired') return '—';
  const exp = new Date(expiresAt);
  const now = new Date();
  const diffMs = exp.getTime() - now.getTime();
  if (diffMs <= 0) return 'Expired';
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffMins = Math.floor((diffMs % 3600000) / 60000);
  if (diffHrs >= 24) return `${Math.floor(diffHrs / 24)}d`;
  if (diffHrs >= 1) return `${diffHrs}h ${diffMins}m`;
  return `${diffMins}m`;
};

const mapLotStatus = (status: string): 'active' | 'kyc-verified' | 'completed' | 'pending-verification' | 'warning' => {
  const map: Record<string, 'active' | 'kyc-verified' | 'completed' | 'pending-verification' | 'warning'> = {
    published: 'active',
    matched: 'kyc-verified',
    sold: 'completed',
    draft: 'pending-verification',
    archived: 'warning',
  };
  return map[status] || 'pending-verification';
};

const mapDemandStatus = (status: string): 'active' | 'completed' | 'warning' | 'pending-verification' => {
  const map: Record<string, 'active' | 'completed' | 'warning' | 'pending-verification'> = {
    active: 'active',
    fulfilled: 'completed',
    expired: 'warning',
    cancelled: 'completed',
  };
  return map[status] || 'active';
};

const mapPaymentStatus = (status: string): 'active' | 'completed' | 'warning' | 'pending-verification' | 'dispute' => {
  const map: Record<string, 'active' | 'completed' | 'warning' | 'pending-verification' | 'dispute'> = {
    pending: 'pending-verification',
    initiated: 'active',
    processing: 'active',
    completed: 'completed',
    failed: 'dispute',
    cancelled: 'warning',
  };
  return map[status] || 'active';
};

export const FpoPage: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('/fpo');

  const [lotsLoading, setLotsLoading] = useState(false);
  const [lotsError, setLotsError] = useState<string | null>(null);
  const [lots, setLots] = useState<BackendLot[]>([]);

  const [demandsLoading, setDemandsLoading] = useState(false);
  const [demandsError, setDemandsError] = useState<string | null>(null);
  const [demands, setDemands] = useState<BackendDemand[]>([]);

  const [offers, setOffers] = useState<BackendOffer[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [offersError, setOffersError] = useState<string | null>(null);

  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);
  const [payments, setPayments] = useState<BackendPayment[]>([]);

  const [commodities, setCommodities] = useState<BackendCommodity[]>([]);

  const getCommodityName = (id: number): string => {
    const commodity = commodities.find(c => c.id === id);
    return commodity?.name || `Commodity #${id}`;
  };

  const fetchLots = async () => {
    if (!token) return;
    setLotsLoading(true);
    setLotsError(null);
    try {
      const data = await apiRequest<BackendLot[]>('/lots/', { method: 'GET' }, token);
      setLots(data);
    } catch (err) {
      setLotsError(err instanceof Error ? err.message : 'Failed to load lots');
    } finally {
      setLotsLoading(false);
    }
  };

  const fetchDemands = async () => {
    if (!token) return;
    setDemandsLoading(true);
    setDemandsError(null);
    try {
      const data = await apiRequest<{ items: BackendDemand[]; total: number }>('/demands/', { method: 'GET' }, token);
      setDemands(data.items);
    } catch (err) {
      setDemandsError(err instanceof Error ? err.message : 'Failed to load demands');
    } finally {
      setDemandsLoading(false);
    }
  };

  const fetchOffers = async () => {
    if (!token) return;
    setOffersLoading(true);
    setOffersError(null);
    try {
      const data = await apiRequest<{ items: BackendOffer[]; total: number }>('/offers/', { method: 'GET' }, token);
      setOffers(data.items);
    } catch (err) {
      console.error('Failed to load offers', err);
      setOffersError(err instanceof Error ? err.message : 'Failed to load offers');
      setOffers([]);
    } finally {
      setOffersLoading(false);
    }
  };

  const fetchPayments = async () => {
    if (!token) return;
    setPaymentsLoading(true);
    setPaymentsError(null);
    try {
      const data = await apiRequest<{ items: BackendPayment[]; total: number }>('/payments/', { method: 'GET' }, token);
      setPayments(data.items);
    } catch (err) {
      setPaymentsError(err instanceof Error ? err.message : 'Failed to load payments');
    } finally {
      setPaymentsLoading(false);
    }
  };

  const fetchCommodities = async () => {
    if (!token) return;
    try {
      const data = await apiRequest<BackendCommodity[]>('/commodities/', { method: 'GET' }, token);
      setCommodities(data);
    } catch (err) {
      console.error('Failed to load commodities', err);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchLots();
    fetchDemands();
    fetchOffers();
    fetchPayments();
    fetchCommodities();
  }, [token]);

  const totalLots = lots.length;
  const totalQuantityQtl = Math.round(lots.reduce((sum, lot) => sum + lot.quantity_kg, 0) / 100);
  const activeDemandsCount = demands.filter(d => d.status === 'active').length;
  const pendingOffersCount = offers.filter(o => o.status === 'submitted' || o.status === 'countered').length;

  const memberActivity: MemberActivity[] = [
    { name: 'Ramesh Patil', action: 'Deposited lot', time: '10 mins ago', crop: 'Red Onion' },
    { name: 'Sunita Jadhav', action: 'Grade confirmed', time: '1 hr ago', crop: 'Soybean' },
    { name: 'Arun Kulkarni', action: 'Withdrawal request', time: '3 hrs ago', crop: 'Wheat' },
    { name: 'Priya Deshmukh', action: 'Payment received', time: '5 hrs ago', crop: 'Tomato' },
  ];

  const lotColumns = [
    { key: 'id', header: 'Lot ID', align: 'left' as const, render: (item: BackendLot) => <span className="text-xs font-mono text-text-main">LOT-{item.id}</span> },
    { key: 'crop', header: 'Crop / Commodity', align: 'left' as const },
    { key: 'quantity', header: 'Quantity', align: 'right' as const, isNumeric: true, render: (item: BackendLot) => <span className="text-xs font-mono text-text-main">{item.quantity_kg.toLocaleString()} {item.unit}</span> },
    { key: 'grade', header: 'Grade', align: 'center' as const, render: (item: BackendLot) => <StatusBadge status="grade" label={item.quality_grade} size="sm" /> },
    { key: 'status', header: 'Status', align: 'center' as const, render: (item: BackendLot) => <StatusBadge status={mapLotStatus(item.status)} label={item.status} size="sm" /> },
    { key: 'updated', header: 'Last Updated', align: 'left' as const, render: () => <DataFreshness timestamp="Live data" isLive /> },
  ];

  const demandColumns = [
    { key: 'id', header: 'RFQ ID', align: 'left' as const, render: (item: BackendDemand) => <span className="text-xs font-mono text-text-main">RFQ-{item.id}</span> },
    { key: 'crop', header: 'Commodity', align: 'left' as const, render: (item: BackendDemand) => <span className="text-xs text-text-main">{getCommodityName(item.commodity_id)}</span> },
    { key: 'quantity', header: 'Required Qty', align: 'right' as const, isNumeric: true, render: (item: BackendDemand) => <span className="text-xs font-mono text-text-main">{item.required_quantity.toLocaleString()} {item.unit}</span> },
    { key: 'grade', header: 'Min Grade', align: 'center' as const, render: (item: BackendDemand) => <span className="text-xs text-text-main">{item.minimum_grade || '—'}</span> },
    { key: 'location', header: 'Delivery', align: 'left' as const, render: (item: BackendDemand) => <span className="text-xs text-text-muted">{item.delivery_location || '—'}</span> },
    { key: 'status', header: 'Status', align: 'center' as const, render: (item: BackendDemand) => <StatusBadge status={mapDemandStatus(item.status)} label={item.status} size="sm" /> },
    { key: 'updated', header: 'Updated', align: 'left' as const, render: (item: BackendDemand) => <DataFreshness timestamp={formatRelativeTime(item.updated_at || item.created_at)} /> },
  ];

  const offerColumns = [
    { key: 'id', header: 'Offer ID', align: 'left' as const, render: (item: BackendOffer) => <span className="text-xs font-mono text-text-main">OFF-{item.id}</span> },
    { key: 'buyer', header: 'Buyer', align: 'left' as const, render: (item: BackendOffer) => <span className="text-xs text-text-main">Buyer #{item.buyer_id}</span> },
    { key: 'quantity', header: 'Qty', align: 'right' as const, isNumeric: true, render: (item: BackendOffer) => <span className="text-xs font-mono text-text-main">{item.quantity.toLocaleString()} kg</span> },
    { key: 'price', header: 'Price', align: 'right' as const, isNumeric: true, render: (item: BackendOffer) => <span className="text-xs font-mono text-accent">₹{item.offered_price.toLocaleString()}/qtl</span> },
    { key: 'status', header: 'Status', align: 'center' as const, render: (item: BackendOffer) => {
      const map: Record<string, 'active' | 'completed' | 'warning' | 'pending-verification'> = {
        submitted: 'pending-verification',
        countered: 'warning',
        accepted: 'active',
        rejected: 'completed',
        expired: 'completed',
      };
      return <StatusBadge status={map[item.status] || 'active'} label={item.status} size="sm" />;
    }},
    { key: 'expires', header: 'Expires', align: 'left' as const, render: (item: BackendOffer) => <span className="text-xs text-text-muted">{formatExpiry(item.expires_at, item.status)}</span> },
  ];

  const paymentColumns = [
    { key: 'id', header: 'Payment ID', align: 'left' as const, render: (item: BackendPayment) => <span className="text-xs font-mono text-text-main">PAY-{item.id}</span> },
    { key: 'transaction_id', header: 'Transaction', align: 'left' as const, render: (item: BackendPayment) => <span className="text-xs text-text-muted">TXN-{item.transaction_id}</span> },
    { key: 'amount', header: 'Amount', align: 'right' as const, isNumeric: true, render: (item: BackendPayment) => <span className="text-xs font-mono text-accent">₹{item.amount.toLocaleString('en-IN')}</span> },
    { key: 'status', header: 'Status', align: 'center' as const, render: (item: BackendPayment) => <StatusBadge status={mapPaymentStatus(item.status)} label={item.status} size="sm" /> },
    { key: 'method', header: 'Method', align: 'left' as const, render: (item: BackendPayment) => <span className="text-xs text-text-muted">{item.payment_method || '—'}</span> },
    { key: 'updated', header: 'Updated', align: 'left' as const, render: (item: BackendPayment) => <DataFreshness timestamp={formatRelativeTime(item.updated_at || item.created_at)} /> },
  ];

  return (
    <AppShell forcedRole="fpo" activeSubTab={activeTab} onSelectSubTab={setActiveTab}>
      <MobileStack spacing="md">
        <PageHeader
          title="FPO Manager Hub"
          subtitle="Coordinate pooled lots, track buyer demand, and manage collective sell-side opportunities."
          roleBadge={<StatusBadge status="kyc-verified" label="FPO Verified" size="sm" />}
          statusBadge={<SyncStatus state="Synced" lastSyncedTime="5m ago" />}
          primaryAction={
            <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
              Pool New Lot
            </Button>
          }
        />

        <AlertBanner
          variant="info"
          title="Backend-Connected Dashboard"
          message="Overview metrics, pooled lots, active demands, and payout ledger are now connected to live backend APIs. Member activity and compliance sections currently show demo data because dedicated FPO/member endpoints are not yet implemented."
        />

        {activeTab === '/fpo' && (
          <>
            <DashboardGrid columns={4}>
          <MetricCard
            label="Pooled Lots"
            value={String(totalLots)}
            unit="Total"
            change={{ value: 'Live from backend', isPositive: true }}
            timestamp="Updated just now"
            icon={<Layers className="w-4 h-4 text-status-success" />}
          />
          <MetricCard
            label="Pooled Quantity"
            value={String(totalQuantityQtl)}
            unit="Quintals"
            change={{ value: 'Live from backend', isPositive: true }}
            timestamp="Updated just now"
            icon={<Activity className="w-4 h-4 text-accent" />}
          />
          <MetricCard
            label="Active Buyer Demand"
            value={String(activeDemandsCount)}
            unit="Open RFQs"
            change={{ value: 'Live from backend', isPositive: true }}
            timestamp="Updated just now"
            icon={<Building2 className="w-4 h-4 text-text-muted" />}
          />
          <MetricCard
            label="Pending Offers"
            value={String(pendingOffersCount)}
            unit="Awaiting Response"
            change={{ value: pendingOffersCount > 0 ? 'Action needed' : 'All clear', isPositive: pendingOffersCount === 0 }}
            timestamp="Updated just now"
            icon={<Coins className="w-4 h-4 text-status-warning" />}
          />
        </DashboardGrid>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Section
              title="Pooled Produce Inventory"
              description="Grade-certified bulk lots pooled from member farmers, ready for institutional buyers."
              action={
                <Button variant="ghost" size="sm">View All Lots</Button>
              }
            >
              <Card variant="default" padding="none">
                {lotsLoading ? (
                  <LoadingState message="Loading pooled lots..." />
                ) : lotsError ? (
                  <ErrorState title="Unable to load lots" message={lotsError} onRetry={fetchLots} />
                ) : lots.length === 0 ? (
                  <EmptyState icon={<Layers className="w-6 h-6" />} title="No pooled lots yet" description="Lots will appear here once farmers publish produce." />
                ) : (
                  <Table
                    columns={lotColumns}
                    data={lots}
                    keyExtractor={(item) => String(item.id)}
                    emptyMessage="No pooled lots yet"
                  />
                )}
              </Card>
            </Section>

            <Section
              title="Buyer Demand"
              description="Active procurement requirements from institutional buyers matching your pooled inventory."
              action={
                <Button variant="ghost" size="sm">Browse All RFQs</Button>
              }
            >
              <Card variant="default" padding="none">
                {demandsLoading ? (
                  <LoadingState message="Loading active demands..." />
                ) : demandsError ? (
                  <ErrorState title="Unable to load demands" message={demandsError} onRetry={fetchDemands} />
                ) : demands.length === 0 ? (
                  <EmptyState icon={<Building2 className="w-6 h-6" />} title="No active demands" description="Active procurement demands will appear here." />
                ) : (
                  <Table
                    columns={demandColumns}
                    data={demands}
                    keyExtractor={(item) => String(item.id)}
                    emptyMessage="No active demands"
                  />
                )}
              </Card>
            </Section>

            <Section
              title="Offers & Matching"
              description="Buyer offers against your pooled lots. Review pricing, quantities, and negotiate terms."
              action={
                <Button variant="ghost" size="sm">View All Offers</Button>
              }
            >
              <Card variant="default" padding="none">
                {offersLoading ? (
                  <LoadingState message="Loading offers..." />
                ) : offersError ? (
                  <ErrorState title="Unable to load offers" message={offersError} onRetry={fetchOffers} />
                ) : offers.length === 0 ? (
                  <EmptyState icon={<Coins className="w-6 h-6" />} title="No offers yet" description="Offers will appear here when buyers respond to your lots." />
                ) : (
                  <Table
                    columns={offerColumns}
                    data={offers}
                    keyExtractor={(item) => String(item.id)}
                    emptyMessage="No offers yet"
                  />
                )}
              </Card>
            </Section>
          </div>

          <div className="space-y-6">
            <Section title="Member Activity" description="Recent contributions across member farmers.">
              <Card variant="default" padding="none">
                <div className="p-3 rounded-lg bg-surface-raised border border-border/30 text-xs text-status-warning mb-3">
                  Demo data — member activity API not yet implemented
                </div>
                <div className="divide-y divide-border/60">
                  {memberActivity.map((activity, idx) => (
                    <div key={idx} className="p-4 flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border/30 flex items-center justify-center text-status-success shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-text-main truncate">{activity.name}</div>
                        <div className="text-xs text-text-muted">{activity.action} • {activity.crop}</div>
                        <DataFreshness timestamp={activity.time} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </Section>

            <Section title="Payout Ledger" description="Pro-rata distribution from accepted offers.">
              <Card variant="default" padding="none">
                {paymentsLoading ? (
                  <LoadingState message="Loading payout ledger..." />
                ) : paymentsError ? (
                  <ErrorState title="Unable to load payments" message={paymentsError} onRetry={fetchPayments} />
                ) : payments.length === 0 ? (
                  <EmptyState icon={<Coins className="w-6 h-6" />} title="No payments yet" description="Payouts will appear here once payments are recorded." />
                ) : (
                  <>
                    <div className="p-3 text-xs text-text-muted bg-surface-raised/50 border-b border-border/30">
                      Pro-rata distribution calculated from individual lot grade contributions.
                    </div>
                    <Table
                      columns={paymentColumns}
                      data={payments.slice(0, 5)}
                      keyExtractor={(item) => String(item.id)}
                      emptyMessage="No payments recorded"
                    />
                  </>
                )}
              </Card>
            </Section>
          </div>
        </div>
          </>
        )}
        
        {activeTab === '/fpo/members' && (
          <div className="space-y-6">
            <Section title="Member Activity" description="Recent contributions across member farmers.">
              <Card variant="default" padding="none">
                <div className="p-3 rounded-lg bg-surface-raised border border-border/30 text-xs text-status-warning mb-3">
                  Demo data — member activity API not yet implemented
                </div>
                <div className="divide-y divide-border/60">
                  {memberActivity.map((activity, idx) => (
                    <div key={idx} className="p-4 flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border/30 flex items-center justify-center text-status-success shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-text-main truncate">{activity.name}</div>
                        <div className="text-xs text-text-muted">{activity.action} • {activity.crop}</div>
                        <DataFreshness timestamp={activity.time} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </Section>
          </div>
        )}
        
        {activeTab === '/fpo/lots' && (
          <div className="space-y-6">
            <Section
              title="Pooled Produce Inventory"
              description="Grade-certified bulk lots pooled from member farmers, ready for institutional buyers."
              action={
                <Button variant="ghost" size="sm">View All Lots</Button>
              }
            >
              <Card variant="default" padding="none">
                {lotsLoading ? (
                  <LoadingState message="Loading pooled lots..." />
                ) : lotsError ? (
                  <ErrorState title="Unable to load lots" message={lotsError} onRetry={fetchLots} />
                ) : lots.length === 0 ? (
                  <EmptyState icon={<Layers className="w-6 h-6" />} title="No pooled lots yet" description="Lots will appear here once farmers publish produce." />
                ) : (
                  <Table
                    columns={lotColumns}
                    data={lots}
                    keyExtractor={(item) => String(item.id)}
                    emptyMessage="No pooled lots yet"
                  />
                )}
              </Card>
            </Section>
          </div>
        )}
        
        {activeTab === '/fpo/demand' && (
          <div className="space-y-6">
            <Section
              title="Buyer Demand"
              description="Active procurement requirements from institutional buyers matching your pooled inventory."
              action={
                <Button variant="ghost" size="sm">Browse All RFQs</Button>
              }
            >
              <Card variant="default" padding="none">
                {demandsLoading ? (
                  <LoadingState message="Loading active demands..." />
                ) : demandsError ? (
                  <ErrorState title="Unable to load demands" message={demandsError} onRetry={fetchDemands} />
                ) : demands.length === 0 ? (
                  <EmptyState icon={<Building2 className="w-6 h-6" />} title="No active demands" description="Active procurement demands will appear here." />
                ) : (
                  <Table
                    columns={demandColumns}
                    data={demands}
                    keyExtractor={(item) => String(item.id)}
                    emptyMessage="No active demands"
                  />
                )}
              </Card>
            </Section>
          </div>
        )}
        
        {activeTab === '/fpo/offers' && (
          <div className="space-y-6">
            <Section
              title="Offers & Matching"
              description="Buyer offers against your pooled lots. Review pricing, quantities, and negotiate terms."
              action={
                <Button variant="ghost" size="sm">View All Offers</Button>
              }
            >
              <Card variant="default" padding="none">
                {offersLoading ? (
                  <LoadingState message="Loading offers..." />
                ) : offersError ? (
                  <ErrorState title="Unable to load offers" message={offersError} onRetry={fetchOffers} />
                ) : offers.length === 0 ? (
                  <EmptyState icon={<Coins className="w-6 h-6" />} title="No offers yet" description="Offers will appear here when buyers respond to your lots." />
                ) : (
                  <Table
                    columns={offerColumns}
                    data={offers}
                    keyExtractor={(item) => String(item.id)}
                    emptyMessage="No offers yet"
                  />
                )}
              </Card>
            </Section>
          </div>
        )}
        
        {activeTab === '/fpo/transactions' && (
          <div className="space-y-6">
            <Section title="Payout Ledger" description="Pro-rata distribution from accepted offers.">
              <Card variant="default" padding="none">
                {paymentsLoading ? (
                  <LoadingState message="Loading payout ledger..." />
                ) : paymentsError ? (
                  <ErrorState title="Unable to load payments" message={paymentsError} onRetry={fetchPayments} />
                ) : payments.length === 0 ? (
                  <EmptyState icon={<Coins className="w-6 h-6" />} title="No payments yet" description="Payouts will appear here once payments are recorded." />
                ) : (
                  <>
                    <div className="p-3 text-xs text-text-muted bg-surface-raised/50 border-b border-border/30">
                      Pro-rata distribution calculated from individual lot grade contributions.
                    </div>
                    <Table
                      columns={paymentColumns}
                      data={payments.slice(0, 5)}
                      keyExtractor={(item) => String(item.id)}
                      emptyMessage="No payments recorded"
                    />
                  </>
                )}
              </Card>
            </Section>
          </div>
        )}
        
        {activeTab === '/fpo/analytics' && (
          <div className="space-y-6">
            <Card variant="default" padding="md">
              <EmptyState icon={<BarChart3 className="w-6 h-6" />} title="Analytics coming soon" description="Detailed analytics will be available in a future update." />
            </Card>
          </div>
        )}
        
        <Card variant="default" padding="md">
          <div className="flex items-start space-x-4">
            <ShieldCheck className="w-5 h-5 text-status-success mt-0.5 shrink-0" />
            <div className="space-y-2">
              <div className="text-sm font-semibold text-text-main">FPO Collective Bargaining Rules</div>
              <div className="text-xs text-text-muted leading-relaxed">
                Bulk pricing, quality standards, and delivery terms follow FPO bye-laws (RULES.md Section 6 & 7). These terms are automatically appended to all pooled-lot RFQs and member payout calculations.
              </div>
            </div>
          </div>
        </Card>
       </MobileStack>
    </AppShell>
  );
};
