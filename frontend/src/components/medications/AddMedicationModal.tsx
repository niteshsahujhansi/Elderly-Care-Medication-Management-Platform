'use client';

import React, { useState } from 'react';
import { useActiveProfile } from '../../context/ActiveProfileContext';
import { api } from '../../lib/api';
import { MedicationCreateInput } from '../../lib/types';
import { X, Pill, Clock, Plus, Check } from 'lucide-react';

interface AddMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddMedicationModal({ isOpen, onClose, onSuccess }: AddMedicationModalProps) {
  const { activeProfile } = useActiveProfile();
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [timeSlot, setTimeSlot] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');
  const [exactTime, setExactTime] = useState('08:00');
  const [instructions, setInstructions] = useState('Take with food');
  const [purpose, setPurpose] = useState('');
  const [pillColor, setPillColor] = useState('White');
  const [pillShape, setPillShape] = useState('Round');
  const [inventoryCount, setInventoryCount] = useState<number | undefined>(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !activeProfile) return null;

  const handleSlotSelect = (slot: 'morning' | 'afternoon' | 'evening' | 'night') => {
    setTimeSlot(slot);
    if (slot === 'morning') setExactTime('08:00');
    if (slot === 'afternoon') setExactTime('13:00');
    if (slot === 'evening') setExactTime('19:00');
    if (slot === 'night') setExactTime('21:30');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Medication name is required.');
      return;
    }
    if (!dosage.trim()) {
      setError('Dosage is required (e.g. 500 mg).');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const payload: MedicationCreateInput = {
        profile_id: activeProfile.id,
        name: name.trim(),
        dosage: dosage.trim(),
        time_slot: timeSlot,
        exact_time: exactTime,
        instructions: instructions.trim(),
        purpose: purpose.trim() || undefined,
        pill_color: pillColor,
        pill_shape: pillShape,
        inventory_count: inventoryCount,
      };

      await api.createMedication(payload);
      onSuccess();
      onClose();
      // Reset form
      setName('');
      setDosage('');
      setPurpose('');
    } catch (err: any) {
      setError(err.message || 'Failed to add medication');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Add Medication</h2>
              <p className="text-xs text-gray-500">
                Adding to <span className="font-semibold">{activeProfile.name}</span>&apos;s schedule
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {error}
            </div>
          )}

          {/* Time Slot Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Time of Day Slot <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'morning', label: 'Morning', icon: '🌅', defaultTime: '08:00' },
                { id: 'afternoon', label: 'Afternoon', icon: '☀️', defaultTime: '13:00' },
                { id: 'evening', label: 'Evening', icon: '🌇', defaultTime: '19:00' },
                { id: 'night', label: 'Bedtime', icon: '🌙', defaultTime: '21:30' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSlotSelect(s.id as any)}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-0.5 ${timeSlot === s.id
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                >
                  <span className="text-base">{s.icon}</span>
                  <span className="text-xs capitalize">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Name & Dosage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Medicine Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Metformin"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Dosage & Strength <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 500 mg or 1 tablet"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Exact Time & Purpose */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Scheduled Time (HH:MM)
              </label>
              <div className="relative">
                <input
                  type="time"
                  required
                  value={exactTime}
                  onChange={(e) => setExactTime(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Medical Purpose (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Blood sugar, Blood pressure"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Intake Instructions
            </label>
            <input
              type="text"
              placeholder="e.g. Take with food after meal"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {[
                'Take with food',
                'Take on empty stomach',
                'Take with full glass of water',
                'Take right before sleep',
              ].map((pill) => (
                <button
                  key={pill}
                  type="button"
                  onClick={() => setInstructions(pill)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-600 transition"
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>

          {/* Visual Pill Helpers (Shape & Color) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Pill Shape</label>
              <select
                value={pillShape}
                onChange={(e) => setPillShape(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Round">Round Tablet</option>
                <option value="Oval">Oval Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Liquid">Liquid Drops</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Pill Color</label>
              <select
                value={pillColor}
                onChange={(e) => setPillColor(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="White">White</option>
                <option value="Yellow">Yellow</option>
                <option value="Pink">Pink</option>
                <option value="Blue">Blue</option>
                <option value="Red">Red</option>
                <option value="Clear">Clear</option>
              </select>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5"
            >
              {isSubmitting ? 'Saving...' : <><Check className="w-4 h-4" /> Save to Schedule</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

