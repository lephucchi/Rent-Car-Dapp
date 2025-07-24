from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, validator


class UserBase(BaseModel):
    username: str
    email: EmailStr
    display_name: Optional[str] = None
    role: str = "user"

    @validator("username")
    def validate_username(cls, v):
        if len(v) < 3 or len(v) > 20:
            raise ValueError("Username must be between 3 and 20 characters")
        if not v.replace("_", "").isalnum():
            raise ValueError("Username can only contain letters, numbers, and underscores")
        return v

    @validator("role")
    def validate_role(cls, v):
        if v not in ["user", "admin", "inspector"]:
            raise ValueError("Role must be one of: user, admin, inspector")
        return v


class UserCreate(UserBase):
    password: str

    @validator("password")
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters long")
        return v


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    display_name: Optional[str] = None
    metamask_address: Optional[str] = None
    role: Optional[str] = None

    @validator("metamask_address")
    def validate_metamask_address(cls, v):
        if v and (not v.startswith("0x") or len(v) != 42):
            raise ValueError("Invalid MetaMask address format")
        return v.lower() if v else v


class UserResponse(UserBase):
    id: int
    metamask_address: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserProfile(BaseModel):
    id: int
    username: str
    email: EmailStr
    display_name: Optional[str] = None
    metamask_address: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
