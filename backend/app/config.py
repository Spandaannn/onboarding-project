import os
from dotenv import load_dotenv

load_dotenv()  # reads backend/.env into environment variables

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tasks.db")
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")