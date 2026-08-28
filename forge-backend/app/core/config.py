from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )

    # App
    app_name: str = "FORGE API"
    environment: str = "development"
    debug: bool = True

    # Database
    database_url: str = "postgresql+psycopg2://forge:forge@localhost:5432/forge"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Auth
    secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    # OAuth (populate via .env — never commit real values)
    google_client_id: str | None = None
    google_client_secret: str | None = None
    github_client_id: str | None = None
    github_client_secret: str | None = None

    # AI Mentor — Groq
    # Populate via .env — never commit a real key.
    groq_api_key: str | None = None
    groq_model: str = "llama-3.3-70b-versatile"

    # CORS
    cors_origins: list[str] = ["http://localhost:3000"]

    # Execution sandbox — see app/submissions/README.md. Unset in dev; the
    # submissions router will refuse to run real code until this is wired
    # to an actual isolated worker per forge-architecture-plan.md §7.
    sandbox_enabled: bool = False


@lru_cache
def get_settings() -> Settings:
    return Settings()
