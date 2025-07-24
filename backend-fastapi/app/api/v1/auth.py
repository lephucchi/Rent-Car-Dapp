from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import verify_password, create_access_token
from app.core.config import settings
from app.schemas.auth import LoginRequest, TokenResponse, AuthResponse, ConnectMetamaskRequest, ChangePasswordRequest, DeactivateAccountRequest
from app.schemas.user import UserCreate, UserResponse
from app.repositories.user_repository import user_repository
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.post("/register", response_model=AuthResponse)
async def register(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user"""
    # Check if user already exists
    existing_user = await user_repository.get_by_username_or_email(
        db, username_or_email=user_in.username
    )
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    existing_user = await user_repository.get_by_email(db, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user = await user_repository.create(db, obj_in=user_in)
    
    # Create access token
    access_token = create_access_token(subject=str(user.id))
    
    return AuthResponse(
        message="User registered successfully",
        access_token=access_token,
        user={
            "id": str(user.id),
            "username": user.username,
            "email": user.email,
            "display_name": user.display_name,
            "role": user.role,
            "metamask_address": user.metamask_address,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat(),
            "updated_at": user.updated_at.isoformat()
        }
    )


@router.post("/login", response_model=AuthResponse)
async def login(
    login_data: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """Login user"""
    # Find user by username or email
    user = await user_repository.get_by_username_or_email(
        db, username_or_email=login_data.username_or_email
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Verify password
    if not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is deactivated"
        )
    
    # Create access token
    access_token = create_access_token(subject=str(user.id))
    
    return AuthResponse(
        message="Login successful",
        access_token=access_token,
        user={
            "id": str(user.id),
            "username": user.username,
            "email": user.email,
            "display_name": user.display_name,
            "role": user.role,
            "metamask_address": user.metamask_address,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat(),
            "updated_at": user.updated_at.isoformat()
        }
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current user information"""
    return current_user


@router.post("/connect-metamask")
async def connect_metamask(
    metamask_data: ConnectMetamaskRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Connect MetaMask wallet to user account"""
    # Check if this metamask address is already connected to another user
    existing_user = await user_repository.get_by_metamask_address(
        db, metamask_address=metamask_data.metamask_address
    )
    
    if existing_user and existing_user.id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This MetaMask address is already connected to another account"
        )
    
    # Update user's metamask address
    updated_user = await user_repository.update_metamask_address(
        db, user=current_user, metamask_address=metamask_data.metamask_address
    )
    
    return {
        "message": "MetaMask connected successfully",
        "user": {
            "id": str(updated_user.id),
            "username": updated_user.username,
            "email": updated_user.email,
            "display_name": updated_user.display_name,
            "role": updated_user.role,
            "metamask_address": updated_user.metamask_address,
            "is_active": updated_user.is_active
        }
    }


@router.post("/logout")
async def logout():
    """Logout user (client-side token removal)"""
    return {"message": "Logged out successfully"}


@router.post("/refresh-token", response_model=TokenResponse)
async def refresh_token(
    current_user: User = Depends(get_current_user)
):
    """Refresh access token for authenticated user"""
    access_token = create_access_token(subject=str(current_user.id))
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.JWT_EXPIRE_MINUTES * 60  # Convert to seconds
    )


@router.post("/change-password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Change user password"""
    from app.core.security import verify_password, get_password_hash
    
    # Verify current password
    if not verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update password
    current_user.hashed_password = get_password_hash(request.new_password)
    db.add(current_user)
    await db.commit()
    
    return {"message": "Password changed successfully"}


@router.post("/deactivate-account")
async def deactivate_account(
    request: DeactivateAccountRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Deactivate user account"""
    from app.core.security import verify_password
    
    # Verify password for security
    if not verify_password(request.password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is incorrect"
        )
    
    # Deactivate account
    await user_repository.deactivate(db, user=current_user)
    
    return {"message": "Account deactivated successfully"}


@router.post("/disconnect-metamask")
async def disconnect_metamask(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Disconnect MetaMask wallet from user account"""
    # Remove metamask address
    current_user.metamask_address = None
    db.add(current_user)
    await db.commit()
    
    return {
        "message": "MetaMask disconnected successfully",
        "user": {
            "id": str(current_user.id),
            "username": current_user.username,
            "email": current_user.email,
            "display_name": current_user.display_name,
            "role": current_user.role,
            "metamask_address": None,
            "is_active": current_user.is_active
        }
    }
