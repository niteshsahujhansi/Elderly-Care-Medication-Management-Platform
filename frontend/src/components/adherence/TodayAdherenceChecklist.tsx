'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertCircle,
  Sun,
  Sunset,
  Moon,
  Coffee,
  Pill,
  Lock,
  Sparkles,
} from 'lucide-react';
import { TodayAdherenceSummary, TodayDoseItem } from '../../lib/types';
import { SkipDoseModal } from './SkipDoseModal';

interface TodayAdherenceChecklistProps {
  summary: TodayAdherenceSummary | null;
  loading: boolean;
  userRole: string;
  onTakeDose: (medicationId: number, timeSlot: string) => Promise<void>;
  onSkipDose: (medicationId: number, timeSlot: string, notes: string) => Promise<void>;
  onResetDose: (logId: number) => Promise<void>;
}

const SLOT_CONFIG: Record<
  string,
  { label: string; timeRange: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  morning: {
    label: 'Morning',
    timeRange: '07:00 AM - 11:59 AM',
    icon: Coffee,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  afternoon: {
    label: 'Afternoon',
    timeRange: '12:00 PM - 04:59 PM',
    icon: Sun,
    color: 'text-orange-600 bg-orange-50 border-orange-200',
  },
  evening: {
    label: 'Evening',
    timeRange: '05:00 PM - 08:59 PM',
    icon: Sunset,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  night: {
    label: 'Bedtime',
    timeRange: '09:00 PM - Late',
    icon: Moon,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
  },
};

export function TodayAdherenceChecklist({
  summary,
  loading,
  userRole,
  onTakeDose,
  onSkipDose,
  onResetDose,
}: TodayAdherenceChecklistProps) {
  const [skipModalDose, setSkipModalDose] = useState<TodayDoseItem | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const canEdit = userRole !== 'other';

  const handleTake = async (medId: number, slot: string) => {
    setProcessingId(medId);
    try {
      await onTakeDose(medId, slot);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReset = async (logId: number) => {
    setProcessingId(logId);
    try {
      await onResetDose(logId);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm animate-pulse space-y-6">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="h-3 bg-gray-100 rounded-full w-full"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-50 rounded-2xl border border-gray-100"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const pct = summary.compliance_percentage;
  const isComplete = pct === 100 && summary.total_doses > 0;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100/80 shadow-lg shadow-emerald-950/5">
      {/* Header & Progress */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
              Today&apos;s Checklist
            </span>
            <span className="text-xs text-gray-500 font-medium">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mt-1">
            Daily Medication Routine
          </h2>
        </div>

        {/* Adherence progress pill */}
        <div className="flex items-center gap-3 bg-emerald-50/80 border border-emerald-200/70 p-3 rounded-2xl">
          <div className="text-right">
            <span className="text-xs font-semibold text-emerald-900 block">
              {summary.taken_count} of {summary.total_doses} Doses Taken
            </span>
            <span className="text-[11px] text-emerald-700">
              {summary.pending_count > 0 ? `${summary.pending_count} pending today` : 'All scheduled doses logged'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-emerald-600/20">
            {pct}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isComplete
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Motivational Subtext */}
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            {isComplete ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Perfect adherence! All medications taken for today.
              </span>
            ) : summary.taken_count > 0 ? (
              <span className="text-emerald-700 font-medium">
                Great progress today! Keep staying consistent.
              </span>
            ) : (
              <span>Ready for today&apos;s routine. Tap &apos;Take Dose&apos; when taken.</span>
            )}
          </div>
          {!canEdit && (
            <span className="flex items-center gap-1 text-gray-400 font-medium">
              <Lock className="w-3 h-3" /> View-only access
            </span>
          )}
        </div>
      </div>

      {/* Slots Section */}
      <div className="space-y-6">
        {(['morning', 'afternoon', 'evening', 'night'] as const).map((slotKey) => {
          const config = SLOT_CONFIG[slotKey];
          const SlotIcon = config.icon;
          const doses = summary.slots[slotKey] || [];

          if (doses.length === 0) return null;

          return (
            <div key={slotKey} className="space-y-3">
              {/* Slot Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg border ${config.color}`}>
                    <SlotIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900 tracking-tight">
                      {config.label}
                    </h3>
                    <span className="text-[11px] text-gray-400">{config.timeRange}</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-gray-400">
                  {doses.filter((d) => d.status === 'taken').length}/{doses.length} taken
                </span>
              </div>

              {/* Doses in this slot */}
              <div className="grid grid-cols-1 gap-3">
                {doses.map((dose) => {
                  const isTaken = dose.status === 'taken';
                  const isSkipped = dose.status === 'skipped';
                  const isPending = dose.status === 'pending';

                  return (
                    <div
                      key={dose.medication_id}
                      className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isTaken
                          ? 'bg-emerald-50/40 border-emerald-200/80'
                          : isSkipped
                          ? 'bg-amber-50/40 border-amber-200/80'
                          : 'bg-white border-gray-200 hover:border-emerald-300 shadow-sm'
                      }`}
                    >
                      {/* Left: Med Details */}
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                            isTaken
                              ? 'bg-emerald-600 text-white'
                              : isSkipped
                              ? 'bg-amber-500 text-white'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {isTaken ? (
                            <CheckCircle2 className="w-6 h-6" />
                          ) : isSkipped ? (
                            <AlertCircle className="w-6 h-6" />
                          ) : (
                            <Pill className="w-6 h-6" />
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-base font-extrabold text-gray-900">
                              {dose.name}
                            </h4>
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-100/60 px-2.5 py-0.5 rounded-full">
                              {dose.dosage}
                            </span>
                            <span className="text-xs font-mono font-semibold text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              {dose.exact_time}
                            </span>
                          </div>

                          {dose.instructions && (
                            <p className="text-xs text-gray-600 mt-1 font-medium">
                              📝 {dose.instructions}
                            </p>
                          )}

                          {dose.purpose && (
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              For: {dose.purpose}
                            </p>
                          )}

                          {/* Status info line if taken or skipped */}
                          {isTaken && (
                            <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-emerald-800">
                              <span>✅ Taken</span>
                              {dose.logged_by_name && (
                                <span className="text-emerald-700">
                                  by <strong className="font-bold">{dose.logged_by_name}</strong>
                                </span>
                              )}
                              {dose.logged_at && (
                                <span className="text-emerald-600 font-mono text-[11px]">
                                  • {new Date(dose.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                              {dose.notes && (
                                <span className="text-emerald-700 italic">(&ldquo;{dose.notes}&rdquo;)</span>
                              )}
                            </div>
                          )}

                          {isSkipped && (
                            <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-amber-800">
                              <span>⏭️ Skipped</span>
                              {dose.notes && (
                                <span className="italic">(&ldquo;{dose.notes}&rdquo;)</span>
                              )}
                              {dose.logged_by_name && (
                                <span className="text-amber-700">
                                  • logged by {dose.logged_by_name}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {isPending && canEdit && (
                          <>
                            <button
                              type="button"
                              disabled={processingId === dose.medication_id}
                              onClick={() => handleTake(dose.medication_id, dose.time_slot)}
                              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              {processingId === dose.medication_id ? 'Logging...' : 'Take Dose'}
                            </button>

                            <button
                              type="button"
                              disabled={processingId === dose.medication_id}
                              onClick={() => setSkipModalDose(dose)}
                              className="px-3 py-2.5 bg-gray-100 hover:bg-amber-100 text-gray-700 hover:text-amber-900 text-xs font-semibold rounded-xl transition flex items-center gap-1"
                              title="Skip Dose"
                            >
                              Skip
                            </button>
                          </>
                        )}

                        {(isTaken || isSkipped) && canEdit && dose.log_id && (
                          <button
                            type="button"
                            disabled={processingId === dose.log_id}
                            onClick={() => handleReset(dose.log_id!)}
                            className="px-3 py-2 text-gray-400 hover:text-gray-700 hover:bg-white rounded-xl text-xs font-semibold transition border border-gray-200/80 flex items-center gap-1 shadow-sm"
                            title="Undo accidental log"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            {processingId === dose.log_id ? 'Undoing...' : 'Undo'}
                          </button>
                        )}

                        {!canEdit && isPending && (
                          <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1.5 rounded-xl">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Skip Dose Modal */}
      <SkipDoseModal
        isOpen={!!skipModalDose}
        dose={skipModalDose}
        onClose={() => setSkipModalDose(null)}
        onConfirm={async (medId, timeSlot, notes) => {
          await onSkipDose(medId, timeSlot, notes);
        }}
      />
    </div>
  );
}
