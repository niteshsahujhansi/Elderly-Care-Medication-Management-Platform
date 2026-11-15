'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Appointment } from '../../lib/types';
import { X, Calendar, Stethoscope, AlertCircle, CheckCircle2 } from 'lucide-react';

interface EditAppointmentModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
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

export function EditAppointmentModal({
  isOpen,
  appointment,
  onClose,
  onSuccess,
}: EditAppointmentModalProps) {
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('General Physician');
  const [clinicOrHospital, setClinicOrHospital] = useState('');
  const [appointmentDatetime, setAppointmentDatetime] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [purposeOrReason, setPurposeOrReason] = useState('');
  const [preparationNotes, setPreparationNotes] = useState('');
  const [status, setStatus] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (appointment) {
      setDoctorName(appointment.doctor_name || '');
      setSpecialty(appointment.specialty || 'General Physician');
      setClinicOrHospital(appointment.clinic_or_hospital || '');
      // Format datetime to YYYY-MM-DDTHH:MM for input[type="datetime-local"]
      const dt = appointment.appointment_datetime ? appointment.appointment_datetime.slice(0, 16) : '';
      setAppointmentDatetime(dt);
      setContactPhone(appointment.contact_phone || '');
      setPurposeOrReason(appointment.purpose_or_reason || '');
      setPreparationNotes(appointment.preparation_notes || '');
      setStatus(appointment.status || 'upcoming');
      setError(null);
    }
  }, [appointment]);

  if (!isOpen || !appointment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName.trim() || !clinicOrHospital.trim() || !appointmentDatetime) {
      setError('Please fill in Doctor Name, Hospital/Clinic, and Appointment Date/Time.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.updateAppointment(appointment.id, {
        doctor_name: doctorName.trim(),
        specialty,
        clinic_or_hospital: clinicOrHospital.trim(),
        appointment_datetime: appointmentDatetime,
        contact_phone: contactPhone.trim() || undefined,
        purpose_or_reason: purposeOrReason.trim() || undefined,
        preparation_notes: preparationNotes.trim() || undefined,
        status,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update appointment');
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
              <h3 className="text-base font-extrabold tracking-tight">Edit Medical Appointment</h3>
              <p className="text-xs text-emerald-100">
                Update visit details, clinic room, or consultation status
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

          {/* Status Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Appointment Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('upcoming')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 ${
                  status === 'upcoming'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Upcoming
              </button>
              <button
                type="button"
                onClick={() => setStatus('completed')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 ${
                  status === 'completed'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Completed
              </button>
              <button
                type="button"
                onClick={() => setStatus('cancelled')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 ${
                  status === 'cancelled'
                    ? 'bg-gray-700 text-white border-gray-700 shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Cancelled
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Doctor Name *
              </label>
              <input
                type="text"
                required
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
              value={purposeOrReason}
              onChange={(e) => setPurposeOrReason(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Preparation Guidelines (Optional)
            </label>
            <textarea
              rows={2}
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
              {isSubmitting ? 'Updating...' : 'Update Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
