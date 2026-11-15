'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Medication, MedicationCreateInput } from '../../lib/types';
import { X, Edit3, Check } from 'lucide-react';

interface EditMedicationModalProps {
  isOpen: boolean;
  medication: Medication | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditMedicationModal({
  isOpen,
  medication,
  onClose,
  onSuccess,
}: EditMedicationModalProps) {
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

  useEffect(() => {
    if (medication && isOpen) {
      setName(medication.name || '');
      setDosage(medication.dosage || '');
      setTimeSlot(medication.time_slot || 'morning');
      setExactTime(medication.exact_time || '08:00');
      setInstructions(medication.instructions || '');
      setPurpose(medication.purpose || '');
      setPillColor(medication.pill_color || 'White');
      setPillShape(medication.pill_shape || 'Round');
      setInventoryCount(medication.inventory_count || undefined);
      setError(null);
    }
  }, [medication, isOpen]);

  if (!isOpen || !medication) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Medication name is required.');
      return;
    }
    if (!dosage.trim()) {
      setError('Dosage is required.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const payload: Partial<MedicationCreateInput> = {
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

      await api.updateMedication(medication.id, payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update medication');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-emerald-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Edit Medication</h2>
              <p className="text-xs text-gray-500">
                Adjust dosage, timing, or instructions
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
                { id: 'morning', label: 'Morning', icon: '🌅' },
                { id: 'afternoon', label: 'Afternoon', icon: '☀️' },
                { id: 'evening', label: 'Evening', icon: '🌇' },
                { id: 'night', label: 'Bedtime', icon: '🌙' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setTimeSlot(s.id as any)}
                  className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-0.5 ${timeSlot === s.id
                    ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold ring-2 ring-amber-500/20'
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Dosage & Strength <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Exact Time & Purpose */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Scheduled Time (HH:MM)
              </label>
              <input
                type="time"
                required
                value={exactTime}
                onChange={(e) => setExactTime(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Medical Purpose
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
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
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Pill Visuals */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Pill Shape</label>
              <select
                value={pillShape}
                onChange={(e) => setPillShape(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
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
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
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
              className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-xl shadow-md shadow-amber-500/20 transition flex items-center gap-1.5"
            >
              {isSubmitting ? 'Saving...' : <><Check className="w-4 h-4" /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

