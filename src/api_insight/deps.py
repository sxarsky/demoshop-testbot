"""
Dependencies for the API.
"""
import logging
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import ValidationError
from sqlmodel import Session
from jwt.exceptions import InvalidTokenError
from api_insight.core.db import engine
from api_insight.core.security import decode_token
from api_insight.models.user import User, TokenPayload
from api_insight.crud.users import get_user_by_email
logger = logging.getLogger(__name__)

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl="api/v1/login"
)

def get_session():
    """
    Get a new SQLAlchemy session.
    
    Returns:
        Session: A new SQLAlchemy session
    """
    session = Session(engine)
    try:
        yield session
    except Exception as e:
        logger.error("Error in get_session: %s", str(e))
        raise e
    finally:
        session.close()

SessionDep = Annotated[Session, Depends(get_session)]
TokenDep = Annotated[str, Depends(reusable_oauth2)]

def get_current_user(session: SessionDep, token: TokenDep) -> User:
    """
    Get the current user from the database.
    """
    try:
        payload = decode_token(token)
        token_data = TokenPayload(**payload)

    except (ValidationError, InvalidTokenError) as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        ) from exc
    user = get_user_by_email(session, token_data.sub)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


CurrentUserDep = Annotated[User, Depends(get_current_user)]
