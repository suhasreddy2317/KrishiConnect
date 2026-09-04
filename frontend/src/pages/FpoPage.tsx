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
import { MetricCard } from '@/components/data-display/MetricCard';
import { Table } from '@/components/data-display/Table';
import { AlertBanner } from '@/components/status/AlertBanner';
import { Users, Layers, Building2, Coins, Plus, Activity, Info } from 'lucide-react';

interface PooledLot {
  id: string;
  crop: string;
  quantity: string;
  grade: string;
  members: number;
  status: string;
  updated: string;
}

interface MemberActivity {
  name: string;
  action: string;
  time: string;
  crop: string;
}

export const FpoPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('/fpo');

  const pooledLots: PooledLot[] = [
    { id: 'FPO-PL-1041', crop: 'Red Onion', quantity: '120 Quintals', grade: 'Grade A', members: 8, status: 'available', updated: '2 hrs ago' },
    { id: 'FPO-PL-1040', crop: 'Soybean', quantity: '85 Quintals', grade: 'Grade B', members: 5, status: 'matched', updated: '5 hrs ago' },
    { id: 'FPO-PL-1039', crop: 'Wheat', quantity: '200 Quintals', grade: 'Grade A', members: 12, status: 'available', updated: '1 day ago' },
    { id: 'FPO-PL-1038', crop: 'Tomato', quantity: '45 Quintals', grade: 'Grade A', members: 3, status: 'sold', updated: '2 days ago' },
  ];

  const memberActivity: MemberActivity[] = [
    { name: 'Ramesh Patil', action: 'Deposited lot', time: '10 mins ago', crop: 'Red Onion' },
    { name: 'Sunita Jadhav', action: 'Grade confirmed', time: '1 hr ago', crop: 'Soybean' },
    { name: 'Arun Kulkarni', action: 'Withdrawal request', time: '3 hrs ago', crop: 'Wheat' },
    { name: 'Priya Deshmukh', action: 'Payment received', time: '5 hrs ago', crop: 'Tomato' },
  ];

  const lotColumns = [
    { key: 'id', header: 'Lot ID', align: 'left' as const },
    { key: 'crop', header: 'Crop', align: 'left' as const },
    { key: 'quantity', header: 'Quantity', align: 'right' as const, isNumeric: true },
    { key: 'grade', header: 'Grade', align: 'center' as const },
    { key: 'members', header: 'Members', align: 'center' as const, isNumeric: true },
    { key: 'status', header: 'Status', align: 'center' as const, render: (item: PooledLot) => (
      <StatusBadge status={item.status === 'available' ? 'active' : item.status === 'matched' ? 'kyc-verified' : 'completed'} label={item.status} size="sm" />
    )},
    { key: 'updated', header: 'Updated', align: 'left' as const, render: (item: PooledLot) => <DataFreshness timestamp={item.updated} /> },
  ];

  return (
    <AppShell forcedRole="fpo" activeSubTab={activeTab} onSelectSubTab={setActiveTab}>
      <MobileStack spacing="md">
        <PageHeader
          title="FPO Manager Hub"
          subtitle="Aggregate member harvests into bulk pooled lots to command institutional pricing leverage."
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
          title="Phase 1 Foundation"
          message="FPO pooling, demand matching, and payout distribution business logic will be implemented in Phase 3. This dashboard shows the intended shell and data model."
        />

        <DashboardGrid columns={4}>
          <MetricCard
            label="Pooled Lots"
            value="12"
            unit="Active"
            change={{ value: '3 this week', isPositive: true }}
            timestamp="Updated 2m ago"
            icon={<Layers className="w-4 h-4 text-[#2FBF8F]" />}
          />
          <MetricCard
            label="Total Quantity"
            value="450"
            unit="Quintals"
            change={{ value: '18% vs last cycle', isPositive: true }}
            timestamp="Updated 5m ago"
            icon={<Activity className="w-4 h-4 text-[#C4FF4D]" />}
          />
          <MetricCard
            label="Active Demand"
            value="7"
            unit="Open RFQs"
            change={{ value: '2 new', isPositive: true }}
            timestamp="Updated 1m ago"
            icon={<Building2 className="w-4 h-4 text-[#5B5E8C]" />}
          />
          <MetricCard
            label="Pending Offers"
            value="4"
            unit="Awaiting Response"
            change={{ value: '1 expired', isPositive: false }}
            timestamp="Updated 12m ago"
            icon={<Coins className="w-4 h-4 text-[#F5A623]" />}
          />
        </DashboardGrid>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Section
              title="Recent Pooled Lots"
              description="Grade-certified bulk lots available for institutional buyers."
              action={
                <Button variant="ghost" size="sm">View All Lots</Button>
              }
            >
              <Card variant="default" padding="none">
                <Table
                  columns={lotColumns}
                  data={pooledLots}
                  keyExtractor={(item) => item.id}
                  emptyMessage="No pooled lots yet"
                />
              </Card>
            </Section>

            <Section
              title="Active Demand"
              description="Institutional procurement requirements matching your pooled inventory."
              action={
                <Button variant="ghost" size="sm">Post New RFQ</Button>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card variant="raised" padding="md" className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="lime" size="sm">Wheat</Badge>
                    <DataFreshness timestamp="1 hr ago" source="Buyer Direct" />
                  </div>
                  <div className="text-xs text-[#A7ABC9] space-y-1">
                    <div className="flex justify-between"><span>Quantity:</span><span className="text-[#EEF0FA] font-mono">200 Quintals</span></div>
                    <div className="flex justify-between"><span>Grade:</span><span className="text-[#EEF0FA]">Grade A</span></div>
                    <div className="flex justify-between"><span>Delivery:</span><span className="text-[#EEF0FA]">Within 10 days</span></div>
                  </div>
                  <Button variant="secondary" size="sm" fullWidth>Match Pooled Lot</Button>
                </Card>
                <Card variant="raised" padding="md" className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="default" size="sm">Soybean</Badge>
                    <DataFreshness timestamp="3 hrs ago" source="Processor RFQ" />
                  </div>
                  <div className="text-xs text-[#A7ABC9] space-y-1">
                    <div className="flex justify-between"><span>Quantity:</span><span className="text-[#EEF0FA] font-mono">100 Quintals</span></div>
                    <div className="flex justify-between"><span>Grade:</span><span className="text-[#EEF0FA]">Grade B+</span></div>
                    <div className="flex justify-between"><span>Delivery:</span><span className="text-[#EEF0FA]">Within 14 days</span></div>
                  </div>
                  <Button variant="secondary" size="sm" fullWidth>Match Pooled Lot</Button>
                </Card>
              </div>
            </Section>
          </div>

          <div className="space-y-6">
            <Section title="Member Activity" description="Recent contributions across member farmers.">
              <Card variant="default" padding="none">
                <div className="divide-y divide-[#2C2B73]/60">
                  {memberActivity.map((activity, idx) => (
                    <div key={idx} className="p-4 flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-[#1D1F3D] border border-[#5B5E8C]/30 flex items-center justify-center text-[#2FBF8F] shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-[#EEF0FA] truncate">{activity.name}</div>
                        <div className="text-xs text-[#A7ABC9]">{activity.action} • {activity.crop}</div>
                        <DataFreshness timestamp={activity.time} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </Section>

            <Card variant="raised" padding="md" className="space-y-3">
              <div className="flex items-center space-x-2">
                <Coins className="w-4 h-4 text-[#C4FF4D]" />
                <h3 className="text-sm font-semibold text-[#EEF0FA]">Payout Ledger</h3>
              </div>
              <p className="text-xs text-[#A7ABC9] leading-relaxed">
                Pro-rata distribution calculated from individual lot grade contributions. Next payout cycle: 3 days.
              </p>
              <div className="pt-2 space-y-2 text-xs font-mono">
                <div className="flex justify-between border-b border-[#2C2B73]/50 pb-2">
                  <span className="text-[#A7ABC9]">Cycle</span>
                  <span className="text-[#EEF0FA]">#FPO-2026-09</span>
                </div>
                <div className="flex justify-between border-b border-[#2C2B73]/50 pb-2">
                  <span className="text-[#A7ABC9]">Amount</span>
                  <span className="text-[#C4FF4D] font-bold">₹4,32,000</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-[#A7ABC9]">Members</span>
                  <span className="text-[#EEF0FA]">28 Pending</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <Card variant="default" padding="md">
          <div className="flex items-start space-x-4">
            <Info className="w-5 h-5 text-[#2FBF8F] mt-0.5 shrink-0" />
            <div className="space-y-1 text-sm">
              <h3 className="font-semibold text-[#EEF0FA]">FPO Collective Bargaining Rules (RULES.md Section 6 & 7)</h3>
              <p className="text-[#A7ABC9] leading-relaxed">
                Each contributing member lot maintains a cryptographic and database reference in the pooled master lot. When a bulk offer is accepted, the FPO manager signs on behalf of the collective, and payment milestones trigger automated individual distribution allocations.
              </p>
            </div>
          </div>
        </Card>
      </MobileStack>
    </AppShell>
  );
};
