from datetime import date, timedelta

from sqlalchemy.orm import Session, joinedload

from .auth import get_password_hash
from .models import Location, Problem, User
from .models import Session as SessionModel
from .schemas import ProblemCreate, ProblemUpdate, SessionCreate, SessionUpdate, UserUpdate


def create_user(
    db: Session, username: str, password: str, home_location_id: int
) -> User:
    password_hash = get_password_hash(password)
    user = User(
        username=username,
        password_hash=password_hash,
        home_location_id=home_location_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_username(db: Session, username: str) -> User | None:
    return db.query(User).filter(User.username == username).first()


def update_user(db: Session, user_id: int, user_data: UserUpdate) -> User | None:
    user = get_user_by_id(db, user_id)
    if not user:
        return None

    update_data = user_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user


def get_locations(db: Session) -> list[Location]:
    return db.query(Location).all()


def get_location_by_id(db: Session, location_id: int) -> Location | None:
    return db.query(Location).filter(Location.id == location_id).first()


def get_location_by_slug(db: Session, slug: str) -> Location | None:
    return db.query(Location).filter(Location.slug == slug).first()


def create_session(
    db: Session, session_data: SessionCreate, user_id: int
) -> SessionModel:
    session = SessionModel(
        location_id=session_data.location_id,
        date=session_data.date,
        rating=session_data.rating,
        user_id=user_id,
    )
    db.add(session)
    db.flush()  # Get session.id before adding problems

    # Create problems associated with this session
    for problem_data in session_data.problems:
        problem = Problem(
            session_id=session.id,
            grade=problem_data.grade,
            attempts=problem_data.attempts,
            sends=problem_data.sends,
            notes=problem_data.notes,
        )
        db.add(problem)

    db.commit()
    db.refresh(session)
    return session


def get_sessions(
    db: Session,
    user_id: int,
    location_id: int | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
) -> list[SessionModel]:
    query = (
        db.query(SessionModel)
        .options(joinedload(SessionModel.location), joinedload(SessionModel.problems))
        .filter(SessionModel.user_id == user_id)
    )

    if location_id:
        query = query.filter(SessionModel.location_id == location_id)
    if start_date:
        query = query.filter(SessionModel.date >= start_date)
    if end_date:
        query = query.filter(SessionModel.date <= end_date)

    return query.order_by(SessionModel.date.desc()).all()


def get_session_by_id(
    db: Session, session_id: int, user_id: int
) -> SessionModel | None:
    return (
        db.query(SessionModel)
        .options(joinedload(SessionModel.location), joinedload(SessionModel.problems))
        .filter(SessionModel.id == session_id, SessionModel.user_id == user_id)
        .first()
    )


def update_session(
    db: Session, session_id: int, user_id: int, session_data: SessionUpdate
) -> SessionModel | None:
    session = get_session_by_id(db, session_id, user_id)
    if not session:
        return None

    update_data = session_data.model_dump(exclude_unset=True)

    # Update fields
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


def create_problem(
    db: Session, session_id: int, user_id: int, problem_data: ProblemCreate
) -> Problem | None:
    # Verify session belongs to user
    session = get_session_by_id(db, session_id, user_id)
    if not session:
        return None

    problem = Problem(
        session_id=session_id,
        grade=problem_data.grade,
        attempts=problem_data.attempts,
        sends=problem_data.sends,
        notes=problem_data.notes,
    )
    db.add(problem)
    db.commit()
    db.refresh(problem)
    return problem


def update_problem(
    db: Session, problem_id: int, user_id: int, problem_data: ProblemUpdate
) -> Problem | None:
    # Get problem and verify it belongs to user's session
    problem = (
        db.query(Problem)
        .join(SessionModel)
        .filter(Problem.id == problem_id, SessionModel.user_id == user_id)
        .first()
    )
    if not problem:
        return None

    update_data = problem_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(problem, key, value)

    db.commit()
    db.refresh(problem)
    return problem


def delete_problem(db: Session, problem_id: int, user_id: int) -> bool:
    problem = (
        db.query(Problem)
        .join(SessionModel)
        .filter(Problem.id == problem_id, SessionModel.user_id == user_id)
        .first()
    )
    if not problem:
        return False

    db.delete(problem)
    db.commit()
    return True


def get_user_progress(
    db: Session,
    user_id: int,
    location_id: int | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
) -> list[dict]:
    # Query sessions with problems
    query = (
        db.query(SessionModel)
        .options(joinedload(SessionModel.problems))
        .filter(SessionModel.user_id == user_id)
    )

    if location_id:
        query = query.filter(SessionModel.location_id == location_id)
    if start_date:
        query = query.filter(SessionModel.date >= start_date)
    if end_date:
        query = query.filter(SessionModel.date <= end_date)

    sessions = query.order_by(SessionModel.date).all()

    results = []
    for session in sessions:
        for problem in session.problems:
            # Add one entry for each send
            for _ in range(problem.sends):
                results.append({"date": str(session.date), "grade": problem.grade})

    return results


def get_user_distribution(
    db: Session,
    user_id: int,
    location_id: int | None = None,
    period: str = "all",
) -> dict:
    # Query sessions with problems
    query = (
        db.query(SessionModel)
        .options(joinedload(SessionModel.problems))
        .filter(SessionModel.user_id == user_id)
    )

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

    sessions = query.all()

    grade_counts: dict[str, int] = {}
    for session in sessions:
        for problem in session.problems:
            # Count each send
            grade_counts[problem.grade] = (
                grade_counts.get(problem.grade, 0) + problem.sends
            )

    return grade_counts


def get_location_stats(db: Session, location_id: int) -> dict:
    sessions = (
        db.query(SessionModel)
        .options(joinedload(SessionModel.problems))
        .filter(SessionModel.location_id == location_id)
        .all()
    )

    total_climbs = 0
    grade_distribution: dict[str, int] = {}

    for session in sessions:
        for problem in session.problems:
            # Count attempts for total climbs
            total_climbs += problem.attempts
            # Count sends for grade distribution
            grade_distribution[problem.grade] = (
                grade_distribution.get(problem.grade, 0) + problem.sends
            )

    return {
        "total_climbs": total_climbs,
        "grade_distribution": grade_distribution,
    }


def get_aggregate_stats(
    db: Session, period: str = "all", location_id: int | None = None
) -> dict:
    query = db.query(SessionModel).options(
        joinedload(SessionModel.problems), joinedload(SessionModel.location)
    )

    if location_id:
        query = query.filter(SessionModel.location_id == location_id)

    if period == "week":
        week_ago = date.today() - timedelta(days=7)
        query = query.filter(SessionModel.date >= week_ago)
    elif period == "month":
        month_ago = date.today() - timedelta(days=30)
        query = query.filter(SessionModel.date >= month_ago)

    sessions = query.all()

    total_climbs = 0
    grade_distribution: dict[str, int] = {}
    location_counts: dict[int, dict[str, str | int]] = {}

    for session in sessions:
        for problem in session.problems:
            # Count attempts for total climbs
            total_climbs += problem.attempts
            # Count sends for grade distribution
            grade_distribution[problem.grade] = (
                grade_distribution.get(problem.grade, 0) + problem.sends
            )

        # Count sessions by location
        loc_id = session.location_id
        loc_name = session.location.name
        if loc_id not in location_counts:
            location_counts[loc_id] = {"name": loc_name, "count": 0}
        count_val = location_counts[loc_id]["count"]
        if isinstance(count_val, int):
            location_counts[loc_id]["count"] = count_val + 1

    return {
        "total_climbs": total_climbs,
        "by_location": [
            {"location_id": loc_id, "name": data["name"], "count": data["count"]}
            for loc_id, data in location_counts.items()
        ],
        "grade_distribution": grade_distribution,
    }


def get_aggregate_progress(
    db: Session,
    location_id: int | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
) -> list[dict]:
    # Query all sessions with problems (across all users)
    query = db.query(SessionModel).options(joinedload(SessionModel.problems))

    if location_id:
        query = query.filter(SessionModel.location_id == location_id)
    if start_date:
        query = query.filter(SessionModel.date >= start_date)
    if end_date:
        query = query.filter(SessionModel.date <= end_date)

    sessions = query.order_by(SessionModel.date).all()

    results = []
    for session in sessions:
        for problem in session.problems:
            # Add one entry for each send
            for _ in range(problem.sends):
                results.append({"date": str(session.date), "grade": problem.grade})

    return results
