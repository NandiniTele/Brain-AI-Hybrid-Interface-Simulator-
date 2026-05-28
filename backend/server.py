import asyncio
import json
import time
import datetime
import random
import websockets
import numpy as np
from pynput import keyboard

# Shared cognitive state: 'neutral', 'focus', 'stress', 'calm', 'happy', or 'dull'
current_state = 'neutral'

# Cognitive state parameters dictionary
STATES = {
    'neutral': {
        'focus': 0.58,
        'stress': 0.29,
        'emotion': 'Neutral',
        'desc': 'Neutral Baseline State'
    },
    'focus': {
        'focus': 0.88,
        'stress': 0.20,
        'emotion': 'Focused',
        'desc': 'Focus State (Fast Beta waves)'
    },
    'stress': {
        'focus': 0.35,
        'stress': 0.85,
        'emotion': 'Stressed',
        'desc': 'Stress State (Erratic Gamma waves)'
    },
    'calm': {
        'focus': 0.50,
        'stress': 0.15,
        'emotion': 'Relaxed',
        'desc': 'Calm State (Smooth Alpha waves)'
    },
    'happy': {
        'focus': 0.72,
        'stress': 0.35,
        'emotion': 'Happy',
        'desc': 'Happy State (Elevated Alpha/Beta blend)'
    },
    'dull': {
        'focus': 0.40,
        'stress': 0.22,
        'emotion': 'Dull',
        'desc': 'Dull State (Theta wave dominant)'
    }
}

# Keep track of active WebSocket connections
connected_clients = set()

# Historical telemetry logs buffer for Session Analytics
history_log = []
total_sessions = 1
last_recorded_state = 'neutral'

def pre_populate_history():
    """
    Pre-populates the historical log with realistic data points to ensure
    the analytics chart immediately renders active trends.
    """
    now = datetime.datetime.now()
    for i in range(10, 0, -1):
        past_time = now - datetime.timedelta(seconds=i * 5)
        history_log.append({
            "timestamp": past_time.strftime("%H:%M:%S"),
            "focus": round(random.uniform(0.50, 0.62), 2),
            "stress": round(random.uniform(0.24, 0.32), 2),
            "emotion": "Neutral"
        })

# Pre-populate history log on startup
pre_populate_history()

def add_history_point(state):
    """
    Appends a new datapoint to the historical logs.
    Increments the session counter if a cognitive state transition occurs.
    """
    global total_sessions, last_recorded_state
    
    # If the user switches state, increment session counter
    if state != last_recorded_state:
        total_sessions += 1
        last_recorded_state = state
        
    params = STATES[state]
    now = datetime.datetime.now()
    
    # Introduce subtle random variance to simulate real time-series fluctuation
    focus_val = round(max(0.0, min(1.0, params['focus'] + random.uniform(-0.03, 0.03))), 2)
    stress_val = round(max(0.0, min(1.0, params['stress'] + random.uniform(-0.03, 0.03))), 2)
    
    history_log.append({
        "timestamp": now.strftime("%H:%M:%S"),
        "focus": focus_val,
        "stress": stress_val,
        "emotion": params['emotion']
    })
    
    # Cap historical queue size at 12 items for visual clarity on chart
    if len(history_log) > 12:
        history_log.pop(0)

def get_summary_stats():
    """
    Computes averages and determines the dominant emotion in the current history session.
    """
    if not history_log:
        return {
            "average_focus": 0.58,
            "average_stress": 0.29,
            "dominant_emotion": "Neutral",
            "total_sessions": total_sessions
        }
    
    avg_focus = round(sum(d['focus'] for d in history_log) / len(history_log), 2)
    avg_stress = round(sum(d['stress'] for d in history_log) / len(history_log), 2)
    
    # Find dominant emotion via occurrences tally
    emotions = [d.get('emotion', 'Neutral') for d in history_log]
    dominant_emotion = max(set(emotions), key=emotions.count)
    
    return {
        "average_focus": avg_focus,
        "average_stress": avg_stress,
        "dominant_emotion": dominant_emotion,
        "total_sessions": total_sessions
    }

def on_press(key):
    """
    Global keyboard listener hook to switch cognitive states dynamically.
    """
    global current_state
    try:
        if hasattr(key, 'char') and key.char is not None:
            char = key.char.lower()
            new_state = None
            if char == 'f':
                new_state = 'focus'
            elif char == 's':
                new_state = 'stress'
            elif char == 'c':
                new_state = 'calm'
            elif char == 'n':
                new_state = 'neutral'
            elif char == 'h':
                new_state = 'happy'
            elif char == 'd':
                new_state = 'dull'
                
            if new_state and new_state != current_state:
                current_state = new_state
                # Record immediately to trigger live transition on analytics charts
                add_history_point(current_state)
                state_info = STATES[current_state]
                print(f"--> [State Triggered] {state_info['desc']} | Focus: {int(state_info['focus']*100)}% | Stress: {int(state_info['stress']*100)}% | Emotion: {state_info['emotion']}")
    except Exception as e:
        print(f"Error handling key press: {e}")

