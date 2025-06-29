from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app import jwt, models
from app.database import get_db


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # Siapkan error standar jika token tidak valid
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Verifikasi token 
    email = jwt.verify_token(token, credentials_exception)

    # Ambil data lengkap user dari database berdasarkan email di dalam token
    user = db.query(models.User).filter(models.User.email == email).first()

    
    return user