"""
Security utilities for password hashing and JWT token creation.
"""
from typing import Any
from datetime import datetime, timedelta, timezone
from bcrypt import hashpw, checkpw, gensalt
from jwt import encode, decode
from jwt.exceptions import InvalidTokenError
from api_insight.core.config import get_settings

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return hashpw(password.encode(), gensalt()).decode()

def check_password(password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return checkpw(password.encode(), hashed_password.encode())

ALGORITHM = "HS256"

def create_access_token(data: dict, expires_delta: timedelta) -> str:
    """
    Create a new JWT access token.

    Args:
        data: Payload to encode in the token
        expires_delta: Optional custom expiration time

    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = encode(to_encode, get_settings().SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> Any:
    """
    Decode a JWT token.
    """
    try:
        payload = decode(token, get_settings().SECRET_KEY, algorithms=[ALGORITHM])
    except InvalidTokenError as exc:
        raise InvalidTokenError from exc

    return payload
