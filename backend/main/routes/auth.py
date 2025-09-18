from fastapi import APIRouter, HTTPException, status,Response,Cookie
from bson import ObjectId
from main.db.mongo import users_collection
from main.models.users import hash_password,verify_password
from main.core.security import create_jwt_token, decode_jwt_token
from pydantic import BaseModel
from jwt import PyJWTError
router = APIRouter()
class User(BaseModel):
     email: str
     password: str
     name:str
     
class SigninData(BaseModel):
    email: str
    password: str

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
async def signin(response: Response, data: SigninData):
     email = data.email
     password = data.password
     
     user = await users_collection.find_one({"email": email})
     if not user or not verify_password(password, user["password"]):
          raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

     token = create_jwt_token({"user_id": str(user["_id"]), "email": email, "name":user.get("name")})

     # set cookie (HttpOnly so JS can't read it)
     response.set_cookie(
          key="auth_token",
          value=token,
          httponly=True,     
          secure=True,
          samesite="none",    # 👈 allow cross-site requests
          max_age=60*60*24,
          path="/"
     )

     return {"access_token": token, "token_type": "bearer"}

@router.get("/me")
async def me(auth_token: str = Cookie(None)):
     print(Cookie(None))
     if not auth_token:
          raise HTTPException(
               status_code=status.HTTP_401_UNAUTHORIZED,
               detail="Missing authentication token",
          )

     try:
          payload = decode_jwt_token(auth_token)
          user_id: str = payload.get("user_id")
          email: str = payload.get("email")
          if not user_id:
               raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

     except PyJWTError:
          raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
     user = await users_collection.find_one({"_id": ObjectId(user_id)})
     if not user:
          raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

     return {
          "user_id": str(user["_id"]),
          "email": user["email"],
          "name": user.get("name"),
     }

@router.post("/signout")
async def logout(response: Response, auth_token: str = Cookie(None)):
     if not auth_token:
          raise HTTPException(
               status_code=status.HTTP_401_UNAUTHORIZED,
               detail="Missing authentication token",
          )

     response.delete_cookie(
          key="auth_token",
          httponly=True,     
          secure=True,
          samesite="none",    # 👈 allow cross-site requests
          path="/"
          )
     return {"message": "Logout successful"}