# Elderly Care & Medication Management Platform
## Project Plan (Part 1: Core Functionality Overview & Part 2: Innovations)

---

## PART 1: CORE FUNCTIONALITY (MUST-HAVE) — MAIN FOCUS

The core objective is to build a reliable, accessible, and shared healthcare management ecosystem connecting the **Elderly Person**, **Family Members**, and **Caretakers**. All efforts in Phase 1 are dedicated to completing, testing, and deploying these features.

---

### 1. User Profiles & Passcode-Based Access

* **Elderly Profile Setup:**
  * Basic details: Name, age, emergency contact, basic medical notes (allergies, primary doctor).
  * Unique Care Profile ID generated for each elderly individual.
* **Passcode-Based Access Model:**
  * Simple, secure **PIN/Passcode** (e.g., 4 to 6 digits) assigned to the profile for friction-free access.
  * Eliminates complex passwords for elderly users.
  * Family members and caretakers join the elderly person's profile using the **Profile ID + Passcode**.
* **Role-Based Perspectives:**
  * **Elderly View:** Streamlined, high-legibility interface focused strictly on *Today's Medication* and *Upcoming Appointments*.
  * **Caretaker / Family View:** Full administrative access to add, update, and monitor schedules and history.

---

### 2. Medication Schedule Management

* **Medication Entry (CRUD):**
  * Medicine name and dosage (e.g., *Metformin 500mg*).
  * Frequency (e.g., Daily, Twice daily, Specific days).
  * Time slots (Morning, Afternoon, Evening, Night / specific hours: e.g., 08:00 AM, 08:00 PM).
  * Intake instructions (e.g., *Take with food*, *Take on an empty stomach*).
  * Start date and end date (or ongoing chronic medication).
* **Schedule Timeline:**
  * Chronological "Today's Schedule" broken down into clear time blocks (Morning, Afternoon, Evening, Night).
  * Active vs. inactive medication list.

---

### 3. Medication Adherence Tracking

* **One-Click Adherence Logging:**
  * Simple status update for each scheduled dose:
    * **Taken** (with automatic timestamp)
    * **Skipped** (optional reason: e.g., feeling unwell, doctor advised)
    * **Pending**
* **Adherence History & Log:**
  * Daily and weekly adherence log visible to caretakers and family members.
  * Real-time status sync: When marked "Taken" by the elderly or caretaker, all authorized members immediately see the updated status.

---

### 4. Medical Appointments Management

* **Appointment Entry (CRUD):**
  * Doctor/Specialist name and clinic/hospital location.
  * Date and time of appointment.
  * Purpose/Notes (e.g., *Routine blood pressure checkup*, *Bring previous lab reports*).
* **Appointment Tracking:**
  * Upcoming appointments dashboard sorted by date.
  * Past appointment history log.

---

### 5. Proactive Email Reminders & Notifications

* **Notification Engine:**
  * **Upcoming Dose Reminder:** Automated email sent prior to scheduled medication times.
  * **Missed Dose Alert:** Proactive email alert sent to family members and caretakers if a dose is not logged as "Taken" within a defined window (e.g., 30–60 minutes after scheduled time).
  * **Upcoming Appointment Reminder:** Proactive email reminder sent 24 hours and 2 hours before scheduled medical appointments.
* **Recipient Configuration:**
  * Configurable alert list containing emails for the elderly individual, designated family members, and primary caretakers.

---

### 6. Clean, Responsive User Interface (Next.js)

* **Elderly-Friendly UI Elements:**
  * Large buttons, high-contrast text, clear visual icons (pill, clock, calendar, checkmark).
  * Minimal cognitive load: No multi-level nested menus for the elderly user.
* **Shared Care Circle Dashboard:**
  * Unified view showing:
    1. Today’s medication checklist.
    2. Today’s adherence summary (e.g., 3 of 4 taken).
    3. Next scheduled doctor visit.
    4. Quick action buttons to log medication or add an appointment.

---

## PART 2: INNOVATIONS (PLANNED EXTENSIONS)

*Note: These will be implemented one by one only after Core Functionality is fully completed, deployed, and verified.*

1. **AI Prescription Label Scanner:** Upload a photo of a prescription or medicine bottle to automatically extract medicine name, dosage, and timings.
2. **Emergency SOS & Medical Passport:** A single-click emergency card displaying blood group, chronic conditions, active prescriptions, and emergency contacts for first responders.
3. **Voice Audio Companion (TTS & Speech Commands):** Browser-native voice readout of today's schedule and simple voice confirmations (*"Mark morning pills as taken"*).
4. **Smart Drug Interaction Checker:** Real-time safety check when adding new medication to warn about potential adverse interactions with existing drugs.
5. **Multi-Tier Escalation Ladder:** Automated escalation where missed doses trigger successive alerts from SMS/Email to secondary emergency contacts.
6. **Caregiver Evening Digest:** Daily automated summary email sent to family members summarizing daily adherence score and tomorrow's schedule.

---

## EXECUTION ORDER

1. **Step 1:** Finalize Scope & Requirements.
2. **Step 2:** Formulate Technical Design Document (Database, API, Frontend, Schedulers).
3. **Step 3:** Implement Core Functionality Backend (Python / FastAPI).
4. **Step 4:** Implement Core Functionality Frontend (Next.js).
5. **Step 5:** Connect Email Reminders & Test End-to-End.
6. **Step 6:** Select and implement Innovations one by one.
