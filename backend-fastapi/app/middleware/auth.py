from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.core.database import get_db
from app.core.security import verify_token
from app.repositories.user_repository import user_repository
from app.models.user import User


class AuthMiddleware:
    """Custom authentication middleware for handling JWT tokens"""
    
    def __init__(self):
        self.security = HTTPBearer(auto_error=False)
    
    async def get_current_user_from_request(self, request: Request) -> Optional[User]:
        """Extract user from request headers"""
        authorization: str = request.headers.get("Authorization")
        if not authorization:
            return None
        
        try:
            scheme, token = authorization.split()
            if scheme.lower() != "bearer":
                return None
        except ValueError:
            return None
        
        user_id = verify_token(token)
        if not user_id:
            return None
        
        try:
            user_id_int = int(user_id)
        except (ValueError, TypeError):
            return None
        
        # Get database session
        async for db in get_db():
            user = await user_repository.get(db, id=user_id_int)
            return user if user and user.is_active else None
    
    async def require_auth(self, request: Request) -> User:
        """Require authentication - raise exception if not authenticated"""
        user = await self.get_current_user_from_request(request)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user
    
    async def require_admin(self, request: Request) -> User:
        """Require admin role"""
        user = await self.require_auth(request)
        if user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        return user
    
    async def require_inspector_or_admin(self, request: Request) -> User:
        """Require inspector or admin role"""
        user = await self.require_auth(request)
        if user.role not in ["inspector", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Inspector or admin access required"
            )
        return user


# Global instance
auth_middleware = AuthMiddleware()
