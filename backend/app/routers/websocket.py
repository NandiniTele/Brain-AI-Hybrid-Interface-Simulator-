from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
import asyncio
import random
from ..models.decoder import Decoder
from ..config import settings
import os

router = APIRouter()

decoder = None
try:
    # Ensure models directory exists
    os.makedirs(os.path.dirname(settings.model_path), exist_ok=True)
    if not os.path.exists(settings.model_path):
        try:
            import torch
            class DummyTorchModel(torch.nn.Module):
                def __init__(self):
                    super().__init__()
                    self.linear = torch.nn.Linear(10, 10)
                def forward(self, x):
                    # Mock model response matching shape (1, 5), (1,), (1,), (1, 5)
                    emotion_logits = torch.tensor([[0.1, 0.7, 0.1, 0.05, 0.05]], dtype=torch.float32)
                    focus_val = torch.tensor([[0.85]], dtype=torch.float32)
                    stress_val = torch.tensor([[0.25]], dtype=torch.float32)
                    intent_logits = torch.tensor([[0.05, 0.9, 0.02, 0.02, 0.01]], dtype=torch.float32)
                    return emotion_logits, focus_val, stress_val, intent_logits
            
            torch.save(DummyTorchModel(), settings.model_path)
            print(f"Successfully auto-generated dummy PyTorch model at {settings.model_path}")
        except Exception as te:
            print(f"Failed to auto-generate dummy torch model: {te}")
            
    decoder = Decoder(settings.model_path)
except Exception as e:
    print(f"Warning: Could not load real decoder: {e}. Using mock decoder.")
    class MockDecoder:
        def predict(self, samples, sampling_rate, preset=None):
            import numpy as np
            arr = np.array(samples)
            std_val = np.std(arr) if len(arr) > 0 else 0.0
            
            # Base cognitive levels based on signal features
            if std_val < 5.0:
                base_focus = 0.45
                base_stress = 0.12
            elif std_val < 15.0:
                base_focus = 0.76
                base_stress = 0.18
            elif std_val < 25.0:
                base_focus = 0.88
                base_stress = 0.28
            elif std_val < 45.0:
                base_focus = 0.62
                base_stress = 0.72
            else:
                # high amplitude artifacts
                base_focus = 0.35
                base_stress = 0.45
                
            focus = float(np.clip(base_focus + random.uniform(-0.06, 0.06), 0.0, 1.0))
            stress = float(np.clip(base_stress + random.uniform(-0.06, 0.06), 0.0, 1.0))
            
            emotion_label = "neutral"
            intent_action = "none"
            
            if preset:
                preset_l = preset.lower()
                if "happy" in preset_l or "excited" in preset_l or "joy" in preset_l:
                    emotion_label = "happy"
                elif "angry" in preset_l or "fear" in preset_l or "pain" in preset_l or "stress" in preset_l:
                    emotion_label = "angry"
                elif "sad" in preset_l:
                    emotion_label = "sad"
                elif "surprise" in preset_l:
                    emotion_label = "surprised"
                    
                if "left" in preset_l:
                    intent_action = "move_left"
                elif "right" in preset_l:
                    intent_action = "move_right"
                elif "select" in preset_l or "forward" in preset_l or "yes" in preset_l or "click" in preset_l:
                    intent_action = "select"
                elif "cancel" in preset_l or "backward" in preset_l or "no" in preset_l or "stop" in preset_l:
                    intent_action = "cancel"
                    
            emotion_confidence = round(random.uniform(0.82, 0.97), 3)
            intent_confidence = round(random.uniform(0.85, 0.99) if intent_action != "none" else random.uniform(0.92, 0.98), 3)
            
            return {
                "emotion": {"label": emotion_label, "confidence": emotion_confidence},
                "focus": round(focus, 3),
                "stress": round(stress, 3),
                "intent": {"action": intent_action, "confidence": intent_confidence},
            }
    decoder = MockDecoder()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket client connected")
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            if "samples" in payload:
                samples = payload["samples"]
                sampling_rate = payload.get("sampling_rate", 256)
                preset = payload.get("preset", None)
                
                prediction = decoder.predict(samples, sampling_rate, preset=preset)
                
                await websocket.send_json({
                    "type": "eeg_update",
                    "samples": samples,
                    "prediction": prediction
                })
            else:
                await websocket.send_json({"type": "ping"})
    except WebSocketDisconnect:
        print("WebSocket client disconnected")
    except Exception as e:
        print(f"WebSocket connection error: {e}")
        try:
            await websocket.close()
        except:
            pass
