from passlib.context import CryptContext

# Buat konteks untuk hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Fungsi untuk mengenkripsi password
def hash_password(password: str):
    return pwd_context.hash(password)

# Fungsi untuk memverifikasi password
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)