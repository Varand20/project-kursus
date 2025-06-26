from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware # <-- 1. Impor Middleware CORS
from .routers import courses, users, authentication, categories, lessons, favorites, enrollments
from . import models
from .database import engine, SessionLocal

INITIAL_CATEGORIES = [
    "Pemrograman",
    "Desain Grafis",
    "Bisnis & Pemasaran",
    "Olahraga",
    "Lainnya"
]

def populate_categories():
    db = SessionLocal()
    try:
        if db.query(models.Category).count() == 0:
            for cat_name in INITIAL_CATEGORIES:
                db.add(models.Category(name=cat_name))
            db.commit()
    finally:
        db.close()

app = FastAPI()

# --- TAMBAHKAN BLOK KODE INI ---
# Ini memberitahu backend untuk mengizinkan permintaan dari alamat React Anda.
origins = [
    "http://localhost:3000", # Alamat default Create React App
    "http://localhost:5173", # Alamat default Vite
    # Anda bisa menambahkan alamat lain di sini nanti
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Izinkan semua metode (GET, POST, dll)
    allow_headers=["*"], # Izinkan semua header
)
# --------------------------------

@app.on_event("startup")
def on_startup():
    models.Base.metadata.create_all(bind=engine)
    populate_categories()

app.mount("/static", StaticFiles(directory="static"), name="static")

# Daftarkan semua router
app.include_router(authentication.router)
app.include_router(users.router)
app.include_router(courses.router)
app.include_router(categories.router)
app.include_router(lessons.router)
app.include_router(enrollments.router)
app.include_router(favorites.router)

@app.get("/")
def read_root():
    return {"message": "Selamat datang di Course API"}