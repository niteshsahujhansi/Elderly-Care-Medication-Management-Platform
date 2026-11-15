from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_appointments():
    print("\n--- Running Automated Medical Appointments API Verification Tests ---\n")

    # 1. Unauthenticated request rejected with 401
    res = client.get("/api/appointments?profile_id=1")
    assert res.status_code == 401
    print("PASS: 1. Unauthenticated request rejected with 401 Unauthorized")

    # 2. Login as Sarah (Family)
    res = client.post("/api/auth/demo-login/sarah")
    assert res.status_code == 200
    sarah_token = res.json()["access_token"]
    sarah_headers = {"Authorization": f"Bearer {sarah_token}"}

    # 3. Get Grandpa Robert's profile ID
    res = client.get("/api/profiles/my", headers=sarah_headers)
    assert res.status_code == 200
    profiles = res.json()
    robert_profile = next(p for p in profiles if "Robert" in p["name"])
    alice_profile = next(p for p in profiles if "Alice" in p["name"])
    robert_id = robert_profile["profile_id"]
    alice_id = alice_profile["profile_id"]

    # 4. List appointments for Grandpa Robert
    res = client.get(f"/api/appointments?profile_id={robert_id}", headers=sarah_headers)
    assert res.status_code == 200
    apps = res.json()
    assert len(apps) >= 2
    print(f"PASS: 2. Retrieved {len(apps)} appointments for Robert Jenkins: {[a['doctor_name'] for a in apps]}")

    # 5. Check Appointments Summary endpoint (Upcoming vs Past)
    res = client.get(f"/api/appointments/summary?profile_id={robert_id}", headers=sarah_headers)
    assert res.status_code == 200
    summary = res.json()
    assert summary["total_upcoming"] >= 1
    assert len(summary["past_or_completed"]) >= 1
    print(f"PASS: 3. Summary partitioned into {len(summary['upcoming'])} upcoming and {len(summary['past_or_completed'])} past/completed")

    # 6. Schedule a brand new appointment
    future_date = (datetime.utcnow() + timedelta(days=7)).strftime("%Y-%m-%dT11:00")
    new_app_payload = {
        "profile_id": robert_id,
        "doctor_name": "Dr. Emily Davis",
        "specialty": "Physical Therapist",
        "clinic_or_hospital": "Springfield Physical Therapy Clinic",
        "appointment_datetime": future_date,
        "contact_phone": "+1-555-0678",
        "purpose_or_reason": "Knee Mobility & Walking Cane Assessment",
        "preparation_notes": "Wear loose, comfortable clothes and walking shoes.",
    }
    res = client.post("/api/appointments", json=new_app_payload, headers=sarah_headers)
    assert res.status_code == 201
    created_app = res.json()
    created_id = created_app["id"]
    assert created_app["doctor_name"] == "Dr. Emily Davis"
    assert created_app["status"] == "upcoming"
    print(f"PASS: 4. Scheduled appointment with {created_app['doctor_name']} (ID: {created_id})")

    # 7. Get single appointment by ID
    res = client.get(f"/api/appointments/{created_id}", headers=sarah_headers)
    assert res.status_code == 200
    single_app = res.json()
    assert single_app["id"] == created_id
    assert single_app["specialty"] == "Physical Therapist"
    print("PASS: 5. Retrieved single appointment details successfully")

    # 8. Update appointment details
    update_payload = {
        "purpose_or_reason": "Knee Mobility & Gait Balance Follow-up",
        "preparation_notes": "Fast 2 hours prior and bring comfortable sneakers.",
    }
    res = client.put(f"/api/appointments/{created_id}", json=update_payload, headers=sarah_headers)
    assert res.status_code == 200
    updated_app = res.json()
    assert "Gait Balance" in updated_app["purpose_or_reason"]
    print(f"PASS: 6. Updated appointment details: '{updated_app['purpose_or_reason']}'")

    # 9. Mark appointment as completed
    status_payload = {"status": "completed"}
    res = client.put(f"/api/appointments/{created_id}", json=status_payload, headers=sarah_headers)
    assert res.status_code == 200
    assert res.json()["status"] == "completed"
    print("PASS: 7. Marked appointment as completed")

    # 10. Delete the test appointment
    res = client.delete(f"/api/appointments/{created_id}", headers=sarah_headers)
    assert res.status_code == 200
    assert res.json()["success"] is True

    res = client.get(f"/api/appointments/{created_id}", headers=sarah_headers)
    assert res.status_code == 404
    print("PASS: 8. Deleted test appointment verified with 404")

    # 11. Role Protection: Read-only 'other' user (Neighbor Tom)
    res = client.post("/api/auth/demo-login/tom")
    assert res.status_code == 200
    tom_token = res.json()["access_token"]
    tom_headers = {"Authorization": f"Bearer {tom_token}"}

    # Tom CAN view
    res = client.get(f"/api/appointments?profile_id={robert_id}", headers=tom_headers)
    assert res.status_code == 200
    print("PASS: 9. Read-only 'other' user allowed to view appointments (200 OK)")

    # Tom CANNOT create
    res = client.post("/api/appointments", json=new_app_payload, headers=tom_headers)
    assert res.status_code == 403
    print("PASS: 10. Read-only 'other' user correctly blocked from scheduling appointments (403 Forbidden)")

    # 12. Profile Isolation
    res = client.get(f"/api/appointments?profile_id={alice_id}", headers=sarah_headers)
    assert res.status_code == 200
    alice_apps = res.json()
    assert all("Dr. Michael Chen" in a["doctor_name"] for a in alice_apps)
    print(f"PASS: 11. Profile isolation verified: Grandma Alice has separate appointments ({[a['doctor_name'] for a in alice_apps]})")

    print("\nALL 11 APPOINTMENT TESTS PASSED PERFECTLY! (100% Pass Rate)\n")

if __name__ == "__main__":
    test_appointments()
