from datetime import date as date_type
from datetime import datetime

from better_profanity import profanity  # type: ignore[import-untyped]
from pydantic import BaseModel, ConfigDict, Field, field_validator


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
    home_location_id: int | None = None

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
    default_grade: str
    created_at: datetime


class UserUpdate(BaseModel):
    home_location_id: int | None = None
    default_grade: str | None = None

    @field_validator("default_grade")
    @classmethod
    def grade_valid(cls, v: str | None) -> str | None:
        if v is not None:
            valid_grades = ["VB", "V0", "V3", "V4-V6", "V6-V8", "V7-V10"]
            if v not in valid_grades:
                raise ValueError(f"Grade must be one of: {', '.join(valid_grades)}")
        return v


class LocationBase(BaseModel):
    name: str
    slug: str


class LocationCreate(LocationBase):
    pass


class Location(LocationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class ProblemBase(BaseModel):
    grade: str
    attempts: int = Field(0, ge=0)
    sends: int = Field(0, ge=0)
    notes: str | None = None

    @field_validator("grade")
    @classmethod
    def grade_valid(cls, v: str) -> str:
        valid_grades = ["VB", "V0", "V3", "V4-V6", "V6-V8", "V7-V10"]
        if v not in valid_grades:
            raise ValueError(f"Grade must be one of: {', '.join(valid_grades)}")
        return v


class ProblemCreate(ProblemBase):
    pass


class ProblemUpdate(BaseModel):
    grade: str | None = None
    attempts: int | None = Field(None, ge=0)
    sends: int | None = Field(None, ge=0)
    notes: str | None = None

    @field_validator("grade")
    @classmethod
    def grade_valid(cls, v: str | None) -> str | None:
        if v is not None:
            valid_grades = ["VB", "V0", "V3", "V4-V6", "V6-V8", "V7-V10"]
            if v not in valid_grades:
                raise ValueError(f"Grade must be one of: {', '.join(valid_grades)}")
        return v


class Problem(ProblemBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: int
    created_at: datetime


class SessionBase(BaseModel):
    location_id: int
    date: date_type = Field(default_factory=date_type.today)
    rating: int | None = Field(None, ge=1, le=10)


class SessionCreate(SessionBase):
    problems: list[ProblemCreate] = Field(default_factory=list)


class SessionUpdate(BaseModel):
    location_id: int | None = None
    date: date_type | None = None
    rating: int | None = Field(None, ge=1, le=10)


class Session(SessionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    location_name: str
    problems: list[Problem]
    created_at: datetime
