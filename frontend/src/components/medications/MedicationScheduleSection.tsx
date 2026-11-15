'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useActiveProfile } from '../../context/ActiveProfileContext';
import { api } from '../../lib/api';
import { Medication, SlotGroupedMedications } from '../../lib/types';
import { MedicationCard } from './MedicationCard';
import { AddMedicationModal } from './AddMedicationModal';
import { EditMedicationModal } from './EditMedicationModal';
import { DeleteMedicationModal } from './DeleteMedicationModal';
import { Pill, Plus, Calendar, Sparkles } from 'lucide-react';

export function MedicationScheduleSection() {
  const { activeProfile, activeSummary } = useActiveProfile();
  const [groupedMeds, setGroupedMeds] = useState<SlotGroupedMedications | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [deletingMed, setDeletingMed] = useState<Medication | null>(null);

  const canEdit = activeSummary?.role_in_circle !== 'other';

  const loadMedications = useCallback(async () => {
    if (!activeProfile) return;
    setIsLoading(true);
    try {
      const data = await api.getGroupedMedications(activeProfile.id);
      setGroupedMeds(data);
    } catch (err) {
      console.error('Failed to load medications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeProfile]);

  useEffect(() => {
    loadMedications();
  }, [loadMedications]);

  if (!activeProfile) return null;

  const slots = [
    {
      key: 'morning' as const,
      title: 'Morning Routine',
      icon: '🌅',
      timeRange: 'Around 08:00 AM • Breakfast',
      bgHeader: 'from-amber-500/10 to-orange-500/10 border-amber-200/60',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
    },
    {
      key: 'afternoon' as const,
      title: 'Afternoon Routine',
      icon: '☀️',
      timeRange: 'Around 01:00 PM • Lunch',
      bgHeader: 'from-blue-500/10 to-cyan-500/10 border-blue-200/60',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-200',
    },
    {
      key: 'evening' as const,
      title: 'Evening Routine',
      icon: '🌇',
      timeRange: 'Around 07:00 PM • Dinner',
      bgHeader: 'from-indigo-500/10 to-purple-500/10 border-indigo-200/60',
      badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-200',
    },
    {
      key: 'night' as const,
      title: 'Bedtime Routine',
      icon: '🌙',
      timeRange: 'Around 09:30 PM • Sleep',
      bgHeader: 'from-slate-700/10 to-slate-900/10 border-slate-300/60',
      badgeColor: 'bg-slate-200 text-slate-800 border-slate-300',
    },
  ];

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-gray-900">Medication Schedule</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                {groupedMeds?.total_count || 0} Prescriptions
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Daily routine for <strong className="text-gray-800">{activeProfile.name}</strong> • Categorized by time of day
            </p>
          </div>
        </div>

        {canEdit && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Medication
          </button>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-gray-200 animate-pulse space-y-3">
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="h-16 bg-gray-100 rounded-2xl"></div>
            </div>
          ))}
        </div>
      )}

      {/* Time Slots Grid */}
      {!isLoading && groupedMeds && (
        <div className="space-y-6">
          {slots.map((slot) => {
            const medsInSlot = groupedMeds[slot.key] || [];

            return (
              <div
                key={slot.key}
                className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden"
              >
                {/* Slot Header */}
                <div
                  className={`px-6 py-4 bg-gradient-to-r ${slot.bgHeader} border-b flex items-center justify-between`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{slot.icon}</span>
                    <div>
                      <h4 className="text-base font-bold text-gray-900">{slot.title}</h4>
                      <p className="text-xs text-gray-500">{slot.timeRange}</p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${slot.badgeColor}`}
                  >
                    {medsInSlot.length} {medsInSlot.length === 1 ? 'dose' : 'doses'}
                  </span>
                </div>

                {/* Slot Content */}
                <div className="p-4 sm:p-6">
                  {medsInSlot.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 text-xs flex flex-col items-center justify-center gap-1.5">
                      <p>No medications scheduled for {slot.title.toLowerCase()}.</p>
                      {canEdit && (
                        <button
                          onClick={() => setIsAddOpen(true)}
                          className="text-emerald-600 hover:text-emerald-700 font-semibold"
                        >
                          + Add a medication
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {medsInSlot.map((med) => (
                        <MedicationCard
                          key={med.id}
                          medication={med}
                          canEdit={canEdit}
                          onEdit={(m) => setEditingMed(m)}
                          onDelete={(m) => setDeletingMed(m)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AddMedicationModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={loadMedications}
      />

      <EditMedicationModal
        isOpen={!!editingMed}
        medication={editingMed}
        onClose={() => setEditingMed(null)}
        onSuccess={loadMedications}
      />

      <DeleteMedicationModal
        isOpen={!!deletingMed}
        medication={deletingMed}
        onClose={() => setDeletingMed(null)}
        onSuccess={loadMedications}
      />
    </section>
  );
}

