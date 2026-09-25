import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  MapPin,
  Calendar,
  CreditCard,
  Search,
  FileText,
  Building2,
  Car,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { ParkingCase } from '../types';

interface OwnerNoticeViewProps {
  validatedCases: ParkingCase[];
  onGoToAuthority?: () => void;
  onPayFine?: (citationNumber: string) => Promise<void>;
}

export const OwnerNoticeView: React.FC<OwnerNoticeViewProps> = ({
  validatedCases,
  onGoToAuthority,
  onPayFine,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCitationId, setSelectedCitationId] = useState<string>('');
  const [isPaying, setIsPaying] = useState<boolean>(false);
  const [paidReceipt, setPaidReceipt] = useState<{ citationNumber: string; date: string } | null>(
    null
  );

  const filteredCases = validatedCases.filter((c) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const plate = c.vehicleDetails.licensePlate.toLowerCase();
    const citation = c.notificationSent?.citationNumber.toLowerCase() || '';
    const owner = c.ownerInfo.name.toLowerCase();
    return plate.includes(query) || citation.includes(query) || owner.includes(query);
  });

  const activeCase =
    filteredCases.find((c) => c.notificationSent?.citationNumber === selectedCitationId) ||
    filteredCases[0];

  const handlePay = async (citationNum: string) => {
    setIsPaying(true);
    try {
      if (onPayFine) {
        await onPayFine(citationNum);
      } else {
        await fetch(`/api/owner/pay/${citationNum}`, { method: 'POST' });
      }
      setPaidReceipt({
        citationNumber: citationNum,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      if (activeCase && activeCase.notificationSent) {
        activeCase.notificationSent.isPaid = true;
      }
    } catch (err) {
      console.error('Pay error:', err);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Light Blue Official Government Public Service Portal Header (Replaced black header) */}
      <div className="bg-gradient-to-r from-sky-100 via-sky-50 to-blue-100 text-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-sky-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-sky-300 text-sky-700 flex items-center justify-center shrink-0 shadow-2xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-slate-900 tracking-tight">
                Department of Motor Vehicles & Traffic Citations
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Official Vehicle Owner Citation & Automated Fine Notice Service
            </p>
          </div>
        </div>

        {/* Search Bar for Owners */}
        <div className="mt-4 pt-3 border-t border-sky-200/80 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by License Plate or Citation #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-sky-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-sky-500 shadow-2xs"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-600 hover:text-slate-900 px-2 py-1 font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Dispatched Citations Selector Chips */}
      {filteredCases.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {filteredCases.map((c) => {
            const isSelected = c.notificationSent?.citationNumber === activeCase?.notificationSent?.citationNumber;
            const isPaid = c.notificationSent?.isPaid;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCitationId(c.notificationSent?.citationNumber || '')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 flex items-center gap-1.5 border transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="font-mono font-bold">
                  {c.vehicleDetails.licensePlate}
                </span>
                <span className="text-[10px] text-slate-400">
                  ({c.notificationSent?.citationNumber || c.id})
                </span>
                {isPaid ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Paid" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-rose-500" title="Payment Due" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredCases.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500">
            No matching citations found. When the authority validates a case with <strong className="text-slate-800">"Go"</strong>, the fine notice automatically appears here.
          </p>
          {onGoToAuthority && (
            <button
              onClick={onGoToAuthority}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
            >
              Open Authority Terminal
            </button>
          )}
        </div>
      ) : activeCase && activeCase.notificationSent ? (
        /* Detailed Official Notice Card */
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          {/* Header Badge */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Notice of Parking Violation
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Citation Ref: {activeCase.notificationSent.citationNumber}
              </div>
            </div>
            {activeCase.notificationSent.isPaid ? (
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                PAID & CLEARED
              </span>
            ) : (
              <span className="text-[10px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                FINE PAYMENT DUE
              </span>
            )}
          </div>

          {/* SMS Notification Banner */}
          <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-700 font-mono border border-slate-200/80 space-y-1">
            <div className="text-[10px] text-slate-400 font-sans flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-600 font-medium">
                <Bell className="w-3 h-3 text-sky-600" />
                Automated SMS Alert Delivered
              </span>
              <span>{activeCase.notificationSent.sentAt}</span>
            </div>
            <p className="leading-relaxed">
              {activeCase.notificationSent.messagePreview}
            </p>
            <div className="text-[10px] text-slate-400 font-sans pt-0.5">
              Delivered to registered owner: {activeCase.ownerInfo.name} ({activeCase.ownerInfo.phone})
            </div>
          </div>

          {/* Citation Info Breakdown */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Vehicle Plate</span>
              <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                {activeCase.vehicleDetails.licensePlate}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {activeCase.vehicleDetails.makeModel}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Fine Assessment</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">
                ${activeCase.fineAmount}.00
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Due: {activeCase.notificationSent.paymentDue}
              </div>
            </div>
          </div>

          {/* Infraction & Location */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Violation Type</span>
              <span className="font-semibold text-slate-800 text-right max-w-[240px]">
                {activeCase.violationType}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Location Tag</span>
              <span className="text-slate-600 text-right max-w-[240px] truncate">
                {activeCase.location}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Verification Source</span>
              <span className="text-slate-600">CivicEye AI Proof Engine & Authority Officer</span>
            </div>
          </div>

          {/* Photographic Evidence Attachment */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Photographic Evidence on Record
            </span>
            <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={activeCase.imageUrl}
                alt="Violation proof"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Pay Button / Receipt */}
          <div className="pt-2">
            {activeCase.notificationSent.isPaid ? (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center text-xs text-emerald-800 space-y-0.5">
                <div className="font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Citation Fully Paid & Cleared
                </div>
                <div className="text-[11px] text-emerald-700 font-mono">
                  Receipt Ref: REC-{activeCase.notificationSent.citationNumber}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handlePay(activeCase.notificationSent!.citationNumber)}
                disabled={isPaying}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4" />
                {isPaying ? 'Processing Payment...' : `Pay Fine ($${activeCase.fineAmount}.00)`}
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
