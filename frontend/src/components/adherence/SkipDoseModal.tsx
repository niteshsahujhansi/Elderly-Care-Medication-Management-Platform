'use client';

import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { TodayDoseItem } from '../../lib/types';

interface SkipDoseModalProps {
  isOpen: boolean;
  dose: TodayDoseItem | null;
  onClose: () => void;
  onConfirm: (medicationId: number, timeSlot: string, notes: string) => Promise<void>;
}

const COMMON_REASONS = [
  'Feeling unwell / nauseous',
  'Doctor advised to pause',
  'Ran out of medication',
  'Fasting / medical test today',
  'Experiencing side effects',
  'Dose delayed to later',
];

export function SkipDoseModal({ isOpen, dose, onClose, onConfirm }: SkipDoseModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customNote, setCustomNote] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !dose) return null;

  const handleChipClick = (reason: string) => {
    setSelectedReason(reason);
    setCustomNote(reason);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onConfirm(dose.medication_id, dose.time_slot, customNote.trim() || selectedReason || 'Skipped dose');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-amber-50/70 border-b border-amber-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900">Skip Medication Dose</h3>
              <p className="text-xs text-amber-800 font-medium">
                {dose.name} ({dose.dosage}) • {dose.time_slot.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
              Select Reason (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => handleChipClick(reason)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium transition border ${
                    selectedReason === reason
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
              Specific Note for Caregiver / Doctor
            </label>
            <textarea
              rows={3}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Grandpa complained of an upset stomach this morning, doctor said to skip this single dose."
              className="w-full px-4 py-2.5 text-xs text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-[11px] text-amber-800 flex items-center gap-2">
            <span>ℹ️</span>
            <span>This will be logged in the senior&apos;s history so family and nurses know why it was skipped.</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition"
            >
              {submitting ? 'Saving...' : 'Confirm Skip Dose'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
