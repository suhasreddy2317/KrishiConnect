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
import { AlertBanner } from '@/components/status/AlertBanner';
import { MetricCard } from '@/components/data-display/MetricCard';
import { Table } from '@/components/data-display/Table';
import {
  MapPin,
  Camera,
  UserPlus,
  AlertTriangle,
  WifiOff,
  UploadCloud,
  ClipboardList,
  ShieldCheck,
} from 'lucide-react';

interface TaskItem {
  id: string;
  type: string;
  farmer: string;
  location: string;
  priority: string;
  time: string;
  status: string;
}

interface FarmerItem {
  id: string;
  name: string;
  village: string;
  crop: string;
  activeLot: string;
  lastInteraction: string;
  status: string;
}

interface LotAssistItem {
  id: string;
  crop: string;
  farmer: string;
  quantity: string;
  grade: string;
  evidence: string;
  nextAction: string;
}

interface VerificationItem {
  id: string;
  type: string;
  subject: string;
  status: string;
  submitted: string;
  priority: string;
}

interface DisputeItem {
  id: string;
  farmer: string;
  lot: string;
  issue: string;
  status: string;
  updated: string;
}

export const FieldAgentPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('/field-agent');

  const tasks: TaskItem[] = [
    { id: 'TSK-401', type: 'Assist Lot Creation', farmer: 'Ramesh Patil', location: 'Nashik', priority: 'High', time: '09:30 AM', status: 'Pending' },
    { id: 'TSK-402', type: 'Capture Produce Photos', farmer: 'Sunita Jadhav', location: 'Pune', priority: 'Medium', time: '11:00 AM', status: 'In Progress' },
    { id: 'TSK-403', type: 'Verify Farmer Details', farmer: 'Arun Kulkarni', location: 'Solapur', priority: 'High', time: '01:00 PM', status: 'Pending' },
    { id: 'TSK-404', type: 'Review Provisional Grade', farmer: 'Priya Deshmukh', location: 'Ahmednagar', priority: 'Medium', time: '03:00 PM', status: 'Pending' },
    { id: 'TSK-405', type: 'Assist Offer Response', farmer: 'Vijay Pawar', location: 'Nashik', priority: 'Low', time: '04:30 PM', status: 'Pending' },
  ];

  const assignedFarmers: FarmerItem[] = [
    { id: 'FR-101', name: 'Ramesh Patil', village: 'Nashik', crop: 'Red Onion', activeLot: 'LOT-8821', lastInteraction: '2 hrs ago', status: 'Assigned' },
    { id: 'FR-102', name: 'Sunita Jadhav', village: 'Pune', crop: 'Soybean', activeLot: 'LOT-8820', lastInteraction: '5 hrs ago', status: 'Assigned' },
    { id: 'FR-103', name: 'Arun Kulkarni', village: 'Solapur', crop: 'Wheat', activeLot: 'LOT-8819', lastInteraction: '1 day ago', status: 'Pending Review' },
    { id: 'FR-104', name: 'Priya Deshmukh', village: 'Ahmednagar', crop: 'Tomato', activeLot: 'LOT-8818', lastInteraction: '2 days ago', status: 'Assigned' },
  ];

  const lotAssistance: LotAssistItem[] = [
    { id: 'LOT-8821', crop: 'Red Onion', farmer: 'Ramesh Patil', quantity: '40 Q', grade: 'Provisional A', evidence: '3 photos captured', nextAction: 'Confirm grade' },
    { id: 'LOT-8820', crop: 'Soybean', farmer: 'Sunita Jadhav', quantity: '60 Q', grade: 'Provisional B', evidence: 'Checklist incomplete', nextAction: 'Complete checklist' },
    { id: 'LOT-8819', crop: 'Wheat', farmer: 'Arun Kulkarni', quantity: '80 Q', grade: 'Pending', evidence: 'No evidence yet', nextAction: 'Capture photos' },
  ];

  const verifications: VerificationItem[] = [
    { id: 'VER-501', type: 'Farmer Profile', subject: 'Ramesh Patil', status: 'Pending Review', submitted: '2 hrs ago', priority: 'High' },
    { id: 'VER-502', type: 'Produce Evidence', subject: 'LOT-8821 Red Onion', status: 'Under Review', submitted: '5 hrs ago', priority: 'Medium' },
    { id: 'VER-503', type: 'Buyer Verification', subject: 'Anand Agro Foods', status: 'Pending Review', submitted: '1 day ago', priority: 'High' },
  ];

  const disputes: DisputeItem[] = [
    { id: 'DSP-701', farmer: 'Vijay Pawar', lot: 'LOT-8815', issue: 'Quality Disagreement', status: 'Open', updated: '2 hrs ago' },
    { id: 'DSP-700', farmer: 'Meena Raut', lot: 'LOT-8812', issue: 'Short Weight', status: 'Escalated', updated: '1 day ago' },
  ];

  const taskColumns = [
    { key: 'id', header: 'Task ID', align: 'left' as const },
    { key: 'type', header: 'Type', align: 'left' as const },
    { key: 'farmer', header: 'Farmer', align: 'left' as const },
    { key: 'location', header: 'Location', align: 'left' as const },
    { key: 'priority', header: 'Priority', align: 'center' as const, render: (item: TaskItem) => (
      <Badge variant={item.priority === 'High' ? 'error' : item.priority === 'Medium' ? 'warning' : 'default'} size="sm">{item.priority}</Badge>
    )},
    { key: 'time', header: 'Time', align: 'left' as const, render: (item: TaskItem) => <DataFreshness timestamp={item.time} /> },
    { key: 'status', header: 'Status', align: 'center' as const, render: (item: TaskItem) => (
      <StatusBadge status={item.status === 'Pending' ? 'pending-verification' : 'warning'} label={item.status} size="sm" />
    )},
  ];

  const farmerColumns = [
    { key: 'id', header: 'ID', align: 'left' as const },
    { key: 'name', header: 'Farmer', align: 'left' as const },
    { key: 'village', header: 'Village', align: 'left' as const },
    { key: 'crop', header: 'Crop', align: 'left' as const },
    { key: 'activeLot', header: 'Active Lot', align: 'left' as const },
    { key: 'lastInteraction', header: 'Last Contact', align: 'left' as const, render: (item: FarmerItem) => <DataFreshness timestamp={item.lastInteraction} /> },
    { key: 'status', header: 'Status', align: 'center' as const, render: (item: FarmerItem) => (
      <StatusBadge status={item.status === 'Assigned' ? 'active' : 'pending-verification'} label={item.status} size="sm" />
    )},
  ];

  return (
    <AppShell forcedRole="field-agent" activeSubTab={activeTab} onSelectSubTab={setActiveTab}>
      <MobileStack spacing="md">
        <PageHeader
          title="Field Agent"
          subtitle="Assisted farmer onboarding, in-field lot grading, and offline-first data verification."
          roleBadge={<StatusBadge status="active" label="Agent Mode" size="sm" />}
          statusBadge={<SyncStatus state="Synced" lastSyncedTime="2m ago" />}
          primaryAction={
            <Button variant="primary" size="md" leftIcon={<UserPlus className="w-4 h-4" />}>
              Add Farmer
            </Button>
          }
        />

        <AlertBanner
          variant="warning"
          title="Phase 1 Foundation"
          message="Field agent workflows, offline sync, grading logic, and dispute resolution will be implemented in later phases. This dashboard shows the intended shell and static data model."
        />

        <DashboardGrid columns={4}>
          <MetricCard
            label="Assigned Farmers"
            value="12"
            unit="Active"
            change={{ value: '2 new today', isPositive: true }}
            timestamp="Updated 5m ago"
            icon={<MapPin className="w-4 h-4 text-[#F5A623]" />}
          />
          <MetricCard
            label="Today's Tasks"
            value="5"
            unit="Pending"
            change={{ value: '1 in progress', isPositive: false }}
            timestamp="Updated 1m ago"
            icon={<ClipboardList className="w-4 h-4 text-[#C4FF4D]" />}
          />
          <MetricCard
            label="Lots Needing Assistance"
            value="3"
            unit="Incomplete"
            change={{ value: '1 photo pending', isPositive: false }}
            timestamp="Updated 10m ago"
            icon={<Camera className="w-4 h-4 text-[#2FBF8F]" />}
          />
          <MetricCard
            label="Pending Verifications"
            value="3"
            unit="Awaiting Review"
            change={{ value: '1 high priority', isPositive: false }}
            timestamp="Updated 15m ago"
            icon={<ShieldCheck className="w-4 h-4 text-[#5B5E8C]" />}
          />
        </DashboardGrid>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Section
              title="Today's Tasks"
              description="Prioritized field actions requiring attention today."
              action={
                <Button variant="ghost" size="sm">View All Tasks</Button>
              }
            >
              <Card variant="default" padding="none">
                <Table
                  columns={taskColumns}
                  data={tasks}
                  keyExtractor={(item) => item.id}
                  emptyMessage="No tasks assigned"
                />
              </Card>
            </Section>

            <Section
              title="Assigned Farmers"
              description="Farmers under your assistance queue this cycle."
              action={
                <Button variant="ghost" size="sm">View All Farmers</Button>
              }
            >
              <Card variant="default" padding="none">
                <Table
                  columns={farmerColumns}
                  data={assignedFarmers}
                  keyExtractor={(item) => item.id}
                  emptyMessage="No farmers assigned"
                />
              </Card>
            </Section>

            <Section
              title="Lot Assistance"
              description="Lots requiring field-agent support for grading or evidence capture."
              action={
                <Button variant="ghost" size="sm">View All Lots</Button>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {lotAssistance.map((lot, idx) => (
                  <Card key={idx} variant="raised" padding="md" className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="lime" size="sm">{lot.crop}</Badge>
                      <DataFreshness timestamp="Just now" />
                    </div>
                    <div className="text-xs text-[#A7ABC9] space-y-1">
                      <div className="flex justify-between"><span>Farmer:</span><span className="text-[#EEF0FA]">{lot.farmer}</span></div>
                      <div className="flex justify-between"><span>Quantity:</span><span className="text-[#EEF0FA] font-mono">{lot.quantity}</span></div>
                      <div className="flex justify-between"><span>Grade:</span><span className="text-[#EEF0FA]">{lot.grade}</span></div>
                      <div className="flex justify-between"><span>Evidence:</span><span className="text-[#EEF0FA]">{lot.evidence}</span></div>
                    </div>
                    <div className="pt-2 text-xs font-mono text-[#A7ABC9] border-t border-[#2C2B73]/60">
                      Next: <span className="text-[#C4FF4D]">{lot.nextAction}</span>
                    </div>
                    <Button variant="secondary" size="sm" fullWidth leftIcon={<Camera className="w-3.5 h-3.5" />}>
                      Assist Lot
                    </Button>
                  </Card>
                ))}
              </div>
            </Section>
          </div>

          <div className="space-y-6">
            <Card variant="raised" padding="md" className="space-y-4">
              <div className="flex items-center space-x-2">
                <WifiOff className="w-4 h-4 text-[#F5A623]" />
                <h3 className="text-sm font-semibold text-[#EEF0FA]">Field Mode Sync</h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#A7ABC9]">Status</span>
                  <StatusBadge status="active" label="Online" size="sm" />
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A7ABC9]">Synced Records</span>
                  <span className="text-[#EEF0FA] font-mono">18</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A7ABC9]">Pending Upload</span>
                  <span className="text-[#F5A623] font-mono">1 lot</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A7ABC9]">Last Synced</span>
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

            <Section title="Verification Queue" description="Farmer profiles and produce evidence awaiting review.">
              <div className="space-y-3">
                {verifications.map((item, idx) => (
                  <Card key={idx} variant="default" padding="md" className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={item.priority === 'High' ? 'error' : 'warning'} size="sm">{item.type}</Badge>
                      <StatusBadge status={item.status === 'Pending Review' ? 'pending-verification' : 'warning'} label={item.status} size="sm" />
                    </div>
                    <div className="text-xs text-[#A7ABC9] space-y-1">
                      <div className="flex justify-between"><span>Subject:</span><span className="text-[#EEF0FA]">{item.subject}</span></div>
                      <div className="flex justify-between"><span>Submitted:</span><span className="text-[#EEF0FA]"><DataFreshness timestamp={item.submitted} /></span></div>
                    </div>
                    <Button variant="secondary" size="sm" fullWidth>Review</Button>
                  </Card>
                ))}
              </div>
            </Section>

            <Card variant="default" padding="md" className="space-y-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-[#E5484D]" />
                <h3 className="text-sm font-semibold text-[#EEF0FA]">Active Disputes</h3>
              </div>
              <div className="space-y-3">
                {disputes.map((dispute, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-[#1D1F3D] border border-[#2C2B73] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-[#A7ABC9]">{dispute.id}</span>
                      <StatusBadge status={dispute.status === 'Open' ? 'dispute' : 'warning'} label={dispute.status} size="sm" />
                    </div>
                    <div className="text-xs text-[#EEF0FA] font-medium">{dispute.farmer} — {dispute.lot}</div>
                    <div className="text-xs text-[#A7ABC9]">{dispute.issue}</div>
                    <DataFreshness timestamp={dispute.updated} />
                  </div>
                ))}
              </div>
            </Card>

            <Card variant="default" padding="md">
              <h3 className="text-sm font-semibold text-[#EEF0FA] mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" size="sm" fullWidth leftIcon={<UserPlus className="w-3.5 h-3.5" />}>Add Farmer</Button>
                <Button variant="secondary" size="sm" fullWidth leftIcon={<Camera className="w-3.5 h-3.5" />}>Capture Evidence</Button>
                <Button variant="secondary" size="sm" fullWidth leftIcon={<ClipboardList className="w-3.5 h-3.5" />}>Review Task</Button>
                <Button variant="secondary" size="sm" fullWidth leftIcon={<AlertTriangle className="w-3.5 h-3.5" />}>Report Issue</Button>
              </div>
            </Card>
          </div>
        </div>
      </MobileStack>
    </AppShell>
  );
};
