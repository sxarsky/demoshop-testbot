"""
User models for the API.
Defines SQLModel classes for user authentication and management.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional
from pydantic import EmailStr
from sqlmodel import Field, SQLModel

class UserBase(SQLModel):
    """Base model for user authentication with common fields."""
    email: EmailStr = Field(unique=True, index=True, max_length=255)

class UserCreate(UserBase):
    """Model for creating a new user."""
    password: str = Field(min_length=8, max_length=42)

class UserRegister(SQLModel):
    """Model for registering a new user."""
    password: str = Field(min_length=8, max_length=42)
    email: str = Field(unique=True, index=True, max_length=255)


class User(UserBase, table=True):
    """Database model for user authentication."""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc),
                                           nullable=True)
    updated_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc),
                                           nullable=True)

class UserPublic(SQLModel):
    """Public model for user authentication."""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: EmailStr = Field(unique=True, index=True, max_length=255)

class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"

class TokenPayload(SQLModel):
    """Contents of JWT token."""
    sub: str | None = None
