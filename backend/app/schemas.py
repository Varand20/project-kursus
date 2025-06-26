from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from typing import List, Optional
from datetime import datetime

# Import Enum UserRole dari models.py
# Kita letakkan di sini agar schemas dan models bisa saling menggunakan
# jika diperlukan, tanpa menyebabkan circular import.
# (Ini adalah praktik yang baik saat proyek membesar)
import enum

class UserRole(str, enum.Enum):
    instruktur = "instruktur"
    siswa = "siswa"

# Skema untuk membuat user baru (data yang diterima dari frontend)
class UserCreate(BaseModel):
    name: str
    username: str 
    email: EmailStr
    password: str = Field(..., min_length=8)
    # Role tidak perlu ada di sini, karena defaultnya adalah 'siswa'

# Skema untuk menampilkan data user (data yang dikirim ke frontend)
# Ini penting agar kita tidak sengaja mengirim password hash ke frontend
class UserDisplay(BaseModel):
    id: int
    name: str
    username: str 
    email: str
    role: UserRole

    # Kelas Config ini memberitahu Pydantic untuk membaca data
    # yang bukan dict, tapi objek ORM (model SQLAlchemy).
    class Config:
        from_attributes = True
        
class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    # Nanti jika ingin mengizinkan update field lain, tinggal tambahkan di sini
    # email: Optional[EmailStr] = None 
class UserChangePassword(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)

class Category(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True
        
class CategoryCreate(BaseModel):
    name: str

class CourseBase(BaseModel):
    title: str
    description: str
    category_id: int

class CourseCreate(CourseBase):
    pass
    
class CourseUpdate(BaseModel): # Skema untuk PATCH (update sebagian)
    title: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    
class LessonBase(BaseModel):
    title: str
    order: int
    video_url: Optional[str] = None
    content: Optional[str] = None
    
class LessonCreate(LessonBase):
    pass

# Skema untuk menampilkan lesson secara lengkap (untuk siswa terdaftar)
class LessonDisplay(LessonBase):
    id: int
    class Config:
        from_attributes = True

# Skema untuk menampilkan daftar isi publik (hanya judul dan urutan)
class LessonPublicDisplay(BaseModel):
    id: int
    title: str
    order: int
    class Config:
        from_attributes = True

class LessonUpdate(BaseModel):
    title: Optional[str] = None
    order: Optional[int] = None
    video_url: Optional[str] = None
    content: Optional[str] = None

# Skema untuk menampilkan data Kursus secara lengkap
# Perhatikan bagaimana kita menyertakan skema lain (nested schemas)
class CourseDisplay(CourseBase):
    id: int
    instruktur_username: str # Menampilkan detail user/mentor
    category: Category # Menampilkan detail kategori
    lessons: List[LessonPublicDisplay] = [] 
    enrollment_count: int
    thumbnail_url: Optional[str] = None

    class Config:
        from_attributes = True
        
class EnrolledCourseDisplay(BaseModel):
    enrolled_at: datetime
    course: CourseDisplay # Kita gunakan lagi skema CourseDisplay yang sudah kaya akan info

    class Config:
        from_attributes = True
        
class PaginatedCourseDisplay(BaseModel):
    total_items: int
    total_pages: int
    current_page: int
    results: List[CourseDisplay]
        

        
