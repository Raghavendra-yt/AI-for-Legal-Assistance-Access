import sys
import os

# Ensure the repo root is on the path so "backend.app.main" resolves correctly
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.main import app
