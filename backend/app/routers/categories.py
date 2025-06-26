from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import schemas, models
from app.database import get_db

router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)

# Endpoint untuk mengambil semua kategori
@router.get("/", response_model=List[schemas.Category])
def get_all_categories(db: Session = Depends(get_db)):
    categories = db.query(models.Category).all()
    return categories
    
