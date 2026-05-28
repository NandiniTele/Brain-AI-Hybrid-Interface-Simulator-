from datetime import datetime, timezone, timedelta
from ..database import get_db

def utcnow():
    return datetime.now(timezone.utc)
