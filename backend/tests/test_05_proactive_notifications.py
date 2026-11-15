def test_trigger_test_email_alerts(client, sarah_headers, profile_ids):
    robert_id = profile_ids["robert_id"]

    for alert_type in ["missed_dose_alert", "upcoming_dose_reminder", "appointment_reminder"]:
        payload = {
            "profile_id": robert_id,
            "alert_type": alert_type,
            "target_email": "sarah@demo.care",
        }
        res = client.post("/api/notifications/test-alert", json=payload, headers=sarah_headers)
        assert res.status_code == 200
        data = res.json()
        assert data["recipient_email"] == "sarah@demo.care"
        assert "subject" in data
        assert data["status"] in ["sent", "simulated"]

def test_scan_and_dispatch_overdue_alerts(client, sarah_headers, profile_ids):
    robert_id = profile_ids["robert_id"]
    res = client.post("/api/notifications/scan-alerts", json={"profile_id": robert_id}, headers=sarah_headers)
    assert res.status_code == 200
    scan_data = res.json()
    assert "alerts_dispatched" in scan_data
    assert "overdue_doses_found" in scan_data

def test_in_app_notifications_flow(client, sarah_headers, profile_ids):
    robert_id = profile_ids["robert_id"]

    # 1. Check unread count
    res = client.get(f"/api/notifications/unread-count?profile_id={robert_id}", headers=sarah_headers)
    assert res.status_code == 200
    assert "unread_count" in res.json()

    # 2. Get history
    res = client.get(f"/api/notifications/history?profile_id={robert_id}", headers=sarah_headers)
    assert res.status_code == 200
    logs = res.json()
    assert len(logs) >= 1

    # 3. Mark single as read
    first_id = logs[0]["id"]
    res = client.put(f"/api/notifications/{first_id}/read", headers=sarah_headers)
    assert res.status_code == 200
    assert res.json()["success"] is True

    # 4. Mark all read
    res = client.put(f"/api/notifications/read-all?profile_id={robert_id}", headers=sarah_headers)
    assert res.status_code == 200
    assert res.json()["success"] is True

    # 5. Check unread is 0
    res = client.get(f"/api/notifications/unread-count?profile_id={robert_id}", headers=sarah_headers)
    assert res.status_code == 200
    assert res.json()["unread_count"] == 0
