'use client';

import React, { useState } from 'react';
import { useActiveProfile } from '../../context/ActiveProfileContext';
import { api } from '../../lib/api';
import { X, Calendar, Clock, Stethoscope, MapPin, Phone, AlertCircle, Sparkles } from 'lucide-react';

interface ScheduleAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SPECIALTY_OPTIONS = [
  'General Physician',
  'Cardiologist',
  'Endocrinologist',
  'Ophthalmologist',
  'Orthopedic Surgeon',
  'Neurologist',
  'Pulmonologist',
  'Nephrologist',
  'Physical Therapist',
  'Dentist',
  'Other Specialist',
];

const PREPARATION_PRESETS = [
  'Fast 8 hours prior to blood tests',
  'Bring daily blood pressure log',
  'Bring all current prescription bottles',
  'Drink plenty of water before ultrasound',
  'Bring sunglasses (eye dilation planned)',
];

export function ScheduleAppointmentModal({
  isOpen,
  onClose,
  onSuccess,
}: ScheduleAppointmentModalProps) {
  const { activeProfile } = useActiveProfile();

  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('General Physician');
  const [clinicOrHospital, setClinicOrHospital] = useState('');
  const [appointmentDatetime, setAppointmentDatetime] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [purposeOrReason, setPurposeOrReason] = useState('');
  const [preparationNotes, setPreparationNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !activeProfile) return null;

  const handlePresetClick = (preset: string) => {
    if (preparationNotes.includes(preset)) return;
    setPreparationNotes((prev) => (prev ? `${prev}. ${preset}` : preset));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName.trim() || !clinicOrHospital.trim() || !appointmentDatetime) {
      setError('Please fill in Doctor Name, Hospital/Clinic, and Appointment Date/Time.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.createAppointment({
        profile_id: activeProfile.id,
        doctor_name: doctorName.trim(),
        specialty,
        clinic_or_hospital: clinicOrHospital.trim(),
        appointment_datetime: appointmentDatetime,
        contact_phone: contactPhone.trim() || undefined,
        purpose_or_reason: purposeOrReason.trim() || undefined,
        preparation_notes: preparationNotes.trim() || undefined,
      });

      // Reset
      setDoctorName('');
      setSpecialty('General Physician');
      setClinicOrHospital('');
      setAppointmentDatetime('');
      setContactPhone('');
      setPurposeOrReason('');
      setPreparationNotes('');

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to schedule appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Schedule Medical Appointment</h3>
              <p className="text-xs text-emerald-100">
                For {activeProfile.name} • Doctor visits, labs & checkups
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Doctor Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Sarah Adams"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Specialty
              </label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {SPECIALTY_OPTIONS.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Clinic or Hospital Address *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. City Memorial Hospital, Room 302, 42 Elm St"
              value={clinicOrHospital}
              onChange={(e) => setClinicOrHospital(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={appointmentDatetime}
                onChange={(e) => setAppointmentDatetime(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Clinic Phone (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. +1-555-0222"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Purpose / Reason for Visit
            </label>
            <input
              type="text"
              placeholder="e.g. Quarterly Diabetes & Blood Pressure Review"
              value={purposeOrReason}
              onChange={(e) => setPurposeOrReason(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Preparation Notes & Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Preparation Guidelines (Optional)
              </label>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Quick Presets
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-2">
              {PREPARATION_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className="text-[11px] px-2.5 py-1 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-800 text-gray-600 rounded-lg border border-gray-200 transition text-left"
                >
                  + {preset}
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              placeholder="e.g. Fast 8 hours prior. Bring daily blood pressure log."
              value={preparationNotes}
              onChange={(e) => setPreparationNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition"
            >
              {isSubmitting ? 'Scheduling...' : 'Save Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
