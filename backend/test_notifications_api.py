from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_notifications():
    print("\n--- Running Automated Proactive Email Alerts Verification Tests ---\n")

    # 1. Unauthenticated request rejected with 401
    res = client.get("/api/notifications/history?profile_id=1")
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

    # 4. Trigger Test Missed-Dose Alert
    missed_alert_payload = {
        "profile_id": robert_id,
        "alert_type": "missed_dose_alert",
        "target_email": "sarah@demo.care",
    }
    res = client.post("/api/notifications/test-alert", json=missed_alert_payload, headers=sarah_headers)
    assert res.status_code == 200
    missed_res = res.json()
    assert "Missed Medication Alert" in missed_res["subject"]
    assert missed_res["recipient_email"] == "sarah@demo.care"
    print(f"PASS: 2. Dispatched Test Missed-Dose Alert: '{missed_res['subject']}' to {missed_res['recipient_email']}")

    # 5. Trigger Test Upcoming Routine Reminder
    reminder_payload = {
        "profile_id": robert_id,
        "alert_type": "upcoming_dose_reminder",
    }
    res = client.post("/api/notifications/test-alert", json=reminder_payload, headers=sarah_headers)
    assert res.status_code == 200
    assert "Routine" in res.json()["subject"]
    print("PASS: 3. Dispatched Test Routine Reminder successfully")

    # 6. Trigger Test Appointment Notice
    appt_alert_payload = {
        "profile_id": robert_id,
        "alert_type": "appointment_reminder",
    }
    res = client.post("/api/notifications/test-alert", json=appt_alert_payload, headers=sarah_headers)
    assert res.status_code == 200
    assert "Appointment" in res.json()["subject"]
    print("PASS: 4. Dispatched Test Appointment Notice successfully")

    # 7. Scan and Dispatch Overdue Alerts
    res = client.post("/api/notifications/scan-alerts", json={"profile_id": robert_id}, headers=sarah_headers)
    assert res.status_code == 200
    scan_res = res.json()
    assert "alerts_dispatched" in scan_res
    print(f"PASS: 5. Alert scanner executed: found {scan_res['overdue_doses_found']} pending doses, dispatched {scan_res['alerts_dispatched']} emails")

    # 8. Check Notification Audit History
    res = client.get(f"/api/notifications/history?profile_id={robert_id}", headers=sarah_headers)
    assert res.status_code == 200
    history = res.json()
    assert len(history) >= 3
    print(f"PASS: 6. Notification history returned {len(history)} audit records for Robert")

    # 9. Role Protection: Read-only 'other' user (Neighbor Tom)
    res = client.post("/api/auth/demo-login/tom")
    assert res.status_code == 200
    tom_token = res.json()["access_token"]
    tom_headers = {"Authorization": f"Bearer {tom_token}"}

    # Tom CAN view history
    res = client.get(f"/api/notifications/history?profile_id={robert_id}", headers=tom_headers)
    assert res.status_code == 200
    print("PASS: 7. Read-only 'other' user can view notification audit history (200 OK)")

    # Tom CANNOT dispatch test alert
    res = client.post("/api/notifications/test-alert", json=missed_alert_payload, headers=tom_headers)
    assert res.status_code == 403
    print("PASS: 8. Read-only 'other' user blocked from triggering alerts (403 Forbidden)")

    # Tom CANNOT trigger scan alerts
    res = client.post("/api/notifications/scan-alerts", json={"profile_id": robert_id}, headers=tom_headers)
    assert res.status_code == 403
    print("PASS: 9. Read-only 'other' user blocked from executing alert scans (403 Forbidden)")

    # 10. In-App Notification Operations (Unread Count & Mark as Read)
    res = client.get(f"/api/notifications/unread-count?profile_id={robert_id}", headers=sarah_headers)
    assert res.status_code == 200
    unread_data = res.json()
    assert "unread_count" in unread_data
    assert unread_data["unread_count"] >= 1
    print(f"PASS: 10. In-app unread notification count verified: {unread_data['unread_count']} unread alerts")

    # Mark single notification as read
    first_notif_id = history[0]["id"]
    res = client.put(f"/api/notifications/{first_notif_id}/read", headers=sarah_headers)
    assert res.status_code == 200
    assert res.json()["success"] is True

    # Mark all notifications as read
    res = client.put(f"/api/notifications/read-all?profile_id={robert_id}", headers=sarah_headers)
    assert res.status_code == 200
    assert res.json()["success"] is True

    # Check unread count is now 0
    res = client.get(f"/api/notifications/unread-count?profile_id={robert_id}", headers=sarah_headers)
    assert res.status_code == 200
    assert res.json()["unread_count"] == 0
    print("PASS: 11. Marked all notifications as read, unread count is 0")

    # 12. Profile Isolation: Alice's notification logs are isolated
    res = client.get(f"/api/notifications/history?profile_id={alice_id}", headers=sarah_headers)
    assert res.status_code == 200
    alice_history = res.json()
    assert all(h["profile_id"] == alice_id for h in alice_history)
    print("PASS: 12. Profile isolation verified for notification histories")

    print("\nALL 12 NOTIFICATION & IN-APP ALERT TESTS PASSED PERFECTLY! (100% Pass Rate)\n")

if __name__ == "__main__":
    test_notifications()
