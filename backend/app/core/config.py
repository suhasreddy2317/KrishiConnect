from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    PROJECT_NAME: str = "KrishiConnect API"
    VERSION: str = "0.1.0"
    API_PREFIX: str = "/api"
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",

    "https://krishiconnect-frontend-lt2f.onrender.com",
]
    
    # Database - Default SQLite for local development, portable to PostgreSQL
    DATABASE_URL: str = f"sqlite:///{BASE_DIR / 'krishiconnect.db'}"

    # JWT - Development-only defaults. Override via environment for any non-local use.
    JWT_SECRET_KEY: str = "dev-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        extra="ignore"
    )


settings = Settings()

