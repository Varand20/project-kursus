# Lokasi: app/routers/enrollments.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app import models, oauth2, schemas
from app.database import get_db

# Ubah setup router agar lebih fleksibel tanpa prefix
router = APIRouter(
    tags=["Enrollments"]
)

# Endpoint untuk mendaftar ke kursus
@router.post("/courses/{course_id}/enroll", status_code=status.HTTP_201_CREATED)
def enroll_in_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    if course.instruktur_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Instructor cannot enroll in their own course.")

    existing_enrollment = db.query(models.Enrollment).filter(
        models.Enrollment.course_id == course_id,
        models.Enrollment.user_id == current_user.id
    ).first()

    if existing_enrollment:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is already enrolled in this course.")

    new_enrollment = models.Enrollment(course_id=course_id, user_id=current_user.id)
    db.add(new_enrollment)
    db.commit()

    return {"message": "Successfully enrolled in the course."}


# --- ENDPOINT BARU UNTUK MELIHAT KURSUS YANG DIIKUTI ---
@router.get("/my-enrollments", response_model=List[schemas.EnrolledCourseDisplay])
def get_my_enrolled_courses(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    # Query ke tabel enrollments, filter berdasarkan user yang login
    enrollments = db.query(models.Enrollment).options(
        # Lakukan chained joinedload untuk mengambil data course,
        # DAN juga data owner & category dari course tersebut.
        joinedload(models.Enrollment.course)
            .joinedload(models.Course.owner),
        joinedload(models.Enrollment.course)
            .joinedload(models.Course.category),
        joinedload(models.Enrollment.course)
            .joinedload(models.Course.enrollments) # untuk enrollment_count
    ).filter(models.Enrollment.user_id == current_user.id).all()

    return enrollments