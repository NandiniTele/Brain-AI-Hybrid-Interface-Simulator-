from pydantic import BaseModel, Field
from typing import List

class EEGChunk(BaseModel):
    samples: List[float] = Field(..., description="Flat list of EEG samples for 1 s (256 Hz)")
    sampling_rate: int = Field(default=256, description="Sampling rate in Hz")
