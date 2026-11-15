export type Language = 'en' | 'hi';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Brand & Roles
    app_name: 'CareCircle',
    app_subtitle: 'Elderly Care Platform',
    senior: 'Senior',
    family: 'Family',
    caregiver: 'Caregiver',
    viewer: 'Viewer',
    logout: 'Log Out',

    // Navigation Items
    nav_today: "Today's Routine",
    nav_today_desc: 'Daily checklist & adherence',
    nav_medications: 'Prescriptions',
    nav_medications_desc: 'Medication schedule & slots',
    nav_appointments: 'Doctor Appointments',
    nav_appointments_desc: 'Clinic visits & preparation',
    nav_alerts: 'Proactive Alerts',
    nav_alerts_desc: 'Email engine & escalations',
    nav_circle: 'Care Circle & Card',
    nav_circle_desc: 'Vitals, members & code',
    due: 'due',
    done: 'Done',

    // Routine & Adherence
    today_routine_title: "Today's Medication Routine",
    today_routine_desc: 'Real-time adherence checklist for prescribed daily slots',
    all_doses_completed: 'All doses completed for today!',
    take_dose: 'I Took This',
    skip_dose: 'Skip',
    undo: 'Reset',
    dose_taken: 'Taken',
    dose_skipped: 'Skipped',
    dose_pending: 'Due Now',
    slot_morning: 'Morning',
    slot_afternoon: 'Afternoon',
    slot_evening: 'Evening',
    slot_night: 'Night',

    // 7-Day Streak
    weekly_streak_title: '7-Day Adherence Streak',
    weekly_streak_desc: 'Historical daily pill compliance record',
    taken_doses: 'Taken',
    skipped_doses: 'Skipped',
    pending_doses: 'Pending',

    // Care Circle & Medical Card
    emergency_contact: 'Emergency Contact',
    primary_physician: 'Primary Physician',
    known_allergies: 'Known Allergies',
    circle_code: 'Circle Code',
    care_circle_members: 'Care Circle Members',
    care_circle_desc: 'Connected individuals actively monitoring care routine',
    join_code: 'Join Code',
    joined: 'Joined',
    email_alerts_on: 'Email alerts on',

    // Language Toggle
    lang_toggle: 'हिंदी',
  },
  hi: {
    // Brand & Roles
    app_name: 'केयरसर्कल',
    app_subtitle: 'वरिष्ठ नागरिक देखभाल मंच',
    senior: 'वरिष्ठ (बुज़ुर्ग)',
    family: 'परिवार',
    caregiver: 'देखभालकर्ता / नर्स',
    viewer: 'निरीक्षक',
    logout: 'लॉग आउट',

    // Navigation Items
    nav_today: 'दैनिक दिनचर्या',
    nav_today_desc: 'आज की दवाइयाँ और स्थिति',
    nav_medications: 'दवाइयों की सूची',
    nav_medications_desc: 'खुराक, समय और निर्देश',
    nav_appointments: 'डॉक्टर अपॉइंटमेंट्स',
    nav_appointments_desc: 'अस्पताल के दौरे और तैयारी',
    nav_alerts: 'सक्रिय अलर्ट्स',
    nav_alerts_desc: 'ईमेल सूचना और रिमाइंडर',
    nav_circle: 'केयर सर्कल और कार्ड',
    nav_circle_desc: 'आपातकालीन संपर्क और सदस्य',
    due: 'बाकी',
    done: 'पूर्ण',

    // Routine & Adherence
    today_routine_title: 'आज की दवाइयों की दिनचर्या',
    today_routine_desc: 'दैनिक निर्धारित समय के अनुसार दवा लेने की रीयल-टाइम सूची',
    all_doses_completed: 'आज की सभी दवाइयाँ ले ली गई हैं!',
    take_dose: 'दवा ले ली ✅',
    skip_dose: 'छोड़ें',
    undo: 'वापस लें',
    dose_taken: 'ले ली गई',
    dose_skipped: 'छोड़ दी गई',
    dose_pending: 'अभी लेना बाकी है',
    slot_morning: 'सुबह',
    slot_afternoon: 'दोपहर',
    slot_evening: 'शाम',
    slot_night: 'रात',

    // 7-Day Streak
    weekly_streak_title: '7 दिनों का दवा रिकॉर्ड',
    weekly_streak_desc: 'दैनिक दवा अनुपालन का इतिहास',
    taken_doses: 'ली गई',
    skipped_doses: 'छोड़ी गई',
    pending_doses: 'बाकी',

    // Care Circle & Medical Card
    emergency_contact: 'आपातकालीन संपर्क',
    primary_physician: 'प्राथमिक चिकित्सक',
    known_allergies: 'एलर्जी विवरण',
    circle_code: 'सर्कल कोड',
    care_circle_members: 'केयर सर्कल के सदस्य',
    care_circle_desc: 'दैनिक देखभाल और स्वास्थ्य निगरानी में जुड़े सदस्य',
    join_code: 'जुड़ने का कोड',
    joined: 'जुड़े',
    email_alerts_on: 'ईमेल अलर्ट सक्रिय',

    // Language Toggle
    lang_toggle: 'English',
  },
};
