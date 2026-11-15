'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AccessibleProfileSummary, ElderlyProfile, ElderlyProfileCreateInput } from '../lib/types';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

interface ActiveProfileContextType {
  accessibleProfiles: AccessibleProfileSummary[];
  activeProfile: ElderlyProfile | null;
  activeSummary: AccessibleProfileSummary | null;
  isLoadingProfiles: boolean;
  switchProfile: (profileId: number) => Promise<void>;
  createProfile: (input: ElderlyProfileCreateInput) => Promise<ElderlyProfile>;
  updateProfile: (profileId: number, input: Partial<ElderlyProfileCreateInput>) => Promise<ElderlyProfile>;
  joinCircle: (circleCode: string, role: string) => Promise<void>;
  refreshProfiles: () => Promise<void>;
}

const ActiveProfileContext = createContext<ActiveProfileContextType | undefined>(undefined);

export function ActiveProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [accessibleProfiles, setAccessibleProfiles] = useState<AccessibleProfileSummary[]>([]);
  const [activeProfile, setActiveProfile] = useState<ElderlyProfile | null>(null);
  const [activeSummary, setActiveSummary] = useState<AccessibleProfileSummary | null>(null);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState<boolean>(false);

  const switchProfile = useCallback(async (profileId: number) => {
    setIsLoadingProfiles(true);
    try {
      const details = await api.getProfileDetails(profileId);
      setActiveProfile(details);
      if (typeof window !== 'undefined') {
        localStorage.setItem('care_active_profile_id', profileId.toString());
      }
      setAccessibleProfiles((prev) => {
        const found = prev.find((p) => p.profile_id === profileId);
        if (found) setActiveSummary(found);
        return prev;
      });
    } catch (err) {
      console.error('Failed to switch profile:', err);
    } finally {
      setIsLoadingProfiles(false);
    }
  }, []);

  const refreshProfiles = useCallback(async () => {
    if (!user) {
      setAccessibleProfiles([]);
      setActiveProfile(null);
      setActiveSummary(null);
      return;
    }
    setIsLoadingProfiles(true);
    try {
      const profiles = await api.getMyProfiles();
      setAccessibleProfiles(profiles);

      if (profiles.length > 0) {
        let targetId = profiles[0].profile_id;
        if (typeof window !== 'undefined') {
          const savedId = localStorage.getItem('care_active_profile_id');
          if (savedId) {
            const parsed = parseInt(savedId, 10);
            if (profiles.some((p) => p.profile_id === parsed)) {
              targetId = parsed;
            }
          }
        }
        await switchProfile(targetId);
      } else {
        setActiveProfile(null);
        setActiveSummary(null);
      }
    } catch (err) {
      console.error('Failed to load accessible profiles:', err);
    } finally {
      setIsLoadingProfiles(false);
    }
  }, [user, switchProfile]);

  useEffect(() => {
    refreshProfiles();
  }, [refreshProfiles]);

  const createProfile = async (input: ElderlyProfileCreateInput): Promise<ElderlyProfile> => {
    const created = await api.createProfile(input);
    await refreshProfiles();
    await switchProfile(created.id);
    return created;
  };

  const updateProfile = async (
    profileId: number,
    input: Partial<ElderlyProfileCreateInput>
  ): Promise<ElderlyProfile> => {
    const updated = await api.updateProfile(profileId, input);
    setActiveProfile(updated);
    await refreshProfiles();
    return updated;
  };

  const joinCircle = async (circleCode: string, role: string) => {
    const res = await api.joinCircle(circleCode, role);
    await refreshProfiles();
    if (res.profile?.profile_id) {
      await switchProfile(res.profile.profile_id);
    }
  };

  return (
    <ActiveProfileContext.Provider
      value={{
        accessibleProfiles,
        activeProfile,
        activeSummary,
        isLoadingProfiles,
        switchProfile,
        createProfile,
        updateProfile,
        joinCircle,
        refreshProfiles,
      }}
    >
      {children}
    </ActiveProfileContext.Provider>
  );
}

export function useActiveProfile() {
  const context = useContext(ActiveProfileContext);
  if (!context) {
    throw new Error('useActiveProfile must be used within an ActiveProfileProvider');
  }
  return context;
}
