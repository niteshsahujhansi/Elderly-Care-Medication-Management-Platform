from datetime import datetime, timedelta

def test_list_and_summary_appointments(client, sarah_headers, profile_ids):
    robert_id = profile_ids["robert_id"]
    res = client.get(f"/api/appointments/summary?profile_id={robert_id}", headers=sarah_headers)
    assert res.status_code == 200
    summary = res.json()
    assert "upcoming" in summary
    assert "past_or_completed" in summary

def test_appointment_crud_and_completion(client, sarah_headers, profile_ids):
    robert_id = profile_ids["robert_id"]
    future_date = (datetime.utcnow() + timedelta(days=10)).strftime("%Y-%m-%dT10:00")

    # 1. Schedule
    new_app = {
        "profile_id": robert_id,
        "doctor_name": "Dr. Gregory House",
        "specialty": "Nephrologist",
        "clinic_or_hospital": "Princeton Plainsboro Teaching Hospital, Clinic 3",
        "appointment_datetime": future_date,
        "contact_phone": "+1-555-0899",
        "purpose_or_reason": "Renal panel check & electrolytes",
        "preparation_notes": "Drink 2 glasses of water 1 hour before appointment.",
    }
    res = client.post("/api/appointments", json=new_app, headers=sarah_headers)
    assert res.status_code == 201
    created = res.json()
    app_id = created["id"]
    assert created["doctor_name"] == "Dr. Gregory House"

    # 2. Update status to completed
    res = client.put(f"/api/appointments/{app_id}", json={"status": "completed"}, headers=sarah_headers)
    assert res.status_code == 200
    assert res.json()["status"] == "completed"

    # 3. Delete
    res = client.delete(f"/api/appointments/{app_id}", headers=sarah_headers)
    assert res.status_code == 200
    assert res.json()["success"] is True
