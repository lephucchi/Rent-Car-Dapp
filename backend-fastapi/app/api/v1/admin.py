from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.schemas.user import UserResponse
from app.repositories.user_repository import user_repository
from app.api.deps import get_current_admin_user
from app.models.user import User

router = APIRouter()


@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all users (admin only)"""
    users = await user_repository.get_multi(db, skip=skip, limit=limit)
    return users


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user by ID (admin only)"""
    user = await user_repository.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.post("/users/{user_id}/activate")
async def activate_user(
    user_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Activate user account (admin only)"""
    user = await user_repository.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already active"
        )
    
    activated_user = await user_repository.activate(db, user=user)
    return {
        "message": "User activated successfully",
        "user": activated_user
    }


@router.post("/users/{user_id}/deactivate")
async def deactivate_user(
    user_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Deactivate user account (admin only)"""
    user = await user_repository.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already inactive"
        )
    
    # Prevent admin from deactivating themselves
    if user.id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )
    
    deactivated_user = await user_repository.deactivate(db, user=user)
    return {
        "message": "User deactivated successfully",
        "user": deactivated_user
    }


@router.post("/users/{user_id}/change-role")
async def change_user_role(
    user_id: int,
    new_role: str,
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Change user role (admin only)"""
    if new_role not in ["user", "admin", "inspector"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be one of: user, admin, inspector"
        )
    
    user = await user_repository.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent admin from changing their own role
    if user.id == current_admin.id and new_role != "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own admin role"
        )
    
    user.role = new_role
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return {
        "message": f"User role changed to {new_role} successfully",
        "user": user
    }


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete user account (admin only)"""
    user = await user_repository.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent admin from deleting themselves
    if user.id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    await db.delete(user)
    await db.commit()
    
    return {"message": "User deleted successfully"}


@router.get("/stats")
async def get_user_stats(
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user statistics (admin only)"""
    from sqlalchemy import func, select
    
    # Total users
    total_users = await db.execute(select(func.count(User.id)))
    total_count = total_users.scalar()
    
    # Active users
    active_users = await db.execute(
        select(func.count(User.id)).where(User.is_active == True)
    )
    active_count = active_users.scalar()
    
    # Users by role
    role_stats = await db.execute(
        select(User.role, func.count(User.id)).group_by(User.role)
    )
    role_counts = {role: count for role, count in role_stats.fetchall()}
    
    # Users with MetaMask
    metamask_users = await db.execute(
        select(func.count(User.id)).where(User.metamask_address.isnot(None))
    )
    metamask_count = metamask_users.scalar()
    
    return {
        "total_users": total_count,
        "active_users": active_count,
        "inactive_users": total_count - active_count,
        "users_by_role": role_counts,
        "users_with_metamask": metamask_count
    }
