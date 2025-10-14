from datetime import date as date_type
from datetime import datetime

from sqlalchemy import JSON, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class Location(Base):
    __tablename__ = "locations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    sessions: Mapped[list["Session"]] = relationship(
        "Session", back_populates="location"
    )
    users: Mapped[list["User"]] = relationship("User", back_populates="home_location")


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(
        String, unique=True, nullable=False, index=True
    )
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    home_location_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("locations.id"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    sessions: Mapped[list["Session"]] = relationship(
        "Session", back_populates="user", cascade="all, delete-orphan"
    )
    home_location: Mapped["Location"] = relationship("Location", back_populates="users")


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False, index=True
    )
    location_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("locations.id"), nullable=False, index=True
    )
    date: Mapped[date_type] = mapped_column(Date, default=date_type.today, index=True)
    grades: Mapped[list[dict]] = mapped_column(JSON, nullable=False, default=list)
    rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="sessions")
    location: Mapped["Location"] = relationship("Location", back_populates="sessions")

    @property
    def location_name(self) -> str:
        return self.location.name
