# Onboarding Project — Task Manager

**Author:** Spandan

## Purpose
A full-stack Task Manager built during onboarding to practise the team's workflow:
a React frontend, a REST API backend with a database, and an LLM-powered
"AI Breakdown" feature. Built step by step across five assignments.

## Tech stack
| Layer | Technology |
|---|---|
| Frontend | React (Vite) + Tailwind CSS |
| Backend | Python FastAPI |
| Database | SQLite (via SQLAlchemy) |
| Testing | pytest |
| AI feature | Claude API (backend only) |

## Project structure
```
onboarding-project/
├── frontend/   # React app
├── backend/    # FastAPI app
└── README.md
```

## Prerequisites
- Node.js (LTS) and npm
- Python 3.10+
- Git

## Setup
```bash
git clone git@github.com:Spandaannn/onboarding-project.git
cd onboarding-project
```

## Backend (Task API)

### Run
```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```
Interactive docs: http://localhost:8000/docs

### Endpoints
| Method | Endpoint | Purpose | Success | Errors |
|---|---|---|---|---|
| GET | /tasks | List all tasks | 200 | 500 |
| GET | /tasks/{id} | Get one task | 200 | 404 |
| POST | /tasks | Create a task | 201 | 400 |
| PUT | /tasks/{id} | Update a task | 200 | 400, 404 |
| DELETE | /tasks/{id} | Delete a task | 200 | 404 |

### Task object
```json
{ "title": "string (required)", "description": "string",
  "priority": "Low | Medium | High", "completed": false }
```

### Validation errors (400)
```json
{ "detail": "Invalid input",
  "errors": [{ "field": "title", "message": "String should have at least 1 character" }] }
```

A Postman collection is in `backend/postman/`.