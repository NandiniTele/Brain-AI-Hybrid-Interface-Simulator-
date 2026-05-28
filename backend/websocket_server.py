import asyncio
import json
import math
import random
import sys
import time
import websockets

# Active cognitive state: 'neutral', 'focus', 'stress', or 'calm'
current_state = 'neutral'
last_logged_state = 'neutral'

# Lock for safely reading/writing the cognitive state across threads/tasks
state_lock = asyncio.Lock()

# Cognitive state parameters mapping as requested
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
        'desc': 'Focus State (Fast Beta rhythms)'
    },
    'stress': {
        'focus': 0.35,
        'stress': 0.85,
        'emotion': 'Stressed',
        'desc': 'Stress State (Erratic high-amplitude waves)'
    },
    'calm': {
        'focus': 0.50,
        'stress': 0.15,
        'emotion': 'Relaxed',
        'desc': 'Calm State (Smooth Alpha rhythms)'
    }
}

# Keep track of active WebSocket connections
connected_clients = set()

def generate_eeg_samples(state, channel_index):
    """
    Generates 256 samples (1000ms worth of data at 256Hz sampling rate)
    of synthetic EEG data for a specific channel based on cognitive state.
    """
    samples = []
    sampling_rate = 256
    duration = 1.0
    num_samples = int(sampling_rate * duration)
    t_start = time.time()

    for i in range(num_samples):
        # Current timestamp of the sample
        t = t_start + (i / sampling_rate)
        
        if state == 'focus':
            # Focus: Fast Beta waves (18-30Hz) dominant on frontal channels (CH1, CH2)
            if channel_index < 2:
                wave = (
                    math.sin(2 * math.pi * 22 * t) * 15.0 + 
                    math.sin(2 * math.pi * 28 * t) * 8.0 + 
                    random.uniform(-3.5, 3.5)  # moderate noise
                )
            else:
                wave = (
                    math.sin(2 * math.pi * 14 * t + channel_index) * 8.0 + 
                    random.uniform(-2.0, 2.0)
                )
        elif state == 'stress':
            # Stress: Erratic, high-amplitude slow components mixed with high-frequency noise
            wave = (
                math.sin(2 * math.pi * 6 * t + channel_index) * 18.0 + 
                math.sin(2 * math.pi * 35 * t) * 22.0 + 
                random.uniform(-25.0, 25.0)  # massive noise to simulate erratic signals
            )
        elif state == 'calm':
            # Calm: Smooth Alpha waves (8-12Hz) dominant on occipital channels (CH7, CH8)
            if channel_index >= 6:
                wave = (
                    math.sin(2 * math.pi * 10 * t + channel_index) * 24.0 + 
                    random.uniform(-1.0, 1.0)  # minimal noise
                )
            else:
                wave = (
                    math.sin(2 * math.pi * 8 * t + channel_index) * 10.0 + 
                    random.uniform(-1.5, 1.5)
                )
        else:  # 'neutral'
            # Neutral: Baseline standard mixture of Alpha and Theta waves
            wave = (
                math.sin(2 * math.pi * 9.0 * t + channel_index) * 12.0 + 
                math.sin(2 * math.pi * 6.0 * t) * 6.0 +
                random.uniform(-2.5, 2.5)
            )
        
        # Round value to mimic digitized uV telemetry data
        samples.append(round(wave, 4))

    return samples

async def update_state(new_state):
    """
    Safely updates the current state and prints a status message to the terminal.
    """
    global current_state, last_logged_state
    async with state_lock:
        current_state = new_state
        if current_state != last_logged_state:
            last_logged_state = current_state
            info = STATES[current_state]
            print(f"\n--> [State Changed] -> {info['desc']} | Focus: {int(info['focus']*100)}% | Stress: {int(info['stress']*100)}% | Emotion: {info['emotion']}")

def setup_keyboard_listener():
    """
    Tries to set up a global keyboard listener using 'pynput'.
    If pynput is not available or fails, returns False to trigger fallback terminal listener.
    """
    try:
        from pynput import keyboard
        
        def on_press(key):
            try:
                if hasattr(key, 'char') and key.char is not None:
                    char = key.char.lower()
                    if char == 'f':
                        asyncio.run_coroutine_threadsafe(update_state('focus'), loop)
                    elif char == 's':
                        asyncio.run_coroutine_threadsafe(update_state('stress'), loop)
                    elif char == 'c':
                        asyncio.run_coroutine_threadsafe(update_state('calm'), loop)
                    elif char in ['n', ' ', 'd']:
                        asyncio.run_coroutine_threadsafe(update_state('neutral'), loop)
            except Exception as ke:
                pass

        # Start global listener thread
        listener = keyboard.Listener(on_press=on_press)
        listener.daemon = True
        listener.start()
        print("[Keyboard] Global pynput listener started successfully.")
        return True
    except Exception as e:
        print(f"[Keyboard] Could not load global pynput listener ({e}). Using terminal fallback.")
        return False

