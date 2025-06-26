
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_ 
from typing import List
from app import schemas, models, oauth2
from app.database import get_db

router = APIRouter(
    tags=["Lessons"]
)

# Endpoint untuk membuat lesson baru di dalam sebuah course
@router.post("/courses/{course_id}/lessons", status_code=status.HTTP_201_CREATED, response_model=schemas.LessonDisplay)
def create_lesson_for_course(
    course_id: int,
    request: schemas.LessonCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")
    
    if course.instruktur_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to add lesson to this course.")
        
    # --- LOGIKA BARU: Membuat Ruang untuk Pelajaran Baru ---
    # Ambil semua pelajaran yang urutannya lebih besar atau sama dengan urutan baru
    lessons_to_shift = db.query(models.Lesson).filter(
        models.Lesson.course_id == course_id,
        models.Lesson.order >= request.order
    ).order_by(models.Lesson.order.desc()).all() # Urutkan dari yang terbesar agar tidak ada konflik

    # Geser semua pelajaran tersebut satu langkah ke belakang (tambah 1)
    for lesson in lessons_to_shift:
        lesson.order += 1
        db.add(lesson)
    # ----------------------------------------------------

    # Setelah ruang dibuat, baru buat lesson baru
    new_lesson = models.Lesson(**request.model_dump(), course_id=course_id)
    db.add(new_lesson)
    db.commit()
    db.refresh(new_lesson)
    return new_lesson

# Endpoint untuk melihat semua lesson (Publik)
@router.get("/courses/{course_id}/lessons", response_model=List[schemas.LessonPublicDisplay])
def get_lessons_for_course(course_id: int, db: Session = Depends(get_db)):
    lessons = db.query(models.Lesson).filter(models.Lesson.course_id == course_id).order_by(models.Lesson.order).all()
    return lessons

# Endpoint untuk melihat detail satu lesson (Terproteksi)
@router.get("/lessons/{lesson_id}", response_model=schemas.LessonDisplay)
def get_lesson_detail(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found.")

    is_owner = (lesson.course.instruktur_id == current_user.id)
    is_enrolled = False
    if not is_owner:
        enrollment = db.query(models.Enrollment).filter(and_(models.Enrollment.course_id == lesson.course_id, models.Enrollment.user_id == current_user.id)).first()
        if enrollment:
            is_enrolled = True
    
    if not is_owner and not is_enrolled:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this lesson. Please enroll in the course first.")
    
    return lesson

# Endpoint untuk mengedit lesson
@router.patch("/lessons/{lesson_id}", response_model=schemas.LessonDisplay)
def partial_update_lesson(
    lesson_id: int,
    request: schemas.LessonUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    lesson_query = db.query(models.Lesson).filter(models.Lesson.id == lesson_id)
    lesson = lesson_query.first()

    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found.")

    if lesson.course.instruktur_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to perform this action.")

    update_data = request.model_dump(exclude_unset=True)

    # --- LOGIKA BARU: Jika nomor urut diubah ---
    if 'order' in update_data and update_data['order'] != lesson.order:
        old_order = lesson.order
        new_order = update_data['order']
        course_id = lesson.course_id
        
        if new_order < old_order: # Bergerak ke atas (misal dari 5 ke 2)
            # Geser ke bawah pelajaran di antara posisi baru dan lama
            db.query(models.Lesson).filter(
                models.Lesson.course_id == course_id,
                models.Lesson.order >= new_order,
                models.Lesson.order < old_order
            ).update({"order": models.Lesson.order + 1})
        else: # Bergerak ke bawah (misal dari 2 ke 5)
            # Geser ke atas pelajaran di antara posisi lama dan baru
            db.query(models.Lesson).filter(
                models.Lesson.course_id == course_id,
                models.Lesson.order > old_order,
                models.Lesson.order <= new_order
            ).update({"order": models.Lesson.order - 1})
    # ------------------------------------------

    lesson_query.update(update_data, synchronize_session=False)
    db.commit()

    return lesson_query.first()

# Endpoint untuk menghapus lesson
@router.delete("/lessons/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()

    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found.")

    if lesson.course.instruktur_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to perform this action.")
        
    order_to_remove = lesson.order
    course_id_to_update = lesson.course_id

    # --- PERBAIKAN UTAMA DI SINI ---
    db.delete(lesson)
    # -------------------------------
    
    # Geser ke atas semua pelajaran yang urutannya di atas yang dihapus
    db.query(models.Lesson).filter(
        models.Lesson.course_id == course_id_to_update,
        models.Lesson.order > order_to_remove
    ).update({"order": models.Lesson.order - 1})

    db.commit()
    return
