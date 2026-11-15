'use client';

import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Trash2,
  Stethoscope,
  XCircle,
} from 'lucide-react';
import { Appointment } from '../../lib/types';

interface AppointmentCardProps {
  appointment: Appointment;
  canEdit: boolean;
  onEdit: (appointment: Appointment) => void;
  onComplete: (appointmentId: number) => Promise<void>;
  onDelete: (appointmentId: number) => Promise<void>;
}

export function AppointmentCard({
  appointment,
  canEdit,
  onEdit,
  onComplete,
  onDelete,
}: AppointmentCardProps) {
  const [loadingAction, setLoadingAction] = React.useState<string | null>(null);

  // Compute countdown / relative date
  const getTimingBadge = () => {
    if (appointment.status === 'completed') {
      return {
        label: 'Completed',
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-500',
      };
    }
    if (appointment.status === 'cancelled') {
      return {
        label: 'Cancelled',
        bg: 'bg-gray-100 text-gray-600 border-gray-200',
        dot: 'bg-gray-400',
      };
    }

    try {
      const appDate = new Date(appointment.appointment_datetime);
      const now = new Date();
      // Set to midnight for calendar day diff
      const appDay = new Date(appDate.getFullYear(), appDate.getMonth(), appDate.getDate());
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const diffMs = appDay.getTime() - today.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      const timeStr = appDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (diffDays === 0) {
        return {
          label: `TODAY at ${timeStr}`,
          bg: 'bg-red-50 text-red-800 border-red-200 animate-pulse',
          dot: 'bg-red-500',
        };
      } else if (diffDays === 1) {
        return {
          label: `TOMORROW at ${timeStr}`,
          bg: 'bg-amber-50 text-amber-900 border-amber-200',
          dot: 'bg-amber-500',
        };
      } else if (diffDays > 1 && diffDays <= 7) {
        return {
          label: `In ${diffDays} days • ${appDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} at ${timeStr}`,
          bg: 'bg-teal-50 text-teal-800 border-teal-200',
          dot: 'bg-teal-500',
        };
      } else if (diffDays > 7) {
        return {
          label: `${appDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at ${timeStr}`,
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-blue-500',
        };
      } else {
        return {
          label: `Past Due (${appDate.toLocaleDateString([], { month: 'short', day: 'numeric' })})`,
          bg: 'bg-orange-50 text-orange-800 border-orange-200',
          dot: 'bg-orange-500',
        };
      }
    } catch {
      return {
        label: appointment.appointment_datetime,
        bg: 'bg-gray-100 text-gray-700 border-gray-200',
        dot: 'bg-gray-400',
      };
    }
  };

  const badge = getTimingBadge();

  const handleCompleteClick = async () => {
    setLoadingAction('complete');
    try {
      await onComplete(appointment.id);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeleteClick = async () => {
    if (confirm(`Are you sure you want to delete the appointment with ${appointment.doctor_name}?`)) {
      setLoadingAction('delete');
      try {
        await onDelete(appointment.id);
      } finally {
        setLoadingAction(null);
      }
    }
  };

  const isCompleted = appointment.status === 'completed';
  const isCancelled = appointment.status === 'cancelled';
  const isUpcoming = appointment.status === 'upcoming';

  return (
    <div
      className={`rounded-2xl p-5 border transition flex flex-col justify-between gap-4 ${
        isCompleted
          ? 'bg-emerald-50/20 border-emerald-200/60 opacity-90'
          : isCancelled
          ? 'bg-gray-50/50 border-gray-200/60 opacity-75'
          : 'bg-white border-gray-200 hover:border-emerald-300 shadow-sm'
      }`}
    >
      <div className="space-y-3">
        {/* Top Urgency Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 shadow-sm ${badge.bg}`}
          >
            <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
            {badge.label}
          </span>

          <span className="text-[11px] font-semibold text-gray-400">
            Scheduled by {appointment.scheduled_by_name}
          </span>
        </div>

        {/* Doctor & Specialty */}
        <div className="flex items-start gap-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
              isCompleted
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white'
            }`}
          >
            <Stethoscope className="w-5 h-5" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-base font-extrabold text-gray-900 leading-tight">
                {appointment.doctor_name}
              </h4>
              <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                {appointment.specialty}
              </span>
            </div>

            {/* Clinic / Location */}
            <p className="text-xs text-gray-600 font-medium flex items-center gap-1.5 mt-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{appointment.clinic_or_hospital}</span>
            </p>

            {/* Phone */}
            {appointment.contact_phone && (
              <p className="text-xs text-gray-500 font-mono flex items-center gap-1.5 mt-1">
                <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>{appointment.contact_phone}</span>
              </p>
            )}
          </div>
        </div>

        {/* Purpose */}
        {appointment.purpose_or_reason && (
          <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100 text-xs text-gray-700">
            <span className="font-bold text-gray-900">Purpose: </span>
            {appointment.purpose_or_reason}
          </div>
        )}

        {/* Preparation Notes Alert */}
        {appointment.preparation_notes && (
          <div className="bg-amber-50/80 rounded-xl p-3 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase tracking-wider text-[10px] text-amber-800 block mb-0.5">
                Preparation Guidelines:
              </span>
              <p className="leading-relaxed">{appointment.preparation_notes}</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      {canEdit && (
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          <div>
            {isUpcoming && (
              <button
                type="button"
                disabled={loadingAction === 'complete'}
                onClick={handleCompleteClick}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <CheckCircle2 className="w-4 h-4" />
                {loadingAction === 'complete' ? 'Saving...' : 'Mark Completed'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onEdit(appointment)}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg text-xs font-semibold transition flex items-center gap-1"
              title="Edit Appointment"
            >
              <Edit3 className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>

            <button
              type="button"
              disabled={loadingAction === 'delete'}
              onClick={handleDeleteClick}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Delete Appointment"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
