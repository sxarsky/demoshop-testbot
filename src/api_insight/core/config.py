"""
Configuration settings for the API.
Handles environment variables and application settings.
"""
import os
from typing import Literal
from functools import lru_cache
from pydantic_settings import (
    BaseSettings,
    PydanticBaseSettingsSource,
    JsonConfigSettingsSource,
    AWSSecretsManagerSettingsSource
)

class Settings(BaseSettings):
    """Application configuration settings loaded from environment variables."""

    class Config:
        """Pydantic configuration for environment variables."""
        env_file = ".env"
        case_sensitive=False
        secret_file = os.getenv('API_INSIGHT_CONFIG_SECRET_FILE',"")
        if secret_file != "":
            json_file=secret_file
            json_file_encoding='utf-8'

    API_VERSION: str
    SKYRAMP_ENVIRONMENT: Literal["local", "dev", "stg", "prd"] = "local"
    REDIS_HOST: str
    AWS_DEFAULT_REGION: str
    REDIS_PORT: int
    REDIS_USER: str
    REDIS_PASS: str
    REDIS_CLIENT_CRT: str
    REDIS_CLIENT_KEY: str
    REDIS_CA_PEM: str
    KEY_TTL_SECONDS: int

    @classmethod
    @lru_cache
    def settings_customise_sources(
        cls,
        settings_cls: type[BaseSettings],
        init_settings: PydanticBaseSettingsSource,
        env_settings: PydanticBaseSettingsSource,
        dotenv_settings: PydanticBaseSettingsSource,
        file_secret_settings: PydanticBaseSettingsSource,
    ) -> tuple[PydanticBaseSettingsSource, ...]:
        """
        Order of reading env variables
        1. ENV Vars
        2. AWS Secret
        3. DotEnv file
        """
        secret_id = os.getenv('API_INSIGHT_CONFIG_SECRET_ID', "")
        secret_file = os.getenv('API_INSIGHT_CONFIG_SECRET_FILE',"")
        if secret_id != "" and secret_file != "":
            aws_secrets_settings = AWSSecretsManagerSettingsSource(settings_cls, secret_id)
            json_settings = JsonConfigSettingsSource(settings_cls)
            return (
                init_settings,
                env_settings,
                json_settings,
                aws_secrets_settings,
                dotenv_settings
            )
        if secret_id != "":
            aws_secrets_settings = AWSSecretsManagerSettingsSource(settings_cls, secret_id)
            return (
                init_settings,
                env_settings,
                aws_secrets_settings,
                dotenv_settings
            )
        if secret_file != "":
            json_settings = JsonConfigSettingsSource(settings_cls)
            return (
                init_settings,
                env_settings,
                json_settings,
                dotenv_settings,
            )
        return (
            init_settings,
            env_settings,
            dotenv_settings,
        )

def get_settings() -> Settings:
    """Get cached application settings."""
    settings = Settings()

    settings.REDIS_CLIENT_CRT = write_to_tmp(settings.REDIS_CLIENT_CRT, "redis_client_crt.crt")
    settings.REDIS_CLIENT_KEY = write_to_tmp(settings.REDIS_CLIENT_KEY, "redis_client_key.key")
    settings.REDIS_CA_PEM = write_to_tmp(settings.REDIS_CA_PEM, "redis_client_crt.pem")
    return settings

def write_to_tmp(content: str, filename: str) -> str:
    path = f"/tmp/{filename}"
    with open(path, "w", encoding='utf-8') as f:
        f.write(content)
    return path
