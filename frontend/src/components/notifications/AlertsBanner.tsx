'use client';

import React, { useState } from 'react';
import { useActiveProfile } from '../../context/ActiveProfileContext';
import { api } from '../../lib/api';
import { NotificationLog, AlertScanResult } from '../../lib/types';
import { NotificationHistoryModal } from './NotificationHistoryModal';
import {
  Bell,
  Send,
  Search,
  History,
  CheckCircle2,
  AlertTriangle,
  Mail,
  X,
  Sparkles,
} from 'lucide-react';

export function AlertsBanner() {
  const { activeProfile, activeSummary } = useActiveProfile();

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [lastDispatched, setLastDispatched] = useState<NotificationLog | null>(null);
  const [scanResult, setScanResult] = useState<AlertScanResult | null>(null);

  const canEdit = activeSummary?.role_in_circle !== 'other';

  if (!activeProfile) return null;

  const handleSendTestAlert = async (type: 'missed_dose_alert' | 'upcoming_dose_reminder' | 'appointment_reminder') => {
    setSubmitting(type);
    setScanResult(null);
    try {
      const log = await api.sendTestAlert({
        profile_id: activeProfile.id,
        alert_type: type,
      });
      setLastDispatched(log);
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch test alert');
    } finally {
      setSubmitting(null);
    }
  };

  const handleScanAlerts = async () => {
    setSubmitting('scan');
    setLastDispatched(null);
    try {
      const result = await api.scanAlerts(activeProfile.id);
      setScanResult(result);
    } catch (err: any) {
      alert(err.message || 'Failed to scan overdue alerts');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-950/10 border border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status info */}
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0 shadow-inner">
              <Bell className="w-6 h-6 animate-pulse" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-extrabold tracking-tight text-white">
                  Proactive Email Reminders & Escalations
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Engine Active
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Automatically monitors {activeProfile.name}&apos;s daily routine. If any dose remains unlogged &gt;30m after scheduled time, urgent email alerts are dispatched to subscribed family and caregivers.
              </p>
            </div>
          </div>

          {/* Quick Trigger Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0">
            {canEdit && (
              <>
                <button
                  type="button"
                  disabled={!!submitting}
                  onClick={() => handleSendTestAlert('missed_dose_alert')}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/20 transition flex items-center gap-1.5"
                  title="Dispatch instant simulated missed-dose email"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting === 'missed_dose_alert' ? 'Dispatching...' : 'Test Missed-Dose Alert'}
                </button>

                <button
                  type="button"
                  disabled={!!submitting}
                  onClick={handleScanAlerts}
                  className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white text-xs font-bold rounded-xl border border-white/15 transition flex items-center gap-1.5"
                  title="Scan today's routine for overdue doses"
                >
                  <Search className="w-3.5 h-3.5 text-teal-300" />
                  {submitting === 'scan' ? 'Scanning...' : 'Scan Overdue Now'}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/15 transition flex items-center gap-1.5"
            >
              <History className="w-3.5 h-3.5 text-slate-300" />
              Alert History
            </button>
          </div>
        </div>

        {/* Live Dispatched Feedback Card */}
        {lastDispatched && (
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-rose-500/30 flex items-start justify-between gap-3 animate-in fade-in duration-300">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Mail className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-rose-300 block text-xs">
                  Email Alert Dispatched Successfully ({lastDispatched.status.toUpperCase()})
                </span>
                <p className="font-semibold text-white mt-0.5">{lastDispatched.subject}</p>
                <p className="text-slate-300 text-[11px] mt-0.5">
                  Delivered to: <span className="font-mono text-emerald-300">{lastDispatched.recipient_email}</span> • {new Date(lastDispatched.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <button
              onClick={() => setLastDispatched(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Live Scan Results Card */}
        {scanResult && (
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-teal-500/30 flex items-start justify-between gap-3 animate-in fade-in duration-300">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-teal-300 block text-xs">
                  Automated Alert Scan Complete
                </span>
                <p className="font-semibold text-white mt-0.5">
                  Found {scanResult.overdue_doses_found} pending dose(s) • Dispatched {scanResult.alerts_dispatched} email alert(s) to care circle
                </p>
                <ul className="text-slate-300 text-[11px] mt-1 list-disc list-inside space-y-0.5">
                  {scanResult.details.slice(0, 3).map((detail, idx) => (
                    <li key={idx}>{detail}</li>
                  ))}
                </ul>
              </div>
            </div>
            <button
              onClick={() => setScanResult(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* History Modal */}
      <NotificationHistoryModal
        isOpen={isHistoryOpen}
        profileId={activeProfile.id}
        seniorName={activeProfile.name}
        onClose={() => setIsHistoryOpen(false)}
      />
    </>
  );
}
