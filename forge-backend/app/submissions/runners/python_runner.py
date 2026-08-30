"""
Real sandboxed Python execution via Docker. This is the module that actually
runs untrusted learner code — every line here exists to enforce the
isolation boundary from forge-architecture-plan.md §7. Do not weaken any of
the container security settings below without re-reading that section.
"""

import io
import json
import tarfile
import time

from app.core.config import get_settings
from app.submissions.docker_client import get_docker_client
from app.submissions.runners.base import (
    ExecutionLimits,
    RunResult,
    RuntimeSpec,
    TestOutcome,
    ValidationIssue,
)

settings = get_settings()

RESULT_MARKER = "___FORGE_RESULTS___:"

# Built via concatenation, NOT str.format() — the harness code itself
# contains dict literals (`{"n": 0}` etc.), and .format() would try to
# interpret every one of those braces as a template field and crash.
_HARNESS_PREFIX = (
    'import sys, json\n'
    'sys.path.insert(0, "/workspace")\n\n'
    'try:\n'
    '    import solution\n'
    'except Exception as e:\n'
    '    print("' + RESULT_MARKER + '" + json.dumps([\n'
    '        {"name": "Import solution.py", "passed": False, "message": f"{type(e).__name__}: {e}"}\n'
    '    ]))\n'
    '    sys.exit(0)\n\n'
)

_HARNESS_SUFFIX = (
    '\n\ntry:\n'
    '    results = run_tests(solution)\n'
    'except Exception as e:\n'
    '    results = [{"name": "Test harness", "passed": False, "message": f"{type(e).__name__}: {e}"}]\n\n'
    'print("' + RESULT_MARKER + '" + json.dumps(results))\n'
)


def _build_harness_script(harness_code: str) -> str:
    return _HARNESS_PREFIX + harness_code + _HARNESS_SUFFIX


class PythonRunner:
    """Implements the LanguageRunner protocol for Python (base.py §55)."""

    def get_runtime(self) -> RuntimeSpec:
        return RuntimeSpec(image=settings.sandbox_image)

    def get_limits(self) -> ExecutionLimits:
        return ExecutionLimits(
            cpu_limit=settings.sandbox_cpu_limit,
            memory_mb=settings.sandbox_memory_mb,
            pids_limit=settings.sandbox_pids_limit,
            timeout_seconds=settings.sandbox_timeout_seconds,
        )

    def validate(self, files: dict[str, str]) -> list[ValidationIssue]:
        """Syntax check only — `compile()` parses but never executes, so this
        is safe to run in-process without a container."""
        issues: list[ValidationIssue] = []
        for path, content in files.items():
            if not path.endswith(".py"):
                continue
            try:
                compile(content, path, "exec")
            except SyntaxError as e:
                issues.append(ValidationIssue(message=f"{path}: {e.msg}", line=e.lineno))
        return issues

    def run(self, files: dict[str, str], harness_code: str) -> RunResult:
        client = get_docker_client()
        limits = self.get_limits()
        runtime = self.get_runtime()

        harness_script = _build_harness_script(harness_code)
        all_files = {**files, "_harness_runner.py": harness_script}
        archive = _build_tar(all_files)

        container = client.containers.create(
            image=runtime.image,
            command=["python", "_harness_runner.py"],
            working_dir=runtime.workdir,
            # --- Isolation boundary (forge-architecture-plan.md §7.2-7.3) ---
            network_disabled=True,
            mem_limit=f"{limits.memory_mb}m",
            memswap_limit=f"{limits.memory_mb}m",  # prevents swap from bypassing the memory cap
            nano_cpus=int(limits.cpu_limit * 1_000_000_000),
            pids_limit=limits.pids_limit,
            read_only=True,
            # /workspace and /tmp are tmpfs, not the writable root fs — the
            # container has nowhere persistent to write even if it tried.
            tmpfs={"/tmp": "size=16m", "/workspace": "size=16m,uid=1000,gid=1000"},
            user="1000:1000",
            cap_drop=["ALL"],
            security_opt=["no-new-privileges"],
        )
        timed_out = False
        exit_code = -1
        stdout = ""
        stderr = ""
        try:
            client.api.put_archive(container.id, runtime.workdir, archive)
            start = time.monotonic()
            container.start()
            try:
                exit_status = container.wait(timeout=limits.timeout_seconds)
                exit_code = exit_status.get("StatusCode", -1)
            except Exception:
                # Worker-side watchdog per §7.3 — kill even if the container
                # ignored an in-runtime timeout of its own.
                try:
                    container.kill()
                except Exception:
                    pass
                timed_out = True
            duration_ms = int((time.monotonic() - start) * 1000)

            stdout = container.logs(stdout=True, stderr=False).decode("utf-8", errors="replace")
            stderr = container.logs(stdout=False, stderr=True).decode("utf-8", errors="replace")
        finally:
            try:
                container.remove(force=True)
            except Exception:
                pass

        if timed_out:
            tests = [TestOutcome(name="Execution", passed=False, message=f"Timed out after {limits.timeout_seconds}s")]
        else:
            tests = _parse_results(stdout)

        return RunResult(
            tests=tests,
            stdout=stdout,
            stderr=stderr,
            duration_ms=duration_ms,
            exit_code=exit_code,
            timed_out=timed_out,
        )


def _build_tar(files: dict[str, str]) -> bytes:
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode="w") as tar:
        for path, content in files.items():
            data = content.encode("utf-8")
            info = tarfile.TarInfo(name=path)
            info.size = len(data)
            info.mode = 0o644
            tar.addfile(info, io.BytesIO(data))
    return buf.getvalue()


def _parse_results(stdout: str) -> list[TestOutcome]:
    for line in stdout.splitlines():
        if line.startswith(RESULT_MARKER):
            try:
                raw = json.loads(line[len(RESULT_MARKER):])
                return [TestOutcome(**r) for r in raw]
            except Exception:
                break
    return [
        TestOutcome(
            name="Execution",
            passed=False,
            message="Could not parse test results from sandbox output — check stderr.",
        )
    ]
