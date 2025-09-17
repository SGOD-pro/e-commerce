from pydantic import BaseModel, EmailStr
from typing import Optional
from bson import ObjectId

class Users(BaseModel):
    _id: Optional[ObjectId]
    email: EmailStr
    password: str
    name: Optional[str]


from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)