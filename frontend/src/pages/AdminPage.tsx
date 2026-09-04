import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { MobileStack } from '@/components/layout/MobileStack';
import { Section } from '@/components/layout/Section';
import { DashboardGrid } from '@/components/layout/DashboardGrid';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/status/StatusBadge';
import { SyncStatus } from '@/components/status/SyncStatus';
import { DataFreshness } from '@/components/status/DataFreshness';
import { StatusSteps } from '@/components/status/StatusSteps';
import { AlertBanner } from '@/components/status/AlertBanner';
import { MetricCard } from '@/components/data-display/MetricCard';
import { Table } from '@/components/data-display/Table';
import { Timeline } from '@/components/status/Timeline';
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

interface VerificationItem {
  id: string;
  buyer: string;
  business: string;
  location: string;
  kycStatus: string;
  submitted: string;
  reviewStatus: string;
}

interface LotItem {
  id: string;
  farmer: string;
  crop: string;
  quantity: string;
  grade: string;
  market: string;
  status: string;
  freshness: string;
}

interface DisputeItem {
  id: string;
  lot: string;
  issue: string;
  parties: string;
  status: string;
  priority: string;
  updated: string;
}

interface MarketItem {
  market: string;
  crop: string;
  price: string;
  source: string;
  updated: string;
  freshness: string;
}

