"""
Router for handling user login functionality.
"""
from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm

from api_insight.core.config import get_settings
from api_insight.deps import SessionDep
from api_insight.models.user import Token
from api_insight.core.security import create_access_token
from api_insight.crud.users import authenticate

router = APIRouter(
    prefix="/login",
    tags=["login"]
)

@router.post("", status_code=status.HTTP_200_OK)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: SessionDep
):
    """
    Handle user login.
    """
    user = authenticate(session, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    access_token_expires = timedelta(minutes=get_settings().ACCESS_TOKEN_EXPIRE_MINUTES)
    return Token(
        access_token=create_access_token({"sub": user.email}, expires_delta=access_token_expires)
    )
