"""
Worker process entrypoint. Run with:

    python -m app.submissions.worker

On Render, this is what a "Background Worker" service type runs as its
start command. It listens on the `submissions` queue and calls
`execute_submission_job` for each enqueued submission — see that
function's docstring in tasks.py for what it actually does.

This process itself has no special requirements beyond normal Python +
Redis connectivity. It only needs Docker access if SANDBOX_ENABLED=true,
and even then only needs *network* access to a Docker daemon (local or
remote via DOCKER_HOST) — see sandbox_image/BUILD.md.
"""

from rq import Worker

from app.submissions.queue import redis_conn, submission_queue

if __name__ == "__main__":
    worker = Worker([submission_queue], connection=redis_conn)
    worker.work()
