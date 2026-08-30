from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

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

    # AI Mentor — set in .env, never commit a real key.
    groq_api_key: str | None = None
    groq_model: str = "openai/gpt-oss-120b"  # check console.groq.com/docs/models — Groq deprecates models periodically

    # CORS
    cors_origins: list[str] = ["http://localhost:3000"]

    # Execution sandbox — see app/submissions/README.md. Unset in dev; the
    # submissions router will refuse to run real code until this is wired
    # to an actual isolated worker per forge-architecture-plan.md §7.
    sandbox_enabled: bool = False

    # Docker daemon the worker talks to. Locally this is the default socket
    # (docker-py picks it up automatically when unset). In production this
    # MUST point at a real Docker-capable host — Render's standard web/worker
    # services do not expose a local Docker socket. Use Docker's remote TLS
    # API: tcp://your-docker-host:2376, with tls_* below pointing at the
    # client cert/key/ca generated for that host. See
    # app/submissions/sandbox_image/BUILD.md for setup.
    docker_host: str | None = None
    docker_tls_cert_path: str | None = None
    docker_tls_key_path: str | None = None
    docker_tls_ca_path: str | None = None

    sandbox_image: str = "forge-python-sandbox:latest"
    sandbox_cpu_limit: float = 1.0
    sandbox_memory_mb: int = 256
    sandbox_pids_limit: int = 64
    sandbox_timeout_seconds: int = 10


@lru_cache
def get_settings() -> Settings:
    return Settings()
