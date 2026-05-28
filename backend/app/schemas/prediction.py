from pydantic import BaseModel

class LabelConfidence(BaseModel):
    label: str
    confidence: float

class IntentConfidence(BaseModel):
    action: str
    confidence: float

class PredictionResult(BaseModel):
    emotion: LabelConfidence
    focus: float
    stress: float
    intent: IntentConfidence
