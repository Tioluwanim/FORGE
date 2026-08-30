# The image learner code actually executes inside. Deliberately minimal:
# no network tools, no compilers beyond what's needed, no package manager
# access at runtime (pip is present for building the image only — nothing
# in the running container should ever be able to invoke it, and it can't:
# network is fully disabled per the runner's `network_disabled=True`).

FROM python:3.12-slim

# Non-root user the container always runs as (also enforced at the
# docker-py call site via `user="1000:1000"` — belt and suspenders).
RUN useradd --create-home --uid 1000 --shell /usr/sbin/nologin runner

WORKDIR /workspace
USER runner

# No CMD/ENTRYPOINT — the runner always specifies the exact command
# (`python _harness_runner.py`) explicitly, so there's no default behavior
# to accidentally rely on or override.
