import asyncio, httpx, sys

BASE = "http://localhost:8000/api/v1"


async def test(name, method, path, expected, token=None, json_data=None):
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    async with httpx.AsyncClient() as c:
        try:
            if method == "GET":
                r = await c.get(f"{BASE}{path}", headers=headers)
            elif method == "POST":
                r = await c.post(f"{BASE}{path}", headers=headers, json=json_data)
            status = r.status_code
            icon = "✅" if status == expected else "❌"
            print(f"{icon} {status} ({expected}) {method} {path}")
            if status != expected:
                print(f"   Body: {r.text[:200]}")
        except Exception as e:
            print(f"💥 CRASH {method} {path}: {e}")


async def main():
    # Login
    async with httpx.AsyncClient() as c:
        r = await c.post(
            f"{BASE}/auth/login",
            json={"email": "sandrina@kleia-up.com", "password": "admin123"},
        )
        admin_token = r.json()["access_token"]
        r2 = await c.post(
            f"{BASE}/auth/login",
            json={"email": "clara.f@example.com", "password": "password123"},
        )
        learner_token = r2.json()["access_token"]

    print("\n=== HAPPY PATH (Auth required) ===")
    await test("Auth me", "GET", "/auth/me", 200, admin_token)
    await test("Certificates/my", "GET", "/certificates/my", 200, admin_token)
    await test("Admin stats", "GET", "/admin/stats", 200, admin_token)
    await test("Admin stats events", "GET", "/admin/stats/events", 200, admin_token)
    await test("Admin enrollments", "GET", "/admin/enrollments", 200, admin_token)
    await test("Users list", "GET", "/users/", 200, admin_token)

    print("\n=== HAPPY PATH (Public) ===")
    await test("Courses list", "GET", "/courses/", 200)
    await test("Course detail", "GET", "/courses/architecture-message", 200)
    await test("Course modules", "GET", "/courses/architecture-message/modules", 200)

    print("\n=== EDGE CASES: Auth ===")
    await test("No auth", "GET", "/auth/me", 401)
    await test("Bad token", "GET", "/auth/me", 401, "INVALID_TOKEN")
    await test("Learner on admin", "GET", "/admin/stats", 403, learner_token)
    await test(
        "Learner on admin enroll", "GET", "/admin/enrollments", 403, learner_token
    )

    print("\n=== EDGE CASES: 404 ===")
    await test("Unknown course", "GET", "/courses/nonexistent", 404)
    await test(
        "Unknown cert",
        "GET",
        "/certificates/00000000-0000-0000-0000-000000000000",
        404,
        admin_token,
    )

    print("\n=== EDGE CASES: 422 ===")
    await test("Bad login body", "POST", "/auth/login", 422, json_data={"bad": "field"})
    await test(
        "Bad register", "POST", "/auth/register", 422, json_data={"bad": "field"}
    )

    print("\n=== LEARNER: Allowed ===")
    await test("Learner enrollments", "GET", "/enrollments/my", 200, learner_token)
    await test("Learner certs (empty)", "GET", "/certificates/my", 200, learner_token)

    print("\n=== STRESS TEST: 50 concurrent requests ===")
    errors = 0

    async def hit_endpoint(i):
        nonlocal errors
        try:
            async with httpx.AsyncClient() as c:
                r = await c.get(f"{BASE}/courses/", timeout=10)
                if r.status_code != 200:
                    errors += 1
        except:
            errors += 1

    tasks = [hit_endpoint(i) for i in range(50)]
    await asyncio.gather(*tasks)
    print(f"50 requests: {errors} errors ({50 - errors} OK)")

    print("\n=== STRESS TEST: 50 auth requests ===")
    errors = 0

    async def hit_auth(i):
        nonlocal errors
        try:
            async with httpx.AsyncClient() as c:
                r = await c.get(
                    f"{BASE}/auth/me",
                    headers={"Authorization": f"Bearer {admin_token}"},
                    timeout=10,
                )
                if r.status_code != 200:
                    errors += 1
        except:
            errors += 1

    tasks2 = [hit_auth(i) for i in range(50)]
    await asyncio.gather(*tasks2)
    print(f"50 auth requests: {errors} errors ({50 - errors} OK)")

    print("\n=== STRESS TEST: 50 concurrent cert downloads ===")
    # Get cert ID first
    async with httpx.AsyncClient() as c:
        r = await c.get(
            f"{BASE}/certificates/my",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        certs = r.json()
        cert_id = certs[0]["id"] if certs else None

    if cert_id:
        errors = 0

        async def hit_cert(i):
            nonlocal errors
            try:
                async with httpx.AsyncClient() as c:
                    r = await c.get(
                        f"{BASE}/certificates/{cert_id}/download",
                        headers={"Authorization": f"Bearer {admin_token}"},
                        timeout=30,
                    )
                    if r.status_code != 200:
                        errors += 1
            except:
                errors += 1

        tasks3 = [hit_cert(i) for i in range(50)]
        await asyncio.gather(*tasks3)
        print(f"50 cert downloads: {errors} errors ({50 - errors} OK)")

    sys.exit(0 if errors == 0 else 1)


asyncio.run(main())
