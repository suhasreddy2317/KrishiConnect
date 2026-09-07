import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { MobileStack } from '@/components/layout/MobileStack';
import { Section } from '@/components/layout/Section';
import { DashboardGrid } from '@/components/layout/DashboardGrid';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/status/StatusBadge';
import { SyncStatus } from '@/components/status/SyncStatus';
import { DataFreshness } from '@/components/status/DataFreshness';
import { AlertBanner } from '@/components/status/AlertBanner';
import { MetricCard } from '@/components/data-display/MetricCard';
import { Table } from '@/components/data-display/Table';
import { LoadingState } from '@/components/data-display/LoadingState';
import { ErrorState } from '@/components/data-display/ErrorState';
import { EmptyState } from '@/components/data-display/EmptyState';
import {
  Camera,
  UserPlus,
  AlertTriangle,
  WifiOff,
  UploadCloud,
  ClipboardList,
  FileText,
  Users,
} from 'lucide-react';

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

interface BackendFarmer {
  id: number;
  name: string;
  phone: string;
  village: string | null;
  district: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  user_id: number | null;
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

const mapDisputeStatus = (status: string): 'active' | 'completed' | 'warning' | 'pending-verification' | 'dispute' => {
  const map: Record<string, 'active' | 'completed' | 'warning' | 'pending-verification' | 'dispute'> = {
    open: 'dispute',
    under_review: 'warning',
    awaiting_evidence: 'pending-verification',
    escalated: 'warning',
    resolved: 'completed',
  };
  return map[status] || 'dispute';
};

export const FieldAgentPage: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('/field-agent');

  const [lots, setLots] = useState<BackendLot[]>([]);
  const [lotsLoading, setLotsLoading] = useState(false);
  const [lotsError, setLotsError] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<BackendTransaction[]>([]);

  const [disputes, setDisputes] = useState<BackendDispute[]>([]);
  const [disputesLoading, setDisputesLoading] = useState(false);
  const [disputesError, setDisputesError] = useState<string | null>(null);

  const [offers, setOffers] = useState<BackendOffer[]>([]);

