from typing import Optional
from pydantic import BaseModel, validator


class LoginRequest(BaseModel):
    username_or_email: str
    password: str

    @validator("username_or_email")
    def validate_username_or_email(cls, v):
        if not v.strip():
            raise ValueError("Username or email is required")
        return v.strip()

    @validator("password")
    def validate_password(cls, v):
        if not v:
            raise ValueError("Password is required")
        return v


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # in seconds


class ConnectMetamaskRequest(BaseModel):
    metamask_address: str

    @validator("metamask_address")
    def validate_metamask_address(cls, v):
        if not v.startswith("0x") or len(v) != 42:
            raise ValueError("Invalid MetaMask address format")
        return v.lower()


class AuthResponse(BaseModel):
    message: str
    access_token: str
    token_type: str = "bearer"
    user: dict


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @validator("new_password")
    def validate_new_password(cls, v):
        if len(v) < 6:
            raise ValueError("New password must be at least 6 characters long")
        return v


class DeactivateAccountRequest(BaseModel):
    password: str