# Start background keyboard thread
listener = keyboard.Listener(on_press=on_press)
listener.daemon = True
listener.start()

def generate_eeg_chunk(state, channel_index, chunk_size=25):
    """
    Generates synthetic EEG waves corresponding to the current state.
    """
    t_start = time.time()
    t = np.linspace(t_start, t_start + 0.1, chunk_size)
    
    if state == 'focus':
        freq = 22.0 if channel_index < 2 else 14.0
        amplitude = 16.0 if channel_index < 2 else 9.0
        noise = np.random.normal(0, 3.5, chunk_size)
        wave = amplitude * np.sin(2 * np.pi * freq * t) + noise
    elif state == 'stress':
        freq = 38.0
        amplitude = 24.0
        noise = np.random.normal(0, 16.5, chunk_size)
        wave = amplitude * np.sin(2 * np.pi * freq * t) + noise
    elif state == 'calm':
        freq = 10.0 if channel_index >= 6 else 8.5
        amplitude = 22.0 if channel_index >= 6 else 11.0
        noise = np.random.normal(0, 1.2, chunk_size)
        wave = amplitude * np.sin(2 * np.pi * freq * t) + noise
    elif state == 'happy':
        freq = 11.5
        amplitude = 18.0
        noise = np.random.normal(0, 2.0, chunk_size)
        wave = amplitude * np.sin(2 * np.pi * freq * t) + noise
    elif state == 'dull':
        freq = 6.0
        amplitude = 10.0
        noise = np.random.normal(0, 4.0, chunk_size)
        wave = amplitude * np.sin(2 * np.pi * freq * t) + noise
    else:  # neutral
        freq = 9.5
        amplitude = 12.0
        noise = np.random.normal(0, 2.5, chunk_size)
        wave = amplitude * np.sin(2 * np.pi * freq * t) + noise
        
    return np.round(wave, 4).tolist()

async def ws_handler(websocket, path=None):
    connected_clients.add(websocket)
    print(f"[WebSocket] Client connected: {websocket.remote_address}")
    try:
        # Keep socket open
        async for message in websocket:
            pass
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        connected_clients.remove(websocket)
        print(f"[WebSocket] Client disconnected: {websocket.remote_address}")

async def broadcast_telemetry():
    """
    Broadcasts real-time EEG waves, focus/stress indexes, pre-processed history arrays,
    and cumulative statistics at 100ms refresh cycles.
    """
    print("[Telemetry] Broadcast loop started (100ms interval).")
    last_history_time = time.time()
    
    while True:
        state = current_state
        params = STATES[state]
        current_time = time.time()
        
        # Periodically append new history point (every 2.5 seconds)
        if current_time - last_history_time >= 2.5:
            add_history_point(state)
            last_history_time = current_time
        
        # Generate wave telemetry chunk
        eeg_data = []
        for ch in range(8):
            eeg_data.append(generate_eeg_chunk(state, ch, chunk_size=25))
            
        await asyncio.sleep(0.014)  # simulated classification delay
        
        payload = {
            "type": "eeg_data",
            "samples": eeg_data,
            "prediction": {
                "focus": params["focus"],
                "stress": params["stress"],
                "emotion": params["emotion"]
            },
            "history": history_log,
            "summary": get_summary_stats()
        }
        
        if connected_clients:
            json_str = json.dumps(payload)
            await asyncio.gather(
                *[client.send(json_str) for client in connected_clients],
                return_exceptions=True
            )
            
        await asyncio.sleep(0.086)

async def main():
    async with websockets.serve(ws_handler, "localhost", 8000):
        print("=" * 60)
        print(" BCI Thought Pattern Decoder Backend running on ws://localhost:8000")
        print("=" * 60)
        print("  Press 'f' inside terminal -> FOCUS STATE")
        print("  Press 's' inside terminal -> STRESS STATE")
        print("  Press 'c' inside terminal -> CALM STATE")
        print("  Press 'n' inside terminal -> NEUTRAL STATE")
        print("  Press 'h' inside terminal -> HAPPY STATE")
        print("  Press 'd' inside terminal -> DULL STATE")
        print("=" * 60)
        await broadcast_telemetry()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[Server] Shutting down...")
