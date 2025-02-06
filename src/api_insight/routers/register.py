"""
Router for handling user registration.
"""
from typing import Annotated
from fastapi import APIRouter, Form, HTTPException, status
from api_insight.models.user import UserRegister, UserCreate, UserPublic
from api_insight.deps import SessionDep
from api_insight.crud import get_user_by_email, create_user
router = APIRouter(
    prefix="/register",
    tags=["register"]
)

@router.post("", status_code=status.HTTP_201_CREATED, response_model=UserPublic)
async def register(
    user_in: Annotated[UserRegister, Form()],
    session: SessionDep
) -> UserPublic:
    """
    Register a new user.

    Args:
        username: The username to register
        password: The password to hash and store
        session: Database session dependency

    Returns:
        Dict containing the registered username

    Raises:
        HTTPException: If username exists or password is too short
    """
    # Check if username already exists
    user = get_user_by_email(session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with entered email already exists"
        )

    user_create = UserCreate.model_validate(user_in)
    user = create_user(session, user_create)

    return user
