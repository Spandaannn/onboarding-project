import os
from dotenv import load_dotenv

load_dotenv()  # reads backend/.env into environment variables

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tasks.db")
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
LLM_MODEL = os.getenv("LLM_MODEL", "gemini-3.8-flash")
