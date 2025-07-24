from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.schemas.user import UserResponse, UserUpdate
from app.repositories.user_repository import user_repository
from app.api.deps import get_current_user, admin_required
from app.models.user import User

router = APIRouter()


@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return current_user


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update current user profile"""
    # Check if username is being changed and is unique
    if (user_update.username and 
        user_update.username != current_user.username):
        existing_user = await user_repository.get_by_username(
            db, username=user_update.username
        )
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Check if email is being changed and is unique
    if (user_update.email and 
        user_update.email != current_user.email):
        existing_user = await user_repository.get_by_email(
            db, email=user_update.email
        )
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already taken"
            )
    
    # Update user
    updated_user = await user_repository.update(
        db, db_obj=current_user, obj_in=user_update
    )
    
    return updated_user


@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    """List all users (Admin only)"""
    users = await user_repository.get_multi(db, skip=skip, limit=limit)
    return users


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    """Get user by ID (Admin only)"""
    user = await user_repository.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.put("/{user_id}/activate")
async def activate_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    """Activate user account (Admin only)"""
    user = await user_repository.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.is_active:
        return {"message": "User is already active"}
    
    activated_user = await user_repository.activate_user(db, user=user)
    return {
        "message": "User activated successfully",
        "user": {
            "id": str(activated_user.id),
            "username": activated_user.username,
            "email": activated_user.email,
            "is_active": activated_user.is_active
        }
    }


@router.put("/{user_id}/deactivate")
async def deactivate_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    """Deactivate user account (Admin only)"""
    user = await user_repository.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user.is_active:
        return {"message": "User is already inactive"}
    
    deactivated_user = await user_repository.deactivate_user(db, user=user)
    return {
        "message": "User deactivated successfully",
        "user": {
            "id": str(deactivated_user.id),
            "username": deactivated_user.username,
            "email": deactivated_user.email,
            "is_active": deactivated_user.is_active
        }
    }


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    """Delete user (Admin only)"""
    user = await user_repository.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent admin from deleting themselves
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    await user_repository.remove(db, id=user_id)
    return {"message": "User deleted successfully"}
