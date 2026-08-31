import os
import sys

# Add backend to sys.path so app modules import cleanly
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from app.main import app

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
