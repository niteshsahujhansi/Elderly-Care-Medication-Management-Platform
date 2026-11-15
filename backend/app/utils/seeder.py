import hashlib
from datetime import datetime, timedelta
from app.database import SessionLocal, engine, Base
from app.models.user_and_profile import User, ElderlyProfile, CareCircleMember
from app.models.medication import Medication
from app.models.adherence import AdherenceLog
from app.models.appointment import Appointment
from app.models.notification import NotificationLog

def hash_passcode(pin: str) -> str:
    return hashlib.sha256(pin.strip().encode()).hexdigest()

def seed_database(clean: bool = False):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if clean:
        print("--- Cleaning all tables before reseeding ---")
        try:
            db.query(NotificationLog).delete()
            db.query(AdherenceLog).delete()
            db.query(Appointment).delete()
            db.query(Medication).delete()
            db.query(CareCircleMember).delete()
            db.query(ElderlyProfile).delete()
            db.query(User).delete()
            db.commit()
            print("All tables successfully cleared.")
        except Exception as e:
            db.rollback()
            print(f"Notice while clearing tables: {e}")

    print("--- Seeding Database for Elderly Care & Medication Management Platform ---")

    # 1. Ensure Demo Users (PIN: 123456)
    pin_hash = hash_passcode("123456")
    
    user_robert = db.query(User).filter(User.email_or_phone == "robert@demo.care").first()
    if not user_robert:
        user_robert = User(name="Robert Jenkins (Grandpa)", email_or_phone="robert@demo.care", passcode=pin_hash, default_role="senior")
        db.add(user_robert)
    
    user_sarah = db.query(User).filter(User.email_or_phone == "sarah@demo.care").first()
    if not user_sarah:
        user_sarah = User(name="Sarah Jenkins (Daughter)", email_or_phone="sarah@demo.care", passcode=pin_hash, default_role="family")
        db.add(user_sarah)

    user_elena = db.query(User).filter(User.email_or_phone == "elena@demo.care").first()
    if not user_elena:
        user_elena = User(name="Nurse Elena Vance", email_or_phone="elena@demo.care", passcode=pin_hash, default_role="caregiver")
        db.add(user_elena)

    user_tom = db.query(User).filter(User.email_or_phone == "tom@demo.care").first()
    if not user_tom:
        user_tom = User(name="Neighbor Tom", email_or_phone="tom@demo.care", passcode=pin_hash, default_role="other")
        db.add(user_tom)

    db.commit()
    db.refresh(user_robert)
    db.refresh(user_sarah)
    db.refresh(user_elena)
    db.refresh(user_tom)

    # 2. Profiles
    profile_robert = db.query(ElderlyProfile).filter(ElderlyProfile.circle_code == "882104").first()
    if not profile_robert:
        profile_robert = ElderlyProfile(
            circle_code="882104",
            name="Robert Jenkins",
            date_of_birth="1948-05-12",
            age=78,
            gender="Male",
            blood_group="O+",
            primary_phone="+91 98765 43210",
            emergency_phone="+91 98765 43211",
            emergency_contact_name="Sarah Jenkins (Daughter)",
            primary_physician_name="Dr. Sarah Adams",
            primary_physician_phone="+91 98765 43222",
            hospital_preference="City Multispeciality Hospital",
            allergies="Penicillin, Peanuts",
            chronic_conditions="Type 2 Diabetes, Hypertension, Mild Osteoarthritis",
            dietary_restrictions="Low sodium, Diabetic diet, Avoid grapefruit",
            mobility_status="Independent with Cane",
            preferred_language="English",
            room_or_address="Flat 402, Green Valley Apartments, New Delhi",
            insurance_provider="Star Health Senior Care",
            insurance_policy_number="SH-8849201",
            special_care_instructions="Needs reading glasses. Prefers morning medication after oatmeal breakfast.",
        )
        db.add(profile_robert)
        db.commit()
        db.refresh(profile_robert)

    profile_alice = db.query(ElderlyProfile).filter(ElderlyProfile.circle_code == "994821").first()
    if not profile_alice:
        profile_alice = ElderlyProfile(
            circle_code="994821",
            name="Alice Jenkins",
            date_of_birth="1951-09-24",
            age=75,
            gender="Female",
            blood_group="A+",
            primary_phone="+91 98765 43212",
            emergency_phone="+91 98765 43211",
            emergency_contact_name="Robert Jenkins (Husband) / Sarah Jenkins (Daughter)",
            primary_physician_name="Dr. Michael Chen",
            primary_physician_phone="+91 98765 43233",
            hospital_preference="Apollo Multispecialty Clinic",
            allergies="Sulfa antibiotics",
            chronic_conditions="Osteoporosis, Mild Glaucoma",
            dietary_restrictions="High calcium, low caffeine",
            mobility_status="Independent",
            preferred_language="English",
            room_or_address="Flat 402, Green Valley Apartments, New Delhi",
            insurance_provider="Max Bupa Health Plus",
            insurance_policy_number="MB-7731092",
            special_care_instructions="Take eye drops 10 minutes before bedtime.",
        )
        db.add(profile_alice)
        db.commit()
        db.refresh(profile_alice)

    # 3. Connect Care Circle Memberships (Crucial!)
    memberships_to_ensure = [
        # Robert's Circle (882104)
        (user_robert.id, profile_robert.id, "senior", True, True, True),
        (user_sarah.id, profile_robert.id, "family", True, True, True),
        (user_elena.id, profile_robert.id, "caregiver", True, True, True),
        (user_tom.id, profile_robert.id, "other", False, False, False),
        # Alice's Circle (994821)
        (user_robert.id, profile_alice.id, "family", True, True, True),
        (user_sarah.id, profile_alice.id, "family", True, True, True),
    ]

    for uid, pid, role, email_notif, sms_notif, push_notif in memberships_to_ensure:
        existing_m = db.query(CareCircleMember).filter(
            CareCircleMember.user_id == uid,
            CareCircleMember.profile_id == pid,
        ).first()
        if not existing_m:
            db.add(CareCircleMember(
                user_id=uid,
                profile_id=pid,
                role=role,
                notify_email=email_notif,
                notify_sms=sms_notif,
                notify_push=push_notif,
            ))
    db.commit()
    print("Care circle memberships seeded for all demo personas.")

    # 4. Seed Prescriptions for Grandpa Robert (Morning, Afternoon, Evening, Night)
    robert_med_count = db.query(Medication).filter(Medication.profile_id == profile_robert.id).count()
    if robert_med_count == 0:
        meds_robert = [
            Medication(
                profile_id=profile_robert.id,
                name="Metformin",
                dosage="500 mg",
                time_slot="morning",
                exact_time="08:00",
                frequency="daily",
                instructions="Take with food after breakfast",
                purpose="Blood sugar regulation (Type 2 Diabetes)",
                pill_shape="Round",
                pill_color="White",
                inventory_count=45,
            ),
            Medication(
                profile_id=profile_robert.id,
                name="Vitamin D3",
                dosage="1000 IU",
                time_slot="afternoon",
                exact_time="13:00",
                frequency="daily",
                instructions="Take with lunch",
                purpose="Bone & joint health",
                pill_shape="Capsule",
                pill_color="Yellow",
                inventory_count=60,
            ),
            Medication(
                profile_id=profile_robert.id,
                name="Lisinopril",
                dosage="10 mg",
                time_slot="evening",
                exact_time="19:00",
                frequency="daily",
                instructions="Take with dinner and a full glass of water",
                purpose="Blood pressure control",
                pill_shape="Round",
                pill_color="Pink",
                inventory_count=28,
            ),
            Medication(
                profile_id=profile_robert.id,
                name="Atorvastatin",
                dosage="20 mg",
                time_slot="night",
                exact_time="21:30",
                frequency="daily",
                instructions="Take right before bedtime",
                purpose="Cholesterol regulation",
                pill_shape="Oval",
                pill_color="White",
                inventory_count=30,
            ),
        ]
        db.add_all(meds_robert)
        db.commit()
        print("Seeded 4 daily prescriptions for Robert Jenkins.")

    # 5. Seed Prescriptions for Grandma Alice
    alice_med_count = db.query(Medication).filter(Medication.profile_id == profile_alice.id).count()
    if alice_med_count == 0:
        meds_alice = [
            Medication(
                profile_id=profile_alice.id,
                name="Levothyroxine",
                dosage="50 mcg",
                time_slot="morning",
                exact_time="07:30",
                frequency="daily",
                instructions="Take on an empty stomach with water, 30 min before food",
                purpose="Thyroid hormone replacement",
                pill_shape="Round",
                pill_color="White",
                inventory_count=50,
            ),
            Medication(
                profile_id=profile_alice.id,
                name="Calcium + Vit D",
                dosage="600 mg",
                time_slot="afternoon",
                exact_time="13:00",
                frequency="daily",
                instructions="Take with lunch",
                purpose="Osteoporosis bone strength",
                pill_shape="Oval",
                pill_color="Blue",
                inventory_count=40,
            ),
            Medication(
                profile_id=profile_alice.id,
                name="Latanoprost Eye Drops",
                dosage="0.005%",
                time_slot="night",
                exact_time="22:00",
                frequency="daily",
                instructions="1 drop in each eye before sleep",
                purpose="Glaucoma eye pressure control",
                pill_shape="Liquid",
                pill_color="Clear",
                inventory_count=1,
            ),
        ]
        db.add_all(meds_alice)
        db.commit()
        print("Seeded 3 daily prescriptions for Alice Jenkins.")

    # 6. Seed Adherence Logs for Robert Jenkins
    robert_meds = db.query(Medication).filter(Medication.profile_id == profile_robert.id).all()
    today_dt = datetime.utcnow().date()
    today_str = today_dt.strftime("%Y-%m-%d")

    # Past 6 days: 100% adherence logs
    for days_ago in range(6, 0, -1):
        past_date_str = (today_dt - timedelta(days=days_ago)).strftime("%Y-%m-%d")
        for med in robert_meds:
            existing = db.query(AdherenceLog).filter(
                AdherenceLog.profile_id == profile_robert.id,
                AdherenceLog.medication_id == med.id,
                AdherenceLog.log_date == past_date_str,
            ).first()
            if not existing:
                db.add(AdherenceLog(
                    profile_id=profile_robert.id,
                    medication_id=med.id,
                    logged_by_user_id=user_robert.id,
                    logged_by_name="Robert Jenkins",
                    log_date=past_date_str,
                    time_slot=med.time_slot,
                    status="taken",
                    logged_at=datetime.utcnow() - timedelta(days=days_ago),
                    notes="Taken on time with water",
                ))

    # Today: Morning dose taken, others pending for interactive testing by judges
    for med in robert_meds:
        if med.time_slot == "morning":
            existing = db.query(AdherenceLog).filter(
                AdherenceLog.profile_id == profile_robert.id,
                AdherenceLog.medication_id == med.id,
                AdherenceLog.log_date == today_str,
            ).first()
            if not existing:
                db.add(AdherenceLog(
                    profile_id=profile_robert.id,
                    medication_id=med.id,
                    logged_by_user_id=user_robert.id,
                    logged_by_name="Robert Jenkins",
                    log_date=today_str,
                    time_slot="morning",
                    status="taken",
                    logged_at=datetime.utcnow() - timedelta(hours=3),
                    notes="Taken after breakfast oatmeal",
                ))

    db.commit()
    print("Seeded adherence history and today's morning dose for Robert Jenkins.")

    # 7. Seed Appointments
    robert_app_count = db.query(Appointment).filter(Appointment.profile_id == profile_robert.id).count()
    if robert_app_count == 0:
        apps_robert = [
            Appointment(
                profile_id=profile_robert.id,
                scheduled_by_user_id=user_sarah.id,
                scheduled_by_name="Sarah Jenkins (Daughter)",
                doctor_name="Dr. Sarah Adams",
                specialty="Cardiologist",
                clinic_or_hospital="City Multispeciality Hospital, Heart Care Suite 302",
                appointment_datetime=(datetime.utcnow() + timedelta(days=3)).strftime("%Y-%m-%dT10:30"),
                contact_phone="+91 98765 43222",
                purpose_or_reason="Routine Blood Pressure & ECG Assessment",
                preparation_notes="Fast 8 hours prior. Bring daily blood pressure log and current prescription bottles.",
                status="upcoming",
            ),
            Appointment(
                profile_id=profile_robert.id,
                scheduled_by_user_id=user_elena.id,
                scheduled_by_name="Nurse Elena Vance",
                doctor_name="Dr. Robert Vance",
                specialty="Optometrist",
                clinic_or_hospital="West Valley Eye Clinic",
                appointment_datetime=(datetime.utcnow() - timedelta(days=14)).strftime("%Y-%m-%dT14:00"),
                contact_phone="+91 98765 43244",
                purpose_or_reason="Glaucoma eye pressure check & lens update",
                preparation_notes="Bring sunglasses for eye dilation.",
                status="completed",
            ),
        ]
        db.add_all(apps_robert)
        db.commit()
        print("Seeded 2 medical appointments for Robert Jenkins (1 Upcoming, 1 Completed).")

    alice_app_count = db.query(Appointment).filter(Appointment.profile_id == profile_alice.id).count()
    if alice_app_count == 0:
        app_alice = Appointment(
            profile_id=profile_alice.id,
            scheduled_by_user_id=user_robert.id,
            scheduled_by_name="Robert Jenkins (Grandpa)",
            doctor_name="Dr. Michael Chen",
            specialty="Endocrinologist",
            clinic_or_hospital="Apollo Multispecialty Clinic, Room 105",
            appointment_datetime=(datetime.utcnow() + timedelta(days=5)).strftime("%Y-%m-%dT14:00"),
            contact_phone="+91 98765 43233",
            purpose_or_reason="Thyroid hormone levels & bone density review",
            preparation_notes="Take morning Levothyroxine as usual with full glass of water.",
            status="upcoming",
        )
        db.add(app_alice)
        db.commit()
        print("Seeded 1 upcoming medical appointment for Alice Jenkins.")

    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    import sys
    should_clean = "--clean" in sys.argv
    seed_database(clean=should_clean)