async def terminal_keyboard_fallback():
    """
    Fallback terminal-bound keyboard reader for environment compatibility.
    Runs non-blocking input detection.
    """
    # Windows non-blocking input
    if sys.platform == 'win32':
        import msvcrt
        while True:
            if msvcrt.kbhit():
                char = msvcrt.getch().decode('utf-8', errors='ignore').lower()
                if char == 'f':
                    await update_state('focus')
                elif char == 's':
                    await update_state('stress')
                elif char == 'c':
                    await update_state('calm')
                else:
                    await update_state('neutral')
            await asyncio.sleep(0.05)
            
    # macOS/Linux non-blocking input
    else:
        import select
        import termios
        import tty
        fd = sys.stdin.fileno()
        old_settings = termios.tcgetattr(fd)
        try:
            tty.setcbreak(fd)
            while True:
                if select.select([sys.stdin], [], [], 0.05)[0]:
                    char = sys.stdin.read(1).lower()
                    if char == 'f':
                        await update_state('focus')
                    elif char == 's':
                        await update_state('stress')
                    elif char == 'c':
                        await update_state('calm')
                    else:
                        await update_state('neutral')
                await asyncio.sleep(0.05)
        except Exception:
            pass
        finally:
            try:
                termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)
            except:
                pass

async def ws_handler(websocket, path=None):
    """
    Manages client WebSocket connections.
    """
    connected_clients.add(websocket)
    print(f"[WebSocket] Client connected: {websocket.remote_address}")
    try:
        async for message in websocket:
            # Client messages can be processed here if needed
            pass
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        connected_clients.remove(websocket)
        print(f"[WebSocket] Client disconnected: {websocket.remote_address}")

async def broadcast_eeg_data():
    """
    Continuously generates 8-channel EEG waves and sends them to all
    connected WebSocket clients every 1000ms.
    Incorporates a 14ms simulated inference latency prior to sending.
    """
    while True:
        async with state_lock:
            state = current_state
            
        params = STATES[state]
        
        # Generate 8 channels of 256 samples (1000ms worth at 256Hz)
        eeg_channels = []
        for ch in range(8):
            eeg_channels.append(generate_eeg_samples(state, ch))
            
        # Simulate neural model decoding inference latency (~14ms)
        await asyncio.sleep(0.014)
        
        # Build telemetry data packet matching the dashboard expectations
        packet = {
            "type": "eeg_data",
            "samples": eeg_channels,
            "prediction": {
                "focus": params["focus"],
                "stress": params["stress"],
                "emotion": params["emotion"]
            }
        }
        
        # Broadcast JSON payload to all active subscribers
        if connected_clients:
            payload = json.dumps(packet)
            await asyncio.gather(
                *[client.send(payload) for client in connected_clients],
                return_exceptions=True
            )
            
        # Send packets at a 1000ms interval. We subtract the 14ms inference latency
        # to maintain exact pacing (approx 986ms remaining).
        await asyncio.sleep(0.986)

async def main():
    global loop
    loop = asyncio.get_running_loop()
    
    # Print welcome instructions
    print("=" * 60)
    print("   BRAIN-AI HYBRID INTERFACE TELEMETRY SIMULATOR")
    print("=" * 60)
    print("  Press 'f' -> Trigger FOCUS STATE   (88% Focus, 20% Stress)")
    print("  Press 's' -> Trigger STRESS STATE  (35% Focus, 85% Stress)")
    print("  Press 'c' -> Trigger CALM STATE    (50% Focus, 15% Stress)")
    print("  Press 'n' -> Reset to NEUTRAL STATE (58% Focus, 29% Stress)")
    print("=" * 60)
    print(f"Initial State: {STATES[current_state]['desc']}")
    print("-" * 60)

    # Attempt to load global keyboard listener
    has_global = setup_keyboard_listener()

    # Start WebSocket server on localhost:8000
    async with websockets.serve(ws_handler, "localhost", 8000):
        print("[Server] WebSocket server successfully started on ws://localhost:8000")
        
        tasks = [broadcast_eeg_data()]
        if not has_global:
            # If global hook fails, run terminal fallback reader
            tasks.append(terminal_keyboard_fallback())
            
        await asyncio.gather(*tasks)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[Server] WebSocket server shut down gracefully.")
