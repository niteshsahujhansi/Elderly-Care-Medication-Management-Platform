'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useActiveProfile } from '../../context/ActiveProfileContext';
import { api } from '../../lib/api';
import { Appointment, AppointmentListSummary } from '../../lib/types';
import { AppointmentCard } from './AppointmentCard';
import { ScheduleAppointmentModal } from './ScheduleAppointmentModal';
import { EditAppointmentModal } from './EditAppointmentModal';
import { useLanguage } from '../../context/LanguageContext';
import { Calendar, Plus, Stethoscope, Clock, CheckCircle2 } from 'lucide-react';

export function AppointmentsSection() {
  const { activeProfile, activeSummary } = useActiveProfile();
  const { t } = useLanguage();

  const [summary, setSummary] = useState<AppointmentListSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  // Modals state
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const canEdit = activeSummary?.role_in_circle !== 'other';

  const loadAppointments = useCallback(async () => {
    if (!activeProfile) return;
    setLoading(true);
    try {
      const data = await api.getAppointmentsSummary(activeProfile.id);
      setSummary(data);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  }, [activeProfile]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleComplete = async (appointmentId: number) => {
    await api.updateAppointment(appointmentId, { status: 'completed' });
    await loadAppointments();
  };

  const handleDelete = async (appointmentId: number) => {
    await api.deleteAppointment(appointmentId);
    await loadAppointments();
  };

  if (!activeProfile) return null;

  const upcomingList = summary?.upcoming || [];
  const pastList = summary?.past_or_completed || [];
  const currentList = activeTab === 'upcoming' ? upcomingList : pastList;

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold shadow-sm">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-100/70 px-2.5 py-0.5 rounded-full">
                Medical Visits
              </span>
              <span className="text-xs text-gray-500 font-medium">
                {activeProfile.name}&apos;s Doctor Calendar
              </span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight mt-1">
              {t('appointments_title', 'Medical Appointments')}
            </h2>
          </div>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={() => setIsScheduleOpen(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            {t('schedule_appointment', 'Schedule Visit')}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            activeTab === 'upcoming'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          {t('upcoming_appointments', 'Upcoming Visits')} ({upcomingList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('past')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            activeTab === 'past'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          {t('past_appointments', 'Past & Completed')} ({pastList.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-44 bg-gray-100 rounded-2xl"></div>
          ))}
        </div>
      ) : currentList.length === 0 ? (
        <div className="p-10 text-center rounded-2xl bg-gray-50 border border-dashed border-gray-200 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-gray-800">
            {activeTab === 'upcoming'
              ? 'No Upcoming Appointments'
              : 'No Past Appointments Found'}
          </h4>
          <p className="text-xs text-gray-500 mt-1 max-w-sm">
            {activeTab === 'upcoming'
              ? 'All consultations are up to date. Schedule your next routine checkup, eye exam, or lab review.'
              : 'Completed consultations and clinical checkups will be archived here for reference.'}
          </p>
          {activeTab === 'upcoming' && canEdit && (
            <button
              type="button"
              onClick={() => setIsScheduleOpen(true)}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Schedule First Visit
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentList.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              canEdit={canEdit}
              onEdit={(app) => setEditingAppointment(app)}
              onComplete={handleComplete}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <ScheduleAppointmentModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onSuccess={loadAppointments}
      />

      <EditAppointmentModal
        isOpen={!!editingAppointment}
        appointment={editingAppointment}
        onClose={() => setEditingAppointment(null)}
        onSuccess={loadAppointments}
      />
    </section>
  );
}
