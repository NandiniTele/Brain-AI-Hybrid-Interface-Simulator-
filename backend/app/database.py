from sqlmodel import SQLModel, create_engine, Session
from .config import settings

sqlite_file_name = "brain_ai.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

def get_db():
    with Session(engine) as session:
        yield session
