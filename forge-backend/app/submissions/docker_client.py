"""
Docker client factory. Two modes:

- Local dev: `docker_host` unset → docker-py auto-detects the local socket
  (works when running `docker compose up` on your own machine).
- Production: `docker_host` set to `tcp://host:2376` with TLS cert paths →
  connects to a *remote* Docker daemon over Docker's official remote API.
  This is the mode that matters for Render (or any host without a local
  Docker socket) — the worker process itself can run anywhere; it just needs
  network access to a machine that actually has Docker.

Setting up the remote host is a one-time thing on whatever VPS you point
this at — see sandbox_image/BUILD.md for the exact `dockerd` TLS setup.
Never point `docker_host` at a daemon without TLS client-cert auth enabled;
an unauthenticated Docker remote API is equivalent to unauthenticated root
access on that host.
"""

from functools import lru_cache

import docker
from docker.tls import TLSConfig

from app.core.config import get_settings

settings = get_settings()


class DockerUnavailableError(RuntimeError):
    pass


@lru_cache
def get_docker_client() -> docker.DockerClient:
    if settings.docker_host:
        if not (settings.docker_tls_cert_path and settings.docker_tls_key_path and settings.docker_tls_ca_path):
            raise DockerUnavailableError(
                "DOCKER_HOST is set but TLS cert/key/ca paths are missing — refusing to "
                "connect to a remote Docker daemon without client-cert auth."
            )
        tls_config = TLSConfig(
            client_cert=(settings.docker_tls_cert_path, settings.docker_tls_key_path),
            ca_cert=settings.docker_tls_ca_path,
            verify=True,
        )
        try:
            return docker.DockerClient(base_url=settings.docker_host, tls=tls_config, timeout=30)
        except Exception as e:  # noqa: BLE001 — surfaced as a clear operator-facing error
            raise DockerUnavailableError(f"Could not connect to remote Docker host: {e}") from e

    try:
        return docker.from_env(timeout=30)
    except Exception as e:  # noqa: BLE001
        raise DockerUnavailableError(
            "No local Docker daemon found. In production, set DOCKER_HOST to a remote "
            f"Docker-capable host (see sandbox_image/BUILD.md). Original error: {e}"
        ) from e
