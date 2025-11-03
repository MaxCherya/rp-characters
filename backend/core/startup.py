from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
import os
import sys
import platform
import subprocess
import shutil
from typing import Any, Iterable

try:
    from rich.console import Console
    from rich.panel import Panel
    from rich.table import Table
    from rich.columns import Columns
    from rich.text import Text
    from rich import box
except Exception:  # Rich not installed or terminal not supporting it
    Console = None


# ---------- Environment detection (authoritative; updates settings) ----------
def _coerce_bool(v, default=False):
    if v is None:
        return default
    return str(v).strip().lower() in {"1", "true", "yes", "y", "on"}

def _detect_mode_from_env_argv() -> str:
    explicit = os.getenv("DJANGO_MODE")
    if explicit:
        return explicit.upper()

    argv = " ".join(sys.argv).lower()
    if "pytest" in argv or " test" in f" {argv}":
        return "TEST"

    if _coerce_bool(os.getenv("GITHUB_ACTIONS")) or _coerce_bool(os.getenv("CI")):
        return "TEST"

    if _coerce_bool(os.getenv("STAGING")) or _coerce_bool(os.getenv("IS_STAGING")):
        return "STAGING"

    if _coerce_bool(os.getenv("DJANGO_DEBUG"), default=False):
        return "DEV"

    return "PRODUCTION"

def _apply_env_detection(settings):
    """
    Detect MODE/DEBUG/color if not present, then set them on Django settings
    (post-load). This won't affect early-built things like DATABASES, but
    gives you consistent MODE/DEBUG for the rest of the app and the banner.
    """
    if getattr(settings, "MODE", None) is None:
        settings.MODE = _detect_mode_from_env_argv()

    # If DEBUG not explicitly set in settings, derive by MODE (can be overridden by env)
    if getattr(settings, "DEBUG", None) is None:
        default_debug = {"DEV": True, "TEST": False, "STAGING": False, "PRODUCTION": False}
        settings.DEBUG = _coerce_bool(os.getenv("DJANGO_DEBUG"), default=default_debug.get(settings.MODE, False))

    # Color map (exported for banner)
    if getattr(settings, "MODE_COLOR", None) is None:
        settings.MODE_COLOR = {"DEV": "green", "TEST": "yellow", "STAGING": "cyan", "PRODUCTION": "red"}

    if getattr(settings, "color", None) is None:
        settings.color = settings.MODE_COLOR.get(settings.MODE, "green")
# ---------------------------------------------------------------------------


@dataclass
class BannerColors:
    mode: str          # "green" | "red" | "yellow" | "cyan"
    accent: str = "cyan"
    key: str = "bold white"
    value: str = "white"


def _git_info(base_dir: str) -> str | None:
    """Return 'branch@shortsha ✓/⚠' if git available; else None."""
    if not shutil.which("git"):
        return None
    try:
        commit = subprocess.check_output(
            ["git", "-C", base_dir, "rev-parse", "--short", "HEAD"],
            stderr=subprocess.DEVNULL,
        ).decode().strip()
        branch = subprocess.check_output(
            ["git", "-C", base_dir, "rev-parse", "--abbrev-ref", "HEAD"],
            stderr=subprocess.DEVNULL,
        ).decode().strip()
        dirty = subprocess.call(
            ["git", "-C", base_dir, "diff", "--quiet", "--ignore-submodules"],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
        )
        mark = "⚠" if dirty else "✓"
        return f"{branch}@{commit} {mark}"
    except Exception:
        return None


def _mask(v: Any, keep_last: int = 6) -> str:
    s = str(v or "")
    if not s or s.lower() in {"none", "dev-secret"}:
        return s
    return "•" * max(0, len(s) - keep_last) + s[-keep_last:]


def _list(v: Iterable[str] | None, fallback: str = "—") -> str:
    if not v:
        return fallback
    return ", ".join(str(x) for x in v)


def _db_name(settings) -> str:
    try:
        cfg = settings.DATABASES["default"]
        eng = cfg.get("ENGINE", "unknown")
        name = cfg.get("NAME", "")
        if "sqlite" in eng and name:
            import pathlib
            return f"{eng} ({pathlib.Path(name).name})"
        return f"{eng} ({name})" if name else eng
    except Exception:
        return "unknown"


def _server_kind() -> str:
    argv = " ".join(sys.argv).lower()
    if "uvicorn" in argv:
        return "uvicorn"
    if "gunicorn" in argv:
        return "gunicorn"
    if "runserver" in argv:
        return "django runserver"
    return "unknown"


def _safe_import_version(pkg: str) -> str:
    try:
        mod = __import__(pkg)
        return getattr(mod, "__version__", "unknown")
    except Exception:
        return "unknown"


def _color_from_settings_mode(settings) -> str:
    mode = getattr(settings, "MODE", "DEV")
    mapping = getattr(settings, "MODE_COLOR", None)
    if isinstance(mapping, dict):
        return mapping.get(mode, "green")
    # fallback
    m = (mode or "").upper()
    if "PROD" in m:
        return "red"
    if "STAGE" in m:
        return "cyan"
    if "TEST" in m:
        return "yellow"
    return "green"


