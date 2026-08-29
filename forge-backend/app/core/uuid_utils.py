from uuid import UUID

from fastapi import HTTPException, status


def ensure_uuid(value: str) -> str:
    """
    Validates that a path param is a well-formed UUID before it ever reaches
    a query. Without this, passing a non-UUID string (e.g. a stale slug like
    "async-retry" from an outdated frontend build) to a `UUID`-typed column
    causes psycopg to raise `InvalidTextRepresentation`, which SQLAlchemy
    surfaces as an unhandled 500. A malformed ID should 404, not 500 — the
    resource genuinely doesn't exist under that identifier.
    """
    try:
        UUID(value)
    except (ValueError, AttributeError, TypeError):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Not found")
    return value
