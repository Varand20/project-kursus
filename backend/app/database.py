from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Tentukan alamat atau URL database kita
# Formatnya: "sqlite:///./nama_file_database.db"
# "./course_app.db" berarti database akan menjadi file bernama course_app.db
# di dalam folder utama proyek (yaitu di dalam folder backend/)
SQLALCHEMY_DATABASE_URL = "sqlite:///./course_app.db"

# 2. Buat "engine" SQLAlchemy
# Engine adalah titik masuk utama ke database.
# argumen `connect_args` ini khusus untuk SQLite untuk mengizinkan operasi di banyak thread.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 3. Buat "pabrik" untuk sesi database
# Setiap instance dari SessionLocal akan menjadi sebuah sesi (percakapan) dengan database.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Buat sebuah Base class
# Nantinya, semua model (representasi tabel) kita akan mewarisi dari kelas ini.
# Ini memungkinkan SQLAlchemy untuk memetakan kelas Python kita ke tabel database.
Base = declarative_base()

# Fungsi ini adalah sebuah dependency
# yang akan kita panggil di setiap endpoint yang butuh koneksi database.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()