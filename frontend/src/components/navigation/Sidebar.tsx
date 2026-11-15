'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useActiveProfile } from '../../context/ActiveProfileContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  HeartPulse,
  CheckCircle2,
  CalendarDays,
  Stethoscope,
  Bell,
  Users,
  LogOut,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';

export type NavView = 'today' | 'companion' | 'medications' | 'appointments' | 'alerts' | 'circle';

interface SidebarProps {
  activeView: NavView;
  onViewChange: (view: NavView) => void;
  unreadAlertsCount?: number;
  todayPendingCount?: number;
}

export function Sidebar({
  activeView,
  onViewChange,
  unreadAlertsCount = 0,
  todayPendingCount = 0,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const { activeSummary } = useActiveProfile();
  const { t } = useLanguage();

  const currentRole = activeSummary?.role_in_circle || user?.default_role || 'family';

  const NAV_ITEMS: {
    id: NavView;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number | null;
    badgeColor?: string;
  }[] = [
    {
      id: 'today',
      label: t('nav_today', "Today's Routine"),
      description: t('nav_today_desc', 'Daily checklist & adherence'),
      icon: CheckCircle2,
      badge: todayPendingCount > 0 ? `${todayPendingCount} ${t('due', 'due')}` : t('done', 'Done'),
      badgeColor: todayPendingCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'medications',
      label: t('nav_medications', 'Prescriptions'),
      description: t('nav_medications_desc', 'Medication schedule & slots'),
      icon: CalendarDays,
    },
    {
      id: 'appointments',
      label: t('nav_appointments', 'Doctor Appointments'),
      description: t('nav_appointments_desc', 'Clinic visits & preparation'),
      icon: Stethoscope,
    },
    {
      id: 'alerts',
      label: t('nav_alerts', 'Proactive Alerts'),
      description: t('nav_alerts_desc', 'Email engine & escalations'),
      icon: Bell,
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : null,
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      id: 'circle',
      label: t('nav_circle', 'Care Circle & Card'),
      description: t('nav_circle_desc', 'Vitals, members & code'),
      icon: Users,
    },
    {
      id: 'companion',
      label: t('nav_companion', 'AI Companion'),
      description: t('nav_companion_desc', 'Mood, exercise & wellness'),
      icon: Sparkles,
      badge: 'AI ✨',
      badgeColor: 'bg-purple-100 text-purple-800',
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-gray-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
          <HeartPulse className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-extrabold text-gray-900 leading-tight text-base tracking-tight">
            {t('app_name', 'CareCircle')}
          </h1>
          <p className="text-[11px] text-gray-500 font-medium">{t('app_subtitle', 'Elderly Care Platform')}</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="p-3.5 space-y-1.5 flex-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Platform Modules
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onViewChange(item.id)}
              className={`w-full p-3 rounded-2xl text-left transition flex items-center justify-between group ${
                isActive
                  ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/80 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold leading-tight">{item.label}</p>
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">{item.description}</p>
                </div>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    item.badgeColor || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Footer */}
      {user && (
        <div className="p-4 border-t border-gray-200 bg-gray-50/50">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold shrink-0">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-gray-900 truncate leading-tight">
                  {user.name}
                </p>
                <span
                  className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 capitalize border ${
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
            </div>

            <button
              onClick={logout}
              title="Log Out"
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
