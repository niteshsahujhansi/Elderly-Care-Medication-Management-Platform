export interface User {
  id: number;
  name: string;
  email_or_phone: string;
  default_role: 'senior' | 'family' | 'caregiver' | 'other';
  created_at: string;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface AccessibleProfileSummary {
  profile_id: number;
  circle_code: string;
  name: string;
  age?: number | null;
  gender?: string | null;
  blood_group?: string | null;
  role_in_circle: 'senior' | 'family' | 'caregiver' | 'other';
  notify_email: boolean;
}

export interface ElderlyProfile {
  id: number;
  circle_code: string;
  name: string;
  date_of_birth?: string | null;
  age?: number | null;
  gender?: string | null;
  blood_group?: string | null;
  primary_phone?: string | null;
  emergency_phone?: string | null;
  emergency_contact_name?: string | null;
  primary_physician_name?: string | null;
  primary_physician_phone?: string | null;
  hospital_preference?: string | null;
  allergies?: string | null;
  chronic_conditions?: string | null;
  dietary_restrictions?: string | null;
  mobility_status?: string | null;
  preferred_language?: string | null;
  room_or_address?: string | null;
  insurance_provider?: string | null;
  insurance_policy_number?: string | null;
  special_care_instructions?: string | null;
  created_at: string;
}

export interface CircleMemberDetail {
  user_id: number;
  name: string;
  email_or_phone: string;
  role_in_circle: 'senior' | 'family' | 'caregiver' | 'other';
  notify_email: boolean;
  joined_at: string;
}

export interface ElderlyProfileCreateInput {
  name: string;
  date_of_birth?: string;
  age?: number;
  gender?: string;
  blood_group?: string;
  primary_phone?: string;
  emergency_phone?: string;
  emergency_contact_name?: string;
  primary_physician_name?: string;
  primary_physician_phone?: string;
  hospital_preference?: string;
  allergies?: string;
  chronic_conditions?: string;
  dietary_restrictions?: string;
  mobility_status?: string;
  preferred_language?: string;
  room_or_address?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  special_care_instructions?: string;
  role_in_circle?: string;
}

export interface Medication {
  id: number;
  profile_id: number;
  name: string;
  dosage: string;
  time_slot: 'morning' | 'afternoon' | 'evening' | 'night';
  exact_time: string;
  frequency: string;
  instructions?: string | null;
  purpose?: string | null;
  pill_shape?: string | null;
  pill_color?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  inventory_count?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SlotGroupedMedications {
  morning: Medication[];
  afternoon: Medication[];
  evening: Medication[];
  night: Medication[];
  total_count: number;
}

export interface MedicationCreateInput {
  profile_id: number;
  name: string;
  dosage: string;
  time_slot: 'morning' | 'afternoon' | 'evening' | 'night';
  exact_time?: string;
  frequency?: string;
  instructions?: string;
  purpose?: string;
  pill_shape?: string;
  pill_color?: string;
  start_date?: string;
  end_date?: string;
  inventory_count?: number;
}
