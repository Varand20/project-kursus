from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Tentukan alamat atau URL database 
SQLALCHEMY_DATABASE_URL = "sqlite:///./course_app.db"

# 2. Buat "engine" SQLAlchemy
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 3. Buat "pabrik" untuk sesi database
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Buat sebuah Base class
Base = declarative_base()

# Fungsi ini adalah sebuah dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()