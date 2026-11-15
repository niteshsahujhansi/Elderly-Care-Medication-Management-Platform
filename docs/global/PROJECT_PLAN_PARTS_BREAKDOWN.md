# Elderly Care & Medication Management Platform
## Project Plan (7 Small Parts Breakdown & Testing Roadmap)

---

## PART 1: CORE FUNCTIONALITY — 7 SMALL PARTS BREAKDOWN

To ensure rapid, clean execution and easy testing within the 12-hour hackathon, the core functionality is broken down into **7 sequential, testable parts**. Each part can be built, tested, and verified independently.

### Quick Reference Matrix

| Part | Title | Deliverables | How It Will Be Tested |
| :--- | :--- | :--- | :--- |
| **Part 1** | **Foundation & Setup** | FastAPI + SQLite setup, Next.js + Tailwind shell, `/api/health`. | Frontend and backend run and connect successfully. |
| **Part 2** | **Profiles & Passcode Access** | Elderly profile creation with 4–6 digit PIN; PIN login for senior/family. | Create profile, log in with PIN, retrieve profile details. |
| **Part 3** | **Medication Schedule (CRUD)** | Add, edit, list, and delete medications with dosage, time slots, and instructions. | Add "Metformin 500mg, Morning", verify it lists, edits, and deletes. |
| **Part 4** | **Daily Adherence Checklist** | Today's timeline checklist, 1-click "Taken" / "Skipped" logging, live progress bar. | Click "Mark Taken", status & progress bar update instantly and persist on reload. |
| **Part 5** | **Appointments Management** | Add/edit doctor visits, clinic location, date/time, countdown badge. | Schedule a visit, verify it appears in chronological order. |
| **Part 6** | **Proactive Email Alerts** | Automated emails for upcoming doses, missed dose alerts (>30m), and appointments. | Trigger test alert; verify email arrives in inbox with exact medicine details. |
| **Part 7** | **Dual-Mode UI** | 1-click toggle: Elderly Mode (big buttons, zero clutter) vs. Caregiver Mode (full controls). | Verify senior can mark doses in 3 seconds; caregiver can manage all data. |

---

### Part 1: Foundation, Scaffolding & Database Setup
* **Goal:** Set up backend and frontend projects with clean structure and verified communication.
* **Backend (FastAPI):**
  * Initialize FastAPI app, CORS middleware, environment configuration.
  * SQLite database with SQLAlchemy / SQLModel models.
  * Health check endpoint: `GET /api/health`.
* **Frontend (Next.js):**
  * Initialize Next.js app with Tailwind CSS and Lucide icons.
  * Global layout shell (responsive header, container, clean typography).
  * API client helper to communicate with FastAPI.
* **Definition of Done (Testable):**
  * Backend runs and returns `{ "status": "ok" }`.
  * Frontend renders and successfully fetches and displays the health status.

---

### Part 2: Profiles & Passcode-Based Access
* **Goal:** Enable friction-free login for elderly and shared access for family/caretakers.
* **Backend:**
  * Profile Model: `id`, `name`, `age`, `passcode` (4-6 digit PIN), `emergency_contact`, `created_at`.
  * Endpoints:
    * `POST /api/profiles` — Create elderly profile with PIN.
    * `POST /api/profiles/login` — Authenticate using Profile ID + PIN.
    * `GET /api/profiles/{id}` — Get profile details.
* **Frontend:**
  * PIN keypad / login screen (large, readable digits).
  * "Create New Profile" modal for first-time onboarding.
  * Active profile session storage (`localStorage` / React Context).
* **Definition of Done (Testable):**
  * Can create a profile named "Grandpa John" with PIN `1234`.
  * Can log in using that PIN and enter the dashboard.

---

### Part 3: Medication Schedule Management
* **Goal:** Add, view, edit, and delete medications with schedule times and instructions.
* **Backend:**
  * Medication Model: `id`, `profile_id`, `name`, `dosage` (e.g., "500mg"), `time_slot` (Morning, Afternoon, Evening, Night or exact HH:MM), `instructions` (e.g., "With food"), `is_active`.
  * Endpoints:
    * `POST /api/medications` — Add medication.
    * `GET /api/medications?profile_id={id}` — List active medications.
    * `PUT /api/medications/{id}` — Edit medication.
    * `DELETE /api/medications/{id}` — Deactivate/delete medication.
* **Frontend:**
  * "Add Medicine" modal/form (Name, Dosage, Time of Day, Notes).
  * Medication Card list grouped by time of day (Morning / Afternoon / Evening / Night).
* **Definition of Done (Testable):**
  * Can add "Metformin 500mg, Morning, with food" and see it rendered under Morning slot.
  * Can edit or delete it.

---

