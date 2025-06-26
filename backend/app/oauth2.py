from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app import jwt, models
from app.database import get_db

# Baris ini memberitahu FastAPI alamat endpoint mana yang akan digunakan untuk login
# dan mendapatkan token. FastAPI akan menggunakan ini untuk halaman /docs.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Ini adalah fungsi "Satpam" kita
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # Siapkan error standar jika token tidak valid
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Verifikasi token menggunakan fungsi yang sudah kita buat di jwt.py
    email = jwt.verify_token(token, credentials_exception)

    # Ambil data lengkap user dari database berdasarkan email di dalam token
    user = db.query(models.User).filter(models.User.email == email).first()

    # Kembalikan data user lengkap
    return user