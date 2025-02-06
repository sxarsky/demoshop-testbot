"""
CRUD operations for the API.
"""
from api_insight.crud.users import get_user_by_email, create_user, authenticate

__all__ = ["get_user_by_email", "create_user", "authenticate"]
