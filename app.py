"""Root compatibility package shim for platforms starting with `app:create_app()`."""

from pathlib import Path
import sys


ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / 'backend'
PACKAGE_DIR = BACKEND_DIR / 'app'
PACKAGE_INIT = PACKAGE_DIR / '__init__.py'

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Make this module behave like the backend `app` package so imports such as
# `from app.routes import ...` continue to work even when Render starts from
# the repository root with `gunicorn app:create_app()`.
__file__ = str(PACKAGE_INIT)
__package__ = 'app'
__path__ = [str(PACKAGE_DIR)]

with PACKAGE_INIT.open('r', encoding='utf-8') as source_file:
    source = source_file.read()

exec(compile(source, __file__, 'exec'), globals(), globals())
