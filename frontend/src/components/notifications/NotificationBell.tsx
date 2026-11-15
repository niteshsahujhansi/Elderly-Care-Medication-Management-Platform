'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useActiveProfile } from '../../context/ActiveProfileContext';
import { api } from '../../lib/api';
import { NotificationLog } from '../../lib/types';
import {
  Bell,
  Check,
  CheckCheck,
  AlertTriangle,
  Clock,
  Stethoscope,
  Mail,
  ChevronRight,
} from 'lucide-react';

interface NotificationBellProps {
  onViewAllClick?: () => void;
}

export function NotificationBell({ onViewAllClick }: NotificationBellProps) {
  const { activeProfile } = useActiveProfile();

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [recentAlerts, setRecentAlerts] = useState<NotificationLog[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(async () => {
    if (!activeProfile) return;
    try {
      const [countRes, historyRes] = await Promise.all([
        api.getUnreadNotificationCount(activeProfile.id),
        api.getNotificationHistory(activeProfile.id, 6),
      ]);
      setUnreadCount(countRes.unread_count);
      setRecentAlerts(historyRes);
    } catch (err) {
      console.error('Failed to load in-app notifications:', err);
    }
  }, [activeProfile]);

  useEffect(() => {
    loadNotifications();
    // Poll every 30 seconds for live updates
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (logId: number) => {
    try {
      await api.markNotificationRead(logId);
      setRecentAlerts((prev) =>
        prev.map((log) => (log.id === logId ? { ...log, is_read: true } : log))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    if (!activeProfile) return;
    setLoading(true);
    try {
      await api.markAllNotificationsRead(activeProfile.id);
      setRecentAlerts((prev) => prev.map((log) => ({ ...log, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type: string) => {
    if (type === 'missed_dose_alert') {
      return <AlertTriangle className="w-4 h-4 text-rose-600" />;
    }
    if (type === 'upcoming_dose_reminder') {
      return <Clock className="w-4 h-4 text-emerald-600" />;
    }
    if (type === 'appointment_reminder') {
      return <Stethoscope className="w-4 h-4 text-blue-600" />;
    }
    return <Mail className="w-4 h-4 text-gray-500" />;
  };

  if (!activeProfile) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition focus:outline-none"
        title="In-App Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-md shadow-rose-600/30 ring-2 ring-white animate-in zoom-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-gray-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                disabled={loading}
                onClick={handleMarkAllRead}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 transition flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Alert List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {recentAlerts.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                <Bell className="w-6 h-6 mx-auto mb-1.5 text-gray-300" />
                No alerts or notifications yet.
              </div>
            ) : (
              recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => !alert.is_read && handleMarkAsRead(alert.id)}
                  className={`p-3.5 transition flex items-start gap-3 cursor-pointer ${
                    alert.is_read
                      ? 'bg-white hover:bg-gray-50'
                      : 'bg-rose-50/40 hover:bg-rose-50/70'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white border border-gray-100 shadow-sm shrink-0 mt-0.5">
                    {getAlertIcon(alert.alert_type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs leading-snug line-clamp-2 ${
                        alert.is_read ? 'text-gray-700 font-medium' : 'text-gray-900 font-bold'
                      }`}
                    >
                      {alert.subject}
                    </p>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-gray-400">
                      <span>{new Date(alert.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="capitalize">{alert.status}</span>
                    </div>
                  </div>

                  {!alert.is_read && (
                    <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-2" title="Unread" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {onViewAllClick && (
            <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onViewAllClick();
                }}
                className="text-xs font-bold text-gray-700 hover:text-emerald-700 transition flex items-center justify-center gap-1 w-full py-1"
              >
                <span>View Full Audit Log</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
