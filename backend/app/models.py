from datetime import datetime, timezone

from sqlalchemy import String, Text, Boolean, DateTime, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    priority: Mapped[str] = mapped_column(String(10), default="Medium")
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    subtasks: Mapped[list["Subtask"]] = relationship(
        back_populates="task", cascade="all, delete-orphan"
    )


class Subtask(Base):
    __tablename__ = "subtasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    task_id: Mapped[int] = mapped_column(ForeignKey("tasks.id"))

    task: Mapped[Task] = relationship(back_populates="subtasks")
