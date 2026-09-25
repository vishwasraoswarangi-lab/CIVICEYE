import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  MapPin,
  Sparkles,
  Smartphone,
  RotateCcw,
  Clock,
  Car,
  FileText,
  BadgeAlert,
} from 'lucide-react';
import { ParkingCase } from '../types';

interface AuthorityViewProps {
  cases: ParkingCase[];
  onTakeAction: (caseId: string, decision: 'GO' | 'NO_GO') => Promise<void>;
  onResetCases?: () => void;
  onViewOwnerPortal?: () => void;
}

export const AuthorityView: React.FC<AuthorityViewProps> = ({
  cases,
  onTakeAction,
  onResetCases,
  onViewOwnerPortal,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    cases.find((c) => c.status === 'PENDING_REVIEW')?.id || cases[0]?.id || ''
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const selectedCase = cases.find((c) => c.id === selectedCaseId) || cases[0];
  const pendingCount = cases.filter((c) => c.status === 'PENDING_REVIEW').length;
  const validatedCount = cases.filter((c) => c.status === 'VALIDATED').length;
  const dismissedCount = cases.filter((c) => c.status === 'DISMISSED').length;

  const handleDecision = async (decision: 'GO' | 'NO_GO') => {
    if (!selectedCase) return;
    setIsProcessing(true);
    try {
      await onTakeAction(selectedCase.id, decision);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {/* Light Blue Authority Terminal Dashboard (Replaced black header) */}
      <div className="bg-gradient-to-r from-sky-100 via-sky-50 to-blue-100 text-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-sky-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-sky-300 text-sky-700 flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-slate-900 tracking-tight">
                  Municipal Traffic Authority Terminal
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-200 text-sky-800 border border-sky-300">
                  OFFICER BADGE #8042
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Centralized Enforcement Console • Connected to Shared CivicEye Core Database
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onResetCases && (
              <button
                onClick={onResetCases}
                title="Reset demo cases"
                className="px-2.5 py-1.5 bg-white hover:bg-sky-50 text-slate-700 text-xs rounded-xl border border-sky-200 shadow-2xs flex items-center gap-1.5 transition-colors font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5 text-sky-600" />
                Reset Queue
              </button>
            )}
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-sky-200/80 text-center">
          <div className="bg-white rounded-xl p-2.5 border border-sky-200 shadow-2xs">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Pending Review</div>
            <div className="text-lg font-bold text-amber-600">{pendingCount}</div>
          </div>
          <div className="bg-white rounded-xl p-2.5 border border-sky-200 shadow-2xs">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Validated & Fined</div>
            <div className="text-lg font-bold text-emerald-600">{validatedCount}</div>
          </div>
          <div className="bg-white rounded-xl p-2.5 border border-sky-200 shadow-2xs">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Dismissed</div>
            <div className="text-lg font-bold text-rose-600">{dismissedCount}</div>
          </div>
        </div>
      </div>

      {/* Case Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {cases.map((c) => {
          const isSelected = c.id === selectedCase?.id;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCaseId(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 flex items-center gap-2 border transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="font-mono font-bold">{c.id}</span>
              {c.status === 'VALIDATED' && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Validated" />
              )}
              {c.status === 'DISMISSED' && (
                <span className="w-2 h-2 rounded-full bg-rose-500" title="Dismissed" />
              )}
              {c.status === 'PENDING_REVIEW' && (
                <span className="w-2 h-2 rounded-full bg-amber-500" title="Pending" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Authority Case Inspection Pane */}
      {selectedCase ? (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Photographic Evidence */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  AI Photographic Proof
                </span>
                <span className="font-mono text-slate-400">{selectedCase.timestamp}</span>
              </div>

              <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={selectedCase.imageUrl}
                  alt={selectedCase.violationType}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-md font-mono font-bold">
                  {selectedCase.vehicleDetails.licensePlate}
                </div>
                <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-black/75 backdrop-blur-xs text-white text-xs px-2.5 py-1.5 rounded-md flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="truncate">{selectedCase.location}</span>
                </div>
              </div>
            </div>

            {/* Case Details & AI Proof */}
            <div className="space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Reported Infraction
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-0.5">
                      {selectedCase.violationType}
                    </h3>
                  </div>
                  <span className="font-mono font-bold text-slate-900 text-base">
                    ${selectedCase.fineAmount}
                  </span>
                </div>

                {/* AI Proof Box */}
                <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-3 text-xs text-sky-950 space-y-1">
                  <span className="font-semibold text-sky-900 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-sky-600" />
                    AI Verification Proof:
                  </span>
                  <p className="leading-relaxed text-slate-700">
                    {selectedCase.proofSummary}
                  </p>
                </div>

                {/* Registered Owner Lookup */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs">
                  <div className="text-slate-400 text-[10px] uppercase font-semibold">
                    Registered Vehicle Owner (DMV Core)
                  </div>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {selectedCase.ownerInfo.name} • {selectedCase.ownerInfo.phone}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {selectedCase.ownerInfo.vehicleRegistered}
                  </div>
                </div>
              </div>

              {/* Status Alert if already acted on */}
              {selectedCase.status === 'VALIDATED' && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Validated • Automated Fine Dispatched to Owner
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Official citation transmitted via SMS to {selectedCase.ownerInfo.phone}.
                  </p>
                  {onViewOwnerPortal && (
                    <button
                      onClick={onViewOwnerPortal}
                      className="text-emerald-700 font-semibold underline text-xs mt-1 block"
                    >
                      View in Vehicle Owner Portal →
                    </button>
                  )}
                </div>
              )}

              {selectedCase.status === 'DISMISSED' && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-xs text-rose-800 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  Case Dismissed by Officer. No fine dispatched.
                </div>
              )}
            </div>
          </div>

          {/* Authority Final Action: STRICTLY Go or No-Go */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="text-center text-[11px] text-slate-400 font-medium">
              Authority Final Verification (Officer Decision: Go or No-Go only)
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDecision('NO_GO')}
                disabled={isProcessing}
                className={`py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all ${
                  selectedCase.status === 'DISMISSED'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 active:scale-98'
                }`}
              >
                <XCircle className="w-4 h-4" />
                No-Go (Dismiss)
              </button>

              <button
                type="button"
                onClick={() => handleDecision('GO')}
                disabled={isProcessing}
                className={`py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all ${
                  selectedCase.status === 'VALIDATED'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-xs active:scale-98'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Go (Validate & Fine)
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-500">
          No cases in queue.
        </div>
      )}
    </div>
  );
};
