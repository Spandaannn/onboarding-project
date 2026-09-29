from app import llm, main


def test_breakdown_returns_subtasks(client, monkeypatch):
    # Never call the real LLM in tests: replace it with a fake
    monkeypatch.setattr(main, "generate_subtasks", lambda title, desc: ["a", "b", "c"])
    task_id = client.post("/tasks", json={"title": "Plan trip"}).json()["id"]
    res = client.post(f"/tasks/{task_id}/breakdown")
    assert res.status_code == 200
    assert res.json()["subtasks"] == ["a", "b", "c"]


def test_breakdown_llm_timeout_is_handled(client, monkeypatch):
    def boom(title, desc):
        raise llm.LLMError(504, "The AI service took too long to respond. Please try again.")

    monkeypatch.setattr(main, "generate_subtasks", boom)
    task_id = client.post("/tasks", json={"title": "Plan trip"}).json()["id"]
    res = client.post(f"/tasks/{task_id}/breakdown")
    assert res.status_code == 504
    assert "too long" in res.json()["detail"]


def test_save_subtasks(client):
    task_id = client.post("/tasks", json={"title": "Plan trip"}).json()["id"]
    res = client.post(f"/tasks/{task_id}/subtasks", json={"subtasks": ["Book flight", "Pack"]})
    assert res.status_code == 201
    assert [s["title"] for s in res.json()["subtasks"]] == ["Book flight", "Pack"]


def test_parse_subtasks_handles_extra_text():
    text = 'Sure! {"subtasks": ["one", "two", "three", "four", "five", "six"]}'
    assert llm.parse_subtasks(text) == ["one", "two", "three", "four", "five"]
