from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.schemas import ChangePasswordRequest, LoginRequest, MeResponse, SignupRequest, TokenResponse
from app.core.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.models_identity import Profile, User
from app.db.session import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)) -> TokenResponse:
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists")

    user = User(email=payload.email, password_hash=hash_password(payload.password))
    db.add(user)
    db.flush()  # populate user.id before creating the profile

    profile = Profile(user_id=user.id, display_name=payload.display_name)
    db.add(profile)
    db.commit()

    token = create_access_token(subject=user.id)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password")

    token = create_access_token(subject=user.id)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=MeResponse)
def me(current_user: User = Depends(get_current_user)) -> MeResponse:
    return MeResponse(
        id=current_user.id,
        email=current_user.email,
        display_name=current_user.profile.display_name if current_user.profile else "",
        engineering_level=current_user.profile.engineering_level if current_user.profile else 1,
        oauth_provider=current_user.oauth_provider.value if current_user.oauth_provider else None,
    )


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    if not current_user.password_hash or not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Current password is incorrect")

    current_user.password_hash = hash_password(payload.new_password)
    db.commit()


# --- OAuth ---------------------------------------------------------------
# TODO: real Google/GitHub OAuth needs registered app credentials
# (GOOGLE_CLIENT_ID/SECRET, GITHUB_CLIENT_ID/SECRET in .env) and the
# authorization-code exchange, which can't be safely stubbed without them.
# These endpoints exist so the frontend has something to hit in dev, and
# clearly fail rather than silently pretending to authenticate anyone.

@router.get("/oauth/{provider}/authorize")
def oauth_authorize(provider: str):
    raise HTTPException(
        status.HTTP_501_NOT_IMPLEMENTED,
        f"OAuth with {provider} isn't configured yet — add client credentials to .env "
        "and implement the authorization-code exchange in app/auth/oauth.py.",
    )
