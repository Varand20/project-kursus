from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app import models, hashing, jwt 
from app.database import get_db

router = APIRouter(
    tags=["Authentication"]
)

@router.post("/login")
def login(request: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Dapatkan input dari user
    identifier = request.username 

    
    if "@" in identifier:
        
        user = db.query(models.User).filter(models.User.email == identifier).first()
    else:
        # Jika tidak ada, kita anggap itu username
        user = db.query(models.User).filter(models.User.username == identifier).first()


    if not user or not hashing.verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password", 
            headers={"WWW-Authenticate": "Bearer"},
        )

    data = {"sub": user.email, "role": user.role.value}
    access_token = jwt.create_access_token(data=data)
    return {"access_token": access_token, "token_type": "bearer"}