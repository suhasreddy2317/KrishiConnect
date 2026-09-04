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
import { ScoreBar } from '@/components/data-display/ScoreBar';
import { Building2, Send, ShieldCheck, Activity, Search } from 'lucide-react';

interface Demand {
  id: string;
  crop: string;
  quantity: string;
  grade: string;
  location: string;
  requiredBy: string;
  status: string;
  updated: string;
}

interface Lot {
  id: string;
  crop: string;
  grade: string;
  quantity: string;
  location: string;
  price: string;
  freshness: string;
  matchStatus: string;
}

interface MatchLot {
  crop: string;
  grade: string;
  quantity: string;
  location: string;
  distance: string;
  freshness: string;
  matchScore: number;
}

interface Offer {
  id: string;
  lotId: string;
  crop: string;
  price: string;
  quantity: string;
  status: string;
  expiry: string;
  updated: string;
}

export const BuyerPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('/buyer');

  const demands: Demand[] = [
    { id: 'RFQ-301', crop: 'Red Onion', quantity: '100 Quintals', grade: 'Grade A', location: 'Nashik APMC', requiredBy: 'Sep 10, 2026', status: 'Open', updated: '2 hrs ago' },
    { id: 'RFQ-302', crop: 'Soybean', quantity: '50 Quintals', grade: 'Grade B+', location: 'Pune', requiredBy: 'Sep 12, 2026', status: 'Open', updated: '5 hrs ago' },
    { id: 'RFQ-303', crop: 'Wheat', quantity: '200 Quintals', grade: 'Grade A', location: 'Nagpur', requiredBy: 'Sep 15, 2026', status: 'Matched', updated: '1 day ago' },
  ];

  const availableLots: Lot[] = [
    { id: 'LOT-8821', crop: 'Red Onion', grade: 'Grade A', quantity: '40 Q', location: 'Nashik, 18 km', price: '₹2,480/qtl', freshness: '12m ago', matchStatus: 'Strong Match' },
    { id: 'LOT-8820', crop: 'Tomato', grade: 'Grade A', quantity: '25 Q', location: 'Pune, 34 km', price: '₹2,100/qtl', freshness: '1h ago', matchStatus: 'Partial Match' },
    { id: 'LOT-8819', crop: 'Soybean', grade: 'Grade B', quantity: '60 Q', location: 'Solapur, 52 km', price: '₹4,100/qtl', freshness: '3h ago', matchStatus: 'Review' },
    { id: 'LOT-8818', crop: 'Wheat', grade: 'Grade A', quantity: '80 Q', location: 'Ahmednagar, 45 km', price: '₹2,250/qtl', freshness: '5h ago', matchStatus: 'Strong Match' },
  ];

  const matchedLots: MatchLot[] = [
    { crop: 'Red Onion', grade: 'Grade A', quantity: '40 Q', location: 'Nashik', distance: '18 km', freshness: '12m ago', matchScore: 92 },
    { crop: 'Wheat', grade: 'Grade A', quantity: '80 Q', location: 'Ahmednagar', distance: '45 km', freshness: '5h ago', matchScore: 87 },
    { crop: 'Soybean', grade: 'Grade B', quantity: '60 Q', location: 'Solapur', distance: '52 km', freshness: '3h ago', matchScore: 74 },
  ];

  const offers: Offer[] = [
    { id: 'OFF-2044', lotId: 'LOT-8821', crop: 'Red Onion', price: '₹2,480/qtl', quantity: '40 Q', status: 'pending', expiry: '28 hrs', updated: '2 hrs ago' },
    { id: 'OFF-2043', lotId: 'LOT-8819', crop: 'Soybean', price: '₹4,200/qtl', quantity: '60 Q', status: 'accepted', expiry: '—', updated: '5 hrs ago' },
    { id: 'OFF-2042', lotId: 'LOT-8820', crop: 'Tomato', price: '₹2,100/qtl', quantity: '25 Q', status: 'countered', expiry: '18 hrs', updated: '1 day ago' },
  ];

  const demandColumns = [
    { key: 'id', header: 'RFQ ID', align: 'left' as const },
    { key: 'crop', header: 'Crop', align: 'left' as const },
    { key: 'quantity', header: 'Quantity', align: 'right' as const, isNumeric: true },
    { key: 'grade', header: 'Grade', align: 'center' as const },
    { key: 'location', header: 'Location', align: 'left' as const },
    { key: 'requiredBy', header: 'Required By', align: 'left' as const },
    { key: 'status', header: 'Status', align: 'center' as const, render: (item: Demand) => (
      <StatusBadge status={item.status === 'Open' ? 'active' : 'kyc-verified'} label={item.status} size="sm" />
    )},
    { key: 'updated', header: 'Updated', align: 'left' as const, render: (item: Demand) => <DataFreshness timestamp={item.updated} /> },
  ];

  const lotColumns = [
    { key: 'id', header: 'Lot ID', align: 'left' as const },
    { key: 'crop', header: 'Crop', align: 'left' as const },
    { key: 'grade', header: 'Grade', align: 'center' as const },
    { key: 'quantity', header: 'Qty', align: 'right' as const, isNumeric: true },
    { key: 'location', header: 'Location', align: 'left' as const },
    { key: 'price', header: 'Price', align: 'right' as const, isNumeric: true },
    { key: 'freshness', header: 'Freshness', align: 'left' as const, render: (item: Lot) => <DataFreshness timestamp={item.freshness} /> },
    { key: 'matchStatus', header: 'Match', align: 'center' as const, render: (item: Lot) => (
      <StatusBadge status={item.matchStatus === 'Strong Match' ? 'trusted' : item.matchStatus === 'Partial Match' ? 'warning' : 'pending-verification'} label={item.matchStatus} size="sm" />
    )},
  ];

  const offerColumns = [
    { key: 'id', header: 'Offer ID', align: 'left' as const },
    { key: 'lotId', header: 'Lot', align: 'left' as const },
    { key: 'crop', header: 'Crop', align: 'left' as const },
    { key: 'price', header: 'Price', align: 'right' as const, isNumeric: true },
    { key: 'quantity', header: 'Qty', align: 'center' as const },
    { key: 'status', header: 'Status', align: 'center' as const, render: (item: Offer) => {
      const map: Record<string, 'active' | 'completed' | 'warning' | 'pending-verification'> = { pending: 'pending-verification', accepted: 'active', countered: 'warning', rejected: 'completed' };
      return <StatusBadge status={map[item.status] || 'active'} label={item.status} size="sm" />;
    }},
    { key: 'expiry', header: 'Expiry', align: 'center' as const },
    { key: 'updated', header: 'Updated', align: 'left' as const, render: (item: Offer) => <DataFreshness timestamp={item.updated} /> },
  ];

  return (
    <AppShell forcedRole="buyer" activeSubTab={activeTab} onSelectSubTab={setActiveTab}>
      <MobileStack spacing="md">
        <PageHeader
          title="Buyer Procurement"
          subtitle="Source verified-quality commodities at scale with trust-verified sellers and transparent pricing."
          roleBadge={<StatusBadge status="kyc-verified" label="Buyer KYC 2" size="sm" />}
          statusBadge={<SyncStatus state="Synced" lastSyncedTime="2m ago" />}
          primaryAction={
            <Button variant="primary" size="md" leftIcon={<Send className="w-4 h-4" />}>
              Post Demand RFQ
            </Button>
          }
        />

        <AlertBanner
          variant="info"
          title="Phase 1 Foundation"
          message="Buyer demand posting, lot matching, offer negotiation, and transaction business logic will be implemented in later phases. This dashboard shows the intended shell and static data model."
        />

        <DashboardGrid columns={4}>
          <MetricCard
            label="Active Demands"
            value="7"
            unit="Open RFQs"
            change={{ value: '2 new today', isPositive: true }}
            timestamp="Updated 1m ago"
            icon={<Send className="w-4 h-4 text-[#C4FF4D]" />}
          />
          <MetricCard
            label="Available Lots"
            value="24"
            unit="Listed"
            change={{ value: '5 new today', isPositive: true }}
            timestamp="Updated 3m ago"
            icon={<Building2 className="w-4 h-4 text-[#5B5E8C]" />}
          />
          <MetricCard
            label="Matched Lots"
            value="5"
            unit="Strong Fit"
            change={{ value: '92% avg match', isPositive: true }}
            timestamp="Updated 5m ago"
            icon={<Search className="w-4 h-4 text-[#2FBF8F]" />}
          />
          <MetricCard
            label="Pending Offers"
            value="3"
            unit="Awaiting Response"
            change={{ value: '1 countered', isPositive: false }}
            timestamp="Updated 12m ago"
            icon={<Activity className="w-4 h-4 text-[#F5A623]" />}
          />
        </DashboardGrid>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Section
              title="Active Procurement Demands"
              description="Open RFQs requiring verified-quality produce within defined timelines."
              action={
                <Button variant="ghost" size="sm">Post New RFQ</Button>
              }
            >
              <Card variant="default" padding="none">
                <Table
                  columns={demandColumns}
                  data={demands}
                  keyExtractor={(item) => item.id}
                  emptyMessage="No active demands"
                />
              </Card>
            </Section>

            <Section
              title="Available Lots"
              description="Verified farmer and FPO lots available for immediate procurement."
              action={
                <Button variant="ghost" size="sm">Filter Lots</Button>
              }
            >
              <Card variant="default" padding="none">
                <Table
                  columns={lotColumns}
                  data={availableLots}
                  keyExtractor={(item) => item.id}
                  emptyMessage="No lots available"
                />
              </Card>
            </Section>

            <Section
              title="Active Offers"
              description="Structured offers with locking expiry and negotiation history."
              action={
                <Button variant="ghost" size="sm">Review All</Button>
              }
            >
              <Card variant="default" padding="none">
                <Table
                  columns={offerColumns}
                  data={offers}
                  keyExtractor={(item) => item.id}
                  emptyMessage="No active offers"
                />
              </Card>
            </Section>
          </div>

          <div className="space-y-6">
            <Section title="Match Radar" description="Top lots matching your active procurement profile.">
              <div className="space-y-4">
                {matchedLots.map((match, idx) => (
                  <Card key={idx} variant="raised" padding="md" className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="lime" size="sm">{match.crop}</Badge>
                      <DataFreshness timestamp={match.freshness} />
                    </div>
                    <div className="text-xs text-[#A7ABC9] space-y-1">
                      <div className="flex justify-between"><span>Grade:</span><span className="text-[#EEF0FA]">{match.grade}</span></div>
                      <div className="flex justify-between"><span>Quantity:</span><span className="text-[#EEF0FA] font-mono">{match.quantity}</span></div>
                      <div className="flex justify-between"><span>Location:</span><span className="text-[#EEF0FA]">{match.location} ({match.distance})</span></div>
                    </div>
                    <ScoreBar value={match.matchScore} label="Match Score" />
                    <Button variant="secondary" size="sm" fullWidth>Review Lot</Button>
                  </Card>
                ))}
              </div>
            </Section>

            <Card variant="raised" padding="md" className="space-y-4">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#2FBF8F]" />
                <h3 className="text-sm font-semibold text-[#EEF0FA]">Buyer Confidence</h3>
              </div>
              <ScoreBar value={94} label="Overall Confidence" />
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#A7ABC9]">KYC Status</span>
                  <StatusBadge status="kyc-verified" label="Level 2 Verified" size="sm" />
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A7ABC9]">Payment History</span>
                  <span className="text-[#2FBF8F] font-medium">100% On-Time</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A7ABC9]">Seller Rating</span>
                  <span className="text-[#EEF0FA] font-medium">4.8 / 5.0</span>
                </div>
              </div>
            </Card>

            <Card variant="default" padding="md">
              <h3 className="text-sm font-semibold text-[#EEF0FA] mb-4">Transaction Overview</h3>
              <StatusSteps
                steps={[
                  { id: '1', label: 'Awaiting', sublabel: 'TXN-551 Onion', status: 'pending' },
                  { id: '2', label: 'Confirmed', sublabel: 'TXN-550 Soybean', status: 'complete' },
                  { id: '3', label: 'Logistics', sublabel: 'TXN-549 Wheat', status: 'current' },
                ]}
              />
            </Card>
          </div>
        </div>
      </MobileStack>
    </AppShell>
  );
};
