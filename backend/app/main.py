from fastapi import FastAPI, Depends, HTTPException, Request, Response, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app import models, schemas
from app.config import FRONTEND_ORIGIN
from app.database import Base, engine, get_db

Base.metadata.create_all(bind=engine)  # creates tables on startup if missing

app = FastAPI(title="Task API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count"],
)

# FastAPI returns 422 for bad input by default; the assignment asks for 400.
@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    errors = [{"field": ".".join(str(p) for p in e["loc"][1:]), "message": e["msg"]} for e in exc.errors()]
    return JSONResponse(status_code=400, content={"detail": "Invalid input", "errors": errors})


# Any unexpected crash becomes a clean 500 instead of leaking a stack trace.
@app.exception_handler(Exception)
async def server_error_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


def get_task_or_404(task_id: int, db: Session) -> models.Task:
    task = db.get(models.Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
    return task


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/tasks", response_model=list[schemas.TaskOut])
def list_tasks(
    response: Response,
    search: str | None = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    query = select(models.Task)
    if search:
        query = query.where(models.Task.title.ilike(f"%{search}%"))
    total = db.scalar(select(func.count()).select_from(query.subquery()))
    response.headers["X-Total-Count"] = str(total)  # lets the frontend build page numbers
    return db.scalars(query.order_by(models.Task.id.desc()).offset(skip).limit(min(limit, 100))).all()


@app.get("/tasks/{task_id}", response_model=schemas.TaskOut)
def get_task(task_id: int, db: Session = Depends(get_db)):
    return get_task_or_404(task_id, db)


@app.post("/tasks", response_model=schemas.TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(payload: schemas.TaskCreate, db: Session = Depends(get_db)):
    task = models.Task(**payload.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@app.put("/tasks/{task_id}", response_model=schemas.TaskOut)
def update_task(task_id: int, payload: schemas.TaskUpdate, db: Session = Depends(get_db)):
    task = get_task_or_404(task_id, db)
    for field, value in payload.model_dump().items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = get_task_or_404(task_id, db)
    db.delete(task)
    db.commit()
    return {"detail": f"Task {task_id} deleted"}