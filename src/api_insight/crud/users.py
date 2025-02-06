"""
CRUD operations for user management.
"""
from sqlmodel import Session, select
from api_insight.core.security import hash_password, check_password
from api_insight.models import User, UserCreate


def create_user(session: Session, user_create: UserCreate) -> User:
    """Create a new user."""
    db_obj = User.model_validate(
        user_create, update={"hashed_password": hash_password(user_create.password)}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def get_user_by_email(session: Session, email: str) -> User | None:
    """Get a user by email."""
    statement = select(User).where(User.email == email)
    session_user = session.exec(statement).first()
    return session_user


def authenticate(session: Session, email: str, password: str) -> User | None:
    """Authenticate a user."""
    db_user = get_user_by_email(session=session, email=email)
    if not db_user:
        return None
    if not check_password(password, db_user.hashed_password):
        return None
    return db_user
