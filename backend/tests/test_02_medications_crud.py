def test_list_medications(client, sarah_headers, profile_ids):
    robert_id = profile_ids["robert_id"]
    res = client.get(f"/api/medications?profile_id={robert_id}", headers=sarah_headers)
    assert res.status_code == 200
    meds = res.json()
    assert len(meds) >= 4
    med_names = [m["name"] for m in meds]
    assert "Metformin" in med_names

def test_grouped_medications_slots(client, sarah_headers, profile_ids):
    robert_id = profile_ids["robert_id"]
    res = client.get(f"/api/medications/grouped?profile_id={robert_id}", headers=sarah_headers)
    assert res.status_code == 200
    data = res.json()
    assert "morning" in data
    assert "afternoon" in data
    assert "evening" in data
    assert "night" in data

def test_medication_crud_lifecycle(client, sarah_headers, profile_ids):
    robert_id = profile_ids["robert_id"]
    # 1. Create
    new_med = {
        "profile_id": robert_id,
        "name": "CoQ10 Enzyme",
        "dosage": "100 mg",
        "time_slot": "morning",
        "exact_time": "08:30",
        "instructions": "Take with breakfast",
        "purpose": "Heart and muscle cellular energy",
        "pill_shape": "Oval",
        "pill_color": "Yellow",
    }
    res = client.post("/api/medications", json=new_med, headers=sarah_headers)
    assert res.status_code == 201
    created = res.json()
    med_id = created["id"]
    assert created["name"] == "CoQ10 Enzyme"

    # 2. Update
    update_payload = {"dosage": "200 mg", "instructions": "Take with fruit juice"}
    res = client.put(f"/api/medications/{med_id}", json=update_payload, headers=sarah_headers)
    assert res.status_code == 200
    assert res.json()["dosage"] == "200 mg"

    # 3. Delete
    res = client.delete(f"/api/medications/{med_id}", headers=sarah_headers)
    assert res.status_code == 200
    assert res.json()["success"] is True
