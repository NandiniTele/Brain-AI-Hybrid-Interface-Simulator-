from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from ..services.auth_service import get_current_user
from ..models.user import User
import random

router = APIRouter()

@router.get("/history", response_model=List[Dict[str, Any]])
def get_analytics_history(current_user: User = Depends(get_current_user)):
    # Generate some mock historical analytics data
    history = []
    emotions = ["neutral", "happy", "sad", "angry", "surprised"]
    for i in range(10):
        history.append({
            "timestamp": f"{10 - i}m ago",
            "focus": round(random.uniform(0.5, 0.95), 2),
            "stress": round(random.uniform(0.1, 0.45), 2),
            "emotion": random.choice(emotions)
        })
    return history

@router.get("/summary", response_model=Dict[str, Any])
def get_analytics_summary(current_user: User = Depends(get_current_user)):
    return {
        "average_focus": 0.78,
        "average_stress": 0.24,
        "dominant_emotion": "happy",
        "total_sessions": 8,
        "total_active_time_minutes": 112
    }
