import time

def test_health_check(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_demo_logins(client):
    for persona in ["grandpa", "sarah", "elena", "tom"]:
        res = client.post(f"/api/auth/demo-login/{persona}")
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert "user" in data

def test_user_signup_and_login(client):
    unique_email = f"nurse_patricia_{int(time.time())}@demo.care"
    signup_payload = {
        "name": "Nurse Patricia",
        "email_or_phone": unique_email,
        "passcode": "789123",
        "default_role": "caregiver",
    }
    res = client.post("/api/auth/signup", json=signup_payload)
    assert res.status_code == 201
    assert res.json()["user"]["name"] == "Nurse Patricia"

    # Login with same passcode
    login_payload = {
        "email_or_phone": unique_email,
        "passcode": "789123",
    }
    res = client.post("/api/auth/login", json=login_payload)
    assert res.status_code == 200
    assert "access_token" in res.json()

def test_accessible_profiles_switcher(client, sarah_headers):
    res = client.get("/api/profiles/my", headers=sarah_headers)
    assert res.status_code == 200
    profiles = res.json()
    assert len(profiles) >= 2
    names = [p["name"] for p in profiles]
    assert any("Robert" in n for n in names)
    assert any("Alice" in n for n in names)

def test_join_care_circle(client, robert_headers):
    # Create unique user
    unique_email = f"volunteer_{int(time.time())}@demo.care"
    res = client.post("/api/auth/signup", json={
        "name": "Community Volunteer",
        "email_or_phone": unique_email,
        "passcode": "112233",
        "default_role": "other",
    })
    assert res.status_code == 201
    user_token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {user_token}"}

    # Join Grandpa Robert's care circle using 6-digit universal code
    join_res = client.post("/api/profiles/join", json={
        "circle_code": "882104",
        "role_in_circle": "other",
    }, headers=headers)
    assert join_res.status_code == 200
    assert join_res.json()["profile"]["name"] == "Robert Jenkins"
