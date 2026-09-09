import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { MobileStack } from '@/components/layout/MobileStack';
import { Section } from '@/components/layout/Section';
import { DashboardGrid } from '@/components/layout/DashboardGrid';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { StatusBadge } from '@/components/status/StatusBadge';
import { SyncStatus } from '@/components/status/SyncStatus';
import { DataFreshness } from '@/components/status/DataFreshness';
import { StatusSteps } from '@/components/status/StatusSteps';
import { AlertBanner } from '@/components/status/AlertBanner';
import { Timeline } from '@/components/status/Timeline';
import { LoadingState } from '@/components/data-display/LoadingState';
import { ErrorState } from '@/components/data-display/ErrorState';
import { EmptyState } from '@/components/data-display/EmptyState';
import { MetricCard } from '@/components/data-display/MetricCard';
import { Table } from '@/components/data-display/Table';
import { Select } from '@/components/ui/Select';
import {
  ShieldCheck,
  FileCheck,
  Scale,
  LineChart,
  Lock,
  Activity,
  Users,
  Package,
  ClipboardList,
  AlertTriangle,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';

type TabId = '/admin' | '/admin/users' | '/admin/verification' | '/admin/lots' | '/admin/transactions' | '/admin/disputes' | '/admin/market-data' | '/admin/audit-logs' | '/admin/system-health';

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

interface BackendTransaction {
  id: number;
  offer_id: number;
  lot_id: number;
  buyer_id: number;
  farmer_id: number;
  quantity: number;
  agreed_price: number;
  total_amount: number;
  status: string;
  confirmed_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string | null;
}

interface BackendDispute {
  id: number;
  transaction_id: number;
  opened_by_user_id: number;
  reason: string;
  description: string | null;
  priority: string;
  status: string;
  resolution_notes: string | null;
  resolved_by_user_id: number | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string | null;
}

interface BackendAuditLog {
  id: number;
  actor_user_id: number | null;
  action: string;
  entity_type: string;
  entity_id: number;
  details: string | null;
  created_at: string;
}

interface BackendBuyer {
  id: number;
  business_name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  business_type: string | null;
  location: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface BackendUser {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
}

interface BackendMarket {
  id: number;
  name: string;
  location: string | null;
  region: string | null;
  state: string | null;
  is_active: boolean;
}

interface TransactionListResponse {
  items: BackendTransaction[];
  total: number;
}

interface DisputeListResponse {
  items: BackendDispute[];
  total: number;
}

interface AuditLogListResponse {
  items: BackendAuditLog[];
  total: number;
}

export const AdminPage: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('/admin');

  const [lotsLoading, setLotsLoading] = useState(false);
  const [lotsError, setLotsError] = useState<string | null>(null);
  const [lots, setLots] = useState<BackendLot[]>([]);

  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<TransactionListResponse | null>(null);

  const [disputesLoading, setDisputesLoading] = useState(false);
  const [disputesError, setDisputesError] = useState<string | null>(null);
  const [disputes, setDisputes] = useState<DisputeListResponse | null>(null);

  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogListResponse | null>(null);

  const [buyersLoading, setBuyersLoading] = useState(false);
  const [buyersError, setBuyersError] = useState<string | null>(null);
  const [buyers, setBuyers] = useState<BackendBuyer[]>([]);

  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [users, setUsers] = useState<BackendUser[]>([]);

  const [commoditiesError, setCommoditiesError] = useState<string | null>(null);
  const [commodities, setCommodities] = useState<BackendCommodity[]>([]);

  const [marketsError, setMarketsError] = useState<string | null>(null);
  const [markets, setMarkets] = useState<BackendMarket[]>([]);

  const [selectedCommodityId, setSelectedCommodityId] = useState<number | null>(null);
  const [selectedMarketId, setSelectedMarketId] = useState<number | null>(null);
  const [marketHistory, setMarketHistory] = useState<MarketHistoryItem[]>([]);
  const [marketHistoryLoading, setMarketHistoryLoading] = useState(false);
  const [marketHistoryError, setMarketHistoryError] = useState<string | null>(null);

  interface MarketHistoryItem {
    date: string;
    min_price: number | null;
    max_price: number | null;
    modal_price: number | null;
    arrival_volume: number | null;
    source: string | null;
    market_name: string;
    commodity_name: string;
  }

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: '/admin', label: 'Dashboard' },
    { id: '/admin/users', label: 'Users' },
    { id: '/admin/verification', label: 'Verification', count: buyers.filter(b => b.status === 'unverified').length || undefined },
    { id: '/admin/lots', label: 'Lots', count: lots.length || undefined },
    { id: '/admin/transactions', label: 'Transactions', count: transactions?.items.length || undefined },
    { id: '/admin/disputes', label: 'Disputes', count: disputes?.items.length || undefined },
    { id: '/admin/market-data', label: 'Market Data' },
    { id: '/admin/audit-logs', label: 'Audit Logs', count: auditLogs?.items.length || undefined },
    { id: '/admin/system-health', label: 'System' },
  ];

  useEffect(() => {
    if (!token) return;
    fetchLots();
    fetchTransactions();
    fetchDisputes();
    fetchAuditLogs();
    fetchBuyers();
    fetchUsers();
    fetchCommodities();
    fetchMarkets();
  }, [token]);

  useEffect(() => {
    if (selectedCommodityId && selectedMarketId) {
      fetchMarketHistory();
    }
  }, [selectedCommodityId, selectedMarketId]);

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

  const fetchTransactions = async () => {
    if (!token) return;
    setTransactionsLoading(true);
    setTransactionsError(null);
    try {
      const data = await apiRequest<TransactionListResponse>('/transactions/', { method: 'GET' }, token);
      setTransactions(data);
    } catch (err) {
      setTransactionsError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setTransactionsLoading(false);
    }
  };

  const fetchDisputes = async () => {
    if (!token) return;
    setDisputesLoading(true);
    setDisputesError(null);
    try {
      const data = await apiRequest<DisputeListResponse>('/disputes/', { method: 'GET' }, token);
      setDisputes(data);
    } catch (err) {
      setDisputesError(err instanceof Error ? err.message : 'Failed to load disputes');
    } finally {
      setDisputesLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    if (!token) return;
    setAuditLoading(true);
    setAuditError(null);
    try {
      const data = await apiRequest<AuditLogListResponse>('/audit/', { method: 'GET' }, token);
      setAuditLogs(data);
    } catch (err) {
      setAuditError(err instanceof Error ? err.message : 'Failed to load audit logs');
    } finally {
      setAuditLoading(false);
    }
  };

  const fetchBuyers = async () => {
    if (!token) return;
    setBuyersLoading(true);
    setBuyersError(null);
    try {
      const data = await apiRequest<BackendBuyer[]>('/buyers/', { method: 'GET' }, token);
      setBuyers(data);
    } catch (err) {
      setBuyersError(err instanceof Error ? err.message : 'Failed to load buyers');
    } finally {
      setBuyersLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!token) return;
    setUsersLoading(true);
    setUsersError(null);
    try {
      const data = await apiRequest<BackendUser[]>('/users/', { method: 'GET' }, token);
      setUsers(data);
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : 'Failed to load users');
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchCommodities = async () => {
    if (!token) return;
    setCommoditiesError(null);
    try {
      const data = await apiRequest<BackendCommodity[]>('/commodities/', { method: 'GET' }, token);
      setCommodities(data);
    } catch (err) {
      setCommoditiesError(err instanceof Error ? err.message : 'Failed to load commodities');
    }
  };

  const fetchMarkets = async () => {
    if (!token) return;
    setMarketsError(null);
    try {
      const data = await apiRequest<BackendMarket[]>('/markets/', { method: 'GET' }, token);
      setMarkets(data);
    } catch (err) {
      setMarketsError(err instanceof Error ? err.message : 'Failed to load markets');
    }
  };

  const fetchMarketHistory = async () => {
    if (!token || !selectedCommodityId || !selectedMarketId) return;
    setMarketHistoryLoading(true);
    setMarketHistoryError(null);
    try {
      const data = await apiRequest<{ history: MarketHistoryItem[] }>(
        `/market-prices/history?commodity_id=${selectedCommodityId}&market_id=${selectedMarketId}&days=14`,
        { method: 'GET' },
        token
      );
      setMarketHistory(
        data.history.map((item) => ({
          ...item,
          market_name: markets.find(m => m.id === selectedMarketId)?.name || `Market #${selectedMarketId}`,
          commodity_name: commodities.find(c => c.id === selectedCommodityId)?.name || `Commodity #${selectedCommodityId}`,
        }))
      );
    } catch (err) {
      setMarketHistoryError(err instanceof Error ? err.message : 'Failed to load market price history');
      setMarketHistory([]);
    } finally {
      setMarketHistoryLoading(false);
    }
  };

  const renderDashboard = () => {
    const openDisputes = disputes?.items.filter(d => d.status === 'open' || d.status === 'escalated').length || 0;
    const pendingBuyers = buyers.filter(b => b.status === 'unverified').length;
    const activeLots = lots.filter(l => l.status === 'available' || l.status === 'published').length;
    const activeTransactions = transactions?.items.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length || 0;

    return (
      <div className="space-y-6">
        <DashboardGrid columns={4}>
          <MetricCard
            label="Total Buyers"
            value={String(buyers.length || pendingBuyers)}
            unit="Registered"
            change={{ value: `${pendingBuyers} pending review`, isPositive: pendingBuyers === 0 }}
            timestamp="Updated via API"
            icon={<Users className="w-4 h-4 text-accent" />}
          />
          <MetricCard
            label="Active Lots"
            value={String(activeLots || lots.length)}
            unit="Listed"
            change={{ value: `${lots.length} total`, isPositive: true }}
            timestamp="Updated via API"
            icon={<Package className="w-4 h-4 text-status-success" />}
          />
          <MetricCard
            label="Active Transactions"
            value={String(activeTransactions)}
            unit="In Progress"
            change={{ value: `${transactions?.items.length || 0} total`, isPositive: true }}
            timestamp="Updated via API"
            icon={<Scale className="w-4 h-4 text-text-muted" />}
          />
          <MetricCard
            label="Open Disputes"
            value={String(openDisputes)}
            unit="Requires Action"
            change={{ value: openDisputes > 0 ? 'Action needed' : 'All clear', isPositive: openDisputes === 0 }}
            timestamp="Updated via API"
            icon={<AlertTriangle className="w-4 h-4 text-status-error" />}
          />
        </DashboardGrid>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Section
              title="Buyer Verification Queue"
              description="KYC submissions awaiting admin review."
              action={
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('/admin/verification')}>Review All</Button>
              }
            >
              <Card variant="default" padding="none">
                {buyersLoading ? (
                  <LoadingState message="Loading buyers..." />
                ) : buyersError ? (
                  <ErrorState title="Unable to load buyers" message={buyersError} onRetry={fetchBuyers} />
                ) : buyers.length === 0 ? (
                  <EmptyState icon={<FileCheck className="w-6 h-6" />} title="No buyers found" description="Buyers will appear here once registered." />
                ) : (
                  <Table
                    columns={[
                      { key: 'id', header: 'ID', align: 'left' as const },
                      { key: 'business_name', header: 'Business', align: 'left' as const },
                      { key: 'business_type', header: 'Type', align: 'left' as const },
                      { key: 'location', header: 'Location', align: 'left' as const },
                      { key: 'status', header: 'Status', align: 'center' as const, render: (item: BackendBuyer) => {
                        const map: Record<string, 'pending-verification' | 'active' | 'warning' | 'dispute'> = {
                          'unverified': 'pending-verification',
                          'verified': 'active',
                          'rejected': 'warning',
                        };
                        return <StatusBadge status={map[item.status] || 'active'} label={item.status} size="sm" />;
                      }},
                      { key: 'updated_at', header: 'Updated', align: 'left' as const, render: (item: BackendBuyer) => <DataFreshness timestamp={new Date(item.updated_at).toLocaleString()} /> },
                    ]}
                    data={buyers}
                    keyExtractor={(item) => String(item.id)}
                    emptyMessage="No buyers found"
                  />
                )}
              </Card>
            </Section>

            <Section
              title="Active Lot Oversight"
              description="Platform lots requiring governance attention."
              action={
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('/admin/lots')}>Inspect Lots</Button>
              }
            >
              <Card variant="default" padding="none">
                {lotsLoading ? (
                  <LoadingState message="Loading lots..." />
                ) : lotsError ? (
                  <ErrorState title="Unable to load lots" message={lotsError} onRetry={fetchLots} />
                ) : lots.length === 0 ? (
                  <EmptyState icon={<Package className="w-6 h-6" />} title="No lots found" description="Lots will appear here once published." />
                ) : (
                  <Table
                    columns={[
                      { key: 'id', header: 'Lot ID', align: 'left' as const },
                      { key: 'crop', header: 'Crop', align: 'left' as const },
                      { key: 'quantity_kg', header: 'Qty (kg)', align: 'right' as const, isNumeric: true },
                      { key: 'quality_grade', header: 'Grade', align: 'center' as const },
                      { key: 'location', header: 'Location', align: 'left' as const },
                      { key: 'status', header: 'Status', align: 'center' as const, render: (item: BackendLot) => {
                        const map: Record<string, 'active' | 'trusted' | 'warning' | 'dispute'> = {
                          'available': 'active',
                          'published': 'active',
                          'matched': 'trusted',
                          'under_review': 'warning',
                          'flagged': 'dispute',
                        };
                        return <StatusBadge status={map[item.status] || 'active'} label={item.status} size="sm" />;
                      }},
                    ]}
                    data={lots}
                    keyExtractor={(item) => String(item.id)}
                    emptyMessage="No lots found"
                  />
                )}
              </Card>
            </Section>

            <Section
              title="Disputes"
              description="Open and escalated disputes requiring mediation."
              action={
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('/admin/disputes')}>Review Disputes</Button>
              }
            >
              <Card variant="default" padding="none">
                {disputesLoading ? (
                  <LoadingState message="Loading disputes..." />
                ) : disputesError ? (
                  <ErrorState title="Unable to load disputes" message={disputesError} onRetry={fetchDisputes} />
                ) : !disputes || disputes.items.length === 0 ? (
                  <EmptyState icon={<AlertTriangle className="w-6 h-6" />} title="No active disputes" description="Disputes will appear here once opened." />
                ) : (
                  <Table
                    columns={[
                      { key: 'id', header: 'Dispute ID', align: 'left' as const },
                      { key: 'transaction_id', header: 'Transaction', align: 'left' as const },
                      { key: 'reason', header: 'Issue', align: 'left' as const },
                      { key: 'priority', header: 'Priority', align: 'center' as const, render: (item: BackendDispute) => (
                        <Badge variant={item.priority === 'high' ? 'error' : 'warning'} size="sm">{item.priority}</Badge>
                      )},
                      { key: 'status', header: 'Status', align: 'center' as const, render: (item: BackendDispute) => {
                        const map: Record<string, 'dispute' | 'warning' | 'active' | 'pending-verification'> = {
                          'open': 'dispute',
                          'escalated': 'warning',
                          'under_review': 'pending-verification',
                          'resolved': 'active',
                        };
                        return <StatusBadge status={map[item.status] || 'active'} label={item.status} size="sm" />;
                      }},
                      { key: 'created_at', header: 'Opened', align: 'left' as const, render: (item: BackendDispute) => <DataFreshness timestamp={new Date(item.created_at).toLocaleString()} /> },
                    ]}
                    data={disputes.items}
                    keyExtractor={(item) => String(item.id)}
                    emptyMessage="No active disputes"
                  />
                )}
              </Card>
            </Section>
          </div>

          <div className="space-y-6">
            <Card variant="raised" padding="md" className="space-y-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-status-success" />
                <h3 className="text-sm font-semibold text-text-main">Platform Health</h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted">API</span>
                  <StatusBadge status="active" label="Operational" size="sm" />
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Database</span>
                  <StatusBadge status="active" label="Connected" size="sm" />
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Market Data</span>
                  <StatusBadge status="warning" label="Demo Feed" size="sm" />
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Sync Queue</span>
                  <StatusBadge status="active" label="Normal" size="sm" />
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Notifications</span>
                  <StatusBadge status="active" label="Operational" size="sm" />
                </div>
              </div>
            </Card>

            <Section title="Market Data Freshness" description="Demo data — not live government feeds. API support pending.">
              <Card variant="default" padding="none">
                <Table
                  columns={[
                    { key: 'market', header: 'Market', align: 'left' as const },
                    { key: 'crop', header: 'Crop', align: 'left' as const },
                    { key: 'price', header: 'Price', align: 'right' as const, isNumeric: true },
                    { key: 'source', header: 'Source', align: 'left' as const },
                    { key: 'updated', header: 'Updated', align: 'left' as const, render: (item: any) => <DataFreshness timestamp={item.updated} /> },
                  ]}
                  data={[]}
                  keyExtractor={(item) => item.market}
                  emptyMessage="No live market data available"
                />
              </Card>
            </Section>

            <Card variant="default" padding="md" title="Transaction Lifecycle">
              <StatusSteps
                steps={[
                  { id: '1', label: 'Offer Pending', sublabel: transactions?.items[0] ? `TXN-${transactions.items[0].id}` : '—', status: 'pending' },
                  { id: '2', label: 'Accepted', sublabel: transactions?.items[0] ? `₹${transactions.items[0].agreed_price}/qtl` : '—', status: transactions?.items.some(t => ['accepted', 'confirmed', 'dispatched', 'in_transit', 'delivered', 'payment_pending', 'completed'].includes(t.status)) ? 'complete' : 'pending' },
                  { id: '3', label: 'In Transit', sublabel: '—', status: transactions?.items.some(t => ['dispatched', 'in_transit', 'delivered', 'payment_pending', 'completed'].includes(t.status)) ? 'complete' : 'pending' },
                  { id: '4', label: 'Delivered', sublabel: '—', status: transactions?.items.some(t => ['delivered', 'payment_pending', 'completed'].includes(t.status)) ? 'complete' : 'pending' },
                  { id: '5', label: 'Payment', sublabel: '—', status: transactions?.items.some(t => t.status === 'completed') ? 'complete' : 'pending' },
                ]}
              />
            </Card>

            <Card variant="default" padding="md" title="Recent Audit Activity">
              {auditLoading ? (
                <LoadingState message="Loading audit logs..." />
              ) : auditError ? (
                <ErrorState title="Unable to load audit logs" message={auditError} onRetry={fetchAuditLogs} />
              ) : !auditLogs || auditLogs.items.length === 0 ? (
                <EmptyState icon={<ClipboardList className="w-6 h-6" />} title="No audit logs" description="Administrative actions will be recorded here." />
              ) : (
                <Timeline
                  items={auditLogs.items.slice(0, 10).map((log) => ({
                    id: String(log.id),
                    actor: log.actor_user_id ? `User #${log.actor_user_id}` : 'System',
                    role: 'admin',
                    description: `${log.action} — ${log.entity_type} #${log.entity_id}${log.details ? `: ${log.details}` : ''}`,
                    timestamp: new Date(log.created_at).toLocaleString(),
                    status: 'accepted',
                  }))}
                />
              )}
            </Card>

            <Card variant="default" padding="md" title="Quick Governance Actions">
              <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" size="sm" fullWidth leftIcon={<FileCheck className="w-3.5 h-3.5" />} onClick={() => setActiveTab('/admin/verification')}>Review Buyers</Button>
                <Button variant="secondary" size="sm" fullWidth leftIcon={<Scale className="w-3.5 h-3.5" />} onClick={() => setActiveTab('/admin/disputes')}>Review Disputes</Button>
                <Button variant="secondary" size="sm" fullWidth leftIcon={<Package className="w-3.5 h-3.5" />} onClick={() => setActiveTab('/admin/lots')}>Inspect Lots</Button>
                <Button variant="secondary" size="sm" fullWidth leftIcon={<ClipboardList className="w-3.5 h-3.5" />} onClick={() => setActiveTab('/admin/transactions')}>Review Transactions</Button>
                <Button variant="secondary" size="sm" fullWidth leftIcon={<LineChart className="w-3.5 h-3.5" />} onClick={() => setActiveTab('/admin/market-data')}>Check Market Data</Button>
                <Button variant="secondary" size="sm" fullWidth leftIcon={<Activity className="w-3.5 h-3.5" />} onClick={() => setActiveTab('/admin/audit-logs')}>View Audit Log</Button>
              </div>
            </Card>
          </div>
        </div>

        <Card variant="default" padding="md">
          <div className="flex items-start space-x-4">
            <Lock className="w-5 h-5 text-accent mt-0.5 shrink-0" />
            <div className="space-y-1 text-sm">
              <h3 className="font-semibold text-text-main">Admin Security & Privacy Rules (RULES.md Section 2 & 15)</h3>
              <p className="text-text-muted leading-relaxed">
                Admins have elevated privileges for dispute mediation and KYC approval, but may not view user payment or contact details outside an active dispute investigation. All administrative actions require an explicit audit justification that is permanently written to the ledger.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderUsersTab = () => {
    return (
      <div className="space-y-6">
        <AlertBanner variant="info" title="No dedicated users endpoint" message="There is no /api/users/ endpoint in the current backend. The Users tab UI is preserved as a placeholder. Add an admin user list endpoint to connect this section." />
        <Section title="Users" description="Platform users and role management.">
          <Card variant="default" padding="none">
            {usersLoading ? (
              <LoadingState message="Loading users..." />
            ) : usersError ? (
              <ErrorState title="Unable to load users" message={usersError} onRetry={fetchUsers} />
            ) : users.length === 0 ? (
              <EmptyState icon={<Users className="w-6 h-6" />} title="No users data" description="Connect a users API to display platform users here." />
            ) : (
              <Table
                columns={[
                  { key: 'id', header: 'ID', align: 'left' as const },
                  { key: 'name', header: 'Name', align: 'left' as const },
                  { key: 'role', header: 'Role', align: 'center' as const },
                  { key: 'phone', header: 'Phone', align: 'left' as const },
                  { key: 'is_active', header: 'Active', align: 'center' as const, render: (item: BackendUser) => (
                    <StatusBadge status={item.is_active ? 'active' : 'warning'} label={item.is_active ? 'Yes' : 'No'} size="sm" />
                  )},
                  { key: 'created_at', header: 'Created', align: 'left' as const, render: (item: BackendUser) => <DataFreshness timestamp={new Date(item.created_at).toLocaleString()} /> },
                ]}
                data={users}
                keyExtractor={(item) => String(item.id)}
                emptyMessage="No users found"
              />
            )}
          </Card>
        </Section>
      </div>
    );
  };

  const renderVerificationTab = () => {
    return (
      <div className="space-y-6">
        <AlertBanner variant="info" title="Buyer Verification Queue" message="Showing all registered buyers. The backend exposes buyer data via GET /buyers/. There is no dedicated KYC workflow endpoint yet; status updates require a backend mutation API." />
        <Section title="Buyer Verification" description="KYC submissions awaiting admin review or escalation.">
          <Card variant="default" padding="none">
            {buyersLoading ? (
              <LoadingState message="Loading buyers..." />
            ) : buyersError ? (
              <ErrorState title="Unable to load buyers" message={buyersError} onRetry={fetchBuyers} />
            ) : buyers.length === 0 ? (
              <EmptyState icon={<FileCheck className="w-6 h-6" />} title="No buyers found" description="Buyers will appear here once registered." />
            ) : (
              <Table
                columns={[
                  { key: 'id', header: 'Buyer ID', align: 'left' as const },
                  { key: 'business_name', header: 'Business', align: 'left' as const },
                  { key: 'business_type', header: 'Type', align: 'left' as const },
                  { key: 'location', header: 'Location', align: 'left' as const },
                  { key: 'status', header: 'Status', align: 'center' as const, render: (item: BackendBuyer) => {
                    const map: Record<string, 'pending-verification' | 'active' | 'warning' | 'dispute'> = {
                      'unverified': 'pending-verification',
                      'verified': 'active',
                      'rejected': 'warning',
                    };
                    return <StatusBadge status={map[item.status] || 'active'} label={item.status} size="sm" />;
                  }},
                  { key: 'updated_at', header: 'Updated', align: 'left' as const, render: (item: BackendBuyer) => <DataFreshness timestamp={new Date(item.updated_at).toLocaleString()} /> },
                ]}
                data={buyers}
                keyExtractor={(item) => String(item.id)}
                emptyMessage="No buyers found"
              />
            )}
          </Card>
        </Section>
      </div>
    );
  };

  const renderLotsTab = () => {
    return (
      <div className="space-y-6">
        <Section title="Lot Oversight" description="All platform lots visible to admin.">
          <Card variant="default" padding="none">
            {lotsLoading ? (
              <LoadingState message="Loading lots..." />
            ) : lotsError ? (
              <ErrorState title="Unable to load lots" message={lotsError} onRetry={fetchLots} />
            ) : lots.length === 0 ? (
              <EmptyState icon={<Package className="w-6 h-6" />} title="No lots found" description="Lots will appear here once published." />
            ) : (
              <Table
                columns={[
                  { key: 'id', header: 'Lot ID', align: 'left' as const },
                  { key: 'crop', header: 'Crop', align: 'left' as const },
                  { key: 'quantity_kg', header: 'Qty (kg)', align: 'right' as const, isNumeric: true },
                  { key: 'quality_grade', header: 'Grade', align: 'center' as const },
                  { key: 'location', header: 'Location', align: 'left' as const },
                  { key: 'status', header: 'Status', align: 'center' as const, render: (item: BackendLot) => {
                    const map: Record<string, 'active' | 'trusted' | 'warning' | 'dispute'> = {
                      'available': 'active',
                      'published': 'active',
                      'matched': 'trusted',
                      'under_review': 'warning',
                      'flagged': 'dispute',
                    };
                    return <StatusBadge status={map[item.status] || 'active'} label={item.status} size="sm" />;
                  }},
                  { key: 'farmer_id', header: 'Farmer ID', align: 'left' as const },
                ]}
                data={lots}
                keyExtractor={(item) => String(item.id)}
                emptyMessage="No lots found"
              />
            )}
          </Card>
        </Section>
      </div>
    );
  };

  const renderTransactionsTab = () => {
    return (
      <div className="space-y-6">
        <Section title="Transactions" description="All platform transactions visible to admin.">
          <Card variant="default" padding="none">
            {transactionsLoading ? (
              <LoadingState message="Loading transactions..." />
            ) : transactionsError ? (
              <ErrorState title="Unable to load transactions" message={transactionsError} onRetry={fetchTransactions} />
            ) : !transactions || transactions.items.length === 0 ? (
              <EmptyState icon={<Scale className="w-6 h-6" />} title="No transactions" description="Transactions will appear here once created." />
            ) : (
              <Table
                columns={[
                  { key: 'id', header: 'Txn ID', align: 'left' as const },
                  { key: 'lot_id', header: 'Lot', align: 'left' as const },
                  { key: 'buyer_id', header: 'Buyer', align: 'left' as const },
                  { key: 'farmer_id', header: 'Farmer', align: 'left' as const },
                  { key: 'quantity', header: 'Qty', align: 'right' as const, isNumeric: true },
                  { key: 'agreed_price', header: 'Price', align: 'right' as const, isNumeric: true },
                  { key: 'total_amount', header: 'Total', align: 'right' as const, isNumeric: true },
                  { key: 'status', header: 'Status', align: 'center' as const, render: (item: BackendTransaction) => (
                    <StatusBadge status={item.status === 'completed' ? 'completed' : 'active'} label={item.status} size="sm" />
                  )},
                  { key: 'created_at', header: 'Created', align: 'left' as const, render: (item: BackendTransaction) => <DataFreshness timestamp={new Date(item.created_at).toLocaleString()} /> },
                ]}
                data={transactions.items}
                keyExtractor={(item) => String(item.id)}
                emptyMessage="No transactions found"
              />
            )}
          </Card>
        </Section>
      </div>
    );
  };

  const renderDisputesTab = () => {
    return (
      <div className="space-y-6">
        <AlertBanner variant="info" title="Dispute Resolution" message="Admin can view all disputes via GET /disputes/. Status updates use PATCH /disputes/{id}/status with an admin audit trail." />
        <Section title="Disputes" description="Open and escalated disputes requiring mediation or review.">
          <Card variant="default" padding="none">
            {disputesLoading ? (
              <LoadingState message="Loading disputes..." />
            ) : disputesError ? (
              <ErrorState title="Unable to load disputes" message={disputesError} onRetry={fetchDisputes} />
            ) : !disputes || disputes.items.length === 0 ? (
              <EmptyState icon={<AlertTriangle className="w-6 h-6" />} title="No active disputes" description="Disputes will appear here once opened." />
            ) : (
              <Table
                columns={[
                  { key: 'id', header: 'Dispute ID', align: 'left' as const },
                  { key: 'transaction_id', header: 'Transaction', align: 'left' as const },
                  { key: 'reason', header: 'Issue', align: 'left' as const },
                  { key: 'priority', header: 'Priority', align: 'center' as const, render: (item: BackendDispute) => (
                    <Badge variant={item.priority === 'high' ? 'error' : 'warning'} size="sm">{item.priority}</Badge>
                  )},
                  { key: 'status', header: 'Status', align: 'center' as const, render: (item: BackendDispute) => {
                    const map: Record<string, 'dispute' | 'warning' | 'active' | 'pending-verification'> = {
                      'open': 'dispute',
                      'escalated': 'warning',
                      'under_review': 'pending-verification',
                      'resolved': 'active',
                    };
                    return <StatusBadge status={map[item.status] || 'active'} label={item.status} size="sm" />;
                  }},
                  { key: 'created_at', header: 'Opened', align: 'left' as const, render: (item: BackendDispute) => <DataFreshness timestamp={new Date(item.created_at).toLocaleString()} /> },
                ]}
                data={disputes.items}
                keyExtractor={(item) => String(item.id)}
                emptyMessage="No active disputes"
              />
            )}
          </Card>
        </Section>
      </div>
    );
  };

  const renderMarketDataTab = () => {
    const activeMarkets = markets.filter(m => m.is_active);
    const activeCommodities = commodities.filter(c => c.is_active);

    const getMarketName = (id: number) => markets.find(m => m.id === id)?.name || `Market #${id}`;
    const getCommodityName = (id: number) => commodities.find(c => c.id === id)?.name || `Commodity #${id}`;

    const enrichedHistory = marketHistory.map((item) => ({
      ...item,
      market_name: getMarketName(selectedMarketId!),
      commodity_name: getCommodityName(selectedCommodityId!),
    }));

    return (
      <div className="space-y-6">
        <AlertBanner variant="info" title="Market Data" message="Price history is fetched from GET /api/market-prices/history. Select a commodity and market to view price records." />
        <Section title="Market Price History" description="Select a commodity and market to view recent price benchmarks.">
          <Card variant="default" padding="none">
            <div className="p-4 flex flex-wrap items-end gap-4">
              <Select
                label="Commodity"
                helperText="Required"
                error={selectedCommodityId ? undefined : 'Select a commodity'}
                options={[
                  { value: '', label: 'Select commodity...', disabled: true },
                  ...activeCommodities.map(c => ({ value: String(c.id), label: `${c.name}${c.variety ? ` (${c.variety})` : ''}` })),
                ]}
                value={selectedCommodityId ? String(selectedCommodityId) : ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCommodityId(e.target.value ? Number(e.target.value) : null)}
              />
              <Select
                label="Market"
                helperText="Required"
                error={selectedMarketId ? undefined : 'Select a market'}
                options={[
                  { value: '', label: 'Select market...', disabled: true },
                  ...activeMarkets.map(m => ({ value: String(m.id), label: `${m.name}${m.location ? `, ${m.location}` : ''}` })),
                ]}
                value={selectedMarketId ? String(selectedMarketId) : ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedMarketId(e.target.value ? Number(e.target.value) : null)}
              />
              <Button variant="secondary" size="sm" leftIcon={<Activity className="w-3.5 h-3.5" />} onClick={fetchMarketHistory} disabled={!selectedCommodityId || !selectedMarketId || marketHistoryLoading}>
                Refresh
              </Button>
            </div>
            {marketsError || commoditiesError ? (
              <ErrorState title="Unable to load reference data" message={marketsError || commoditiesError || 'Failed to load markets or commodities'} onRetry={() => { fetchMarkets(); fetchCommodities(); }} />
            ) : marketHistoryLoading ? (
              <LoadingState message="Loading market price history..." />
            ) : marketHistoryError ? (
              <ErrorState title="Unable to load market data" message={marketHistoryError} onRetry={fetchMarketHistory} />
            ) : !selectedCommodityId || !selectedMarketId ? (
              <EmptyState icon={<LineChart className="w-6 h-6" />} title="Select filters" description="Choose a commodity and market above to load price history." />
            ) : enrichedHistory.length === 0 ? (
              <EmptyState icon={<LineChart className="w-6 h-6" />} title="No price history" description="No market price records found for the selected commodity and market." />
            ) : (
              <Table
                columns={[
                  { key: 'date', header: 'Date', align: 'left' as const },
                  { key: 'market_name', header: 'Market', align: 'left' as const },
                  { key: 'commodity_name', header: 'Commodity', align: 'left' as const },
                  { key: 'min_price', header: 'Min Price', align: 'right' as const, isNumeric: true },
                  { key: 'max_price', header: 'Max Price', align: 'right' as const, isNumeric: true },
                  { key: 'modal_price', header: 'Modal Price', align: 'right' as const, isNumeric: true },
                  { key: 'arrival_volume', header: 'Arrival', align: 'right' as const, isNumeric: true },
                  { key: 'source', header: 'Source', align: 'left' as const },
                  { key: 'updated', header: 'Updated', align: 'left' as const, render: (item: any) => <DataFreshness timestamp={new Date(item.date).toLocaleDateString()} /> },
                ]}
                data={enrichedHistory}
                keyExtractor={(item) => `${item.date}-${selectedMarketId}-${selectedCommodityId}-${item.market_name}-${item.commodity_name}`}
                emptyMessage="No market data available"
              />
            )}
          </Card>
        </Section>
      </div>
    );
  };

  const renderAuditLogsTab = () => {
    return (
      <div className="space-y-6">
        <AlertBanner variant="success" title="Audit Log Connected" message="Audit records are fetched from GET /api/audit/. This endpoint is admin-only and returns an append-only ledger of platform actions." />
        <Section title="Audit Timeline" description="Append-only audit log of administrative and platform actions.">
          <Card variant="default" padding="none">
            {auditLoading ? (
              <LoadingState message="Loading audit logs..." />
            ) : auditError ? (
              <ErrorState title="Unable to load audit logs" message={auditError} onRetry={fetchAuditLogs} />
            ) : !auditLogs || auditLogs.items.length === 0 ? (
              <EmptyState icon={<ClipboardList className="w-6 h-6" />} title="No audit logs" description="Administrative actions will be recorded here." />
            ) : (
              <Table
                columns={[
                  { key: 'id', header: 'Log ID', align: 'left' as const },
                  { key: 'action', header: 'Action', align: 'left' as const },
                  { key: 'entity_type', header: 'Entity Type', align: 'left' as const },
                  { key: 'entity_id', header: 'Entity ID', align: 'left' as const },
                  { key: 'details', header: 'Details', align: 'left' as const },
                  { key: 'created_at', header: 'Timestamp', align: 'left' as const, render: (item: BackendAuditLog) => <DataFreshness timestamp={new Date(item.created_at).toLocaleString()} /> },
                ]}
                data={auditLogs.items}
                keyExtractor={(item) => String(item.id)}
                emptyMessage="No audit logs found"
              />
            )}
          </Card>
        </Section>
      </div>
    );
  };

  const renderSystemHealthTab = () => {
    return (
      <div className="space-y-6">
        <AlertBanner variant="info" title="System Health" message="System health metrics are not exposed by a dedicated backend endpoint. This tab preserves the intended UI shell." />
        <Section title="System Health" description="Platform operational health and monitoring.">
          <Card variant="raised" padding="md" className="space-y-4">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted">API</span>
                <StatusBadge status="active" label="Operational" size="sm" />
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Database</span>
                <StatusBadge status="active" label="Connected" size="sm" />
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Market Data</span>
                <StatusBadge status="warning" label="Demo Feed" size="sm" />
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Sync Queue</span>
                <StatusBadge status="active" label="Normal" size="sm" />
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Notifications</span>
                <StatusBadge status="active" label="Operational" size="sm" />
              </div>
            </div>
          </Card>
        </Section>
      </div>
    );
  };

  return (
    <AppShell forcedRole="admin" activeSubTab={activeTab} onSelectSubTab={(path) => setActiveTab(path as TabId)}>
      <MobileStack spacing="md">
        <PageHeader
          title="Admin & Governance"
          subtitle="Platform oversight, verification queues, and operational health monitoring."
          roleBadge={<StatusBadge status="verified-buyer" label="Admin" size="sm" />}
          statusBadge={<SyncStatus state="Synced" lastSyncedTime="1m ago" />}
          primaryAction={
            <Button variant="primary" size="md" leftIcon={<ShieldCheck className="w-4 h-4" />}>
              Audit Action
            </Button>
          }
        />

        <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as TabId)} />

        {activeTab === '/admin' && renderDashboard()}
        {activeTab === '/admin/users' && renderUsersTab()}
        {activeTab === '/admin/verification' && renderVerificationTab()}
        {activeTab === '/admin/lots' && renderLotsTab()}
        {activeTab === '/admin/transactions' && renderTransactionsTab()}
        {activeTab === '/admin/disputes' && renderDisputesTab()}
        {activeTab === '/admin/market-data' && renderMarketDataTab()}
        {activeTab === '/admin/audit-logs' && renderAuditLogsTab()}
        {activeTab === '/admin/system-health' && renderSystemHealthTab()}
      </MobileStack>
    </AppShell>
  );
};
