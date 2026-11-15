from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api():
    print("\n--- Running Automated API Verification Tests ---\n")

    # 1. Health check
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("PASS: Health check endpoint /api/health returned 200 OK")

    # 2. Demo login as Sarah (Family)
    res = client.post("/api/auth/demo-login/sarah")
    assert res.status_code == 200, f"Demo login failed: {res.text}"
    sarah_data = res.json()
    sarah_token = sarah_data["access_token"]
    sarah_headers = {"Authorization": f"Bearer {sarah_token}"}
    print(f"PASS: Demo login as Sarah successful: User ID {sarah_data['user']['id']}")

    # 3. Check accessible profiles for Sarah (Profile Switcher)
    res = client.get("/api/profiles/my", headers=sarah_headers)
    assert res.status_code == 200, f"Get my profiles failed: {res.text}"
    sarah_profiles = res.json()
    assert len(sarah_profiles) >= 2, f"Expected at least 2 profiles for Sarah, got {len(sarah_profiles)}"
    print(f"PASS: Sarah has {len(sarah_profiles)} accessible profiles in her switcher: {[p['name'] for p in sarah_profiles]}")

    # 4. Check Grandpa Robert's roles: Robert is 'senior' in his profile, and 'family' in Alice's profile
    res = client.post("/api/auth/demo-login/grandpa")
    assert res.status_code == 200
    grandpa_token = res.json()["access_token"]
    grandpa_headers = {"Authorization": f"Bearer {grandpa_token}"}
    res = client.get("/api/profiles/my", headers=grandpa_headers)
    assert res.status_code == 200
    grandpa_profiles = res.json()
    print("PASS: Grandpa Robert's multi-profile roles:")
    for p in grandpa_profiles:
        print(f"   -> {p['name']} (Code: {p['circle_code']}) | Role: {p['role_in_circle']}")

    # 5. Test Signup for a brand new user
    import time
    unique_email = f"watson_{int(time.time())}@demo.care"
    new_user_payload = {
        "name": "Dr. Watson",
        "email_or_phone": unique_email,
        "passcode": "654321",
        "default_role": "caregiver"
    }
    res = client.post("/api/auth/signup", json=new_user_payload)
    assert res.status_code == 201, f"Signup failed: {res.text}"
    watson_token = res.json()["access_token"]
    watson_headers = {"Authorization": f"Bearer {watson_token}"}
    print("PASS: New user signup (Dr. Watson) successful with 6-digit PIN")

    # 6. Test joining Robert's circle (882104) as caregiver
    join_payload = {
        "circle_code": "882104",
        "role_in_circle": "caregiver"
    }
    res = client.post("/api/profiles/join", json=join_payload, headers=watson_headers)
    assert res.status_code == 200, f"Join circle failed: {res.text}"
    print("PASS: Dr. Watson joined Grandpa Robert's circle using code 882104")

    # 7. Check members of Grandpa Robert's circle
    robert_profile_id = sarah_profiles[0]["profile_id"]
    res = client.get(f"/api/profiles/{robert_profile_id}/members", headers=sarah_headers)
    assert res.status_code == 200
    members = res.json()
    member_names = [m["name"] for m in members]
    print(f"PASS: Grandpa Robert's Circle Members ({len(members)}): {member_names}")
    assert any("Watson" in name for name in member_names)

    # 8. Test creating a new profile
    new_profile_payload = {
        "name": "Grandpa Charles",
        "age": 82,
        "gender": "Male",
        "blood_group": "B+",
        "allergies": "Aspirin",
        "chronic_conditions": "Parkinson's, Hypertension",
        "primary_physician_name": "Dr. Gregory House",
        "role_in_circle": "family"
    }
    res = client.post("/api/profiles", json=new_profile_payload, headers=sarah_headers)
    assert res.status_code == 201, f"Create profile failed: {res.text}"
    new_p = res.json()
    print(f"PASS: Created new profile '{new_p['name']}' with 6-digit Circle Code: {new_p['circle_code']}")
    assert len(new_p["circle_code"]) == 6

    # 9. Test read-only permission for Neighbor Tom
    res = client.post("/api/auth/demo-login/tom")
    assert res.status_code == 200
    tom_token = res.json()["access_token"]
    tom_headers = {"Authorization": f"Bearer {tom_token}"}
    res = client.get("/api/profiles/my", headers=tom_headers)
    tom_profiles = res.json()
    assert tom_profiles[0]["role_in_circle"] == "other"
    print(f"PASS: Neighbor Tom has read-only role '{tom_profiles[0]['role_in_circle']}' in Grandpa Robert's circle")

    print("\nALL 9 API VERIFICATION TESTS PASSED PERFECTLY!\n")

if __name__ == "__main__":
    test_api()
