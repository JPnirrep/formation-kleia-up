import sys, os
sys.path.append(os.path.abspath('.'))
from fastapi.testclient import TestClient
from app.main import app
client = TestClient(app)
print('Health:', client.get('/api/health').status_code, client.get('/api/health').json())
# Register a test user
payload = {"email": "test@example.com", "password": "test1234", "display_name": "Test User"}
resp = client.post('/api/v1/auth/register', json=payload)
print('Register status', resp.status_code, resp.json())
# Login
login_payload = {"email": "test@example.com", "password": "test1234"}
resp2 = client.post('/api/v1/auth/login', json=login_payload)
print('Login status', resp2.status_code, resp2.json())
