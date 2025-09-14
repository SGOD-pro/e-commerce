from pydantic import BaseModel, EmailStr
from typing import Optional
from bson import ObjectId

class User(BaseModel):
    _id: Optional[ObjectId]
    email: EmailStr
    password: str
    name: str
    token: Optional[str] = None
