"""
Configuration settings for the API.
Handles environment variables and application settings.
"""
import secrets
from functools import lru_cache
from typing import Literal
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application configuration settings loaded from environment variables."""
    database_url: str
    api_version: str
    ENVIRONMENT: Literal["local", "development", "production"] = "local"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    class Config:
        """Pydantic configuration for environment variables."""
        env_file = ".env"

@lru_cache
def get_settings() -> Settings:
    """Get cached application settings."""
    return Settings()
