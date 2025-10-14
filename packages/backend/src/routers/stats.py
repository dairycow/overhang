from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import crud
from ..database import get_db
from ..dependencies import get_current_user
from ..models import User

router = APIRouter()


@router.get("/user/progress")
def get_user_progress(
    location_id: int | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud.get_user_progress(
        db,
        user_id=current_user.id,
        location_id=location_id,
        start_date=start_date,
        end_date=end_date,
    )


@router.get("/user/distribution")
def get_user_distribution(
    location_id: int | None = None,
    period: str = "all",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud.get_user_distribution(
        db, user_id=current_user.id, location_id=location_id, period=period
    )


@router.get("/location/{location_id}")
def get_location_stats(location_id: int, db: Session = Depends(get_db)):
    return crud.get_location_stats(db, location_id)


@router.get("/aggregate")
def get_aggregate_stats(
    period: str = "all",
    location_id: int | None = None,
    db: Session = Depends(get_db),
):
    return crud.get_aggregate_stats(db, period, location_id)


@router.get("/aggregate/progress")
def get_aggregate_progress(
    location_id: int | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    db: Session = Depends(get_db),
):
    return crud.get_aggregate_progress(
        db,
        location_id=location_id,
        start_date=start_date,
        end_date=end_date,
    )
