import React from 'react';
import {
  ShieldCheck,
  FileCheck,
  Scale,
  LineChart,
  Lock,
  Clock,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Role Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2C2B73]">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-[#2C2B73] border border-[#5B5E8C]/40 flex items-center justify-center text-[#A7ABC9]">
            <ShieldCheck className="w-6 h-6 text-[#C4FF4D]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-semibold text-[#EEF0FA]">Admin & Governance Console</h1>
              <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-[#1D1F3D] text-[#A7ABC9] border border-[#5B5E8C]/40">
                Role: Admin / Moderator
              </span>
            </div>
            <p className="text-sm text-[#A7ABC9]">
              Platform oversight, buyer verification, dispute resolution, and market data integrity surveillance.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-[#A7ABC9] bg-[#14152E] px-3 py-1.5 rounded-lg border border-[#2C2B73]">
          <Clock className="w-3.5 h-3.5 text-[#C4FF4D]" />
          <span>Status: Phase 1 Foundation</span>
        </div>
      </div>

      {/* Governance Metrics & Watchtower */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded-xl bg-[#14152E] border border-[#2C2B73] space-y-1">
          <span className="text-xs text-[#A7ABC9]">KYC Review Queue</span>
          <div className="text-2xl font-bold text-[#EEF0FA]">0 Pending</div>
          <span className="text-[11px] text-[#2FBF8F]">SLA: &lt; 12 Hours</span>
        </div>

        <div className="p-4 rounded-xl bg-[#14152E] border border-[#2C2B73] space-y-1">
          <span className="text-xs text-[#A7ABC9]">Active Grievances</span>
          <div className="text-2xl font-bold text-[#EEF0FA]">0 Open</div>
          <span className="text-[11px] text-[#2FBF8F]">No escalated disputes</span>
        </div>

        <div className="p-4 rounded-xl bg-[#14152E] border border-[#2C2B73] space-y-1">
          <span className="text-xs text-[#A7ABC9]">Mandi Price Feeds</span>
          <div className="text-2xl font-bold text-[#2FBF8F]">Synced</div>
          <span className="text-[11px] text-[#A7ABC9]">Agmarknet / e-NAM</span>
        </div>

        <div className="p-4 rounded-xl bg-[#14152E] border border-[#2C2B73] space-y-1">
          <span className="text-xs text-[#A7ABC9]">Audit Log State</span>
          <div className="text-2xl font-bold text-[#C4FF4D]">Immutable</div>
          <span className="text-[11px] text-[#A7ABC9]">Append-only records</span>
        </div>
      </div>

      {/* Oversight Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Module 1: Buyer KYC Verification */}
        <div className="p-6 rounded-xl bg-[#14152E] border border-[#2C2B73] space-y-4">
          <div className="w-10 h-10 rounded-lg bg-[#1D1F3D] flex items-center justify-center text-[#2FBF8F]">
            <FileCheck className="w-5 h-5" />
          </div>
          <h2 className="text-base font-semibold text-[#EEF0FA]">Buyer KYC & Onboarding</h2>
          <p className="text-sm text-[#A7ABC9] leading-relaxed">
            Verify company incorporation docs, APMC licenses, GST certificates, and credit history before granting access to farmer lots.
          </p>
          <div className="pt-2 text-xs font-mono text-[#A7ABC9]">
            <span>Verification Standard: </span>
            <span className="text-[#2FBF8F]">Tiered Trust 1–3</span>
          </div>
        </div>

        {/* Module 2: Dispute Mediation */}
        <div className="p-6 rounded-xl bg-[#14152E] border border-[#2C2B73] space-y-4">
          <div className="w-10 h-10 rounded-lg bg-[#1D1F3D] flex items-center justify-center text-[#F5A623]">
            <Scale className="w-5 h-5" />
          </div>
          <h2 className="text-base font-semibold text-[#EEF0FA]">Dispute Mediation Console</h2>
          <p className="text-sm text-[#A7ABC9] leading-relaxed">
            Review delivery quality mismatches, delayed transport damages, and payment delays with field-agent inspected photo evidence.
          </p>
          <div className="pt-2 text-xs font-mono text-[#A7ABC9]">
            <span>Resolution Feedback: </span>
            <span className="text-[#EEF0FA]">Updates Buyer Trust Score</span>
          </div>
        </div>

        {/* Module 3: Market Data Integrity */}
        <div className="p-6 rounded-xl bg-[#14152E] border border-[#2C2B73] space-y-4">
          <div className="w-10 h-10 rounded-lg bg-[#1D1F3D] flex items-center justify-center text-[#C4FF4D]">
            <LineChart className="w-5 h-5" />
          </div>
          <h2 className="text-base font-semibold text-[#EEF0FA]">Price Feed Surveillance</h2>
          <p className="text-sm text-[#A7ABC9] leading-relaxed">
            Monitor mandi price feeds for stale reporting, anomalous price spikes, or missing arrival data, triggering manual fallback audits.
          </p>
          <div className="pt-2 text-xs font-mono text-[#A7ABC9]">
            <span>Audit Rule: </span>
            <span className="text-[#C4FF4D]">No In-Place Overwrite</span>
          </div>
        </div>

      </div>

      {/* Rules Compliance Notice */}
      <div className="p-6 rounded-xl bg-[#14152E] border border-[#2C2B73] flex items-start space-x-4">
        <Lock className="w-5 h-5 text-[#C4FF4D] mt-0.5 shrink-0" />
        <div className="space-y-1 text-sm">
          <h3 className="font-semibold text-[#EEF0FA]">Admin Security & Privacy Rules (RULES.md Section 2 & 15)</h3>
          <p className="text-[#A7ABC9] leading-relaxed">
            Admins have elevated privileges for dispute mediation and KYC approval, but may not view user payment or contact details outside an active dispute investigation. All administrative actions require an explicit audit justification that is permanently written to the ledger.
          </p>
        </div>
      </div>
    </div>
  );
};