def print_startup_banner(settings) -> None:
    """Pretty startup banner. Safe to call multiple times (prints once)."""
    if getattr(print_startup_banner, "_printed", False):
        return
    setattr(print_startup_banner, "_printed", True)

    # Ensure MODE/DEBUG/color exist (may override defaults from settings)
    _apply_env_detection(settings)

    # If Rich is unavailable, print a compact fallback and exit.
    if Console is None:
        ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(
            f"[{ts}] {getattr(settings, 'PROJECT_NAME', 'Project')} "
            f"starting in {getattr(settings, 'MODE', 'DEV')} "
            f"(debug={getattr(settings, 'DEBUG', False)})",
            file=sys.stderr,
        )
        return

    console = Console()

    # Collect settings / env data
    proj = getattr(settings, "PROJECT_NAME", "Project")
    mode = getattr(settings, "MODE", "DEV")
    debug = getattr(settings, "DEBUG", False)
    hosts = getattr(settings, "ALLOWED_HOSTS", [])
    cors = getattr(settings, "CORS_ALLOWED_ORIGINS", [])
    csrf = getattr(settings, "CSRF_TRUSTED_ORIGINS", [])
    tz = getattr(settings, "TIME_ZONE", "UTC")
    lang = getattr(settings, "LANGUAGE_CODE", "en-us")
    base_dir = str(getattr(settings, "BASE_DIR", ""))
    secret = _mask(getattr(settings, "SECRET_KEY", ""))
    dj_db = _db_name(settings)
    static_url = getattr(settings, "STATIC_URL", "static/")
    static_root = getattr(settings, "STATIC_ROOT", None)
    default_auto = getattr(settings, "DEFAULT_AUTO_FIELD", "—")
    apps_count = len(getattr(settings, "INSTALLED_APPS", []))
    middleware_count = len(getattr(settings, "MIDDLEWARE", []))
    dj_version = _safe_import_version("django")
    py_version = platform.python_version()
    os_name = f"{platform.system()} {platform.release()}"
    proc_id = os.getpid()
    git = _git_info(base_dir)
    port = os.environ.get("PORT") or os.environ.get("DJANGO_PORT") or "8000"
    server = _server_kind()
    color = _color_from_settings_mode(settings)

    # Left panel: Environment
    p_env = Table.grid(padding=(0, 1))
    p_env.add_column(style="bold white", justify="right", no_wrap=True)
    p_env.add_column(style="white")
    p_env.add_row("Mode", f"[bold {color}]{mode}[/]")
    p_env.add_row("Debug", f"[yellow]{debug}[/]")
    p_env.add_row("Server", server)
    p_env.add_row("Django", f"[cyan]{dj_version}[/]")
    p_env.add_row("Python", f"[cyan]{py_version}[/]")
    p_env.add_row("PID", f"{proc_id}")
    if git:
        p_env.add_row("Git", f"[magenta]{git}[/]")

    # Middle panel: Network
    p_net = Table.grid(padding=(0, 1))
    p_net.add_column(style="bold white", justify="right", no_wrap=True)
    p_net.add_column(style="white")
    p_net.add_row("Hosts", _list(hosts))
    p_net.add_row("CORS", _list(cors))
    if csrf:
        p_net.add_row("CSRF", _list(csrf))
    p_net.add_row("Port", port)
    p_net.add_row("TZ / Lang", f"{tz} / {lang}")

    # Right panel: Storage / Secrets
    p_store = Table.grid(padding=(0, 1))
    p_store.add_column(style="bold white", justify="right", no_wrap=True)
    p_store.add_column(style="white")
    p_store.add_row("Database", dj_db)
    p_store.add_row("Secret", f"[dim]{secret}[/]")
    p_store.add_row("Static URL", static_url or "—")
    p_store.add_row("Static Root", str(static_root) if static_root else "—")
    p_store.add_row("Auto PK", default_auto)

    # Footer: System stats
    p_sys = Table.grid(padding=(0, 1))
    p_sys.add_column(style="bold white", justify="right", no_wrap=True)
    p_sys.add_column(style="white")
    p_sys.add_row("Installed Apps", str(apps_count))
    p_sys.add_row("Middleware", str(middleware_count))
    p_sys.add_row("Base Dir", base_dir)
    p_sys.add_row("OS", os_name)
    p_sys.add_row("Started", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

    # Header + render
    header = Text.assemble(
        (" 🧠 ", "bold"),
        (proj, "bold cyan"),
        (" — Django startup", "bold white"),
    )
    console.rule(characters="=", style=color)
    console.print(Panel(header, box=box.ROUNDED, style=color))
    console.print(
        Columns(
            [
                Panel(p_env, title="Environment", box=box.MINIMAL, border_style=color),
                Panel(p_net, title="Network", box=box.MINIMAL, border_style=color),
                Panel(p_store, title="Storage", box=box.MINIMAL, border_style=color),
            ],
            expand=True,
            equal=True,
        )
    )
    console.print(Panel(p_sys, title="System", box=box.MINIMAL, border_style=color))
    console.rule(characters="=", style=color)