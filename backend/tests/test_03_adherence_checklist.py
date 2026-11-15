def test_today_adherence_routine(client, robert_headers, profile_ids):
    robert_id = profile_ids["robert_id"]
    res = client.get(f"/api/adherence/today?profile_id={robert_id}", headers=robert_headers)
    assert res.status_code == 200
    data = res.json()
    assert "slots" in data
    assert "compliance_percentage" in data
    assert "total_doses" in data

def test_log_dose_taken_and_reset(client, robert_headers, profile_ids):
    robert_id = profile_ids["robert_id"]
    # Get today's doses
    res = client.get(f"/api/adherence/today?profile_id={robert_id}", headers=robert_headers)
    assert res.status_code == 200
    morning_doses = res.json()["slots"]["morning"]
    assert len(morning_doses) >= 1
    med_id = morning_doses[0]["medication_id"]

    # Log as taken
    log_res = client.post("/api/adherence/log", json={
        "profile_id": robert_id,
        "medication_id": med_id,
        "time_slot": "morning",
        "status": "taken",
        "notes": "Taken with breakfast oatmeal",
    }, headers=robert_headers)
    assert log_res.status_code == 200
    log_data = log_res.json()
    assert log_data["status"] == "taken"
    log_id = log_data["id"]

    # Reset (Undo)
    reset_res = client.delete(f"/api/adherence/reset/{log_id}", headers=robert_headers)
    assert reset_res.status_code == 200
    assert reset_res.json()["success"] is True

def test_log_dose_skipped_with_reason(client, robert_headers, profile_ids):
    robert_id = profile_ids["robert_id"]
    res = client.get(f"/api/adherence/today?profile_id={robert_id}", headers=robert_headers)
    assert res.status_code == 200
    afternoon_doses = res.json()["slots"]["afternoon"]
    assert len(afternoon_doses) >= 1
    med_id = afternoon_doses[0]["medication_id"]

    # Log as skipped
    skip_res = client.post("/api/adherence/log", json={
        "profile_id": robert_id,
        "medication_id": med_id,
        "time_slot": "afternoon",
        "status": "skipped",
        "notes": "Doctor advised to skip today due to upset stomach",
    }, headers=robert_headers)
    assert skip_res.status_code == 200
    assert skip_res.json()["status"] == "skipped"
    assert "Doctor advised" in skip_res.json()["notes"]

def test_adherence_7day_history(client, robert_headers, profile_ids):
    robert_id = profile_ids["robert_id"]
    res = client.get(f"/api/adherence/history?profile_id={robert_id}&days=7", headers=robert_headers)
    assert res.status_code == 200
    history = res.json()
    assert len(history["days"]) == 7
    assert "average_compliance" in history
