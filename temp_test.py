import sys, os
sys.path.append(os.path.abspath('backend'))
from fastapi.testclient import TestClient
from app.main import app
client = TestClient(app)
resp = client.get('/api/health')
print('status', resp.status_code)
print('json', resp.json())
