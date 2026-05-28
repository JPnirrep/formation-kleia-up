import sys, os, traceback
sys.path.append(os.path.abspath('backend'))
try:
    from fastapi.testclient import TestClient
    from app.main import app
    client = TestClient(app)
    print('health', client.get('/api/health').status_code)
except Exception as e:
    traceback.print_exc()
