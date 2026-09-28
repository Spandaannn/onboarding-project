from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class Priority(str, Enum):
    low = "Low"
    medium = "Medium"
    high = "High"


class TaskBase(BaseModel):
    # strips spaces, so "   " counts as empty and fails min_length
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=2000)
    priority: Priority = Priority.medium


class TaskCreate(TaskBase):
    pass


class TaskUpdate(TaskBase):
    completed: bool = False


class TaskOut(TaskBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    completed: bool
    created_at: datetime