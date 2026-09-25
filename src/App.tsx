/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  ShieldCheck,
  Building2,
  Database,
  RefreshCw,
} from 'lucide-react';
import { CitizenView } from './components/CitizenView';
import { AuthorityView } from './components/AuthorityView';
import { OwnerNoticeView } from './components/OwnerNoticeView';
import { ParkingCase } from './types';

export default function App() {
  const [activePersona, setActivePersona] = useState<'citizen' | 'authority' | 'owner'>('citizen');
  const [cases, setCases] = useState<ParkingCase[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const fetchCases = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/cases');
      if (res.ok) {
        const data = await res.json();
        if (data.cases) {
          setCases(data.cases);
        }
      }
    } catch (err) {
      console.warn('Could not load cases from backend:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleCaseSubmitted = (newCase: ParkingCase) => {
    setCases((prev) => [newCase, ...prev]);
  };

  const handleTakeAction = async (caseId: string, decision: 'GO' | 'NO_GO') => {
    try {
      const res = await fetch(`/api/cases/${caseId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });

      if (res.ok) {
        const data = await res.json();
        setCases((prev) =>
          prev.map((c) => (c.id === caseId ? data.case : c))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayFine = async (citationNumber: string) => {
    try {
      const res = await fetch(`/api/owner/pay/${citationNumber}`, {
        method: 'POST',
      });
      if (res.ok) {
        setCases((prev) =>
          prev.map((c) => {
            if (c.notificationSent?.citationNumber === citationNumber) {
              return {
                ...c,
                notificationSent: {
                  ...c.notificationSent,
                  isPaid: true,
                },
              };
            }
            return c;
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetCases = async () => {
    try {
      const res = await fetch('/api/cases/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setCases(data.cases);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const pendingCount = cases.filter((c) => c.status === 'PENDING_REVIEW').length;
  const validatedCases = cases.filter((c) => c.status === 'VALIDATED');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-yellow-200">
      {/* Light Blue Dashboard Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-sky-100 via-sky-50 to-blue-100 text-slate-900 border-b border-sky-200 px-3 sm:px-6 py-2.5 shadow-xs">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Shared Backend Live Status */}
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-sky-600" />
              Shared Live Engine:
            </span>
            <span className="text-slate-600 hidden md:inline font-medium">
              1 Central Backend • 3 Dedicated Interfaces
            </span>
            <button
              onClick={fetchCases}
              title="Refresh live data from backend"
              className="text-slate-500 hover:text-slate-900 ml-1 p-0.5 rounded hover:bg-sky-200/50 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Citizen / Authority / Notice Yellow Tabs */}
          <div className="flex items-center gap-1 bg-yellow-300/90 p-1 rounded-2xl border border-yellow-400 shadow-xs">
            <button
              onClick={() => setActivePersona('citizen')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activePersona === 'citizen'
                  ? 'bg-yellow-400 text-slate-950 shadow-xs border border-yellow-500'
                  : 'text-yellow-950 hover:bg-yellow-400/60 font-semibold'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Citizen App
            </button>

            <button
              onClick={() => setActivePersona('authority')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all relative ${
                activePersona === 'authority'
                  ? 'bg-yellow-400 text-slate-950 shadow-xs border border-yellow-500'
                  : 'text-yellow-950 hover:bg-yellow-400/60 font-semibold'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Authority
              {pendingCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-slate-900 text-yellow-300 text-[10px] font-bold flex items-center justify-center shadow-2xs">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActivePersona('owner')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all relative ${
                activePersona === 'owner'
                  ? 'bg-yellow-400 text-slate-950 shadow-xs border border-yellow-500'
                  : 'text-yellow-950 hover:bg-yellow-400/60 font-semibold'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Notice Portal
              {validatedCases.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center shadow-2xs">
                  {validatedCases.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main View Area (Renders the distinct persona's interface) */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 sm:py-8 flex flex-col items-center justify-start">
        {activePersona === 'citizen' && (
          <CitizenView cases={cases} onCaseSubmitted={handleCaseSubmitted} />
        )}

        {activePersona === 'authority' && (
          <AuthorityView
            cases={cases}
            onTakeAction={handleTakeAction}
            onResetCases={handleResetCases}
            onViewOwnerPortal={() => setActivePersona('owner')}
          />
        )}

        {activePersona === 'owner' && (
          <OwnerNoticeView
            validatedCases={validatedCases}
            onGoToAuthority={() => setActivePersona('authority')}
            onPayFine={handlePayFine}
          />
        )}
      </main>

      {/* Light Blue Minimalist Footer */}
      <footer className="border-t border-sky-100 bg-sky-50/50 py-3 text-center text-xs text-slate-500">
        CivicEye • Spot • Verify • Act — Shared Live Engine with Yellow Navigation & Light Blue Dashboard
      </footer>
    </div>
  );
}
