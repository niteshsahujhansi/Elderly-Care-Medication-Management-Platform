'use client';

import React, { useEffect, useState } from 'react';
import { useActiveProfile } from '../../context/ActiveProfileContext';
import { CircleMemberDetail } from '../../lib/types';
import { api } from '../../lib/api';
import { X, Heart, ShieldAlert, Phone, Users, Stethoscope, FileText, Activity, Edit3 } from 'lucide-react';

interface ProfileDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditClick: () => void;
}

export function ProfileDetailsModal({ isOpen, onClose, onEditClick }: ProfileDetailsModalProps) {
  const { activeProfile, activeSummary } = useActiveProfile();
  const [members, setMembers] = useState<CircleMemberDetail[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    if (isOpen && activeProfile) {
      setLoadingMembers(true);
      api.getCircleMembers(activeProfile.id)
        .then(setMembers)
        .catch(console.error)
        .finally(() => setLoadingMembers(false));
    }
  }, [isOpen, activeProfile]);

  if (!isOpen || !activeProfile) return null;

  const canEdit = activeSummary?.role_in_circle !== 'other';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
        {/* Header Banner */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-bold">
              {activeProfile.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{activeProfile.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-medium">
                  {activeProfile.age ? `${activeProfile.age} yrs` : 'Senior'} • {activeProfile.gender || 'Patient'}
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-mono mt-0.5">
                Universal Circle Code: <span className="font-bold tracking-wider">{activeProfile.circle_code}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEditClick();
                }}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Key Vitals Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
              <span className="text-[11px] font-semibold text-red-600 uppercase tracking-wider block">Blood Group</span>
              <span className="text-lg font-bold text-red-900">{activeProfile.blood_group || 'Not specified'}</span>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">Mobility</span>
              <span className="text-sm font-bold text-blue-900">{activeProfile.mobility_status || 'Independent'}</span>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">Diet</span>
              <span className="text-sm font-bold text-amber-900 truncate block">{activeProfile.dietary_restrictions || 'Standard'}</span>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl">
              <span className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider block">Language</span>
              <span className="text-sm font-bold text-purple-900">{activeProfile.preferred_language || 'English'}</span>
            </div>
          </div>

          {/* Emergency & Doctor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-500" /> Emergency Contact
              </h4>
              <p className="text-sm font-semibold text-gray-900">{activeProfile.emergency_contact_name || 'Primary Family'}</p>
              <p className="text-sm font-mono text-gray-600 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> {activeProfile.emergency_phone || 'None provided'}
              </p>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-emerald-600" /> Primary Physician
              </h4>
              <p className="text-sm font-semibold text-gray-900">{activeProfile.primary_physician_name || 'Not assigned'}</p>
              <p className="text-xs text-gray-500">{activeProfile.hospital_preference || 'Local Clinic'}</p>
            </div>
          </div>

          {/* Allergies & Chronic Conditions */}
          <div className="space-y-3">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl">
              <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" /> Known Allergies
              </h4>
              <p className="text-sm text-rose-950 font-medium">
                {activeProfile.allergies || 'No known drug or food allergies recorded.'}
              </p>
            </div>

            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Chronic Medical Conditions
              </h4>
              <p className="text-sm text-gray-800">
                {activeProfile.chronic_conditions || 'None recorded.'}
              </p>
            </div>

            {activeProfile.special_care_instructions && (
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                  Special Care Instructions
                </h4>
                <p className="text-sm text-emerald-950">
                  {activeProfile.special_care_instructions}
                </p>
              </div>
            )}
          </div>

          {/* Connected Care Circle Members */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
              <Users className="w-4 h-4" /> Connected Care Circle Members ({members.length})
            </h4>
            <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
              {loadingMembers ? (
                <div className="p-4 text-center text-sm text-gray-400">Loading members...</div>
              ) : members.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">No other members connected yet.</div>
              ) : (
                members.map((m) => (
                  <div key={m.user_id} className="p-3 flex items-center justify-between text-sm hover:bg-gray-50 transition">
                    <div>
                      <p className="font-medium text-gray-900">{m.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{m.email_or_phone}</p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium capitalize bg-gray-100 text-gray-700">
                      {m.role_in_circle}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
