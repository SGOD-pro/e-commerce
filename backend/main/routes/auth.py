from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from main.db.mongo import users_collection
from main.models.users import hash_password,verify_password
from main.core.security import create_jwt_token

router = APIRouter()

@router.post("/signup")
async def signup(email: str, password: str):
    # Check if user already exists
    existing = await users_collection.find_one({"email": email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="email already exists"
        )

    hashed = hash_password(password)

    user = {"email": email, "password": hashed}
    result = await users_collection.insert_one(user)

    return {"message": "User created successfully", "user_id": str(result.inserted_id)}

@router.post("/signin")
async def signin(email: str, password: str):
    # Find user
    user = await users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Check password
    if not verify_password(password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Create JWT
    token = create_jwt_token({"user_id": str(user["_id"]), "email": email})
    return {"access_token": token, "token_type": "bearer"}