  const [isAddFarmerOpen, setIsAddFarmerOpen] = useState(false);
  const [farmerName, setFarmerName] = useState('');
  const [farmerPhone, setFarmerPhone] = useState('');
  const [farmerVillage, setFarmerVillage] = useState('');
  const [farmerErrors, setFarmerErrors] = useState<Record<string, string>>({});
  const [isSubmittingFarmer, setIsSubmittingFarmer] = useState(false);
  const [farmerSubmitError, setFarmerSubmitError] = useState<string | null>(null);

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
    try {
      const data = await apiRequest<{ items: BackendTransaction[]; total: number }>('/transactions/', { method: 'GET' }, token);
      setTransactions(data.items);
    } catch (err) {
      console.error('Failed to load transactions', err);
    }
  };

  const fetchDisputes = async () => {
    if (!token) return;
    setDisputesLoading(true);
    setDisputesError(null);
    try {
      const data = await apiRequest<{ items: BackendDispute[]; total: number }>('/disputes/', { method: 'GET' }, token);
      setDisputes(data.items);
    } catch (err) {
      setDisputesError(err instanceof Error ? err.message : 'Failed to load disputes');
    } finally {
      setDisputesLoading(false);
    }
  };

  const fetchOffers = async () => {
    if (!token) return;
    try {
      const data = await apiRequest<{ items: BackendOffer[]; total: number }>('/offers/', { method: 'GET' }, token);
      setOffers(data.items);
    } catch (err) {
      console.error('Failed to load offers', err);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchLots();
    fetchTransactions();
    fetchDisputes();
    fetchOffers();
  }, [token]);

  const lotsNeedingAssistance = lots.filter(l => l.status === 'draft' || !l.quality_grade || l.quality_grade === 'Pending');
  const openDisputes = disputes.filter(d => d.status === 'open' || d.status === 'escalated' || d.status === 'awaiting_evidence');
  const pendingOffers = offers.filter(o => o.status === 'submitted' || o.status === 'countered');

  const taskItems = [
    ...lotsNeedingAssistance.slice(0, 3).map(lot => ({
      id: `LOT-${lot.id}`,
      type: 'Lot Grading',
      farmer: `Farmer #${lot.farmer_id}`,
      location: lot.location || 'Unknown',
      priority: lot.status === 'draft' ? 'High' : 'Medium',
      time: 'Live data',
      status: 'Pending',
      backendLotId: lot.id,
    })),
    ...openDisputes.slice(0, 2).map(dispute => ({
      id: `DSP-${dispute.id}`,
      type: 'Dispute Review',
      farmer: `User #${dispute.opened_by_user_id}`,
      location: '—',
      priority: dispute.priority === 'high' ? 'High' : 'Medium',
      time: formatRelativeTime(dispute.created_at),
      status: dispute.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      backendDisputeId: dispute.id,
    })),
  ];

  const validateFarmerForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!farmerName.trim()) errors.name = 'Name is required';
    if (!farmerPhone.trim()) errors.phone = 'Phone is required';
    setFarmerErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAddFarmer = () => {
    setFarmerName('');
    setFarmerPhone('');
    setFarmerVillage('');
    setFarmerErrors({});
    setFarmerSubmitError(null);
    setIsAddFarmerOpen(true);
  };

  const handleCloseAddFarmer = () => {
    setIsAddFarmerOpen(false);
  };

  const handleAddFarmer = async () => {
    if (!validateFarmerForm() || !token) return;
    setIsSubmittingFarmer(true);
    setFarmerSubmitError(null);
    try {
      await apiRequest<BackendFarmer>('/farmers/', {
        method: 'POST',
        body: JSON.stringify({
          name: farmerName.trim(),
          phone: farmerPhone.trim(),
          village: farmerVillage.trim() || null,
        }),
      }, token);
      setIsAddFarmerOpen(false);
      setFarmerName('');
      setFarmerPhone('');
      setFarmerVillage('');
    } catch (err) {
      setFarmerSubmitError(err instanceof Error ? err.message : 'Failed to add farmer');
    } finally {
      setIsSubmittingFarmer(false);
    }
  };

  const taskColumns = [
    { key: 'id', header: 'ID', align: 'left' as const, render: (item: any) => <span className="text-xs font-mono text-text-main">{item.id}</span> },
    { key: 'type', header: 'Type', align: 'left' as const },
    { key: 'farmer', header: 'Farmer / Opened By', align: 'left' as const },
    { key: 'location', header: 'Location', align: 'left' as const },
    { key: 'priority', header: 'Priority', align: 'center' as const, render: (item: any) => (
      <Badge variant={item.priority === 'High' ? 'error' : item.priority === 'Medium' ? 'warning' : 'default'} size="sm">{item.priority}</Badge>
    )},
    { key: 'time', header: 'Time', align: 'left' as const, render: (item: any) => <DataFreshness timestamp={item.time} /> },
    { key: 'status', header: 'Status', align: 'center' as const, render: (item: any) => (
      <StatusBadge status={item.status === 'Pending' || item.status.includes('Pending') ? 'pending-verification' : item.status === 'Open' || item.status.includes('Open') || item.status.includes('Under Review') ? 'dispute' : 'warning'} label={item.status} size="sm" />
    )},
  ];

  const lotColumns = [
    { key: 'id', header: 'Lot ID', align: 'left' as const, render: (item: BackendLot) => <span className="text-xs font-mono text-text-main">LOT-{item.id}</span> },
    { key: 'crop', header: 'Crop', align: 'left' as const },
    { key: 'quantity', header: 'Quantity', align: 'right' as const, isNumeric: true, render: (item: BackendLot) => <span className="text-xs font-mono text-text-main">{item.quantity_kg.toLocaleString()} {item.unit}</span> },
    { key: 'grade', header: 'Grade', align: 'center' as const, render: (item: BackendLot) => <StatusBadge status="grade" label={item.quality_grade || 'Pending'} size="sm" /> },
    { key: 'status', header: 'Status', align: 'center' as const, render: (item: BackendLot) => <StatusBadge status={mapLotStatus(item.status)} label={item.status} size="sm" /> },
    { key: 'location', header: 'Location', align: 'left' as const, render: (item: BackendLot) => <span className="text-xs text-text-muted">{item.location || '—'}</span> },
    { key: 'updated', header: 'Updated', align: 'left' as const, render: () => <DataFreshness timestamp="Live data" isLive /> },
  ];

  const disputeColumns = [
    { key: 'id', header: 'Dispute ID', align: 'left' as const, render: (item: BackendDispute) => <span className="text-xs font-mono text-text-main">DSP-{item.id}</span> },
    { key: 'transaction_id', header: 'Transaction', align: 'left' as const, render: (item: BackendDispute) => <span className="text-xs text-text-muted">TXN-{item.transaction_id}</span> },
    { key: 'reason', header: 'Reason', align: 'left' as const },
    { key: 'priority', header: 'Priority', align: 'center' as const, render: (item: BackendDispute) => (
      <span className="text-xs text-text-muted capitalize">{item.priority}</span>
    )},
    { key: 'status', header: 'Status', align: 'center' as const, render: (item: BackendDispute) => (
      <StatusBadge status={mapDisputeStatus(item.status)} label={item.status.replace(/_/g, ' ')} size="sm" />
    )},
    { key: 'created_at', header: 'Opened', align: 'left' as const, render: (item: BackendDispute) => <DataFreshness timestamp={formatRelativeTime(item.created_at)} /> },
  ];

  return (
    <AppShell forcedRole="field-agent" activeSubTab={activeTab} onSelectSubTab={setActiveTab}>
      <MobileStack spacing="md">
        <PageHeader
          title="Field Agent Workspace"
          subtitle="In-field farmer onboarding, produce verification, lot grading, and dispute mediation support."
          roleBadge={<StatusBadge status="active" label="Agent Mode" size="sm" />}
          statusBadge={<SyncStatus state="Synced" lastSyncedTime="2m ago" />}
          primaryAction={
            <Button variant="primary" size="md" leftIcon={<UserPlus className="w-4 h-4" />} onClick={handleOpenAddFarmer}>
              Add Farmer
            </Button>
          }
        />

        <AlertBanner
          variant="info"
          title="Backend-Connected Dashboard"
          message="Lots, disputes, transactions, offers, and payments are connected to live backend APIs. Assigned farmers and member activity sections are demo-only because the backend does not yet expose list/search endpoints for farmers."
        />

        <DashboardGrid columns={4}>
          <MetricCard
            label="Lots Needing Assistance"
            value={String(lotsNeedingAssistance.length || lots.length)}
            unit={lotsNeedingAssistance.length > 0 ? 'Need Action' : 'Total'}
            change={{ value: lotsNeedingAssistance.length > 0 ? `${lotsNeedingAssistance.length} need grading` : 'Live from backend', isPositive: lotsNeedingAssistance.length === 0 }}
            timestamp="Updated just now"
            icon={<Camera className="w-4 h-4 text-status-success" />}
          />
          <MetricCard
            label="Open Disputes"
            value={String(openDisputes.length)}
            unit="Active"
            change={{ value: openDisputes.length > 0 ? 'Requires review' : 'No active disputes', isPositive: openDisputes.length === 0 }}
            timestamp="Updated just now"
            icon={<AlertTriangle className="w-4 h-4 text-status-error" />}
          />
          <MetricCard
            label="Pending Offers"
            value={String(pendingOffers.length)}
            unit="Awaiting Response"
            change={{ value: pendingOffers.length > 0 ? 'Needs attention' : 'No pending offers', isPositive: pendingOffers.length === 0 }}
            timestamp="Updated just now"
            icon={<FileText className="w-4 h-4 text-status-warning" />}
          />
          <MetricCard
            label="Transactions"
            value={String(transactions.length)}
            unit="Total"
            change={{ value: 'Live from backend', isPositive: true }}
            timestamp="Updated just now"
            icon={<ClipboardList className="w-4 h-4 text-accent" />}
          />
        </DashboardGrid>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Section
              title="Today's Tasks"
              description="Actionable items derived from lots, disputes, and transactions requiring field attention."
              action={
                <Button variant="ghost" size="sm">Refresh Tasks</Button>
              }
            >
              <Card variant="default" padding="none">
                {taskItems.length === 0 ? (
                  <EmptyState icon={<ClipboardList className="w-6 h-6" />} title="No tasks" description="All lots and disputes are in good standing." />
                ) : (
                  <Table
                    columns={taskColumns}
                    data={taskItems}
                    keyExtractor={(item) => item.id}
                    emptyMessage="No tasks assigned"
                  />
                )}
              </Card>
            </Section>

            <Section
              title="Lots Requiring Assistance"
              description="All lots from backend. Draft or incomplete lots may need field-agent grading or evidence capture."
              action={
                <Button variant="ghost" size="sm" onClick={fetchLots}>Refresh Lots</Button>
              }
            >
              <Card variant="default" padding="none">
                {lotsLoading ? (
                  <LoadingState message="Loading lots..." />
                ) : lotsError ? (
                  <ErrorState title="Unable to load lots" message={lotsError} onRetry={fetchLots} />
                ) : lots.length === 0 ? (
                  <EmptyState icon={<Camera className="w-6 h-6" />} title="No lots yet" description="Lots will appear here once farmers publish produce." />
                ) : (
                  <Table
                    columns={lotColumns}
                    data={lots}
                    keyExtractor={(item) => String(item.id)}
                    emptyMessage="No lots found"
                  />
                )}
              </Card>
            </Section>

            <Section
              title="Disputes"
              description="All disputes visible to field agents. Update status or add evidence where authorized."
              action={
                <Button variant="ghost" size="sm" onClick={fetchDisputes}>Refresh Disputes</Button>
              }
            >
              <Card variant="default" padding="none">
                {disputesLoading ? (
                  <LoadingState message="Loading disputes..." />
                ) : disputesError ? (
                  <ErrorState title="Unable to load disputes" message={disputesError} onRetry={fetchDisputes} />
                ) : disputes.length === 0 ? (
                  <EmptyState icon={<AlertTriangle className="w-6 h-6" />} title="No disputes" description="Disputes will appear here when opened by buyers or farmers." />
                ) : (
                  <Table
                    columns={disputeColumns}
                    data={disputes}
                    keyExtractor={(item) => String(item.id)}
                    emptyMessage="No disputes"
                  />
                )}
              </Card>
            </Section>
          </div>

          <div className="space-y-6">
            <Card variant="raised" padding="md" className="space-y-4">
              <div className="flex items-center space-x-2">
                <WifiOff className="w-4 h-4 text-status-warning" />
                <h3 className="text-sm font-semibold text-text-main">Field Mode Sync</h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted">Status</span>
                  <StatusBadge status="active" label="Online" size="sm" />
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Synced Records</span>
                  <span className="text-text-main font-mono">{lots.length + transactions.length + disputes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Pending Upload</span>
                  <span className="text-status-warning font-mono">{lotsNeedingAssistance.length} lot{lotsNeedingAssistance.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Last Synced</span>
                  <DataFreshness timestamp="2m ago" />
                </div>
              </div>
              <div className="pt-2 space-y-2">
                <Button variant="secondary" size="sm" fullWidth leftIcon={<UploadCloud className="w-3.5 h-3.5" />}>
                  Sync Now
                </Button>
                <Button variant="ghost" size="sm" fullWidth leftIcon={<WifiOff className="w-3.5 h-3.5" />}>
                  Go Offline
                </Button>
              </div>
            </Card>

            <Section title="Assigned Farmers" description="Farmers under your assistance queue.">
              <Card variant="default" padding="none">
                <div className="p-3 rounded-lg bg-surface-raised border border-border text-xs text-status-warning mb-3">
                  Demo data — farmer list/search API not yet implemented
                </div>
                <div className="divide-y divide-border">
                  {[
                    { name: 'Ramesh Patil', village: 'Nashik', crop: 'Red Onion', status: 'Assigned' },
                    { name: 'Sunita Jadhav', village: 'Pune', crop: 'Soybean', status: 'Assigned' },
                    { name: 'Arun Kulkarni', village: 'Solapur', crop: 'Wheat', status: 'Pending Review' },
                  ].map((farmer, idx) => (
                    <div key={idx} className="p-4 flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-status-success shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-text-main truncate">{farmer.name}</div>
                        <div className="text-xs text-text-muted">{farmer.village} • {farmer.crop}</div>
                        <StatusBadge status={farmer.status === 'Assigned' ? 'active' : 'pending-verification'} label={farmer.status} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </Section>

            <Card variant="default" padding="md" className="space-y-4">
              <h3 className="text-sm font-semibold text-text-main">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" size="sm" fullWidth leftIcon={<UserPlus className="w-3.5 h-3.5" />} onClick={handleOpenAddFarmer}>
                  Add Farmer
                </Button>
                <Button variant="secondary" size="sm" fullWidth leftIcon={<Camera className="w-3.5 h-3.5" />}>
                  Capture Evidence
                </Button>
                <Button variant="secondary" size="sm" fullWidth leftIcon={<ClipboardList className="w-3.5 h-3.5" />}>
                  Review Task
                </Button>
                <Button variant="secondary" size="sm" fullWidth leftIcon={<AlertTriangle className="w-3.5 h-3.5" />}>
                  Report Issue
                </Button>
              </div>
              <p className="text-[10px] text-text-muted leading-relaxed">
                Only &quot;Add Farmer&quot; is wired to the backend. Other actions require additional endpoints not yet implemented.
              </p>
            </Card>
          </div>
        </div>
      </MobileStack>

      <Dialog isOpen={isAddFarmerOpen} onClose={handleCloseAddFarmer} title="Add Farmer" description="Register a new farmer profile under your assistance queue." maxWidth="sm" footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={handleCloseAddFarmer} disabled={isSubmittingFarmer}>Cancel</Button>
          <Button variant="primary" onClick={handleAddFarmer} disabled={isSubmittingFarmer}>Add Farmer</Button>
        </div>
      }>
        <div className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Ramesh Patil"
            error={farmerErrors.name}
            value={farmerName}
            onChange={(e) => setFarmerName(e.target.value)}
          />
          <Input
            label="Phone Number"
            placeholder="e.g. 9876543210"
            error={farmerErrors.phone}
            value={farmerPhone}
            onChange={(e) => setFarmerPhone(e.target.value)}
          />
          <Input
            label="Village"
            placeholder="e.g. Nashik"
            error={farmerErrors.village}
            value={farmerVillage}
            onChange={(e) => setFarmerVillage(e.target.value)}
          />
          {farmerSubmitError && (
            <div className="rounded-md bg-status-error/10 border border-border p-3 text-xs text-status-error">
              {farmerSubmitError}
            </div>
          )}
        </div>
      </Dialog>
    </AppShell>
  );
};
