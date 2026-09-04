import React from 'react';
import {
  Building2,
  Send,
  Search,
  ShieldCheck,
  Truck,
  Clock,
} from 'lucide-react';

export const BuyerPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Role Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2C2B73]">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-[#2C2B73] border border-[#5B5E8C]/40 flex items-center justify-center text-[#5B5E8C]">
            <Building2 className="w-6 h-6 text-[#C4FF4D]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-semibold text-[#EEF0FA]">Buyer Procurement Portal</h1>
              <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-[#1D1F3D] text-[#5B5E8C] border border-[#5B5E8C]/40">
                Role: Buyer
              </span>
            </div>
            <p className="text-sm text-[#A7ABC9]">
              Source verifiable quality lots directly from smallholders and FPOs with zero counterparty friction.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-[#A7ABC9] bg-[#14152E] px-3 py-1.5 rounded-lg border border-[#2C2B73]">
          <Clock className="w-3.5 h-3.5 text-[#C4FF4D]" />
          <span>Status: Phase 1 Foundation</span>
        </div>
      </div>

      {/* Buyer Confidence Trust Standing Banner */}
      <div className="p-6 rounded-xl bg-[#14152E] border border-[#2C2B73] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-[#1D1F3D] border border-[#2FBF8F]/40 flex items-center justify-center text-[#2FBF8F]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-semibold text-[#EEF0FA]">Buyer Trust Status</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#2FBF8F]/10 text-[#2FBF8F] border border-[#2FBF8F]/30">
                KYC Level 2 Verified
              </span>
            </div>
            <p className="text-xs text-[#A7ABC9] mt-0.5">
              High Confidence ranking unlocks direct algorithmic lot priority and reduced escrow collateral.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-6 sm:border-l sm:border-[#2C2B73] sm:pl-6">
          <div className="space-y-0.5">
            <span className="text-[11px] font-mono text-[#A7ABC9]">Confidence Score</span>
            <div className="text-xl font-bold font-mono text-[#2FBF8F]">94 / 100</div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[11px] font-mono text-[#A7ABC9]">Dispute Ratio</span>
            <div className="text-xl font-bold font-mono text-[#EEF0FA]">0.0%</div>
          </div>
        </div>
      </div>

      {/* Procurement Workflow Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Step 1: Demand Posting */}
        <div className="p-6 rounded-xl bg-[#14152E] border border-[#2C2B73] space-y-4">
          <div className="w-10 h-10 rounded-lg bg-[#1D1F3D] flex items-center justify-center text-[#C4FF4D]">
            <Send className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-[#EEF0FA]">Post Demand RFQ</h3>
          <p className="text-sm text-[#A7ABC9] leading-relaxed">
            Specify target commodity, required grade specifications, total volume, delivery deadlines, and price tolerance range.
          </p>
          <div className="pt-2">
            <span className="text-xs font-mono text-[#A7ABC9] block">Engine Feature:</span>
            <span className="text-xs text-[#EEF0FA]">Auto-broadcasts to matching farm clusters</span>
          </div>
        </div>

        {/* Step 2: Quality-Matched Lot Discovery */}
        <div className="p-6 rounded-xl bg-[#14152E] border border-[#2C2B73] space-y-4">
          <div className="w-10 h-10 rounded-lg bg-[#1D1F3D] flex items-center justify-center text-[#2FBF8F]">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-[#EEF0FA]">Match Radar</h3>
          <p className="text-sm text-[#A7ABC9] leading-relaxed">
            Filter published farmer and FPO pooled lots by verified provisional grade, moisture checklist, and transport radius.
          </p>
          <div className="pt-2">
            <span className="text-xs font-mono text-[#A7ABC9] block">Engine Feature:</span>
            <span className="text-xs text-[#EEF0FA]">Proximity-weighted freight cost estimator</span>
          </div>
        </div>

        {/* Step 3: Terms Locking & Logistics */}
        <div className="p-6 rounded-xl bg-[#14152E] border border-[#2C2B73] space-y-4">
          <div className="w-10 h-10 rounded-lg bg-[#1D1F3D] flex items-center justify-center text-[#F5A623]">
            <Truck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-[#EEF0FA]">Logistics & Delivery</h3>
          <p className="text-sm text-[#A7ABC9] leading-relaxed">
            Standardized digital offer submission with 48h locking, vehicle dispatch milestones, and delivery quality reconciliation.
          </p>
          <div className="pt-2">
            <span className="text-xs font-mono text-[#A7ABC9] block">Engine Feature:</span>
            <span className="text-xs text-[#EEF0FA]">Delivery checkpoint sign-off</span>
          </div>
        </div>

      </div>
    </div>
  );
};

