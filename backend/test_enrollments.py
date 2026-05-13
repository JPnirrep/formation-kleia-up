import sys, os
sys.path.append(os.path.abspath('backend'))
from fastapi.testclient import TestClient
from app.main import app
client = TestClient(app)
# health
print('health', client.get('/api/health').status_code)
# register a user
reg = client.post('/api/v1/auth/register', json={"email":"enroll@test.com","password":"test1234","display_name":"Enroll Test"})
print('register', reg.status_code, reg.json())
# login
login = client.post('/api/v1/auth/login', json={"email":"enroll@test.com","password":"test1234"})
print('login', login.status_code, login.json())
access = login.json().get('access_token')
headers = {"Authorization": f"Bearer {access}"}
list_resp = client.get('/api/v1/enrollments/', headers=headers)
print('list', list_resp.status_code, list_resp.json())
