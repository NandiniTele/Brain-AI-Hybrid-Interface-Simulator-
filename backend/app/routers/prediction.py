from fastapi import APIRouter, Depends
import random
from ..schemas.prediction import PredictionResult
from .websocket import decoder

router = APIRouter()

@router.get("/latest", response_model=PredictionResult)
def get_latest_prediction():
    # Simulate processing of a new segment
    samples = [random.uniform(-50.0, 50.0) for _ in range(256)]
    prediction = decoder.predict(samples, 256)
    return prediction
