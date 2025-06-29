from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy import or_, and_
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app import schemas, models, oauth2
from app.database import get_db
import shutil
import math
import uuid

# Setup router
router = APIRouter(
    prefix="/courses",
    tags=["Courses"]
)

# === ENDPOINT PUBLIK ===

# 1. Melihat semua kursus
@router.get("/", response_model=schemas.PaginatedCourseDisplay)
def get_all_courses(
    db: Session = Depends(get_db),
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 4
):
    query = db.query(models.Course).options(
        joinedload(models.Course.owner), 
        joinedload(models.Course.category),
        joinedload(models.Course.enrollments)
    )

    # 1. Filter berdasarkan kategori jika ID-nya diberikan
    if category_id:
        query = query.filter(models.Course.category_id == category_id)

    # 2. Filter berdasarkan kata kunci pencarian jika ada
    if search:
        search_term = f"%{search}%"
        query = query.filter(models.Course.title.ilike(search_term))
    
    # ---------------------------

    total_items = query.count()
    offset = (page - 1) * limit
    courses = query.order_by(models.Course.id.desc()).limit(limit).offset(offset).all()
    total_pages = math.ceil(total_items / limit)

    return {
        "total_items": total_items,
        "total_pages": total_pages,
        "current_page": page,
        "results": courses
    }

@router.get("/featured", response_model=List[schemas.CourseDisplay])
def get_featured_courses(db: Session = Depends(get_db)):
    """
    Mengambil sejumlah kecil kursus untuk ditampilkan di homepage.
    Logika: Mengambil semua kursus, mengurutkannya di Python, lalu mengambil 4 teratas.
    """
    # 1. Ambil SEMUA kursus dengan data relasi yang dibutuhkan
    all_courses = db.query(models.Course).options(
        joinedload(models.Course.owner), 
        joinedload(models.Course.category),
        joinedload(models.Course.enrollments)
    ).all()
    
    # 2. Urutkan daftar kursus di dalam Python menggunakan 'sorted()'
    sorted_courses = sorted(all_courses, key=lambda c: c.enrollment_count, reverse=True)
    
    # 3. Ambil 4 kursus pertama dari daftar yang sudah terurut
    featured_courses = sorted_courses[:4]
    
    return featured_courses


# 4. Melihat semua kursus milik instruktur yang login
@router.get("/my-courses", response_model=List[schemas.CourseDisplay])
def get_my_courses(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    if current_user.role != 'instruktur':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Access denied. Only instructors can view their courses.")

    my_courses = db.query(models.Course).options(
        joinedload(models.Course.owner),
        joinedload(models.Course.category),
        joinedload(models.Course.enrollments)
    ).filter(models.Course.instruktur_id == current_user.id).all()
        
    return my_courses


# 2. Melihat detail satu kursus
@router.get("/{id}", response_model=schemas.CourseDisplay)
def get_course_by_id(id: int, db: Session = Depends(get_db)):
    course = db.query(models.Course).options(
        joinedload(models.Course.owner),
        joinedload(models.Course.category),
        joinedload(models.Course.enrollments)
    ).filter(models.Course.id == id).first()

    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Course with id {id} not found.")
    return course

# === ENDPOINT KHUSUS INSTRUKTUR ===

# 3. Membuat kursus baru
@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.CourseDisplay)
async def create_course_with_upload(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    category_id: int = Form(...),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    # 1. Otorisasi: Hanya instruktur yang boleh membuat kursus
    if current_user.role != 'instruktur':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Only instructors can create courses.")
                            
    

    thumbnail_url = None # Default URL adalah None
    
    # Proses file HANYA jika file dikirim oleh pengguna
    if file:
        file_extension = file.filename.split('.')[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = f"static/images/{unique_filename}"
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        thumbnail_url = f"http://localhost:8000/{file_path}"

    # 4. Buat objek kursus baru 
    new_course = models.Course(
        title=title,
        description=description,
        category_id=category_id,
        thumbnail_url=thumbnail_url, 
        instruktur_id=current_user.id
    )

    # 5. Simpan kursus ke database
    db.add(new_course)
    db.commit()
    db.refresh(new_course)

    return new_course



# 5. Mengedit kursus (update sebagian)
@router.patch("/{id}", response_model=schemas.CourseDisplay)
async def partial_update_course(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user),
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    category_id: Optional[int] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    course_query = db.query(models.Course).filter(models.Course.id == id)
    course = course_query.first()

    # Pengecekan standar
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Course with id {id} not found.")
    
    if course.instruktur_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Not authorized to perform requested action.")

    
    # 1. Buat dictionary untuk menampung data teks yang akan diupdate
    update_data = {}
    if title is not None:
        update_data['title'] = title
    if description is not None:
        update_data['description'] = description
    if category_id is not None:
        update_data['category_id'] = category_id
    
    # Jika ada data teks yang dikirim, lakukan update
    if update_data:
        course_query.update(update_data, synchronize_session=False)

    # 2. Cek apakah ada file gambar baru yang diunggah
    if file:
        if course.thumbnail_url:
            # Dapatkan path file lama dari URL
            old_file_path = course.thumbnail_url.replace("http://localhost:8000/", "")
            if os.path.exists(old_file_path):
                os.remove(old_file_path)

        # Simpan file baru
        file_path = f"static/images/{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        thumbnail_url = f"http://localhost:8000/{file_path}"
        # Update field thumbnail_url di objek course
        course.thumbnail_url = thumbnail_url
        db.add(course)

   
    db.commit()

    # Ambil data terbaru yang lengkap 
    updated_course = db.query(models.Course).options(
        joinedload(models.Course.owner),
        joinedload(models.Course.category),
        joinedload(models.Course.enrollments)
    ).filter(models.Course.id == id).first()

    return updated_course

# 6. Menghapus kursus
@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    course = db.query(models.Course).filter(models.Course.id == id).first()

    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Course with id {id} not found.")
    
    if course.instruktur_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Not authorized to perform requested action.")

    db.delete(course)
    # -------------------------------
    
    db.commit()
    return

