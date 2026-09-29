def test_create_task(client):
    res = client.post("/tasks", json={"title": "Write README", "priority": "High"})
    assert res.status_code == 201
    body = res.json()
    assert body["title"] == "Write README"
    assert body["priority"] == "High"
    assert body["completed"] is False
    assert "id" in body


def test_get_missing_task_returns_404(client):
    res = client.get("/tasks/9999")
    assert res.status_code == 404
    assert res.json()["detail"] == "Task 9999 not found"


def test_invalid_input_returns_400(client):
    # blank title
    assert client.post("/tasks", json={"title": "   "}).status_code == 400
    # missing title
    assert client.post("/tasks", json={"priority": "Low"}).status_code == 400
    # priority not in Low/Medium/High
    res = client.post("/tasks", json={"title": "x", "priority": "Urgent"})
    assert res.status_code == 400
    assert res.json()["errors"][0]["field"] == "priority"


def test_update_and_delete(client):
    task_id = client.post("/tasks", json={"title": "Draft"}).json()["id"]
    res = client.put(f"/tasks/{task_id}", json={"title": "Final", "priority": "Low", "completed": True})
    assert res.status_code == 200 and res.json()["completed"] is True
    assert client.delete(f"/tasks/{task_id}").status_code == 200
    assert client.get(f"/tasks/{task_id}").status_code == 404


def test_search_and_pagination(client):
    for t in ["Buy milk", "Buy eggs", "Call bank"]:
        client.post("/tasks", json={"title": t})
    res = client.get("/tasks", params={"search": "buy", "limit": 1})
    assert len(res.json()) == 1
    assert res.headers["X-Total-Count"] == "2"