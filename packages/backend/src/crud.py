from datetime import date, datetime, timedelta
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from .auth import get_password_hash
from .models import Climb, Location, Session as SessionModel, User
from .schemas import SessionCreate, SessionUpdate


def create_user(
    db: Session, username: str, password: str, home_location_id: int
) -> User:
    password_hash = get_password_hash(password)
    user = User(
        username=username, password_hash=password_hash, home_location_id=home_location_id
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    return db.query(User).filter(User.username == username).first()


def get_locations(db: Session) -> list[Location]:
    return db.query(Location).all()


def get_location_by_id(db: Session, location_id: int) -> Optional[Location]:
    return db.query(Location).filter(Location.id == location_id).first()


def get_location_by_slug(db: Session, slug: str) -> Optional[Location]:
    return db.query(Location).filter(Location.slug == slug).first()


def create_session(db: Session, session_data: SessionCreate, user_id: int) -> SessionModel:
    # Create the session first
    session = SessionModel(
        location_id=session_data.location_id,
        date=session_data.date,
        notes=session_data.notes,
        user_id=user_id
    )
    db.add(session)
    db.flush()  # Get the session ID without committing
    
    # Create climbs for this session
    for climb_data in session_data.climbs:
        climb = Climb(
            session_id=session.id,
            grade=climb_data.grade,
            attempts=climb_data.attempts,
            completed=climb_data.completed,
            rating=climb_data.rating,
            notes=climb_data.notes
        )
        db.add(climb)
    
    db.commit()
    db.refresh(session)
    return session


def get_sessions(
    db: Session,
    user_id: int,
    location_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> list[SessionModel]:
    query = db.query(SessionModel).filter(SessionModel.user_id == user_id)
    
    if location_id:
        query = query.filter(SessionModel.location_id == location_id)
    if start_date:
        query = query.filter(SessionModel.date >= start_date)
    if end_date:
        query = query.filter(SessionModel.date <= end_date)
    
    return query.order_by(SessionModel.date.desc()).all()


def get_session_by_id(db: Session, session_id: int, user_id: int) -> Optional[SessionModel]:
    return (
        db.query(SessionModel)
        .filter(SessionModel.id == session_id, SessionModel.user_id == user_id)
        .first()
    )


def update_session(
    db: Session, session_id: int, user_id: int, session_data: SessionUpdate
) -> Optional[SessionModel]:
    session = get_session_by_id(db, session_id, user_id)
    if not session:
        return None
    
    update_data = session_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(session, key, value)
    
    db.commit()
    db.refresh(session)
    return session


def delete_session(db: Session, session_id: int, user_id: int) -> bool:
    session = get_session_by_id(db, session_id, user_id)
    if not session:
        return False
    
    db.delete(session)
    db.commit()
    return True


def get_user_progress(
    db: Session,
    user_id: int,
    location_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> list[dict]:
    # Join with climbs table to get grade information
    query = (
        db.query(SessionModel.date, Climb.grade)
        .join(Climb)
        .filter(SessionModel.user_id == user_id, Climb.completed == True)
    )
    
    if location_id:
        query = query.filter(SessionModel.location_id == location_id)
    if start_date:
        query = query.filter(SessionModel.date >= start_date)
    if end_date:
        query = query.filter(SessionModel.date <= end_date)
    
    results = query.order_by(SessionModel.date).all()
    return [{"date": str(r.date), "grade": r.grade} for r in results]


def get_user_distribution(
    db: Session,
    user_id: int,
    location_id: Optional[int] = None,
    period: str = "all",
) -> dict:
    # Join with climbs table to get grade information
    query = db.query(
        Climb.grade, func.count(Climb.id).label("count")
    ).join(SessionModel).filter(SessionModel.user_id == user_id)
    
    if location_id:
        query = query.filter(SessionModel.location_id == location_id)
    
    if period == "today":
        query = query.filter(SessionModel.date == date.today())
    elif period == "week":
        week_ago = date.today() - timedelta(days=7)
        query = query.filter(SessionModel.date >= week_ago)
    elif period == "month":
        month_ago = date.today() - timedelta(days=30)
        query = query.filter(SessionModel.date >= month_ago)
    
    results = query.group_by(Climb.grade).all()
    return {r.grade: r.count for r in results}


def get_location_stats(db: Session, location_id: int) -> dict:
    total_climbs = (
        db.query(func.count(SessionModel.id))
        .filter(SessionModel.location_id == location_id)
        .scalar()
    )
    
    # Join with climbs table to get grade information
    grade_distribution = (
        db.query(Climb.grade, func.count(Climb.id).label("count"))
        .join(SessionModel)
        .filter(SessionModel.location_id == location_id)
        .group_by(Climb.grade)
        .all()
    )
    
    return {
        "total_climbs": total_climbs,
        "grade_distribution": {r.grade: r.count for r in grade_distribution},
    }


def get_aggregate_stats(db: Session, period: str = "all") -> dict:
    query = db.query(SessionModel)
    
    if period == "week":
        week_ago = date.today() - timedelta(days=7)
        query = query.filter(SessionModel.date >= week_ago)
    elif period == "month":
        month_ago = date.today() - timedelta(days=30)
        query = query.filter(SessionModel.date >= month_ago)
    
    total_climbs = query.count()
    
    by_location = (
        query.with_entities(
            SessionModel.location_id,
            Location.name,
            func.count(SessionModel.id).label("count"),
        )
        .join(Location)
        .group_by(SessionModel.location_id, Location.name)
        .all()
    )
    
    # Join with climbs table to get grade information
    grade_distribution = (
        query.with_entities(
            Climb.grade, func.count(Climb.id).label("count")
        )
        .join(Climb)
        .group_by(Climb.grade)
        .all()
    )
    
    return {
        "total_climbs": total_climbs,
        "by_location": [
            {"location_id": r.location_id, "name": r.name, "count": r.count}
            for r in by_location
        ],
        "grade_distribution": {r.grade: r.count for r in grade_distribution},
    }
