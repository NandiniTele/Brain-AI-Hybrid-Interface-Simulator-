<![CDATA[<div align="center">

# 🧠 Brain–AI Hybrid Interface Simulator

### *Real-Time BCI Telemetry Dashboard for Cognitive State Decoding*

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.95+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PyTorch](https://img.shields.io/badge/PyTorch-1.12+-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org)
[![WebSocket](https://img.shields.io/badge/WebSocket-Real--Time-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br/>

*A full-stack Brain–Computer Interface (BCI) simulator that decodes synthetic EEG signals into cognitive, emotional, and behavioral states in real time — featuring an 8-channel waveform visualizer, live focus/stress analytics, and interactive cognitive state transitions.*

<br/>

---

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [Keyboard Controls](#-keyboard-controls)
- [API Endpoints](#-api-endpoints)
- [Screenshots](#-screenshots)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

The **Brain–AI Hybrid Interface Simulator** bridges the gap between neuroscience and artificial intelligence by providing an interactive platform for simulating real-time Brain–Computer Interface (BCI) workflows. It generates synthetic 8-channel EEG data, processes it through a neural decoder model, and streams live telemetry to a premium React dashboard — all at **60 FPS**.

This project serves as a foundation for:
- 🎓 **Education** — Learn BCI signal processing concepts hands-on
- 🔬 **Research Prototyping** — Rapidly prototype neural decoding pipelines
- 🦾 **Assistive Technology** — Explore intent-driven interfaces for accessibility
- 🧪 **Human–AI Interaction** — Study cognitive state-driven AI systems

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| **🔴 Live 8-Channel EEG Waveforms** | Real-time canvas rendering of synthetic brainwave signals across 8 electrode channels at 60 FPS |
| **🧠 Cognitive State Decoding** | Decodes EEG patterns into Focus, Stress, Emotion, and Intent predictions using a PyTorch-based neural decoder |
| **📊 Real-Time Analytics Dashboard** | Interactive charts showing focus/stress trends, session history, and dominant emotion tracking |
| **⌨️ Interactive State Transitions** | Switch between 6 cognitive states (Focus, Stress, Calm, Neutral, Happy, Dull) via keyboard controls |
| **🔐 User Authentication** | JWT-based login/registration system with protected routes |
| **📡 WebSocket Streaming** | Sub-100ms latency telemetry broadcast via persistent WebSocket connections |
| **📈 Session Analytics** | Cumulative session statistics with average focus/stress scores and state transition counters |
| **🎨 Premium UI** | Glassmorphism design with dark mode, smooth animations, and responsive layout |

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                  │
│                                                              │
│  ┌──────────┐  ┌───────────────┐  ┌───────────────────────┐  │
│  │  Login   │  │  Home Page    │  │  BCI Dashboard        │  │
│  │  Page    │  │  (Landing)    │  │  ┌─────────────────┐  │  │
│  └──────────┘  └───────────────┘  │  │ EEG Waveforms   │  │  │
│                                   │  │ (Canvas 60fps)  │  │  │
│                                   │  ├─────────────────┤  │  │
│                                   │  │ Focus/Stress    │  │  │
│                                   │  │ Gauges          │  │  │
│                                   │  ├─────────────────┤  │  │
│                                   │  │ Emotion/Intent  │  │  │
│                                   │  │ Status          │  │  │
│                                   │  ├─────────────────┤  │  │
│                                   │  │ Session History │  │  │
│                                   │  │ Analytics       │  │  │
│                                   │  └─────────────────┘  │  │
│                                   └───────────────────────┘  │
└───────────────────────┬──────────────────────────────────────┘
                        │ WebSocket (ws://localhost:8000)
                        │ REST API  (http://localhost:8001)
┌───────────────────────▼──────────────────────────────────────┐
│                   BACKEND (Python)                            │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  │
│  │  WebSocket     │  │  FastAPI REST   │  │  PyTorch       │  │
│  │  Server        │  │  Server         │  │  Decoder       │  │
│  │  (server.py)   │  │  (main.py)      │  │  (decoder.py)  │  │
│  │                │  │                 │  │                │  │
│  │  • EEG Gen     │  │  • Auth (JWT)   │  │  • Preprocess  │  │
│  │  • State Mgmt  │  │  • Analytics    │  │  • Inference   │  │
│  │  • Broadcast   │  │  • Prediction   │  │  • Classify    │  │
│  └────────────────┘  └────────────────┘  └────────────────┘  │
│                                                              │
│                    ┌────────────────────┐                     │
│                    │  SQLite Database   │                     │
│                    │  (brain_ai.db)     │                     │
│                    └────────────────────┘                     │
└──────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Python 3.10+** | Core backend language |
| **FastAPI** | REST API framework for auth, analytics, and predictions |
| **WebSockets** | Real-time bidirectional telemetry streaming |
| **PyTorch** | Deep learning framework for the neural decoder model |
| **NumPy** | EEG signal generation and numerical processing |
| **SQLModel** | ORM for SQLite database (user management) |
| **python-jose** | JWT token generation and validation |
| **Passlib** | Password hashing with bcrypt |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI component framework |
| **Vite** | Lightning-fast build tool and dev server |
| **Tailwind CSS** | Utility-first styling framework |
| **Lucide React** | Premium icon library |
| **Axios** | HTTP client for REST API calls |
| **React Router v6** | Client-side routing and navigation |
| **Canvas API** | High-performance 60 FPS waveform rendering |

---

## 📁 Project Structure

```
Brain-AI-Hybrid-Interface-Simulator/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   ├── decoder.py          # PyTorch neural decoder model
│   │   │   └── user.py             # SQLModel user schema
│   │   ├── routers/
│   │   │   ├── auth.py             # Login/register endpoints
│   │   │   ├── analytics.py        # Session analytics API
│   │   │   ├── eeg.py              # EEG data endpoints
│   │   │   ├── prediction.py       # Prediction results API
│   │   │   └── websocket.py        # WebSocket handler
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   ├── services/               # Business logic layer
│   │   ├── utils/                  # Utility functions
│   │   ├── config.py               # App configuration (JWT secrets, etc.)
│   │   ├── database.py             # SQLite database connection
│   │   └── main.py                 # FastAPI application entry point
│   ├── models/                     # Trained model weights (.pt files)
│   ├── server.py                   # WebSocket telemetry server
│   ├── websocket_server.py         # Alternative WebSocket implementation
│   └── requirements.txt            # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # Main BCI telemetry dashboard
│   │   │   ├── Home.jsx            # Landing page
│   │   │   └── Login.jsx           # Authentication page
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # React auth state management
│   │   ├── services/
│   │   │   └── api.js              # Axios API client
│   │   ├── App.jsx                 # Root component with routing
│   │   ├── App.css                 # Global styles
│   │   └── main.jsx                # React entry point
│   ├── index.html                  # HTML template
│   ├── tailwind.config.cjs         # Tailwind configuration
│   ├── vite.config.js              # Vite configuration
│   └── package.json                # Node.js dependencies
├── start.ps1                       # PowerShell script to launch all servers
├── package.json                    # Root package.json (mono-repo scripts)
└── README.md                       # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+** — [Download](https://www.python.org/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **Git** — [Download](https://git-scm.com/)

### Installation

**1. Clone the Repository**

```bash
git clone https://github.com/NandiniTele/Brain-AI-Hybrid-Interface-Simulator-.git
cd Brain-AI-Hybrid-Interface-Simulator-
```

**2. Set Up the Backend**

```bash
cd backend

# Create a virtual environment (recommended)
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt
```

**3. Set Up the Frontend**

```bash
cd frontend
npm install
```

**4. Start the Application**

You can start all services at once using the PowerShell script:

```powershell
.\start.ps1
```

Or start each service individually:

```bash
# Terminal 1 — WebSocket Server (EEG telemetry)
cd backend
python server.py

# Terminal 2 — FastAPI REST Server
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

# Terminal 3 — React Frontend
cd frontend
npm run dev
```

**5. Open in Browser**

Navigate to `http://localhost:5173` to access the application.

---

## 🎮 Usage

1. **Register / Login** — Create an account or log in to access the dashboard
2. **View the Dashboard** — Observe real-time 8-channel EEG waveforms rendering at 60 FPS
3. **Switch Cognitive States** — Use keyboard controls to simulate different brain states
4. **Monitor Analytics** — Watch focus/stress gauges, emotion indicators, and session history update in real time
5. **Analyze Sessions** — Review cumulative statistics including average metrics and dominant emotions

---

## ⌨️ Keyboard Controls

Press these keys in the **backend terminal** to switch cognitive states:

| Key | State | Description | Focus | Stress |
|-----|-------|-------------|-------|--------|
| `F` | **Focus** | Fast Beta waves — concentrated attention | 88% | 20% |
| `S` | **Stress** | Erratic Gamma waves — high tension | 35% | 85% |
| `C` | **Calm** | Smooth Alpha waves — deep relaxation | 50% | 15% |
| `N` | **Neutral** | Baseline mixed frequencies | 58% | 29% |
| `H` | **Happy** | Elevated Alpha/Beta blend — positive state | 72% | 35% |
| `D` | **Dull** | Theta wave dominant — low engagement | 40% | 22% |

Each state transition is immediately reflected on the dashboard with corresponding waveform pattern changes, updated focus/stress gauges, and emotion indicators.

---

## 🔌 API Endpoints

### REST API (`http://localhost:8001`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate and receive JWT token |
| `GET` | `/api/analytics` | Retrieve session analytics data |
| `GET` | `/api/prediction` | Get latest prediction results |
| `GET` | `/api/eeg` | Fetch EEG data samples |

### WebSocket (`ws://localhost:8000`)

The WebSocket server broadcasts telemetry payloads every **100ms** containing:

```json
{
  "type": "eeg_data",
  "samples": [[...], [...], ...],     // 8 channels × 25 samples each
  "prediction": {
    "focus": 0.88,
    "stress": 0.20,
    "emotion": "Focused"
  },
  "history": [
    {"timestamp": "14:30:25", "focus": 0.87, "stress": 0.21, "emotion": "Focused"}
  ],
  "summary": {
    "average_focus": 0.72,
    "average_stress": 0.31,
    "dominant_emotion": "Focused",
    "total_sessions": 5
  }
}
```

---

## 🔮 Future Enhancements

- [ ] 🧬 **Real EEG Device Integration** — Support for OpenBCI, Muse, and NeuroSky headsets
- [ ] 🤖 **Trained Neural Decoder** — Replace synthetic predictions with a trained deep learning model
- [ ] 📱 **Mobile Responsive Dashboard** — Full mobile/tablet optimized interface
- [ ] 🗄️ **Session Persistence** — Save and replay historical BCI sessions
- [ ] 🌐 **Multi-User Support** — Real-time collaborative brain state monitoring
- [ ] 📊 **Advanced Analytics** — Frequency-domain analysis (FFT), topographic brain maps
- [ ] 🎯 **Neurofeedback Training** — Guided cognitive exercises with real-time feedback loops

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by [Nandini Tele](https://github.com/NandiniTele)**

*Bridging the gap between the human mind and artificial intelligence*

</div>
]]>
