'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useActiveProfile } from '../../context/ActiveProfileContext';
import { ProfileSwitcher } from './ProfileSwitcher';
import { NotificationBell } from '../notifications/NotificationBell';
import { useLanguage } from '../../context/LanguageContext';
import { HeartPulse, LogOut, User as UserIcon, Globe } from 'lucide-react';

interface HeaderProps {
  onCreateProfileClick: () => void;
  onJoinCircleClick: () => void;
  onOpenNotificationsClick?: () => void;
}

export function Header({ onCreateProfileClick, onJoinCircleClick, onOpenNotificationsClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { activeSummary } = useActiveProfile();
  const { language, toggleLanguage } = useLanguage();

  const currentRole = activeSummary?.role_in_circle || user?.default_role || 'family';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-gray-900 leading-tight text-base tracking-tight">
              CareCircle
            </h1>
            <p className="text-xs text-gray-500">Elderly Care & Meds</p>
          </div>
        </div>

        {/* Profile Switcher */}
        {user && (
          <div className="flex-1 flex justify-center max-w-md">
            <ProfileSwitcher
              onCreateClick={onCreateProfileClick}
              onJoinClick={onJoinCircleClick}
            />
          </div>
        )}

        {/* User info, Notifications & Logout */}
        {user && (
          <div className="flex items-center gap-3">
            {/* Hindi / English Language Toggle */}
            <button
              type="button"
              onClick={toggleLanguage}
              title="Switch Language / भाषा बदलें"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50/80 hover:bg-gray-100 text-gray-700 text-xs font-bold transition shadow-2xs"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            {/* In-App Notifications Bell */}
            <NotificationBell onViewAllClick={onOpenNotificationsClick} />

            <div className="hidden md:flex items-center gap-2.5 text-right">
              <div className="flex flex-col items-end">
                <p className="text-sm font-bold text-gray-900">{user.name}</p>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-0.5 capitalize border ${
                    currentRole === 'senior'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : currentRole === 'caregiver'
                      ? 'bg-blue-100 text-blue-900 border-blue-300'
                      : currentRole === 'family'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-purple-100 text-purple-900 border-purple-300'
                  }`}
                >
                  {currentRole}
                </span>
              </div>
              <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 text-gray-700 flex items-center justify-center font-bold">
                <UserIcon className="w-4 h-4" />
              </div>
            </div>

            <button
              onClick={logout}
              title="Log Out"
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
