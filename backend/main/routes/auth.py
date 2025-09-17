from fastapi import APIRouter, HTTPException, status,Response
from bson import ObjectId
from main.db.mongo import users_collection
from main.models.users import hash_password,verify_password
from main.core.security import create_jwt_token
from pydantic import BaseModel
router = APIRouter()
class User(BaseModel):
     email: str
     password: str
     name:str


@router.post("/signup")
async def signup(data: User):
     email = data.email
     password = data.password
     name=data.name
     
     existing = await users_collection.find_one({"email": email})
     if existing:
          raise HTTPException(
               status_code=status.HTTP_400_BAD_REQUEST,
               detail="email already exists"
          )

     hashed = hash_password(password)
          
     user = {"email": email, "password": hashed, "name":name}
     result = await users_collection.insert_one(user)

     return {"message": "User created successfully", "user_id": str(result.inserted_id)}

@router.post("/signin")
async def signin(response: Response, email: str, password: str):
          
     user = await users_collection.find_one({"email": email})
     if not user or not verify_password(password, user["password"]):
          raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

     token = create_jwt_token({"user_id": str(user["_id"]), "email": email})

     # set cookie (HttpOnly so JS can't read it)
     response.set_cookie(
          key="auth-token",
          value=token,
          httponly=True,
          secure=True,           # set True in prod (HTTPS)
          samesite="lax",
          max_age=60*60*24,      # seconds (adjust)
          path="/"
     )

     return {"access_token": token, "token_type": "bearer"}

