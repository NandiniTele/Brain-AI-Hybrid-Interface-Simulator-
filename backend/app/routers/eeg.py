from fastapi import APIRouter, Depends, HTTPException
from ..schemas.signal import EEGChunk
from ..schemas.prediction import PredictionResult
from .websocket import decoder

router = APIRouter()

@router.post("/process", response_model=PredictionResult)
def process_eeg(chunk: EEGChunk):
    try:
        prediction = decoder.predict(chunk.samples, chunk.sampling_rate)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
