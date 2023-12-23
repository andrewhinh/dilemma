from fastapi.testclient import TestClient

from app.main import app


def test_fact_valid():
    client = TestClient(app)
    with client.websocket_connect("/fact") as websocket:
        data = websocket.receive_json()
        while "message" in data.keys():
            assert data["message"] is not None
            data = websocket.receive_json()
        assert data["status"] == "DONE"
        assert data["result"] is not None
