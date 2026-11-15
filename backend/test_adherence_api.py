from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_adherence():
    print("\n--- Running Automated Adherence & Real-Time Logging Tests ---\n")

    # 1. Unauthenticated request should be rejected (401)
    res = client.get("/api/adherence/today?profile_id=1")
    assert res.status_code == 401
    print("PASS: 1. Unauthenticated request rejected with 401 Unauthorized")

    # 2. Login as Grandpa Robert (Senior)
    res = client.post("/api/auth/demo-login/grandpa")
    assert res.status_code == 200
    robert_token = res.json()["access_token"]
    robert_headers = {"Authorization": f"Bearer {robert_token}"}

    # 3. Get Grandpa Robert's profile ID
    res = client.get("/api/profiles/my", headers=robert_headers)
    assert res.status_code == 200
    profiles = res.json()
    robert_profile = next(p for p in profiles if "Robert" in p["name"])
    robert_id = robert_profile["profile_id"]

    # 4. Clean today's logs to ensure deterministic test baseline
    from app.database import SessionLocal
    from app.models.adherence import AdherenceLog
    from datetime import datetime
    db = SessionLocal()
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    db.query(AdherenceLog).filter(AdherenceLog.profile_id == robert_id, AdherenceLog.log_date == today_str).delete()
    db.commit()
    db.close()

    # Get Today's Adherence Routine (all should be pending initially)
    res = client.get(f"/api/adherence/today?profile_id={robert_id}", headers=robert_headers)
    assert res.status_code == 200
    today_data = res.json()
    assert today_data["profile_id"] == robert_id
    assert today_data["total_doses"] == 4
    morning_slot = today_data["slots"]["morning"]
    assert len(morning_slot) == 1
    assert morning_slot[0]["status"] == "pending"

    # Mark Morning as taken
    morning_med_id = morning_slot[0]["medication_id"]
    res = client.post(
        "/api/adherence/log",
        json={"profile_id": robert_id, "medication_id": morning_med_id, "time_slot": "morning", "status": "taken"},
        headers=robert_headers,
    )
    assert res.status_code == 200
    print(f"PASS: 2. Today's routine returned. Morning dose status logged as taken.")

    # 5. Log Afternoon Dose as 'taken'
    afternoon_med_id = today_data["slots"]["afternoon"][0]["medication_id"]
    log_payload = {
        "profile_id": robert_id,
        "medication_id": afternoon_med_id,
        "time_slot": "afternoon",
        "status": "taken",
        "notes": "Took with lunch",
    }
    res = client.post("/api/adherence/log", json=log_payload, headers=robert_headers)
    assert res.status_code == 200
    log_res = res.json()
    assert log_res["status"] == "taken"
    afternoon_log_id = log_res["id"]
    print(f"PASS: 3. Afternoon dose logged as taken by {log_res['logged_by_name']} (Log ID: {afternoon_log_id})")

    # 6. Verify updated compliance percentage
    res = client.get(f"/api/adherence/today?profile_id={robert_id}", headers=robert_headers)
    assert res.status_code == 200
    updated_today = res.json()
    assert updated_today["taken_count"] == 2
    assert updated_today["compliance_percentage"] == 50
    print(f"PASS: 4. Today's compliance updated to 50% (2 of 4 taken)")

    # 7. Log Evening Dose as 'skipped' with reason
    evening_med_id = today_data["slots"]["evening"][0]["medication_id"]
    skip_payload = {
        "profile_id": robert_id,
        "medication_id": evening_med_id,
        "time_slot": "evening",
        "status": "skipped",
        "notes": "Doctor advised to skip tonight",
    }
    res = client.post("/api/adherence/log", json=skip_payload, headers=robert_headers)
    assert res.status_code == 200
    skip_res = res.json()
    assert skip_res["status"] == "skipped"
    assert skip_res["notes"] == "Doctor advised to skip tonight"
    evening_log_id = skip_res["id"]
    print(f"PASS: 5. Evening dose logged as skipped with note: '{skip_res['notes']}'")

    # 8. Reset Evening Dose back to Pending (Undo)
    res = client.delete(f"/api/adherence/reset/{evening_log_id}", headers=robert_headers)
    assert res.status_code == 200
    assert res.json()["success"] is True

    # Verify evening dose is pending again
    res = client.get(f"/api/adherence/today?profile_id={robert_id}", headers=robert_headers)
    assert res.status_code == 200
    rechecked_evening = res.json()["slots"]["evening"][0]
    assert rechecked_evening["status"] == "pending"
    print("PASS: 6. Evening dose reset successfully back to 'pending'")

    # 9. Test 7-Day Adherence History Endpoint
    res = client.get(f"/api/adherence/history?profile_id={robert_id}&days=7", headers=robert_headers)
    assert res.status_code == 200
    history_data = res.json()
    assert len(history_data["days"]) == 7
    assert history_data["average_compliance"] > 0
    print(f"PASS: 7. 7-Day history returned {len(history_data['days'])} days with average {history_data['average_compliance']}%")

    # 10. Role Protection: Read-only 'other' user cannot log or reset adherence
    res = client.post("/api/auth/demo-login/tom")
    assert res.status_code == 200
    tom_token = res.json()["access_token"]
    tom_headers = {"Authorization": f"Bearer {tom_token}"}

    # Tom attempts to log dose for Robert
    res = client.post("/api/adherence/log", json=log_payload, headers=tom_headers)
    assert res.status_code == 403
    print("PASS: 8. Read-only 'other' user correctly blocked from logging adherence (403 Forbidden)")

    # Tom attempts to reset afternoon dose
    res = client.delete(f"/api/adherence/reset/{afternoon_log_id}", headers=tom_headers)
    assert res.status_code == 403
    print("PASS: 9. Read-only 'other' user correctly blocked from resetting adherence (403 Forbidden)")

    # Reset afternoon dose so state is clean
    res = client.delete(f"/api/adherence/reset/{afternoon_log_id}", headers=robert_headers)
    assert res.status_code == 200
    print("PASS: 10. Cleaned up afternoon test dose")

    print("\nALL 10 ADHERENCE TESTS PASSED SUCCESSFULLY! (100% Pass Rate)\n")

if __name__ == "__main__":
    test_adherence()
