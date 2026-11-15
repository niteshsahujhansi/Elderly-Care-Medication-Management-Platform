'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useActiveProfile } from '../context/ActiveProfileContext';
import { Header } from '../components/navigation/Header';
import { PinPad } from '../components/auth/PinPad';
import { CreateProfileModal } from '../components/modals/CreateProfileModal';
import { JoinCircleModal } from '../components/modals/JoinCircleModal';
import { ProfileDetailsModal } from '../components/modals/ProfileDetailsModal';
import { EditProfileModal } from '../components/modals/EditProfileModal';
import { MedicationScheduleSection } from '../components/medications/MedicationScheduleSection';
import {
  HeartPulse,
  Users,
  Copy,
  Check,
  Plus,
  UserPlus,
  ShieldAlert,
  Stethoscope,
  Pill,
  Calendar,
  Sparkles,
  Info,
  Edit3,
} from 'lucide-react';

export default function Home() {
  const { user, login, signup, demoLogin, isLoading } = useAuth();
  const { activeProfile, activeSummary, accessibleProfiles } = useActiveProfile();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Auth form state
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('family');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    if (activeProfile?.circle_code) {
      navigator.clipboard.writeText(activeProfile.circle_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) {
      setAuthError('Please enter your email or phone number.');
      return;
    }
    if (pin.length !== 6) {
      setAuthError('Please enter a 6-digit numeric passcode.');
      return;
    }

    setAuthError(null);
    setAuthSubmitting(true);
    try {
      if (authMode === 'login') {
        await login(emailOrPhone.trim(), pin);
      } else {
        if (!name.trim()) {
          setAuthError('Please enter your name.');
          setAuthSubmitting(false);
          return;
        }
        await signup(name.trim(), emailOrPhone.trim(), pin, role);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleDemoClick = async (persona: 'grandpa' | 'sarah' | 'elena' | 'tom') => {
    setAuthError(null);
    setAuthSubmitting(true);
    try {
      await demoLogin(persona);
    } catch (err: any) {
      setAuthError(err.message || 'Demo login failed');
    } finally {
      setAuthSubmitting(false);
    }
  };

  // If loading session
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center animate-pulse shadow-lg">
            <HeartPulse className="w-7 h-7" />
          </div>
          <p className="text-sm font-semibold text-gray-600">Loading CareCircle...</p>
        </div>
      </div>
    );
  }

  // --- VIEW A: NOT LOGGED IN (AUTH SCREEN) ---
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50/50 via-slate-50 to-teal-50/30">
        <div className="max-w-md w-full mx-auto space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-emerald-600 text-white items-center justify-center shadow-xl shadow-emerald-500/20 mb-2">
              <HeartPulse className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              CareCircle
            </h1>
            <p className="text-sm text-gray-600">
              Elderly Care & Medication Management Platform
            </p>
          </div>

          {/* 1-Click Hackathon Demo Quick Login */}
          <div className="bg-white p-5 rounded-3xl shadow-xl shadow-slate-200/50 border border-emerald-100/60">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                1-Click Demo Personas (For Judges & Testing)
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={authSubmitting}
                onClick={() => handleDemoClick('grandpa')}
                className="p-3 bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200 rounded-2xl text-left transition flex flex-col group"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-base">👴</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded-full">
                    Senior
                  </span>
                </div>
                <span className="text-xs font-bold text-gray-900 mt-1">Grandpa Robert</span>
                <span className="text-[11px] text-gray-500">Kiosk & today&apos;s pills</span>
              </button>

              <button
                type="button"
                disabled={authSubmitting}
                onClick={() => handleDemoClick('sarah')}
                className="p-3 bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200 rounded-2xl text-left transition flex flex-col group"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-base">👩</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded-full">
                    Family
                  </span>
                </div>
                <span className="text-xs font-bold text-gray-900 mt-1">Daughter Sarah</span>
                <span className="text-[11px] text-gray-500">Caring for Mom & Dad</span>
              </button>

              <button
                type="button"
                disabled={authSubmitting}
                onClick={() => handleDemoClick('elena')}
                className="p-3 bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200 rounded-2xl text-left transition flex flex-col group"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-base">🩺</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-200/60 px-2 py-0.5 rounded-full">
                    Caregiver
                  </span>
                </div>
                <span className="text-xs font-bold text-gray-900 mt-1">Nurse Elena</span>
                <span className="text-[11px] text-gray-500">Meds & appointment admin</span>
              </button>

              <button
                type="button"
                disabled={authSubmitting}
                onClick={() => handleDemoClick('tom')}
                className="p-3 bg-purple-50/70 hover:bg-purple-100/80 border border-purple-200 rounded-2xl text-left transition flex flex-col group"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-base">👁️</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-200/60 px-2 py-0.5 rounded-full">
                    Viewer
                  </span>
                </div>
                <span className="text-xs font-bold text-gray-900 mt-1">Neighbor Tom</span>
                <span className="text-[11px] text-gray-500">Read-only monitoring</span>
              </button>
            </div>
          </div>

          {/* Regular Passcode Login / Signup Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-gray-100">
            {/* Tabs */}
            <div className="flex rounded-2xl bg-gray-100 p-1 mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                  authMode === 'login'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Passcode Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setAuthError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                  authMode === 'signup'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Create New Account
              </button>
            </div>

            {authError && (
              <div className="p-3.5 mb-5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-5">
              {authMode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Primary Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="family">Family Member</option>
                      <option value="caregiver">Professional Caregiver / Nurse</option>
                      <option value="senior">Senior (Patient)</option>
                      <option value="other">Other (Read-only Viewer)</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email or Phone Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. sarah@demo.care or +1-555-0199"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 text-center">
                  6-Digit Numeric Passcode (PIN)
                </label>
                <PinPad pin={pin} onChange={setPin} maxLength={6} />
              </div>

              <button
                type="submit"
                disabled={authSubmitting || pin.length !== 6}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {authSubmitting
                  ? 'Processing...'
                  : authMode === 'login'
                  ? 'Log In with Passcode'
                  : 'Complete Registration'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW B: LOGGED IN (MAIN DASHBOARD CONTAINER) ---
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header
        onCreateProfileClick={() => setIsCreateOpen(true)}
        onJoinCircleClick={() => setIsJoinOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* State 1: No Profiles Connected Yet */}
        {!activeProfile && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm border border-gray-100 space-y-6 my-8">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome to CareCircle, {user.name}!
              </h2>
              <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
                Connect to an elderly person to view and manage daily medications, healthcare routines, and appointments.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create Elderly Profile
              </button>
              <button
                onClick={() => setIsJoinOpen(true)}
                className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" /> Join with 6-Digit Code
              </button>
            </div>
          </div>
        )}

        {/* State 2: Active Profile Selected */}
        {activeProfile && (
          <>
            {/* Senior Healthcare Hero Card */}
            <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-900/10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-extrabold shadow-inner">
                    {activeProfile.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        {activeProfile.name}
                      </h2>
                      <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold">
                        {activeProfile.age ? `${activeProfile.age} yrs` : 'Senior'} • {activeProfile.gender || 'Patient'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-emerald-100">
                      <div className="flex items-center gap-1.5 font-mono bg-black/20 px-3 py-1 rounded-lg">
                        <span>Universal Circle Code:</span>
                        <span className="font-bold text-white text-sm tracking-wider">
                          {activeProfile.circle_code}
                        </span>
                        <button
                          onClick={handleCopyCode}
                          title="Copy Code to Invite Family or Nurse"
                          className="p-1 hover:text-white transition ml-1"
                        >
                          {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {activeProfile.blood_group && (
                        <span className="bg-red-500/30 px-2.5 py-1 rounded-lg font-bold">
                          Blood: {activeProfile.blood_group}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {activeSummary?.role_in_circle !== 'other' && (
                    <button
                      onClick={() => setIsEditOpen(true)}
                      className="px-3.5 py-2.5 bg-white/20 hover:bg-white/30 text-white border border-white/20 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                    </button>
                  )}
                  <button
                    onClick={() => setIsDetailsOpen(true)}
                    className="px-4 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
                  >
                    <Info className="w-4 h-4 text-emerald-600" /> View Medical Card & Circle
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Overview Summary Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Emergency Contact</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">
                    {activeProfile.emergency_contact_name || 'Sarah (Daughter)'}
                  </p>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{activeProfile.emergency_phone || '+1-555-0199'}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Primary Physician</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">
                    {activeProfile.primary_physician_name || 'Dr. Sarah Adams'}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{activeProfile.hospital_preference || 'City Memorial Hospital'}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Known Allergies</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">
                    {activeProfile.allergies || 'Penicillin, Peanuts'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Alerts active</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Circle Code</p>
                  <p className="text-base font-bold text-blue-700 font-mono mt-0.5">
                    {activeProfile.circle_code}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Share with family & nurses</p>
                </div>
              </div>
            </div>

            {/* Medication Schedule Section (Part 3) */}
            <MedicationScheduleSection />
          </>
        )}
      </main>

      {/* Modals */}
      <CreateProfileModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <JoinCircleModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} />
      <ProfileDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onEditClick={() => setIsEditOpen(true)}
      />
      <EditProfileModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
    </div>
  );
}
