from fastapi import Request, HTTPException, status
from jwt import PyJWTError
from main.core.security import decode_jwt_token

async def auth_middleware(request: Request):
    """Reusable middleware to extract and validate JWT token"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing or invalid"
        )

    token = auth_header.split(" ")[1]
    try:
        payload = decode_jwt_token(token)
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: user_id missing"
            )
        return {"user_id": user_id, "payload": payload}
    except PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
