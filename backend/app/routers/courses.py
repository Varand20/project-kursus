# Lokasi: app/routers/courses.py

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy import or_
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
@router.get("/", response_model=schemas.PaginatedCourseDisplay) # <-- Gunakan skema baru
def get_all_courses(
    db: Session = Depends(get_db),
    search: Optional[str] = None,
    # Tambahkan parameter page dan limit dengan nilai default
    page: int = 1,
    limit: int = 10 # Default menampilkan 10 item per halaman
):
    # Query dasar yang sudah ada
    query = db.query(models.Course).options(
        joinedload(models.Course.owner), 
        joinedload(models.Course.category),
        joinedload(models.Course.enrollments)
    )

    # Logika filter pencarian yang sudah ada
    if search:
        search_term = f"%{search}%"
        query = query.join(models.Category).filter(
            or_(
                models.Course.title.ilike(search_term), 
                models.Category.name.ilike(search_term)
            )
        )

    # --- LOGIKA PAGINASI BARU ---

    # 1. Hitung total item SEBELUM menerapkan limit dan offset
    total_items = query.count()

    # 2. Hitung offset (berapa data yang harus dilewati)
    offset = (page - 1) * limit

    # 3. Terapkan limit dan offset pada query
    courses = query.limit(limit).offset(offset).all()

    # 4. Hitung total halaman
    total_pages = math.ceil(total_items / limit)

    # 5. Kembalikan data dalam format skema PaginatedCourseDisplay
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
    #    'key=lambda c: c.enrollment_count' memberitahu Python untuk mengurutkan berdasarkan properti enrollment_count
    #    'reverse=True' untuk mengurutkan dari yang terbesar ke terkecil.
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
    # Data teks sekarang diterima sebagai Form, bukan JSON
    title: str = Form(...),
    description: Optional[str] = Form(None),
    category_id: int = Form(...),
    # Data file diterima sebagai File
    file: Optional[UploadFile] = File(None),
    # Dependencies tetap sama
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

    # 4. Buat objek kursus baru dengan data teks dan URL gambar
    new_course = models.Course(
        title=title,
        description=description,
        category_id=category_id,
        thumbnail_url=thumbnail_url, # Masukkan URL yang sudah dibuat
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
    # Definisikan semua field sebagai Form opsional
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    category_id: Optional[int] = Form(None),
    # File juga bersifat opsional
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

    # --- LOGIKA UPDATE BARU ---

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
        # Hapus gambar lama jika ada untuk menghemat ruang (opsional tapi bagus)
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

    # 3. Lakukan commit ke database
    db.commit()

    # Ambil data terbaru yang lengkap dengan relasinya untuk dikembalikan
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

    # --- PERBAIKAN UTAMA DI SINI ---
    # Hapus objeknya melalui sesi, bukan melalui query.
    # Ini akan memicu aturan cascade.
    db.delete(course)
    # -------------------------------
    
    db.commit()
    return

