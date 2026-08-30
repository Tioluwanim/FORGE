from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.ai.router import router as ai_router
from app.auth.router import router as auth_router
from app.challenges.router import router as challenges_router
from app.core.config import get_settings
from app.curriculum.router import router as curriculum_router
from app.production_labs.router import router as production_labs_router
from app.progress.router import router as progress_router
from app.projects.router import router as projects_router
from app.questions.router import router as questions_router
from app.reviews.router import router as reviews_router
from app.submissions.router import router as submissions_router
from app.system_design.router import router as system_design_router
from app.tracks.router import router as tracks_router
from app.users.router import router as users_router

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="Backend for FORGE — the interactive engineering lab.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(tracks_router, prefix="/api/v1")
app.include_router(curriculum_router, prefix="/api/v1")
app.include_router(challenges_router, prefix="/api/v1")
app.include_router(submissions_router, prefix="/api/v1")
app.include_router(questions_router, prefix="/api/v1")
app.include_router(projects_router, prefix="/api/v1")
app.include_router(progress_router, prefix="/api/v1")
app.include_router(reviews_router, prefix="/api/v1")
app.include_router(production_labs_router, prefix="/api/v1")
app.include_router(system_design_router, prefix="/api/v1")
app.include_router(ai_router, prefix="/api/v1")


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
