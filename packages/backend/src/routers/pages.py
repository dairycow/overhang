from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.dependencies import get_current_user
from app.models import User

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")


@router.get("/", response_class=HTMLResponse)
async def index(request: Request, db: Session = Depends(get_db)):
    stats = crud.get_aggregate_stats(db, period="week")
    locations = crud.get_locations(db)
    return templates.TemplateResponse(
        "index.html", {"request": request, "stats": stats, "locations": locations}
    )


@router.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})


@router.get("/register", response_class=HTMLResponse)
async def register_page(request: Request, db: Session = Depends(get_db)):
    locations = crud.get_locations(db)
    return templates.TemplateResponse(
        "register.html", {"request": request, "locations": locations}
    )


@router.get("/dashboard", response_class=HTMLResponse)
async def dashboard_page(request: Request, db: Session = Depends(get_db)):
    locations = crud.get_locations(db)
    return templates.TemplateResponse(
        "dashboard.html", {"request": request, "locations": locations}
    )


@router.get("/location/{slug}", response_class=HTMLResponse)
async def location_page(request: Request, slug: str, db: Session = Depends(get_db)):
    location = crud.get_location_by_slug(db, slug)
    if not location:
        return templates.TemplateResponse(
            "404.html", {"request": request}, status_code=404
        )
    
    stats = crud.get_location_stats(db, location.id)
    return templates.TemplateResponse(
        "location.html",
        {"request": request, "location": location, "stats": stats},
    )
