import React from 'react';
import {
  Users,
  Layers,
  Building2,
  Coins,
  Clock,
  Info,
} from 'lucide-react';

export const FpoPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Role Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2C2B73]">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-[#2C2B73] border border-[#5B5E8C]/40 flex items-center justify-center text-[#2FBF8F]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-semibold text-[#EEF0FA]">FPO Manager Hub</h1>
              <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-[#1D1F3D] text-[#2FBF8F] border border-[#5B5E8C]/40">
                Role: FPO Manager
              </span>
            </div>
            <p className="text-sm text-[#A7ABC9]">
              Aggregate member harvests into bulk pooled lots to command institutional pricing leverage.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-[#A7ABC9] bg-[#14152E] px-3 py-1.5 rounded-lg border border-[#2C2B73]">
          <Clock className="w-3.5 h-3.5 text-[#2FBF8F]" />
          <span>Status: Phase 1 Foundation</span>
        </div>
      </div>

      {/* Feature Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Module 1: Lot Pooling Engine */}
        <div className="p-6 rounded-xl bg-[#14152E] border border-[#2C2B73] space-y-4">
          <div className="w-10 h-10 rounded-lg bg-[#1D1F3D] flex items-center justify-center text-[#2FBF8F]">
            <Layers className="w-5 h-5" />
          </div>
          <h2 className="text-base font-semibold text-[#EEF0FA]">Member Lot Pooling</h2>
          <p className="text-sm text-[#A7ABC9] leading-relaxed">
            Consolidate 10–500 smallholder member produce deposits into uniform, grade-certified commercial bulk lots.
          </p>
          <div className="pt-2 text-xs font-mono text-[#A7ABC9] space-y-1">
            <div className="flex justify-between border-b border-[#2C2B73]/50 pb-1">
              <span>Member Traceability:</span>
              <span className="text-[#EEF0FA]">Preserved</span>
            </div>
            <div className="flex justify-between pt-1">
              <span>Grade Harmonization:</span>
              <span className="text-[#2FBF8F]">Automated</span>
            </div>
          </div>
        </div>

        {/* Module 2: Bulk Buyer Demands */}
        <div className="p-6 rounded-xl bg-[#14152E] border border-[#2C2B73] space-y-4">
          <div className="w-10 h-10 rounded-lg bg-[#1D1F3D] flex items-center justify-center text-[#C4FF4D]">
            <Building2 className="w-5 h-5" />
          </div>
          <h2 className="text-base font-semibold text-[#EEF0FA]">Bulk Demand Radar</h2>
          <p className="text-sm text-[#A7ABC9] leading-relaxed">
            Directly match pooled volumes against institutional processors, export houses, and supermarket chains requiring minimum tonnage.
          </p>
          <div className="pt-2 text-xs font-mono text-[#A7ABC9] space-y-1">
            <div className="flex justify-between border-b border-[#2C2B73]/50 pb-1">
              <span>Procurement Volume:</span>
              <span className="text-[#EEF0FA]">Tonnage-Scale</span>
            </div>
            <div className="flex justify-between pt-1">
              <span>Intermediation Cut:</span>
              <span className="text-[#2FBF8F]">Bypassed</span>
            </div>
          </div>
        </div>

        {/* Module 3: Member Payout Settlement */}
        <div className="p-6 rounded-xl bg-[#14152E] border border-[#2C2B73] space-y-4">
          <div className="w-10 h-10 rounded-lg bg-[#1D1F3D] flex items-center justify-center text-[#F5A623]">
            <Coins className="w-5 h-5" />
          </div>
          <h2 className="text-base font-semibold text-[#EEF0FA]">Payout Ledger</h2>
          <p className="text-sm text-[#A7ABC9] leading-relaxed">
            Proportional revenue distribution back to member bank accounts calculated accurately from individual lot grade contributions.
          </p>
          <div className="pt-2 text-xs font-mono text-[#A7ABC9] space-y-1">
            <div className="flex justify-between border-b border-[#2C2B73]/50 pb-1">
              <span>Disbursement Model:</span>
              <span className="text-[#EEF0FA]">Pro-rata Grade</span>
            </div>
            <div className="flex justify-between pt-1">
              <span>Settlement Audit:</span>
              <span className="text-[#C4FF4D]">Immutable</span>
            </div>
          </div>
        </div>

      </div>

      {/* Trust Ledger Architecture Card */}
      <div className="p-6 rounded-xl bg-[#14152E] border border-[#2C2B73] flex items-start space-x-4">
        <Info className="w-5 h-5 text-[#2FBF8F] mt-0.5 shrink-0" />
        <div className="space-y-1 text-sm">
          <h3 className="font-semibold text-[#EEF0FA]">FPO Collective Bargaining Rules (RULES.md Section 6 & 7)</h3>
          <p className="text-[#A7ABC9] leading-relaxed">
            Each contributing member lot maintains a cryptographic and database reference in the pooled master lot. When a bulk offer is accepted, the FPO manager signs on behalf of the collective, and payment milestones trigger automated individual distribution allocations.
          </p>
        </div>
      </div>
    </div>
  );
};

