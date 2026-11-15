from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_medications():
    print("\n--- Running Automated Medication API Verification Tests ---\n")

    # 1. Login as Sarah (Family)
    res = client.post("/api/auth/demo-login/sarah")
    assert res.status_code == 200
    sarah_token = res.json()["access_token"]
    sarah_headers = {"Authorization": f"Bearer {sarah_token}"}

    # 2. Get Grandpa Robert's profile ID
    res = client.get("/api/profiles/my", headers=sarah_headers)
    assert res.status_code == 200
    profiles = res.json()
    robert_profile = next(p for p in profiles if "Robert" in p["name"])
    alice_profile = next(p for p in profiles if "Alice" in p["name"])
    
    robert_id = robert_profile["profile_id"]
    alice_id = alice_profile["profile_id"]

    # 3. List medications for Robert
    res = client.get(f"/api/medications?profile_id={robert_id}", headers=sarah_headers)
    assert res.status_code == 200
    meds = res.json()
    assert len(meds) == 4, f"Expected 4 medications for Robert, got {len(meds)}"
    print(f"PASS: Robert has 4 active medications: {[m['name'] for m in meds]}")

    # 4. Grouped medications for Robert
    res = client.get(f"/api/medications/grouped?profile_id={robert_id}", headers=sarah_headers)
    assert res.status_code == 200
    grouped = res.json()
    assert len(grouped["morning"]) == 1 and grouped["morning"][0]["name"] == "Metformin"
    assert len(grouped["afternoon"]) == 1 and grouped["afternoon"][0]["name"] == "Vitamin D3"
    assert len(grouped["evening"]) == 1 and grouped["evening"][0]["name"] == "Lisinopril"
    assert len(grouped["night"]) == 1 and grouped["night"][0]["name"] == "Atorvastatin"
    print("PASS: Grouped schedule matches all 4 daily slots (Morning, Afternoon, Evening, Night)")

    # 5. Add new medication (Aspirin 81mg)
    new_med_payload = {
        "profile_id": robert_id,
        "name": "Baby Aspirin",
        "dosage": "81 mg",
        "time_slot": "morning",
        "exact_time": "08:15",
        "instructions": "Take with water",
        "purpose": "Cardiovascular health",
        "pill_shape": "Round",
        "pill_color": "Yellow",
    }
    res = client.post("/api/medications", json=new_med_payload, headers=sarah_headers)
    assert res.status_code == 201
    created_med = res.json()
    created_med_id = created_med["id"]
    print(f"PASS: Successfully added medication '{created_med['name']}' (ID: {created_med_id})")

    # 6. Update medication dosage
    update_payload = {"dosage": "100 mg", "instructions": "Take with lunch and juice"}
    res = client.put(f"/api/medications/{created_med_id}", json=update_payload, headers=sarah_headers)
    assert res.status_code == 200
    assert res.json()["dosage"] == "100 mg"
    print("PASS: Successfully updated medication dosage to 100 mg")

    # 7. Delete medication
    res = client.delete(f"/api/medications/{created_med_id}", headers=sarah_headers)
    assert res.status_code == 200
    print("PASS: Successfully deleted medication")

    # 8. Test read-only protection for Neighbor Tom
    res = client.post("/api/auth/demo-login/tom")
    assert res.status_code == 200
    tom_headers = {"Authorization": f"Bearer {res.json()['access_token']}"}

    # Tom can view:
    res = client.get(f"/api/medications?profile_id={robert_id}", headers=tom_headers)
    assert res.status_code == 200
    print("PASS: Read-only viewer (Neighbor Tom) can view medication list")

    # Tom CANNOT add:
    res = client.post("/api/medications", json=new_med_payload, headers=tom_headers)
    assert res.status_code == 403
    print("PASS: Read-only viewer (Neighbor Tom) is forbidden (403) from adding medications")

    # 9. Strict profile isolation: Check Grandma Alice's medications
    res = client.get(f"/api/medications?profile_id={alice_id}", headers=sarah_headers)
    assert res.status_code == 200
    alice_meds = res.json()
    alice_med_names = [m["name"] for m in alice_meds]
    assert "Metformin" not in alice_med_names
    assert "Levothyroxine" in alice_med_names
    print(f"PASS: Grandma Alice's medications are isolated: {alice_med_names}")

    print("\nALL 9 MEDICATION CRUD TESTS PASSED PERFECTLY!\n")

if __name__ == "__main__":
    test_medications()

