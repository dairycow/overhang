from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.dependencies import get_current_user
from app.models import User

router = APIRouter()


@router.get("/user/progress")
def get_user_progress(
    location_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
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
    location_id: Optional[int] = None,
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
def get_aggregate_stats(period: str = "all", db: Session = Depends(get_db)):
    return crud.get_aggregate_stats(db, period)
