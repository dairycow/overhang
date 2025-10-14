from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud
from ..database import get_db
from ..schemas import Location

router = APIRouter()


@router.get("", response_model=list[Location])
def get_locations(db: Session = Depends(get_db)):
    return crud.get_locations(db)


@router.get("/{slug}", response_model=Location)
def get_location(slug: str, db: Session = Depends(get_db)):
    location = crud.get_location_by_slug(db, slug=slug)
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Location not found"
        )
    return location
