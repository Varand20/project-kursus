import jwt 
from datetime import datetime, timedelta, timezone


SECRET_KEY = "a_very_secret_key_that_is_long_and_random"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# --- FUNGSI UNTUK MEMBUAT TOKEN ---
def create_access_token(data: dict):
    to_encode = data.copy()

    # Tetapkan waktu kedaluwarsa token
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    # Buat token JWT menggunakan PyJWT
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- FUNGSI UNTUK VERIFIKASI TOKEN ---
def verify_token(token: str, credentials_exception):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        return email
    except jwt.PyJWTError:
        raise credentials_exception