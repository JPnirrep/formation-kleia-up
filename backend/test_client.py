import sys, os
sys.path.append(os.path.abspath('.'))
from fastapi.testclient import TestClient
from app.main import app
client = TestClient(app)
print('health', client.get('/api/health').status_code)
resp = client.get('/api/v1/courses/')
print('courses list status', resp.status_code)
print('courses list json', resp.json())
