from sqlalchemy import Index

from app.db.session import Base  # noqa: F401
from app.db.models_identity import User, Profile, Language, Track  # noqa: F401
from app.db.models_curriculum import Module, Lesson, Concept, Question  # noqa: F401
from app.db.models_challenges import (  # noqa: F401
    Challenge,
    ChallengeFile,
    TestCase,
    Hint,
    Submission,
    ExecutionResult,
)
from app.db.models_projects import (  # noqa: F401
    Project,
    ProjectMilestone,
    UserProject,
    UserProjectMilestone,
)
from app.db.models_progress import Attempt, MasterySnapshot, Review  # noqa: F401
from app.db.models_platform import (  # noqa: F401
    Incident,
    UserIncident,
    SystemDesignAttempt,
    AiSession,
    Notification,
)

# Indexes matching forge-architecture-plan.md §4.7:
# - (user_id, track_id) on the tables the dashboard/roadmap query most.
# - due_at on reviews, for the daily worker sweep.
# - status on submissions, for worker polling / queue reconciliation.
Index("ix_mastery_snapshots_user_track", MasterySnapshot.user_id, MasterySnapshot.track_id)
Index("ix_attempts_user", Attempt.user_id)
Index("ix_reviews_user_track", Review.user_id, Review.track_id)
Index("ix_reviews_due_at", Review.due_at)
Index("ix_submissions_status", Submission.status)
Index("ix_submissions_user", Submission.user_id)
