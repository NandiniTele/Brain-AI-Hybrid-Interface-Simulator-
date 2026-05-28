import torch
import numpy as np
from typing import Dict, Any

class Decoder:
    """Wraps the deep‑learning model used for EEG decoding.

    The model is expected to output a dictionary with the following keys:
    - ``emotion``: {"label": str, "confidence": float}
    - ``focus``: float (0‑1)
    - ``stress``: float (0‑1)
    - ``intent``: {"action": str, "confidence": float}
    """

    def __init__(self, model_path: str):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        # Guard against missing file – raise clear error
        try:
            self.model = torch.load(model_path, map_location=self.device)
        except Exception as exc:
            raise FileNotFoundError(f"Model not found at {model_path}: {exc}")
        self.model.eval()

    def _preprocess(self, samples: list, sampling_rate: int) -> torch.Tensor:
        """Convert raw samples to a tensor suitable for the model.
        - Normalise to zero‑mean, unit‑variance.
        - Reshape to (batch, channels, time). For a single‑channel simulation we add a channel dim.
        """
        arr = np.array(samples, dtype=np.float32)
        # Simple z‑score normalisation
        arr = (arr - arr.mean()) / (arr.std() + 1e-6)
        tensor = torch.from_numpy(arr).unsqueeze(0).unsqueeze(0)  # (1,1,T)
        return tensor.to(self.device)

    def predict(self, samples: list, sampling_rate: int, preset: str = None) -> Dict[str, Any]:
        """Run inference and return a high‑level prediction payload.
        The returned dict matches the ``PredictionResult`` schema defined in ``backend/app/schemas/__init__.py``.
        """
        x = self._preprocess(samples, sampling_rate)
        with torch.no_grad():
            raw_out = self.model(x)
        # Assume model returns a tuple: (emotion_logits, focus_val, stress_val, intent_logits)
        emotion_logits, focus_val, stress_val, intent_logits = raw_out
        emotion_idx = torch.argmax(emotion_logits, dim=-1).item()
        intent_idx = torch.argmax(intent_logits, dim=-1).item()
        # Simple label maps – replace with real mapping if you have one
        emotion_labels = ["neutral", "happy", "sad", "angry", "surprised"]
        intent_labels = ["none", "move_left", "move_right", "select", "cancel"]
        emotion_conf = torch.softmax(emotion_logits, dim=-1)[0, emotion_idx].item()
        intent_conf = torch.softmax(intent_logits, dim=-1)[0, intent_idx].item()
        return {
            "emotion": {"label": emotion_labels[emotion_idx], "confidence": round(emotion_conf, 3)},
            "focus": round(float(focus_val.squeeze().cpu().numpy()), 3),
            "stress": round(float(stress_val.squeeze().cpu().numpy()), 3),
            "intent": {"action": intent_labels[intent_idx], "confidence": round(intent_conf, 3)},
        }
