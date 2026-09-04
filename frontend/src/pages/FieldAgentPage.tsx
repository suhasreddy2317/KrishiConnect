import React from 'react';
import {
  MapPin,
  Camera,
  WifiOff,
  UserPlus,
  AlertTriangle,
  Clock,
  CheckCircle,
} from 'lucide-react';

export const FieldAgentPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Role Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2C2B73]">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-[#2C2B73] border border-[#5B5E8C]/40 flex items-center justify-center text-[#F5A623]">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-semibold text-[#EEF0FA]">Field Agent Operations</h1>
              <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-[#1D1F3D] text-[#F5A623] border border-[#5B5E8C]/40">
                Role: Field Agent
              </span>
            </div>
            <p className="text-sm text-[#A7ABC9]">
              Assisted farmer onboarding, in-field lot grading, and offline-first data verification.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-[#A7ABC9] bg-[#14152E] px-3 py-1.5 rounded-lg border border-[#2C2B73]">
          <Clock className="w-3.5 h-3.5 text-[#F5A623]" />
          <span>Status: Phase 1 Foundation</span>
        </div>
      </div>

      {/* Offline Status & Field Readiness Banner */}
      <div className="p-4 sm:p-6 rounded-xl bg-[#14152E] border border-[#5B5E8C]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-[#1D1F3D] text-[#2FBF8F]">
            <WifiOff className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#EEF0FA]">Offline-Tolerant Field Sync</h2>
            <p className="text-xs text-[#A7ABC9]">
              Field agents can capture photos, checklist answers, and farmer profiles with 0kbps signal.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono px-3 py-1 rounded bg-[#1D1F3D] text-[#2FBF8F] border border-[#2FBF8F]/30">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>IndexedDB Cache Ready</span>
        </div>
      </div>

      {/* Field Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Task 1: Assisted Onboarding */}
        <div className="p-6 rounded-xl bg-[#14152E] border border-[#2C2B73] space-y-4">
          <div className="w-10 h-10 rounded-lg bg-[#1D1F3D] flex items-center justify-center text-[#C4FF4D]">
            <UserPlus className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-[#EEF0FA]">Assisted Onboarding</h3>
          <p className="text-sm text-[#A7ABC9] leading-relaxed">
            Verify farmer landholding, bank account / UPI IDs, and register crops on behalf of digitally challenged smallholders.
          </p>
          <div className="pt-2 text-xs font-mono text-[#A7ABC9]">
            <span>Audit Trail: </span>
            <span className="text-[#EEF0FA]">Mandatory Agent Attestation</span>
          </div>
        </div>

        {/* Task 2: Standardized In-Field Grading */}
        <div className="p-6 rounded-xl bg-[#14152E] border border-[#2C2B73] space-y-4">
          <div className="w-10 h-10 rounded-lg bg-[#1D1F3D] flex items-center justify-center text-[#2FBF8F]">
            <Camera className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-[#EEF0FA]">Lot Grading & Photos</h3>
          <p className="text-sm text-[#A7ABC9] leading-relaxed">
            Execute standard physical sample inspections (moisture sensor entry, foreign matter %, uniformity) and attach photographic evidence.
          </p>
          <div className="pt-2 text-xs font-mono text-[#A7ABC9]">
            <span>Grade Authority: </span>
            <span className="text-[#2FBF8F]">Provisional Grade Verified</span>
          </div>
        </div>

        {/* Task 3: Grievance Investigation */}
        <div className="p-6 rounded-xl bg-[#14152E] border border-[#2C2B73] space-y-4">
          <div className="w-10 h-10 rounded-lg bg-[#1D1F3D] flex items-center justify-center text-[#E5484D]">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-[#EEF0FA]">Dispute Evidence</h3>
          <p className="text-sm text-[#A7ABC9] leading-relaxed">
            Inspect rejected shipments at mandis or collection centers to record objective condition logs for admin mediation.
          </p>
          <div className="pt-2 text-xs font-mono text-[#A7ABC9]">
            <span>Mediation SLA: </span>
            <span className="text-[#F5A623]">24h Field Visit Target</span>
          </div>
        </div>

      </div>
    </div>
  );
};