interface AuditEvent {
  id: string;
  action: string;
  actor: string;
  target: string;
  timestamp: string;
  status: string;
}

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('/admin');

  const verifications: VerificationItem[] = [
    { id: 'KYC-901', buyer: 'Anand Agro Foods', business: 'Processor', location: 'Nashik', kycStatus: 'Level 2', submitted: '2 hrs ago', reviewStatus: 'Pending Review' },
    { id: 'KYC-902', buyer: 'Ramesh Traders', business: 'Mandi Agent', location: 'Pune', kycStatus: 'Level 1', submitted: '5 hrs ago', reviewStatus: 'Documents Required' },
    { id: 'KYC-903', buyer: 'Sunita FPO', business: 'FPO', location: 'Solapur', kycStatus: 'Level 2', submitted: '1 day ago', reviewStatus: 'Verified' },
    { id: 'KYC-904', buyer: 'AgroStar Pvt Ltd', business: 'Exporter', location: 'Mumbai', kycStatus: 'Level 1', submitted: '2 days ago', reviewStatus: 'Escalated' },
  ];

  const lots: LotItem[] = [
    { id: 'LOT-8821', farmer: 'Ramesh Patil', crop: 'Red Onion', quantity: '40 Q', grade: 'Grade A', market: 'Lasalgaon', status: 'Published', freshness: '12m ago' },
    { id: 'LOT-8820', farmer: 'Sunita Jadhav', crop: 'Tomato', quantity: '25 Q', grade: 'Grade A', market: 'Pune', status: 'Matched', freshness: '1h ago' },
    { id: 'LOT-8819', farmer: 'Arun Kulkarni', crop: 'Soybean', quantity: '60 Q', grade: 'Grade B', market: 'Solapur', status: 'Under Review', freshness: '3h ago' },
    { id: 'LOT-8818', farmer: 'Priya Deshmukh', crop: 'Wheat', quantity: '80 Q', grade: 'Grade A', market: 'Ahmednagar', status: 'Flagged', freshness: '5h ago' },
  ];

  const disputes: DisputeItem[] = [
    { id: 'DSP-701', lot: 'LOT-8815', issue: 'Quality Disagreement', parties: 'Vijay Pawar vs Anand Agro', status: 'Open', priority: 'High', updated: '2 hrs ago' },
    { id: 'DSP-700', lot: 'LOT-8812', issue: 'Short Weight', parties: 'Meena Raut vs Ramesh Traders', status: 'Escalated', priority: 'High', updated: '1 day ago' },
    { id: 'DSP-699', lot: 'LOT-8805', issue: 'Payment Delay', parties: 'FPO-104 vs AgroStar', status: 'Under Review', priority: 'Medium', updated: '2 days ago' },
  ];

  const marketData: MarketItem[] = [
    { market: 'Lasalgaon APMC', crop: 'Red Onion', price: '₹2,450/qtl', source: 'Seeded demo data', updated: '12m ago', freshness: 'Fresh' },
    { market: 'Pune APMC', crop: 'Tomato', price: '₹2,100/qtl', source: 'Seeded demo data', updated: '1h ago', freshness: 'Fresh' },
    { market: 'Solapur APMC', crop: 'Soybean', price: '₹4,100/qtl', source: 'Seeded demo data', updated: '3h ago', freshness: 'Fresh' },
    { market: 'Ahmednagar APMC', crop: 'Wheat', price: '₹2,250/qtl', source: 'Seeded demo data', updated: '5h ago', freshness: 'Fresh' },
  ];

  const auditEvents: AuditEvent[] = [
    { id: 'AUD-001', action: 'Buyer verification submitted', actor: 'System', target: 'KYC-901 Anand Agro Foods', timestamp: '2 hrs ago', status: 'Pending' },
    { id: 'AUD-002', action: 'Lot created', actor: 'Farmer', target: 'LOT-8821 Red Onion', timestamp: '4 hrs ago', status: 'Completed' },
    { id: 'AUD-003', action: 'Offer accepted', actor: 'Buyer', target: 'OFF-2043 Soybean', timestamp: '5 hrs ago', status: 'Completed' },
    { id: 'AUD-004', action: 'Dispute opened', actor: 'Farmer', target: 'DSP-701 Quality Disagreement', timestamp: '1 day ago', status: 'Open' },
    { id: 'AUD-005', action: 'Admin review completed', actor: 'Admin', target: 'KYC-903 Sunita FPO', timestamp: '2 days ago', status: 'Resolved' },
  ];

  const verificationColumns = [
    { key: 'id', header: 'KYC ID', align: 'left' as const },
    { key: 'buyer', header: 'Buyer', align: 'left' as const },
    { key: 'business', header: 'Business', align: 'left' as const },
    { key: 'location', header: 'Location', align: 'left' as const },
    { key: 'kycStatus', header: 'KYC Level', align: 'center' as const },
    { key: 'submitted', header: 'Submitted', align: 'left' as const, render: (item: VerificationItem) => <DataFreshness timestamp={item.submitted} /> },
    { key: 'reviewStatus', header: 'Review Status', align: 'center' as const, render: (item: VerificationItem) => {
      const map: Record<string, 'pending-verification' | 'warning' | 'active' | 'dispute'> = {
        'Pending Review': 'pending-verification',
        'Documents Required': 'warning',
        'Verified': 'active',
        'Escalated': 'dispute',
      };
      return <StatusBadge status={map[item.reviewStatus] || 'active'} label={item.reviewStatus} size="sm" />;
    }},
  ];

  const lotColumns = [
    { key: 'id', header: 'Lot ID', align: 'left' as const },
    { key: 'farmer', header: 'Farmer/FPO', align: 'left' as const },
    { key: 'crop', header: 'Crop', align: 'left' as const },
    { key: 'quantity', header: 'Qty', align: 'right' as const, isNumeric: true },
    { key: 'grade', header: 'Grade', align: 'center' as const },
    { key: 'market', header: 'Market', align: 'left' as const },
    { key: 'status', header: 'Status', align: 'center' as const, render: (item: LotItem) => {
      const map: Record<string, 'active' | 'trusted' | 'warning' | 'dispute'> = {
        'Published': 'active',
        'Matched': 'trusted',
        'Under Review': 'warning',
        'Flagged': 'dispute',
      };
      return <StatusBadge status={map[item.status] || 'active'} label={item.status} size="sm" />;
    }},
    { key: 'freshness', header: 'Freshness', align: 'left' as const, render: (item: LotItem) => <DataFreshness timestamp={item.freshness} /> },
  ];

  const disputeColumns = [
    { key: 'id', header: 'Dispute ID', align: 'left' as const },
    { key: 'lot', header: 'Lot/Txn', align: 'left' as const },
    { key: 'issue', header: 'Issue', align: 'left' as const },
    { key: 'parties', header: 'Parties', align: 'left' as const },
    { key: 'status', header: 'Status', align: 'center' as const, render: (item: DisputeItem) => {
      const map: Record<string, 'dispute' | 'warning' | 'active' | 'pending-verification'> = {
        'Open': 'dispute',
        'Escalated': 'warning',
        'Under Review': 'pending-verification',
        'Resolved': 'active',
      };
      return <StatusBadge status={map[item.status] || 'active'} label={item.status} size="sm" />;
    }},
    { key: 'priority', header: 'Priority', align: 'center' as const, render: (item: DisputeItem) => (
      <Badge variant={item.priority === 'High' ? 'error' : 'warning'} size="sm">{item.priority}</Badge>
    )},
    { key: 'updated', header: 'Updated', align: 'left' as const, render: (item: DisputeItem) => <DataFreshness timestamp={item.updated} /> },
  ];

  const marketColumns = [
    { key: 'market', header: 'Market', align: 'left' as const },
    { key: 'crop', header: 'Crop', align: 'left' as const },
    { key: 'price', header: 'Price', align: 'right' as const, isNumeric: true },
    { key: 'source', header: 'Source', align: 'left' as const },
    { key: 'updated', header: 'Updated', align: 'left' as const, render: (item: MarketItem) => <DataFreshness timestamp={item.updated} /> },
    { key: 'freshness', header: 'Status', align: 'center' as const, render: (item: MarketItem) => (
      <StatusBadge status={item.freshness === 'Fresh' ? 'active' : 'warning'} label={item.freshness} size="sm" />
    )},
  ];

  return (
    <AppShell forcedRole="admin" activeSubTab={activeTab} onSelectSubTab={setActiveTab}>
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

        <AlertBanner
          variant="info"
          title="Phase 1 Foundation"
          message="Admin verification workflows, audit logging, dispute resolution, and market-data monitoring will be implemented in later phases. This dashboard shows the intended shell and static data model."
        />

        <DashboardGrid columns={4}>
          <MetricCard
            label="Total Users"
            value="1,248"
            unit="Registered"
            change={{ value: '12 today', isPositive: true }}
            timestamp="Updated 5m ago"
            icon={<Users className="w-4 h-4 text-[#C4FF4D]" />}
          />
          <MetricCard
            label="Active Farmers"
            value="842"
            unit="Online"
            change={{ value: '3% vs yesterday', isPositive: true }}
            timestamp="Updated 2m ago"
            icon={<Users className="w-4 h-4 text-[#2FBF8F]" />}
          />
          <MetricCard
            label="Verified Buyers"
            value="64"
            unit="KYC Passed"
            change={{ value: '2 pending', isPositive: false }}
            timestamp="Updated 10m ago"
            icon={<FileCheck className="w-4 h-4 text-[#5B5E8C]" />}
          />
          <MetricCard
            label="Active Lots"
            value="128"
            unit="Listed"
            change={{ value: '18 today', isPositive: true }}
            timestamp="Updated 1m ago"
            icon={<Package className="w-4 h-4 text-[#F5A623]" />}
          />
          <MetricCard
            label="Active Transactions"
            value="34"
            unit="In Progress"
            change={{ value: '5 completed', isPositive: true }}
            timestamp="Updated 3m ago"
            icon={<Scale className="w-4 h-4 text-[#C4FF4D]" />}
          />
          <MetricCard
            label="Open Disputes"
            value="3"
            unit="Requires Action"
            change={{ value: '1 escalated', isPositive: false }}
            timestamp="Updated 12m ago"
            icon={<AlertTriangle className="w-4 h-4 text-[#E5484D]" />}
          />
        </DashboardGrid>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Section
              title="Buyer Verification Queue"
              description="KYC submissions awaiting admin review or escalation."
              action={
                <Button variant="ghost" size="sm">Review All</Button>
              }
            >
              <Card variant="default" padding="none">
                <Table
                  columns={verificationColumns}
                  data={verifications}
                  keyExtractor={(item) => item.id}
                  emptyMessage="No pending verifications"
                />
              </Card>
            </Section>

            <Section
              title="Active Lot Oversight"
              description="Notable lots requiring governance attention or audit."
              action={
                <Button variant="ghost" size="sm">Inspect Lots</Button>
              }
            >
              <Card variant="default" padding="none">
                <Table
                  columns={lotColumns}
                  data={lots}
                  keyExtractor={(item) => item.id}
                  emptyMessage="No lots found"
                />
              </Card>
            </Section>

            <Section
              title="Disputes"
              description="Open and escalated disputes requiring mediation or review."
              action={
                <Button variant="ghost" size="sm">Review Disputes</Button>
              }
            >
              <Card variant="default" padding="none">
                <Table
                  columns={disputeColumns}
                  data={disputes}
                  keyExtractor={(item) => item.id}
                  emptyMessage="No active disputes"
                />
              </Card>
            </Section>
          </div>

          <div className="space-y-6">
            <Card variant="raised" padding="md" className="space-y-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-[#2FBF8F]" />
                <h3 className="text-sm font-semibold text-[#EEF0FA]">Platform Health</h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#A7ABC9]">API</span>
                  <StatusBadge status="active" label="Operational" size="sm" />
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A7ABC9]">Database</span>
                  <StatusBadge status="active" label="Connected" size="sm" />
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A7ABC9]">Market Data</span>
                  <StatusBadge status="active" label="Fresh" size="sm" />
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A7ABC9]">Sync Queue</span>
                  <StatusBadge status="active" label="Normal" size="sm" />
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A7ABC9]">Notifications</span>
                  <StatusBadge status="active" label="Operational" size="sm" />
                </div>
              </div>
            </Card>

            <Section title="Market Data Freshness" description="Seeded demo data — not live government feeds.">
              <Card variant="default" padding="none">
                <Table
                  columns={marketColumns}
                  data={marketData}
                  keyExtractor={(item) => item.market}
                  emptyMessage="No market data available"
                />
              </Card>
            </Section>

            <Card variant="default" padding="md">
              <h3 className="text-sm font-semibold text-[#EEF0FA] mb-4">Transaction Lifecycle</h3>
              <StatusSteps
                steps={[
                  { id: '1', label: 'Offer Pending', sublabel: 'OFF-2044', status: 'pending' },
                  { id: '2', label: 'Accepted', sublabel: 'OFF-2043', status: 'complete' },
                  { id: '3', label: 'In Transit', sublabel: 'TXN-549', status: 'current' },
                  { id: '4', label: 'Delivered', sublabel: 'TXN-550', status: 'pending' },
                  { id: '5', label: 'Payment', sublabel: 'Pending', status: 'pending' },
                ]}
              />
            </Card>

            <Card variant="default" padding="md">
              <h3 className="text-sm font-semibold text-[#EEF0FA] mb-4">Recent Audit Activity</h3>
              <Timeline
                items={auditEvents.map((event) => ({
                  id: event.id,
                  actor: event.actor,
                  role: event.actor,
                  description: `${event.action} — ${event.target}`,
                  timestamp: event.timestamp,
                  status: event.status.toLowerCase() as 'accepted' | 'pending' | 'countered' | 'rejected',
                }))}
              />
            </Card>

            <Card variant="default" padding="md">
              <h3 className="text-sm font-semibold text-[#EEF0FA] mb-4">Quick Governance Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" size="sm" fullWidth leftIcon={<FileCheck className="w-3.5 h-3.5" />}>Review Buyers</Button>
                <Button variant="secondary" size="sm" fullWidth leftIcon={<Scale className="w-3.5 h-3.5" />}>Review Disputes</Button>
                <Button variant="secondary" size="sm" fullWidth leftIcon={<Package className="w-3.5 h-3.5" />}>Inspect Lots</Button>
                <Button variant="secondary" size="sm" fullWidth leftIcon={<ClipboardList className="w-3.5 h-3.5" />}>Review Transactions</Button>
                <Button variant="secondary" size="sm" fullWidth leftIcon={<LineChart className="w-3.5 h-3.5" />}>Check Market Data</Button>
                <Button variant="secondary" size="sm" fullWidth leftIcon={<Activity className="w-3.5 h-3.5" />}>View Audit Log</Button>
              </div>
            </Card>
          </div>
        </div>

        <Card variant="default" padding="md">
          <div className="flex items-start space-x-4">
            <Lock className="w-5 h-5 text-[#C4FF4D] mt-0.5 shrink-0" />
            <div className="space-y-1 text-sm">
              <h3 className="font-semibold text-[#EEF0FA]">Admin Security & Privacy Rules (RULES.md Section 2 & 15)</h3>
              <p className="text-[#A7ABC9] leading-relaxed">
                Admins have elevated privileges for dispute mediation and KYC approval, but may not view user payment or contact details outside an active dispute investigation. All administrative actions require an explicit audit justification that is permanently written to the ledger.
              </p>
            </div>
          </div>
        </Card>
      </MobileStack>
    </AppShell>
  );
};
