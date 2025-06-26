import enum
from sqlalchemy import Column, Integer, String, TIMESTAMP, text, Enum
from .database import Base # Impor Base dari file database.py
from sqlalchemy.orm import relationship # <-- Tambahkan import relationship
from sqlalchemy import ForeignKey # <-- Tambahkan import ForeignKey

# Definisikan pilihan peran dalam sebuah Enum
# Mewarisi dari str agar bisa diperlakukan seperti string jika diperlukan
class UserRole(str, enum.Enum):
    instruktur = "instruktur"
    siswa = "siswa"

# Definisikan tabel 'users' sebagai sebuah kelas Python model
class User(Base):
    # Nama tabel di dalam database
    __tablename__ = "users"

    # Definisikan kolom-kolomnya
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(Enum(UserRole), nullable=False, server_default=UserRole.siswa.value)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('CURRENT_TIMESTAMP'))
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('CURRENT_TIMESTAMP'), onupdate=text('CURRENT_TIMESTAMP'))
    # Mendefinisikan hubungan: Satu User (Mentor) bisa punya banyak Course
    courses = relationship("Course", back_populates="owner")
    enrollments = relationship("Enrollment", back_populates="user")
    favorites = relationship("Favorite", back_populates="user")

# Nanti Anda akan menambahkan kelas lain seperti Course, Lesson, dll di file ini.

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)

    courses = relationship("Course", back_populates="category")

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    
    # Foreign Keys
    instruktur_id = Column(Integer, ForeignKey("users.id"))
    category_id = Column(Integer, ForeignKey("categories.id"))

    # --- Relationships ---
    # Mendefinisikan hubungan ke tabel-tabel lain
    
    # Hubungan ke User (pemilik/instruktur)
    owner = relationship("User", back_populates="courses")
    
    # Hubungan ke Category
    category = relationship("Category", back_populates="courses")
    
    # Hubungan ke Lesson (dengan cascade delete)
    lessons = relationship("Lesson", back_populates="course", cascade="all, delete-orphan")
    
    # Hubungan ke Enrollment (dengan cascade delete)
    enrollments = relationship("Enrollment", back_populates="course", cascade="all, delete-orphan")
    
    # Hubungan ke Favorite (dengan cascade delete)
    favorites = relationship("Favorite", back_populates="course", cascade="all, delete-orphan")
    
    # --- Properties (Kolom Virtual) ---
    
    @property
    def enrollment_count(self):
        return len(self.enrollments)
        
    @property
    def instruktur_username(self):
        # Tambahkan pengecekan untuk menghindari error jika owner belum ter-load
        if self.owner:
            return self.owner.username
        return None

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    video_url = Column(String, nullable=True)
    content = Column(String, nullable=True) # Menggunakan String akan dipetakan ke TEXT
    order = Column(Integer)

    # Foreign Key yang mengikat Lesson ini ke sebuah Course
    course_id = Column(Integer, ForeignKey("courses.id"))

    # Relationship untuk mengakses data Course dari sebuah Lesson
    course = relationship("Course", back_populates="lessons")

    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('CURRENT_TIMESTAMP'))
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('CURRENT_TIMESTAMP'), onupdate=text('CURRENT_TIMESTAMP'))
    
class Enrollment(Base):
    __tablename__ = "enrollments"
    id = Column(Integer, primary_key=True, index=True)
    
    user_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    
    enrolled_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('CURRENT_TIMESTAMP'))
    
    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")

# --- KELAS BARU UNTUK FAVORITE ---
class Favorite(Base):
    __tablename__ = "favorites"
    id = Column(Integer, primary_key=True, index=True)
    
    user_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    
    user = relationship("User", back_populates="favorites")
    course = relationship("Course", back_populates="favorites")
    