### Part 4: Daily Adherence Checklist & Real-Time Logging
* **Goal:** 1-click status update (Taken / Skipped / Pending) with real-time feedback and history.
* **Backend:**
  * AdherenceLog Model: `id`, `medication_id`, `profile_id`, `date`, `time_slot`, `status` (`taken`, `skipped`, `pending`), `logged_at`.
  * Endpoints:
    * `GET /api/adherence/today?profile_id={id}` — Computes today's schedule + logged statuses.
    * `POST /api/adherence/log` — Record dose status (`taken` / `skipped`) with timestamp.
    * `GET /api/adherence/history?profile_id={id}` — Past 7-day adherence stats.
* **Frontend:**
  * "Today's Checklist": large touch buttons (`Mark Taken ✅`, `Skip ⏭️`).
  * Live Daily Progress Bar (e.g., "2 of 3 taken — 67%").
  * Immediate visual badge change (Green for Taken, Gray for Skipped).
* **Definition of Done (Testable):**
  * Clicking "Mark Taken" updates the status instantly, saves to DB, updates the progress bar, and persists across page reloads.

---

### Part 5: Medical Appointments Management
* **Goal:** Track doctor visits, clinic locations, and appointment notes.
* **Backend:**
  * Appointment Model: `id`, `profile_id`, `doctor_name`, `specialty`, `location`, `appointment_date`, `notes`.
  * Endpoints:
    * `POST /api/appointments` — Schedule new appointment.
    * `GET /api/appointments?profile_id={id}` — List upcoming & past appointments.
    * `DELETE /api/appointments/{id}` — Cancel appointment.
* **Frontend:**
  * "Upcoming Appointments" section with countdown badge (e.g., "In 2 days").
  * "Schedule Appointment" modal form.
* **Definition of Done (Testable):**
  * Can add an appointment with "Dr. Smith (Cardiologist), City Hospital, tomorrow 10:00 AM".
  * Appears in upcoming list chronologically.

---

### Part 6: Proactive Email Reminders & Missed Dose Alerts
* **Goal:** Automatic emails for upcoming doses, missed medications, and upcoming appointments.
* **Backend:**
  * CareCircleContact Model: `id`, `profile_id`, `name`, `email`, `role` (`family` / `caretaker`).
  * Email Dispatcher utility (SMTP / Resend / Background Tasks).
  * Automated or scheduled triggers:
    1. **Upcoming Dose Reminder:** Sent ahead of scheduled dose time.
    2. **Missed Dose Alert:** Triggered if a dose remains "Pending" > 30–60 minutes after scheduled time.
    3. **Appointment Reminder:** Sent 24 hours prior to appointment.
  * Test endpoint: `POST /api/notifications/test-alert` to verify email delivery on demand.
* **Frontend:**
  * Care Circle email settings list (add family/caretaker emails).
  * "Send Test Reminder" button in settings for instant verification.
* **Definition of Done (Testable):**
  * Triggering the test or missing a dose generates an email in inbox with clear details ("Action Required: Grandpa missed 8:00 AM Metformin").

---

### Part 7: Dual-Mode UI (Elderly View vs. Caregiver View)
* **Goal:** Ensure the app is accessible to elderly individuals while giving caregivers full control.
* **Frontend:**
  * **Top Bar Switcher:** One-click toggle between:
    * **Elderly Mode:** Extra-large font, high contrast, clean list of only Today's Pills & Today's Appointments, zero administrative clutter.
    * **Caregiver / Family Mode:** Full administrative controls (Add/edit medications, appointment scheduler, email settings, adherence history).
* **Definition of Done (Testable):**
  * In Elderly Mode, an 80-year-old can see their morning pills and tap "Taken" in under 3 seconds without navigating menus.
  * In Caregiver Mode, family can manage all schedules, contacts, and appointments.

---

## PART 2: INNOVATIONS (PLANNED EXTENSIONS)

*Note: Short list — to be picked one by one only after completing and testing Parts 1–7 above.*

1. **AI Prescription Scanner:** Upload photo of prescription/pill bottle to auto-extract medicine name, dosage, and timings.
2. **Emergency SOS & Medical Passport:** 1-tap emergency card showing blood group, allergies, active prescriptions, and emergency contacts.
3. **Voice Audio Companion (TTS):** Spoken audio reading of daily schedule and simple voice confirmations (*"Mark morning pills as taken"*).
4. **Smart Drug Interaction Checker:** Quick safety check when adding new medication to flag adverse interactions with active drugs.
5. **Multi-Tier Escalation Ladder:** Automated escalation where unconfirmed missed doses notify secondary emergency contacts.
6. **Caregiver Evening Digest:** Automated daily summary email to family reporting daily adherence score and tomorrow's schedule.
