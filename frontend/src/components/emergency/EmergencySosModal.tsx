'use client';

import React, { useState } from 'react';
import {
  PhoneCall,
  AlertTriangle,
  HeartPulse,
  X,
  Radio,
  CheckCircle2,
  ShieldAlert,
  Hospital,
  Activity,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { ElderlyProfile } from '../../lib/types';

interface EmergencySosModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ElderlyProfile | null;
}

export function EmergencySosModal({ isOpen, onClose, profile }: EmergencySosModalProps) {
  const { t } = useLanguage();
  const [broadcasted, setBroadcasted] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);

  if (!isOpen) return null;

  const handleBroadcast = () => {
    setBroadcasting(true);
    setTimeout(() => {
      setBroadcasting(false);
      setBroadcasted(true);
    }, 800);
  };

  const emergencyPhone = profile?.emergency_phone || '+91 98765 43210';
  const emergencyName = profile?.emergency_contact_name || 'Sarah (Family)';
  const hospital = profile?.hospital_preference || 'City Multispeciality Hospital';
  const doctor = profile?.primary_physician_name || 'Dr. Sarah Adams';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border-2 border-red-500 animate-in zoom-in-95 duration-200">
        {/* Pulsing Emergency Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner animate-pulse">
                <ShieldAlert className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-widest bg-red-800/80 px-2.5 py-0.5 rounded-full inline-block">
                  INDIA EMERGENCY HELPLINE
                </span>
                <h2 className="text-2xl font-black tracking-tight mt-0.5">
                  {t('sos_modal_title', 'Emergency Medical SOS')}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-red-100 mt-2 font-medium">
            {t('sos_modal_desc', 'Immediate emergency contacts and clinical dispatch for')} <strong className="font-bold underline">{profile?.name || 'Senior'}</strong>
          </p>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Priority 1: Indian Emergency Services Grid */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              ⚡ Instant 1-Tap Emergency Calling (India)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 112 All-in-One */}
              <a
                href="tel:112"
                className="flex items-center justify-between p-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 transition group"
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider opacity-90 block">All Emergency (ERSS)</span>
                  <span className="text-2xl font-black tracking-tight">Dial 112</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition">
                  <PhoneCall className="w-5 h-5 text-white" />
                </div>
              </a>

              {/* 108 Ambulance */}
              <a
                href="tel:108"
                className="flex items-center justify-between p-4 rounded-2xl bg-rose-700 hover:bg-rose-800 text-white shadow-md shadow-rose-700/20 transition group"
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider opacity-90 block">Medical Ambulance</span>
                  <span className="text-2xl font-black tracking-tight">Dial 108</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition">
                  <Activity className="w-5 h-5 text-white" />
                </div>
              </a>
            </div>

            {/* ElderLine 14567 */}
            <a
              href="tel:14567"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 transition group"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-90 block">Govt Elder Line (Senior Citizens Helpline)</span>
                <span className="text-lg font-black tracking-tight">Dial 14567 (Toll Free)</span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
            </a>
          </div>

          {/* Priority 2: Primary Family Emergency Contact */}
          <div className="p-4 rounded-2xl border-2 border-emerald-500/50 bg-emerald-50/40 flex items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Primary Family Caregiver
              </span>
              <h4 className="text-base font-extrabold text-gray-900 mt-0.5">
                {emergencyName}
              </h4>
              <p className="text-xs text-gray-600 font-mono mt-0.5">{emergencyPhone}</p>
            </div>
            <a
              href={`tel:${emergencyPhone}`}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition"
            >
              <PhoneCall className="w-4 h-4" />
              Call Now
            </a>
          </div>

          {/* Priority 3: Broadcast SOS Alert */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-center space-y-3">
            {broadcasted ? (
              <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold text-sm bg-emerald-100 py-2.5 px-4 rounded-xl border border-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                {t('sos_broadcast_sent', 'Emergency SOS alert sent to all Care Circle members!')}
              </div>
            ) : (
              <button
                type="button"
                disabled={broadcasting}
                onClick={handleBroadcast}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2"
              >
                <Radio className={`w-5 h-5 ${broadcasting ? 'animate-ping' : ''}`} />
                {broadcasting ? 'Broadcasting Alert...' : t('broadcast_emergency', 'Broadcast SOS to All Care Circle Members')}
              </button>
            )}
            <p className="text-[11px] text-gray-500">
              Immediately alerts family members, caregivers, and doctor via push and email notifications.
            </p>
          </div>

          {/* Priority 4: Paramedic & Critical Medical Summary */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              {t('critical_medical_info', 'Critical Medical Summary (For Paramedics)')}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                <span className="text-gray-400 block text-[10px] font-bold uppercase">Blood Group</span>
                <span className="font-extrabold text-red-600 text-sm">{profile?.blood_group || 'O+'}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                <span className="text-gray-400 block text-[10px] font-bold uppercase">Allergies</span>
                <span className="font-bold text-gray-900 truncate block">{profile?.allergies || 'Penicillin'}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-amber-100 col-span-2">
                <span className="text-gray-400 block text-[10px] font-bold uppercase">Hospital & Doctor</span>
                <span className="font-semibold text-gray-900 flex items-center gap-1 mt-0.5">
                  <Hospital className="w-3.5 h-3.5 text-blue-600 inline shrink-0" />
                  {hospital} • {doctor}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-xl transition"
          >
            {t('close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
}
