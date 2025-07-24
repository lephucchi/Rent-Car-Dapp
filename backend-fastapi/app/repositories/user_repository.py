from typing import Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User, UserCreate, UserUpdate]):
    def __init__(self):
        super().__init__(User)

    async def get(self, db: AsyncSession, id: int) -> Optional[User]:
        """Get user by integer ID (override base method that expects UUID)"""
        result = await db.execute(select(User).filter(User.id == id))
        return result.scalar_one_or_none()

    async def get_by_email(self, db: AsyncSession, *, email: str) -> Optional[User]:
        """Get user by email"""
        result = await db.execute(select(User).filter(User.email == email.lower()))
        return result.scalar_one_or_none()

    async def get_by_username(self, db: AsyncSession, *, username: str) -> Optional[User]:
        """Get user by username"""
        result = await db.execute(select(User).filter(User.username == username))
        return result.scalar_one_or_none()

    async def get_by_username_or_email(
        self, db: AsyncSession, *, username_or_email: str
    ) -> Optional[User]:
        """Get user by username or email"""
        result = await db.execute(
            select(User).filter(
                (User.username == username_or_email) | 
                (User.email == username_or_email.lower())
            )
        )
        return result.scalar_one_or_none()

    async def get_by_metamask_address(
        self, db: AsyncSession, *, metamask_address: str
    ) -> Optional[User]:
        """Get user by MetaMask address"""
        result = await db.execute(
            select(User).filter(User.metamask_address == metamask_address.lower())
        )
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, *, obj_in: UserCreate) -> User:
        """Create a new user"""
        from app.core.security import get_password_hash
        
        create_data = obj_in.dict()
        create_data["hashed_password"] = get_password_hash(create_data.pop("password"))
        create_data["email"] = create_data["email"].lower()
        
        db_obj = User(**create_data)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update_metamask_address(
        self, db: AsyncSession, *, user: User, metamask_address: str
    ) -> User:
        """Update user's MetaMask address"""
        user.metamask_address = metamask_address.lower()
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    async def activate(self, db: AsyncSession, *, user: User) -> User:
        """Activate user account"""
        user.is_active = True
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    async def deactivate(self, db: AsyncSession, *, user: User) -> User:
        """Deactivate user account"""
        user.is_active = False
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user


# Create instance to be imported
user_repository = UserRepository()
