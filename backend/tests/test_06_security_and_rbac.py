def test_unauthenticated_requests_are_rejected(client):
    endpoints = [
        ("GET", "/api/profiles/my"),
        ("GET", "/api/medications?profile_id=1"),
        ("GET", "/api/adherence/today?profile_id=1"),
        ("GET", "/api/appointments?profile_id=1"),
        ("GET", "/api/notifications/history?profile_id=1"),
    ]
    for method, url in endpoints:
        if method == "GET":
            res = client.get(url)
        assert res.status_code == 401, f"Expected 401 for unauthenticated {url}, got {res.status_code}"

def test_readonly_other_role_is_strictly_forbidden_from_mutating(client, tom_headers, profile_ids):
    robert_id = profile_ids["robert_id"]

    # 1. Tom CAN view
    res = client.get(f"/api/medications?profile_id={robert_id}", headers=tom_headers)
    assert res.status_code == 200

    # 2. Tom CANNOT add medication (403)
    res = client.post("/api/medications", json={
        "profile_id": robert_id,
        "name": "Unauthorized Drug",
        "dosage": "500 mg",
        "time_slot": "morning",
    }, headers=tom_headers)
    assert res.status_code == 403

    # 3. Tom CANNOT log adherence (403)
    res = client.post("/api/adherence/log", json={
        "profile_id": robert_id,
        "medication_id": 1,
        "time_slot": "morning",
        "status": "taken",
    }, headers=tom_headers)
    assert res.status_code == 403

    # 4. Tom CANNOT schedule appointments (403)
    res = client.post("/api/appointments", json={
        "profile_id": robert_id,
        "doctor_name": "Dr. Hacker",
        "specialty": "None",
        "clinic_or_hospital": "Fake Clinic",
        "appointment_datetime": "2026-11-20T10:00",
    }, headers=tom_headers)
    assert res.status_code == 403

    # 5. Tom CANNOT trigger email alerts (403)
    res = client.post("/api/notifications/test-alert", json={
        "profile_id": robert_id,
        "alert_type": "missed_dose_alert",
    }, headers=tom_headers)
    assert res.status_code == 403

def test_cross_profile_isolation(client, sarah_headers, profile_ids):
    robert_id = profile_ids["robert_id"]
    alice_id = profile_ids["alice_id"]

    # Robert's medications vs Alice's medications
    robert_res = client.get(f"/api/medications?profile_id={robert_id}", headers=sarah_headers)
    alice_res = client.get(f"/api/medications?profile_id={alice_id}", headers=sarah_headers)

    robert_meds = [m["name"] for m in robert_res.json()]
    alice_meds = [m["name"] for m in alice_res.json()]

    assert "Metformin" in robert_meds
    assert "Metformin" not in alice_meds
    assert "Levothyroxine" in alice_meds
    assert "Levothyroxine" not in robert_meds

def test_passcodes_are_never_exposed_in_api(client, sarah_headers):
    res = client.get("/api/auth/me", headers=sarah_headers)
    assert res.status_code == 200
    user_data = res.json()
    assert "passcode" not in user_data
    assert "password" not in user_data
