from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas, models, hashing # Impor semua yang kita butuhkan
from app.database import get_db
from app import oauth2
from app import jwt

# Buat router baru
router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

# Endpoint untuk registrasi user baru
@router.post("/register", response_model=schemas.UserDisplay)
def register_user(request: schemas.UserCreate, db: Session = Depends(get_db)):
    # Cek apakah email sudah terdaftar
    user_by_email = db.query(models.User).filter(models.User.email == request.email).first()
    if user_by_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"User with email {request.email} already exists.")

    # Cek apakah username sudah terdaftar
    user_by_username = db.query(models.User).filter(models.User.username == request.username).first()
    if user_by_username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Username '{request.username}' is already taken.")

    hashed_pwd = hashing.hash_password(request.password)

    new_user = models.User(
        name=request.name,
        username=request.username, # <-- TAMBAHKAN INI
        email=request.email,
        hashed_password=hashed_pwd
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/me", response_model=schemas.UserDisplay)
def get_user_details(current_user: models.User = Depends(oauth2.get_current_user)):
    # Karena ada `Depends(oauth2.get_current_user)`, FastAPI akan menjalankan
    # fungsi "satpam" itu dulu. Jika token tidak valid, fungsi ini tidak akan pernah dijalankan.
    # Jika token valid, data user akan dimasukkan ke variabel `current_user`.
    return current_user

@router.post("/become-instructor", status_code=status.HTTP_200_OK)
def become_instructor(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    user = current_user

    if user.role == "instruktur":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="User is already an instructor.")
    
    # Update peran di database
    user.role = "instruktur"
    db.add(user)
    db.commit()
    db.refresh(user)

    # --- BAGIAN BARU YANG DITAMBAHKAN ---
    # Setelah peran diubah, buat token baru dengan informasi yang sudah ter-update
    data = {"sub": user.email, "role": user.role.value}
    new_access_token = jwt.create_access_token(data=data)

    # Kembalikan token baru tersebut
    return {
        "message": "Congratulations! You are now an instructor.",
        "access_token": new_access_token,
        "token_type": "bearer"
    }
    # -----------------------------------
@router.patch("/me", response_model=schemas.UserDisplay)
def update_user_details(
    request: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    user_to_update = current_user

    # Ambil data yang dikirim oleh pengguna (hanya yang diisi)
    update_data = request.model_dump(exclude_unset=True)

    # --- PENGECEKAN KEAMANAN SEBELUM UPDATE ---

    # Cek jika username baru yang diminta sudah dipakai orang lain
    if "username" in update_data:
        existing_user = db.query(models.User).filter(models.User.username == update_data["username"]).first()
        if existing_user and existing_user.id != user_to_update.id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail="Username is already taken.")

    # Cek jika email baru yang diminta sudah dipakai orang lain
    if "email" in update_data:
        existing_user = db.query(models.User).filter(models.User.email == update_data["email"]).first()
        if existing_user and existing_user.id != user_to_update.id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail="Email is already registered.")

    # --- JIKA SEMUA PENGECEKAN AMAN, LANJUTKAN UPDATE ---

    # Update setiap field yang ada di update_data
    for key, value in update_data.items():
        setattr(user_to_update, key, value)

    db.add(user_to_update)
    db.commit()
    db.refresh(user_to_update)

    return user_to_update
    
@router.put("/me/change-password", status_code=status.HTTP_202_ACCEPTED)
def change_password(
    request: schemas.UserChangePassword,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    user = current_user

    # 1. Verifikasi password saat ini
    #    Bandingkan password yang dikirim di form dengan yang ada di database.
    if not hashing.verify_password(request.current_password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Incorrect current password.")

    # 2. Jika password saat ini benar, hash password yang baru
    new_hashed_password = hashing.hash_password(request.new_password)

    # 3. Update password di database
    user.hashed_password = new_hashed_password
    db.add(user)
    db.commit()

    return {"message": "Password updated successfully."}