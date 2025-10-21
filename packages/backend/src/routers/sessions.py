from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud
from ..database import get_db
from ..dependencies import get_current_user
from ..models import User
from ..schemas import Problem as ProblemSchema
from ..schemas import ProblemCreate, ProblemUpdate
from ..schemas import Session as SessionSchema
from ..schemas import SessionCreate, SessionUpdate

router = APIRouter()


@router.post("", response_model=SessionSchema, status_code=status.HTTP_201_CREATED)
def create_session(
    session_data: SessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    location = crud.get_location_by_id(db, session_data.location_id)
    if not location:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid location"
        )

    return crud.create_session(db, session_data, current_user.id)


@router.get("", response_model=list[SessionSchema])
def get_sessions(
    location_id: int | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud.get_sessions(
        db,
        user_id=current_user.id,
        location_id=location_id,
        start_date=start_date,
        end_date=end_date,
    )


@router.get("/{session_id}", response_model=SessionSchema)
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = crud.get_session_by_id(db, session_id, current_user.id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
        )
    return session


@router.put("/{session_id}", response_model=SessionSchema)
def update_session(
    session_id: int,
    session_data: SessionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = crud.update_session(db, session_id, current_user.id, session_data)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
        )
    return session


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    success = crud.delete_session(db, session_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
        )
    return None


# Problem endpoints
@router.post(
    "/{session_id}/problems",
    response_model=ProblemSchema,
    status_code=status.HTTP_201_CREATED,
)
def create_problem(
    session_id: int,
    problem_data: ProblemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    problem = crud.create_problem(db, session_id, current_user.id, problem_data)
    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
        )
    return problem


@router.put("/problems/{problem_id}", response_model=ProblemSchema)
def update_problem(
    problem_id: int,
    problem_data: ProblemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    problem = crud.update_problem(db, problem_id, current_user.id, problem_data)
    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found"
        )
    return problem


@router.delete("/problems/{problem_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_problem(
    problem_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    success = crud.delete_problem(db, problem_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found"
        )
    return None
