'use client';

import React from 'react';
import { Medication } from '../../lib/types';
import { Pill, Clock, AlertCircle, Edit3, Trash2 } from 'lucide-react';

interface MedicationCardProps {
  medication: Medication;
  canEdit: boolean;
  onEdit: (med: Medication) => void;
  onDelete: (med: Medication) => void;
}

export function MedicationCard({ medication, canEdit, onEdit, onDelete }: MedicationCardProps) {
  const getPillColorBadge = (color?: string | null) => {
    switch (color?.toLowerCase()) {
      case 'white':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'yellow':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'pink':
        return 'bg-pink-100 text-pink-800 border-pink-300';
      case 'blue':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'red':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Left: Pill Info */}
      <div className="flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
          <Pill className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-bold text-gray-900 text-base">{medication.name}</h4>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {medication.dosage}
            </span>
            {medication.pill_color && (
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getPillColorBadge(
                  medication.pill_color
                )}`}
              >
                {medication.pill_color} {medication.pill_shape || 'Pill'}
              </span>
            )}
          </div>

          {medication.purpose && (
            <p className="text-xs font-medium text-emerald-700 flex items-center gap-1">
              For: {medication.purpose}
            </p>
          )}

          {medication.instructions && (
            <p className="text-xs text-gray-600 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg inline-block">
              💡 {medication.instructions}
            </p>
          )}
        </div>
      </div>

      {/* Right: Timing & Actions */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 gap-2 shrink-0">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
          <Clock className="w-3.5 h-3.5 text-gray-500" />
          {medication.exact_time}
        </div>

        {canEdit && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEdit(medication)}
              title="Edit Medication"
              className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(medication)}
              title="Delete Medication"
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

