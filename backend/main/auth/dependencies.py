from fastapi import Request, HTTPException, status
from jwt import PyJWTError
from main.core.security import decode_jwt_token

async def auth_middleware(request: Request)-> dict:
    """Reusable middleware to extract and validate JWT token"""
    token = None

    # 1. Try cookie
    if "auth_token" in request.cookies:
        token = request.cookies.get("auth_token")

    # 2. Fallback to Authorization header
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
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
