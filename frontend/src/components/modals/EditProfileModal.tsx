'use client';

import React, { useState, useEffect } from 'react';
import { useActiveProfile } from '../../context/ActiveProfileContext';
import { ElderlyProfileCreateInput } from '../../lib/types';
import { X, Edit3, ShieldAlert, Stethoscope, FileText, Check } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { activeProfile, updateProfile } = useActiveProfile();
  const [formData, setFormData] = useState<Partial<ElderlyProfileCreateInput>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeProfile && isOpen) {
      setFormData({
        name: activeProfile.name || '',
        age: activeProfile.age || undefined,
        gender: activeProfile.gender || 'Male',
        blood_group: activeProfile.blood_group || 'O+',
        primary_phone: activeProfile.primary_phone || '',
        emergency_phone: activeProfile.emergency_phone || '',
        emergency_contact_name: activeProfile.emergency_contact_name || '',
        primary_physician_name: activeProfile.primary_physician_name || '',
        primary_physician_phone: activeProfile.primary_physician_phone || '',
        hospital_preference: activeProfile.hospital_preference || '',
        allergies: activeProfile.allergies || '',
        chronic_conditions: activeProfile.chronic_conditions || '',
        dietary_restrictions: activeProfile.dietary_restrictions || '',
        mobility_status: activeProfile.mobility_status || 'Independent',
        special_care_instructions: activeProfile.special_care_instructions || '',
      });
      setError(null);
    }
  }, [activeProfile, isOpen]);

  if (!isOpen || !activeProfile) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setError('Patient name cannot be empty.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await updateProfile(activeProfile.id, formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-50/50 to-emerald-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Edit Healthcare Profile</h2>
              <p className="text-xs text-gray-500">
                Updating details for <span className="font-semibold">{activeProfile.name}</span> (Code: {activeProfile.circle_code})
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {error}
            </div>
          )}

          {/* Section 1: Core Info */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-3 flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> 1. Patient Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={formData.age || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value) : undefined })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Blood Group</label>
                  <select
                    value={formData.blood_group || 'O+'}
                    onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                    className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Emergency & Doctor */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-3 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-500" /> 2. Emergency & Medical Contacts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Emergency Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins (Daughter)"
                  value={formData.emergency_contact_name || ''}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Emergency Phone</label>
                <input
                  type="text"
                  placeholder="+1-555-0199"
                  value={formData.emergency_phone || ''}
                  onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Physician</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Sarah Adams"
                  value={formData.primary_physician_name || ''}
                  onChange={(e) => setFormData({ ...formData, primary_physician_name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Hospital Preference</label>
                <input
                  type="text"
                  placeholder="e.g. City Memorial Hospital"
                  value={formData.hospital_preference || ''}
                  onChange={(e) => setFormData({ ...formData, hospital_preference: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Allergies & Conditions */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-3 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-emerald-600" /> 3. Healthcare Vitals & Allergies
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Allergies (Critical)</label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Peanuts, Sulfa drugs"
                  value={formData.allergies || ''}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Chronic Conditions</label>
                <input
                  type="text"
                  placeholder="e.g. Type 2 Diabetes, Hypertension, Arthritis"
                  value={formData.chronic_conditions || ''}
                  onChange={(e) => setFormData({ ...formData, chronic_conditions: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Dietary Restrictions</label>
                  <input
                    type="text"
                    placeholder="e.g. Low sodium, Diabetic diet"
                    value={formData.dietary_restrictions || ''}
                    onChange={(e) => setFormData({ ...formData, dietary_restrictions: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Mobility Status</label>
                  <input
                    type="text"
                    placeholder="e.g. Independent with Cane"
                    value={formData.mobility_status || ''}
                    onChange={(e) => setFormData({ ...formData, mobility_status: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Special Care Instructions</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Needs reading glasses, take morning medication after breakfast"
                  value={formData.special_care_instructions || ''}
                  onChange={(e) => setFormData({ ...formData, special_care_instructions: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
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
