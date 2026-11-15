'use client';

import React, { useState } from 'react';
import { useActiveProfile } from '../../context/ActiveProfileContext';
import { X, UserPlus, Check } from 'lucide-react';

interface JoinCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinCircleModal({ isOpen, onClose }: JoinCircleModalProps) {
  const { joinCircle } = useActiveProfile();
  const [circleCode, setCircleCode] = useState('');
  const [role, setRole] = useState('family');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = circleCode.trim();
    if (cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
      setError('Circle Code must be exactly 6 numeric digits (e.g. 882104).');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await joinCircle(cleanCode, role);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to join care circle');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Join Care Circle</h2>
              <p className="text-xs text-gray-500">Enter the universal 6-digit Circle Code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              6-Digit Circle Code
            </label>
            <input
              type="text"
              maxLength={6}
              required
              placeholder="e.g. 882104"
              value={circleCode}
              onChange={(e) => setCircleCode(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 text-center tracking-widest text-2xl font-mono font-bold border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-center">
              Shared by the senior, family, or caregiver
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Your Role in this Circle
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'family', label: 'Family Member', desc: 'Manage & alerts' },
                { id: 'caregiver', label: 'Caregiver / Nurse', desc: 'Manage & log' },
                { id: 'senior', label: 'Senior (Patient)', desc: 'View & take meds' },
                { id: 'other', label: 'Other (Viewer)', desc: 'Read-only access' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`p-2.5 text-left rounded-xl border transition ${
                    role === r.id
                      ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <p className="text-xs font-semibold text-gray-900">{r.label}</p>
                  <p className="text-[10px] text-gray-500">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || circleCode.length !== 6}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
            >
              {isSubmitting ? 'Joining...' : <><Check className="w-4 h-4" /> Connect to Circle</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
