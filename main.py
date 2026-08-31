import os
import sys

# Add backend directory to Python sys.path so app modules import cleanly
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "backend"))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.main import app  # type: ignore  # noqa: E402, F401

__all__ = ["app"]

if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
