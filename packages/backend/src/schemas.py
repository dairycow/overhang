from datetime import date as date_type
from datetime import datetime

from better_profanity import profanity
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str


class UserBase(BaseModel):
    username: str
    email: str | None = None


class UserCreate(UserBase):
    password: str
    home_location_id: int

    @field_validator("username")
    @classmethod
    def username_not_offensive(cls, v: str) -> str:
        if profanity.contains_profanity(v):
            raise ValueError("Username contains inappropriate language")
        return v


class User(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    home_location_id: int
    created_at: datetime


class LocationBase(BaseModel):
    name: str
    slug: str


class LocationCreate(LocationBase):
    pass


class Location(LocationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class GradeEntry(BaseModel):
    grade: str
    attempts: int = Field(0, ge=0)
    completed: int = Field(..., ge=0)

    @field_validator("grade")
    @classmethod
    def grade_valid(cls, v: str) -> str:
        valid_grades = ["VB", "V0", "V3", "V4-V6", "V6-V8", "V7-V10"]
        if v not in valid_grades:
            raise ValueError(f"Grade must be one of: {', '.join(valid_grades)}")
        return v


class SessionBase(BaseModel):
    location_id: int
    date: date_type = Field(default_factory=date_type.today)
    grades: list[GradeEntry] = Field(..., min_length=1)
    rating: int | None = Field(None, ge=1, le=10)
    notes: str | None = None


class SessionCreate(SessionBase):
    pass


class SessionUpdate(BaseModel):
    location_id: int | None = None
    date: date_type | None = None
    grades: list[GradeEntry] | None = None
    rating: int | None = Field(None, ge=1, le=10)
    notes: str | None = None


class Session(SessionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    location_name: str
    created_at: datetime
