import {
  AuthTokenResponse,
  User,
  AccessibleProfileSummary,
  ElderlyProfile,
  CircleMemberDetail,
  ElderlyProfileCreateInput,
  Medication,
  SlotGroupedMedications,
  MedicationCreateInput,
  TodayAdherenceSummary,
  AdherenceLogCreateInput,
  AdherenceLogResponse,
  WeeklyAdherenceHistory,
  Appointment,
  AppointmentCreateInput,
  AppointmentUpdateInput,
  AppointmentListSummary,
  NotificationLog,
  SendTestAlertRequest,
  AlertScanResult,
} from './types';

function getApiBase(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!envUrl) {
    return 'http://localhost:8000/api';
  }
  // Remove all trailing slashes
  let cleanUrl = envUrl.replace(/\/+$/, '');
  // Auto-append /api if omitted
  if (!cleanUrl.endsWith('/api')) {
    cleanUrl = `${cleanUrl}/api`;
  }
  return cleanUrl;
}

const API_BASE = getApiBase();

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('care_access_token');
}

export function setStoredToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('care_access_token', token);
  }
}

export function clearStoredToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('care_access_token');
    localStorage.removeItem('care_active_profile_id');
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'An unexpected error occurred';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  signup: async (
    name: string,
    email_or_phone: string,
    passcode: string,
    default_role: string = 'family'
  ): Promise<AuthTokenResponse> => {
    return apiRequest<AuthTokenResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email_or_phone, passcode, default_role }),
    });
  },

  login: async (email_or_phone: string, passcode: string): Promise<AuthTokenResponse> => {
    return apiRequest<AuthTokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email_or_phone, passcode }),
    });
  },

  demoLogin: async (persona: 'grandpa' | 'sarah' | 'elena' | 'tom'): Promise<AuthTokenResponse> => {
    return apiRequest<AuthTokenResponse>(`/auth/demo-login/${persona}`, {
      method: 'POST',
    });
  },

  getMe: async (): Promise<User> => {
    return apiRequest<User>('/auth/me');
  },

  // Profiles & Care Circle
  getMyProfiles: async (): Promise<AccessibleProfileSummary[]> => {
    return apiRequest<AccessibleProfileSummary[]>('/profiles/my');
  },

  createProfile: async (data: ElderlyProfileCreateInput): Promise<ElderlyProfile> => {
    return apiRequest<ElderlyProfile>('/profiles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateProfile: async (
    profileId: number,
    data: Partial<ElderlyProfileCreateInput>
  ): Promise<ElderlyProfile> => {
    return apiRequest<ElderlyProfile>(`/profiles/${profileId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  joinCircle: async (
    circle_code: string,
    role_in_circle: string = 'family'
  ): Promise<{ success: boolean; message: string; profile: AccessibleProfileSummary }> => {
    return apiRequest('/profiles/join', {
      method: 'POST',
      body: JSON.stringify({ circle_code, role_in_circle }),
    });
  },

  getProfileDetails: async (profileId: number): Promise<ElderlyProfile> => {
    return apiRequest<ElderlyProfile>(`/profiles/${profileId}`);
  },

  getCircleMembers: async (profileId: number): Promise<CircleMemberDetail[]> => {
    return apiRequest<CircleMemberDetail[]>(`/profiles/${profileId}/members`);
  },

  // Medications
  getMedications: async (profileId: number): Promise<Medication[]> => {
    return apiRequest<Medication[]>(`/medications?profile_id=${profileId}`);
  },

  getGroupedMedications: async (profileId: number): Promise<SlotGroupedMedications> => {
    return apiRequest<SlotGroupedMedications>(`/medications/grouped?profile_id=${profileId}`);
  },

  createMedication: async (data: MedicationCreateInput): Promise<Medication> => {
    return apiRequest<Medication>('/medications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateMedication: async (
    medicationId: number,
    data: Partial<MedicationCreateInput>
  ): Promise<Medication> => {
    return apiRequest<Medication>(`/medications/${medicationId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteMedication: async (medicationId: number): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>(`/medications/${medicationId}`, {
      method: 'DELETE',
    });
  },

  // Adherence & Real-Time Logging
  getTodayAdherence: async (
    profileId: number,
    targetDate?: string
  ): Promise<TodayAdherenceSummary> => {
    const url = targetDate
      ? `/adherence/today?profile_id=${profileId}&target_date=${encodeURIComponent(targetDate)}`
      : `/adherence/today?profile_id=${profileId}`;
    return apiRequest<TodayAdherenceSummary>(url);
  },

  logAdherenceDose: async (
    data: AdherenceLogCreateInput
  ): Promise<AdherenceLogResponse> => {
    return apiRequest<AdherenceLogResponse>('/adherence/log', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  resetAdherenceDose: async (
    logId: number
  ): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>(`/adherence/reset/${logId}`, {
      method: 'DELETE',
    });
  },

  getAdherenceHistory: async (
    profileId: number,
    days: number = 7
  ): Promise<WeeklyAdherenceHistory> => {
    return apiRequest<WeeklyAdherenceHistory>(
      `/adherence/history?profile_id=${profileId}&days=${days}`
    );
  },

  // Medical Appointments Management
  getAppointments: async (
    profileId: number,
    statusFilter?: string
  ): Promise<Appointment[]> => {
    const url = statusFilter
      ? `/appointments?profile_id=${profileId}&status=${encodeURIComponent(statusFilter)}`
      : `/appointments?profile_id=${profileId}`;
    return apiRequest<Appointment[]>(url);
  },

  getAppointmentsSummary: async (
    profileId: number
  ): Promise<AppointmentListSummary> => {
    return apiRequest<AppointmentListSummary>(`/appointments/summary?profile_id=${profileId}`);
  },

  createAppointment: async (
    data: AppointmentCreateInput
  ): Promise<Appointment> => {
    return apiRequest<Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateAppointment: async (
    appointmentId: number,
    data: AppointmentUpdateInput
  ): Promise<Appointment> => {
    return apiRequest<Appointment>(`/appointments/${appointmentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteAppointment: async (
    appointmentId: number
  ): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>(`/appointments/${appointmentId}`, {
      method: 'DELETE',
    });
  },

  // Proactive Email Reminders & Missed Dose Alerts (Part 6)
  sendTestAlert: async (data: SendTestAlertRequest): Promise<NotificationLog> => {
    return apiRequest<NotificationLog>('/notifications/test-alert', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  scanAlerts: async (profileId: number): Promise<AlertScanResult> => {
    return apiRequest<AlertScanResult>('/notifications/scan-alerts', {
      method: 'POST',
      body: JSON.stringify({ profile_id: profileId }),
    });
  },

  getNotificationHistory: async (
    profileId: number,
    limit: number = 20
  ): Promise<NotificationLog[]> => {
    return apiRequest<NotificationLog[]>(
      `/notifications/history?profile_id=${profileId}&limit=${limit}`
    );
  },

  getUnreadNotificationCount: async (
    profileId: number
  ): Promise<{ unread_count: number }> => {
    return apiRequest<{ unread_count: number }>(
      `/notifications/unread-count?profile_id=${profileId}`
    );
  },

  markNotificationRead: async (
    notificationId: number
  ): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>(
      `/notifications/${notificationId}/read`,
      { method: 'PUT' }
    );
  },

  markAllNotificationsRead: async (
    profileId: number
  ): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>(
      `/notifications/read-all?profile_id=${profileId}`,
      { method: 'PUT' }
    );
  },
};
