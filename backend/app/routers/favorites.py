
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app import models, oauth2, schemas
from app.database import get_db


router = APIRouter(
    tags=["Favorites"] 
)

# === ENDPOINT UNTUK AKSI FAVORIT ===

@router.post("/courses/{course_id}/favorite", status_code=status.HTTP_201_CREATED)
def add_course_to_favorites(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    # Cek apakah kursus ada
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    # Cek apakah sudah pernah difavoritkan
    existing_favorite = db.query(models.Favorite).filter(
        models.Favorite.course_id == course_id,
        models.Favorite.user_id == current_user.id
    ).first()
    if existing_favorite:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Course already in favorites.")

    # Jika belum, tambahkan ke favorit
    new_favorite = models.Favorite(course_id=course_id, user_id=current_user.id)
    db.add(new_favorite)
    db.commit()

    return {"message": "Course successfully added to favorites."}


@router.delete("/courses/{course_id}/favorite", status_code=status.HTTP_204_NO_CONTENT)
def remove_course_from_favorites(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    # Cari entri favorit yang akan dihapus
    favorite_to_delete = db.query(models.Favorite).filter(
        models.Favorite.course_id == course_id,
        models.Favorite.user_id == current_user.id
    )

    if not favorite_to_delete.first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Favorite entry not found.")

    # Hapus entri
    favorite_to_delete.delete(synchronize_session=False)
    db.commit()
    return


# === ENDPOINT UNTUK MELIHAT DAFTAR FAVORIT ===

@router.get("/favorites", response_model=List[schemas.CourseDisplay])
def get_my_favorite_courses(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    favorite_courses = db.query(models.Course).join(models.Favorite).filter(
        models.Favorite.user_id == current_user.id
    ).options(
        joinedload(models.Course.owner),
        joinedload(models.Course.category)
    ).all()

    return favorite_courses