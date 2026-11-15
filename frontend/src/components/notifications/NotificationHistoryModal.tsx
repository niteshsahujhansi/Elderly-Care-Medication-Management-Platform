'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { NotificationLog } from '../../lib/types';
import { X, Bell, Mail, Clock, CheckCircle2, AlertTriangle, Stethoscope, RefreshCw } from 'lucide-react';

interface NotificationHistoryModalProps {
  isOpen: boolean;
  profileId: number;
  seniorName: string;
  onClose: () => void;
}

export function NotificationHistoryModal({
  isOpen,
  profileId,
  seniorName,
  onClose,
}: NotificationHistoryModalProps) {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getNotificationHistory(profileId, 30);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load alert history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, profileId]);

  if (!isOpen) return null;

  const getAlertBadge = (type: string) => {
    if (type === 'missed_dose_alert') {
      return {
        label: 'Missed Dose Escalation',
        bg: 'bg-red-50 text-red-800 border-red-200',
        icon: AlertTriangle,
      };
    }
    if (type === 'upcoming_dose_reminder') {
      return {
        label: 'Routine Reminder',
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        icon: Bell,
      };
    }
    if (type === 'appointment_reminder') {
      return {
        label: 'Doctor Appointment Notice',
        bg: 'bg-blue-50 text-blue-800 border-blue-200',
        icon: Stethoscope,
      };
    }
    return {
      label: 'Notification',
      bg: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: Mail,
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Email Alert Audit Log</h3>
              <p className="text-xs text-rose-100">
                Dispatched reminders & overdue dose escalations for {seniorName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadHistory}
              title="Refresh"
              className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-2xl"></div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Mail className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-700">No Dispatched Alerts Yet</p>
              <p className="text-xs text-gray-400 mt-1">
                When doses are overdue or reminders trigger, all dispatched emails will appear here.
              </p>
            </div>
          ) : (
            logs.map((log) => {
              const badge = getAlertBadge(log.alert_type);
              const BadgeIcon = badge.icon;

              return (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl border border-gray-200/80 bg-white hover:border-rose-200 transition space-y-2 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${badge.bg}`}
                    >
                      <BadgeIcon className="w-3 h-3" />
                      {badge.label}
                    </span>

                    <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono">
                      <Clock className="w-3 h-3" />
                      {new Date(log.sent_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-gray-900 leading-snug">
                      {log.subject}
                    </h5>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Recipient: <strong className="text-gray-700">{log.recipient_name}</strong> ({log.recipient_email})
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">
                      Delivery: <span className="font-semibold text-emerald-700 capitalize">{log.status}</span>
                    </span>
                    <span className="text-gray-400">ID #{log.id}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition"
          >
            Close Audit Log
          </button>
        </div>
      </div>
    </div>
  );
}
