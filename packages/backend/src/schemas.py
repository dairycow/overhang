from datetime import date as date_type
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class LocationBase(BaseModel):
    name: str
    slug: str


class LocationCreate(LocationBase):
    pass


class Location(LocationBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime


class ClimbBase(BaseModel):
    grade: str
    attempts: int = Field(..., gt=0)
    completed: bool
    rating: Optional[int] = Field(None, ge=1, le=10)
    notes: Optional[str] = None
    
    @field_validator("grade")
    @classmethod
    def grade_valid(cls, v: str) -> str:
        valid_grades = ["VB", "V0", "V3", "V4-V6", "V6-V8", "V7-V10"]
        if v not in valid_grades:
            raise ValueError(f"Grade must be one of: {', '.join(valid_grades)}")
        return v


class ClimbCreate(ClimbBase):
    pass


class Climb(ClimbBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    session_id: int
    created_at: datetime


class SessionBase(BaseModel):
    location_id: int
    date: date_type = Field(default_factory=date_type.today)
    notes: Optional[str] = None


class SessionCreate(SessionBase):
    climbs: List[ClimbCreate]


class SessionUpdate(BaseModel):
    location_id: Optional[int] = None
    date: Optional[date_type] = None
    notes: Optional[str] = None


class Session(SessionBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: int
    created_at: datetime
    climbs: List[Climb] = []
