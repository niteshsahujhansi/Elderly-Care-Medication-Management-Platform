'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useActiveProfile } from '../../context/ActiveProfileContext';
import { ChevronDown, Check, Plus, UserPlus } from 'lucide-react';

interface ProfileSwitcherProps {
  onCreateClick: () => void;
  onJoinClick: () => void;
}

export function ProfileSwitcher({ onCreateClick, onJoinClick }: ProfileSwitcherProps) {
  const { accessibleProfiles, activeProfile, switchProfile, isLoadingProfiles } =
    useActiveProfile();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!activeProfile && accessibleProfiles.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={onCreateClick}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Add Senior
        </button>
        <button
          onClick={onJoinClick}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition"
        >
          <UserPlus className="w-4 h-4" /> Join Circle
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoadingProfiles}
        className="flex items-center gap-2.5 px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl shadow-sm text-left transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
          {activeProfile?.name?.charAt(0) || 'P'}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 text-sm">
              {activeProfile?.name || 'Select Senior'}
            </span>
            <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
              Senior
            </span>
          </div>
          <span className="text-xs text-gray-500 font-mono">
            Code: {activeProfile?.circle_code}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3.5 py-2 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Connected Seniors ({accessibleProfiles.length})
          </div>

          <div className="max-h-60 overflow-y-auto py-1">
            {accessibleProfiles.map((p) => {
              const isSelected = p.profile_id === activeProfile?.id;
              return (
                <button
                  key={p.profile_id}
                  onClick={() => {
                    switchProfile(p.profile_id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left text-sm hover:bg-gray-50 transition ${
                    isSelected ? 'bg-emerald-50/70 text-emerald-950 font-medium' : 'text-gray-700'
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-gray-900">{p.name}</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.2 rounded-full">
                        Senior
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 font-mono mt-0.5">
                      Code: {p.circle_code}
                    </span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="border-t border-gray-100 pt-1.5 px-2 flex flex-col gap-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onCreateClick();
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <Plus className="w-4 h-4 text-emerald-600" /> Create New Senior Profile
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                onJoinClick();
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <UserPlus className="w-4 h-4 text-blue-600" /> Join with 6-Digit Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
