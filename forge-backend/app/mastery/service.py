"""
Mastery computation — plan §23: mastery is NEVER a flag you set, it's derived
from raw signal in `attempts`. This module is the one place that's allowed to
write to `mastery_snapshots`.

In production this should run as a background worker job, triggered after
each relevant `attempts` write or on a schedule (plan §6, `jobs/mastery_recompute`).
For now (no worker infrastructure yet) `recompute_mastery_for_user` is called
synchronously right after a submission — fine for dev/demo scale, wrong for
production request latency once there's real traffic.
"""

from collections import defaultdict

from sqlalchemy.orm import Session

from app.db.models_progress import Attempt, AttemptResult, MasterySnapshot


def _score_from_attempts(attempts: list[Attempt]) -> dict[str, float]:
    """
    Simple, transparent scoring: recent-weighted pass rate per dimension.
    Understanding ~ question attempts, Implementation ~ challenge attempts,
    Debugging ~ debug_lab attempts, Recall ~ repeated question attempts over
    time. This is a first-pass heuristic — the architecture plan explicitly
    leaves room to swap in something smarter (spaced-recall weighting,
    difficulty-adjusted scoring) once there's real usage data.
    """
    by_kind: dict[str, list[Attempt]] = defaultdict(list)
    for a in attempts:
        by_kind[a.kind.value].append(a)

    def pass_rate(kind: str) -> float:
        items = by_kind.get(kind, [])
        if not items:
            return 0.0
        passed = sum(1 for a in items if a.result == AttemptResult.pass_)
        return round(100 * passed / len(items), 1)

    understanding = pass_rate("question")
    implementation = pass_rate("challenge")
    debugging = pass_rate("debug_lab")
    recall = pass_rate("question")  # same source for now; diverges once spaced-repetition attempts are tagged separately

    overall = round((understanding + implementation + debugging + recall) / 4, 1)
    return {
        "understanding_pct": understanding,
        "implementation_pct": implementation,
        "debugging_pct": debugging,
        "recall_pct": recall,
        "overall_pct": overall,
    }


def recompute_mastery_for_user(db: Session, user_id: str, track_id: str) -> None:
    concept_ids = {
        a.concept_id
        for a in db.query(Attempt).filter(Attempt.user_id == user_id, Attempt.concept_id.isnot(None)).all()
    }

    for concept_id in concept_ids:
        attempts = (
            db.query(Attempt)
            .filter(Attempt.user_id == user_id, Attempt.concept_id == concept_id)
            .order_by(Attempt.created_at.desc())
            .limit(50)
            .all()
        )
        scores = _score_from_attempts(attempts)

        snapshot = (
            db.query(MasterySnapshot)
            .filter(MasterySnapshot.user_id == user_id, MasterySnapshot.concept_id == concept_id)
            .first()
        )
        if snapshot is None:
            snapshot = MasterySnapshot(user_id=user_id, concept_id=concept_id, track_id=track_id)
            db.add(snapshot)

        for field, value in scores.items():
            setattr(snapshot, field, value)

    db.commit()
