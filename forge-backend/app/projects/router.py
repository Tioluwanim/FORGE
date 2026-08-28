from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_current_user
from app.db.models_identity import User
from app.db.models_projects import Project, UserProject, UserProjectMilestone, UserProjectStatus
from app.db.session import get_db
from app.projects.schemas import MilestoneOut, ProjectDetail, ProjectSummary

router = APIRouter(prefix="/projects", tags=["projects"])


def _done_milestone_ids(db: Session, user_id: str, project_id: str) -> set[str]:
    user_project = (
        db.query(UserProject)
        .filter(UserProject.user_id == user_id, UserProject.project_id == project_id)
        .first()
    )
    if user_project is None:
        return set()
    return {
        mp.milestone_id
        for mp in db.query(UserProjectMilestone)
        .filter(UserProjectMilestone.user_project_id == user_project.id, UserProjectMilestone.completed_at.isnot(None))
        .all()
    }


@router.get("", response_model=list[ProjectSummary])
def list_projects(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> list[ProjectSummary]:
    projects = db.query(Project).options(joinedload(Project.milestones)).all()
    out = []
    for p in projects:
        done_ids = _done_milestone_ids(db, current_user.id, p.id)
        out.append(
            ProjectSummary(
                id=p.id,
                title=p.title,
                difficulty=p.difficulty.value,
                description=(p.requirements_md or "").split("\n")[0][:200],
                milestones_total=len(p.milestones),
                milestones_done=len(done_ids),
            )
        )
    return out


@router.get("/{project_id}", response_model=ProjectDetail)
def get_project(
    project_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> ProjectDetail:
    project = db.query(Project).options(joinedload(Project.milestones)).filter(Project.id == project_id).first()
    if project is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Project not found")

    done_ids = _done_milestone_ids(db, current_user.id, project.id)
    return ProjectDetail(
        id=project.id,
        title=project.title,
        difficulty=project.difficulty.value,
        requirements_md=project.requirements_md,
        milestones=[
            MilestoneOut(id=m.id, title=m.title, done=m.id in done_ids) for m in project.milestones
        ],
    )


@router.post("/{project_id}/start", status_code=status.HTTP_204_NO_CONTENT)
def start_project(
    project_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> None:
    project = db.get(Project, project_id)
    if project is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Project not found")

    existing = (
        db.query(UserProject)
        .filter(UserProject.user_id == current_user.id, UserProject.project_id == project_id)
        .first()
    )
    if existing is None:
        track = current_user.tracks[0] if current_user.tracks else None
        if track is None:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Select a language track before starting a project")
        db.add(
            UserProject(
                user_id=current_user.id,
                project_id=project_id,
                track_id=track.id,
                status=UserProjectStatus.in_progress,
                started_at=datetime.now(timezone.utc),
            )
        )
        db.commit()
