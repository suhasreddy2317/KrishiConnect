import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { MobileStack } from '@/components/layout/MobileStack';
import { RecommendationCard } from '@/components/data-display/RecommendationCard';
import { MarketCard } from '@/components/data-display/MarketCard';
import { SyncStatus } from '@/components/status/SyncStatus';
import { StatusSteps } from '@/components/status/StatusSteps';
import { StatusBadge } from '@/components/status/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Drawer } from '@/components/ui/Drawer';
import { Plus, HelpCircle } from 'lucide-react';

export const FarmerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('/farmer');
  const [isLotDrawerOpen, setIsLotDrawerOpen] = useState(false);

  const tabs = [
    { id: '/farmer', label: 'Decision Home' },
    { id: '/farmer/market', label: 'Nearby Mandis' },
    { id: '/farmer/lots', label: 'My Lots', count: 1 },
    { id: '/farmer/offers', label: 'Offers', count: 2 },
  ];

  return (
    <AppShell forcedRole="farmer" activeSubTab={activeTab} onSelectSubTab={setActiveTab}>
      <MobileStack spacing="md">
        {/* Page Header with Sync Status */}
        <PageHeader
          title="Farmer Decision Workspace"
          subtitle="Daily harvest timing, net realized prices, and verified buyer matching."
          roleBadge={<StatusBadge status="active" label="Farmer Mode" size="sm" />}
          statusBadge={<SyncStatus state="Synced" lastSyncedTime="2m ago" />}
          primaryAction={
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsLotDrawerOpen(true)}
            >
              Add Produce Lot
            </Button>
          }
        />

        {/* Tab strip for sub-views */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab Content: Decision Home */}
        {activeTab === '/farmer' && (
          <div className="space-y-6">
            {/* Essential Question Notice */}
            <div className="p-4 rounded-xl bg-[#14152E] border border-[#C4FF4D]/30 flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-[#1D1F3D] text-[#C4FF4D] shrink-0 mt-0.5">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#C4FF4D]">
                  Farmer Operating Principle
                </span>
                <h2 className="text-lg font-semibold text-[#EEF0FA]">
                  "What should I do right now, and why?"
                </h2>
                <p className="text-xs text-[#A7ABC9]">
                  Every recommendation below is inspectable with plain-language market factors.
                </p>
              </div>
            </div>

            {/* Recommendation Card: Dominant Decision Element */}
            <RecommendationCard
              cropName="Red Onion (Nashik)"
              verdict="SELL NOW"
              score={84}
              headline="Current mandi price is 14% above 30-day historical average."
              timestamp="Updated 15 mins ago"
              reasons={[
                {
                  title: 'Price Velocity',
                  impact: 'positive',
                  description: 'Modal price rose ₹180/qtl in the last 72 hours across 3 nearby mandis.',
                },
                {
                  title: 'Arrival Pressure',
                  impact: 'neutral',
                  description: 'Arrival volumes are projected to surge 35% next week, which may dampen prices.',
                },
                {
                  title: 'Storage Cost Risk',
                  impact: 'negative',
                  description: 'Holding beyond 7 days incurs 3.2% moisture weight loss risk at local ambient storage.',
                },
              ]}
              onPrimaryAction={() => setIsLotDrawerOpen(true)}
              primaryActionLabel="List Red Onion Lot"
            />

            {/* Active Transaction Lifecycle Stepper */}
            <Card
              variant="default"
              title="Active Transaction: Lot #KC-8092"
              subtitle="Tomato (Hybrid Grade A) • 25 Quintals"
              headerAction={<StatusBadge status="verified-buyer" label="Buyer Locked" size="sm" />}
            >
              <StatusSteps
                steps={[
                  { id: '1', label: 'Offer Accepted', sublabel: '₹2,100/qtl', status: 'complete' },
                  { id: '2', label: 'Dispatched', sublabel: 'MH-15 Truck', status: 'complete' },
                  { id: '3', label: 'Delivery Inspection', sublabel: 'At Cold Storage', status: 'current' },
                  { id: '4', label: 'Payment Settlement', sublabel: 'Direct UPI', status: 'pending' },
                ]}
              />
            </Card>

            {/* Nearby Mandi Comparisons Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-[#EEF0FA]">
                    Nearby Mandi Price Benchmarks
                  </h3>
                  <p className="text-xs text-[#A7ABC9]">
                    Comparing prices within 40 km economic transport radius.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('/farmer/market')}
                >
                  View All Mandis
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MarketCard
                  mandiName="Lasalgaon APMC"
                  distanceKm={18}
                  commodity="Red Onion"
                  modalPrice={2450}
                  trendPercentage={4.8}
                  timestamp="12m ago"
                  isBestRealized
                  onSelectMandi={() => {}}
                />
                <MarketCard
                  mandiName="Pimpalgaon Mandi"
                  distanceKm={12}
                  commodity="Red Onion"
                  modalPrice={2380}
                  trendPercentage={-1.2}
                  timestamp="25m ago"
                  isNearest
                  onSelectMandi={() => {}}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Nearby Mandis */}
        {activeTab === '/farmer/market' && (
          <div className="space-y-4">
            <MarketCard
              mandiName="Lasalgaon APMC"
              distanceKm={18}
              commodity="Red Onion"
              modalPrice={2450}
              trendPercentage={4.8}
              timestamp="12m ago"
              isBestRealized
            />
            <MarketCard
              mandiName="Pimpalgaon Mandi"
              distanceKm={12}
              commodity="Red Onion"
              modalPrice={2380}
              trendPercentage={-1.2}
              timestamp="25m ago"
              isNearest
            />
            <MarketCard
              mandiName="Nashik Main APMC"
              distanceKm={34}
              commodity="Red Onion"
              modalPrice={2410}
              trendPercentage={2.1}
              timestamp="1 hr ago"
            />
          </div>
        )}

        {/* Tab Content: My Lots */}
        {activeTab === '/farmer/lots' && (
          <Card
            variant="default"
            title="Active Lots (1 Lot Published)"
            subtitle="Produce lots published to verified buyers"
          >
            <div className="p-4 rounded-lg bg-[#1D1F3D] border border-[#5B5E8C]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-sm text-[#EEF0FA]">
                    Red Onion (Garwa Variety)
                  </span>
                  <StatusBadge status="grade" label="Grade A" size="sm" />
                </div>
                <div className="text-xs text-[#A7ABC9] mt-1 font-mono">
                  Quantity: 40 Quintals • Harvest: Sep 2026 • Nashik Farm #2
                </div>
              </div>
              <Button size="sm" variant="outline">
                Manage Lot
              </Button>
            </div>
          </Card>
        )}

        {/* Tab Content: Offers */}
        {activeTab === '/farmer/offers' && (
          <Card
            variant="default"
            title="Received Buyer Offers (2 Active)"
            subtitle="Structured offers with 48h locking expiry"
          >
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-[#1D1F3D] border border-[#2FBF8F]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-[#EEF0FA]">
                      Anand Agro Foods
                    </span>
                    <StatusBadge status="verified-buyer" size="sm" />
                  </div>
                  <div className="text-xs text-[#A7ABC9] mt-1 font-mono">
                    Offer: <span className="text-[#C4FF4D] font-bold">₹2,480 / qtl</span> • 40 Quintals • Expiry in 28 hrs
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="primary">
                    Accept Offer
                  </Button>
                  <Button size="sm" variant="outline">
                    Counter
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </MobileStack>

      {/* Lot Creation Drawer Preview */}
      <Drawer
        isOpen={isLotDrawerOpen}
        onClose={() => setIsLotDrawerOpen(false)}
        title="Create Produce Lot"
        description="Provide crop specifications, estimated quantity, and provisional photos."
        position="bottom"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-[#14152E] border border-[#2C2B73] space-y-2 text-xs text-[#A7ABC9]">
            <p>
              In accordance with Phase 1 Foundation, lot submission business logic will be integrated in Phase 3.
            </p>
            <p className="text-[#C4FF4D]">
              ✓ Form controls, touch targets, and offline sync caching are ready in this UI shell.
            </p>
          </div>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setIsLotDrawerOpen(false)}
          >
            Close Drawer
          </Button>
        </div>
      </Drawer>
    </AppShell>
  );
};
