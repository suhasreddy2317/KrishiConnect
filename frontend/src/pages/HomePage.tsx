import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sprout,
  Users,
  Building2,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Database,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/status/StatusBadge';
import { MetricCard } from '@/components/data-display/MetricCard';

const rolePreviews = [
  {
    role: 'Farmer',
    title: 'Farmer Workspace',
    path: '/farmer',
    icon: Sprout,
    tag: 'Mobile-First',
    color: '#C4FF4D',
    question: 'What should I do right now, and why?',
    highlights: [
      'Sale Window Score Engine (Sell/Store)',
      'Realized mandi comparison after freight',
      'Buyer confidence ranking',
    ],
  },
  {
    role: 'FPO Manager',
    title: 'FPO Manager Hub',
    path: '/fpo',
    icon: Users,
    tag: 'Aggregation',
    color: '#2FBF8F',
    question: 'How do we pool lots to secure bulk institutional pricing?',
    highlights: [
      'Member lot aggregation & grading',
      'Bulk institutional buyer matching',
      'Pro-rata member payment distribution',
    ],
  },
  {
    role: 'Buyer',
    title: 'Buyer Procurement Portal',
    path: '/buyer',
    icon: Building2,
    tag: 'Procurement',
    color: '#5B5E8C',
    question: 'Where can I source verified-grade produce at scale?',
    highlights: [
      'Procurement demand RFQ posting',
      'Proximity-weighted lot matching',
      'Structured counteroffers & logistics',
    ],
  },
  {
    role: 'Field Agent',
    title: 'Field Agent Terminal',
    path: '/field-agent',
    icon: MapPin,
    tag: 'Offline-Tolerant',
    color: '#F5A623',
    question: 'How do I assist farmers in the field with grading & KYC?',
    highlights: [
      'Assisted onboarding with attestation',
      'Standardized photo checklist grading',
      'Offline sync cache (IndexedDB ready)',
    ],
  },
  {
    role: 'Admin',
    title: 'Admin & Governance Console',
    path: '/admin',
    icon: ShieldCheck,
    tag: 'Governance',
    color: '#A7ABC9',
    question: 'How do we maintain counterparty trust & data integrity?',
    highlights: [
      'Tiered buyer KYC verification queue',
      'Dispute mediation & evidence audit',
      'Mandi price feed surveillance',
    ],
  },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageContainer maxWidth="xl" className="space-y-10">
      {/* Top Brand Banner */}
      <div className="relative rounded-2xl bg-[#14152E] border border-[#2C2B73] p-6 sm:p-10 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#2C2B73]/25 blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="lime" icon={<Sparkles className="w-3 h-3" />}>
              Phase 1 Foundation
            </Badge>
            <StatusBadge status="verified-buyer" label="Trust Ledger OS" size="sm" />
          </div>

          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#EEF0FA] leading-tight">
            Decision-Engine First. <br />
            <span className="text-[#C4FF4D]">Transaction Layer Second.</span>
          </h1>

          <p className="text-[#A7ABC9] text-sm sm:text-base leading-relaxed">
            KrishiConnect transforms agricultural commodity trade from distress selling into a
            transparent, verified transaction network. Built to answer the essential farmer question:
            <span className="block text-[#EEF0FA] font-medium mt-1 font-mono text-base">
              "What should I do right now, and why?"
            </span>
          </p>

          {/* Quick Technical Specs */}
          <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono">
            <div className="px-3 py-1 rounded bg-[#1D1F3D] border border-[#5B5E8C]/30 text-[#EEF0FA] flex items-center space-x-2">
              <Cpu className="w-3.5 h-3.5 text-[#C4FF4D]" />
              <span>FastAPI Backend</span>
            </div>
            <div className="px-3 py-1 rounded bg-[#1D1F3D] border border-[#5B5E8C]/30 text-[#EEF0FA] flex items-center space-x-2">
              <Database className="w-3.5 h-3.5 text-[#2FBF8F]" />
              <span>SQLAlchemy (Portable DB)</span>
            </div>
            <div className="px-3 py-1 rounded bg-[#1D1F3D] border border-[#5B5E8C]/30 text-[#EEF0FA] flex items-center space-x-2">
              <Layers className="w-3.5 h-3.5 text-[#C4FF4D]" />
              <span>Trust Ledger Shell</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overview System Metrics Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Supported Roles"
          value="5"
          unit="Active Shells"
          timestamp="Phase 2 Foundation"
        />
        <MetricCard
          label="Design Aesthetic"
          value="Trust Ledger"
          unit="Dark-Mode First"
          change={{ value: 'WCAG AA', isPositive: true }}
        />
        <MetricCard
          label="Decision Accuracy"
          value="Explainable"
          unit="Weighted Signals"
          change={{ value: 'Why-first', isPositive: true }}
        />
        <MetricCard
          label="Local DB State"
          value="Connected"
          unit="SQLite / Postgres"
          timestamp="SELECT 1 Validated"
        />
      </div>

      {/* Role Workspaces Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#EEF0FA]">Role Workspaces & Shells</h2>
            <p className="text-xs sm:text-sm text-[#A7ABC9]">
              Select any role terminal below to inspect its tailored navigation, layout, and component library.
            </p>
          </div>
          <span className="font-mono text-xs text-[#A7ABC9] hidden sm:inline">
            5 Configured
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rolePreviews.map((rp) => {
            const Icon = rp.icon;
            return (
              <Card
                key={rp.path}
                variant="default"
                padding="md"
                className="flex flex-col justify-between hover:border-[#5B5E8C] transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#1D1F3D] border border-[#5B5E8C]/40 flex items-center justify-center text-[#C4FF4D]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="default">{rp.tag}</Badge>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-[#EEF0FA]">{rp.title}</h3>
                    <p className="text-xs font-mono text-[#C4FF4D] mt-1">"{rp.question}"</p>
                  </div>

                  <ul className="space-y-1.5 text-xs text-[#A7ABC9]">
                    {rp.highlights.map((h, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <span className="w-1 h-1 rounded-full bg-[#C4FF4D]" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-4 border-t border-[#2C2B73]/60">
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    onClick={() => navigate(rp.path)}
                  >
                    Open {rp.role} Terminal
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Decision Engine Architecture Summary */}
      <Card variant="raised" padding="lg" className="space-y-4">
        <h3 className="text-base font-semibold text-[#EEF0FA]">
          Decision-Support vs. Transaction Execution (RULES.md Section 1)
        </h3>
        <p className="text-xs sm:text-sm text-[#A7ABC9] leading-relaxed">
          In KrishiConnect, market intelligence and decision support (Sale Window Score, Demand Radar)
          are always accessible independently. A farmer may consult prices, compare nearby mandis, and
          review recommendations without listing a lot. When a sale decision is made, every step—from
          lot creation, buyer matching, offers, logistics, through to payment—is permanently anchored to
          the price benchmark and recommendation at the time of agreement.
        </p>
      </Card>
    </PageContainer>
  );
};
