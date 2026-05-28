import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Brain, Activity, LogOut, Shield, Zap, AlertCircle, 
  ChevronRight, Smile, Flame, Sliders, RefreshCw, BarChart2 
} from 'lucide-react';

// Get API base URL for WebSocket construction
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_URL = API_BASE.replace(/^http/, 'ws') + '/ws';

const BCI_PROTOCOLS = [
  // Relaxation & Focus
  { id: "calm_state", name: "Calm State", instruction: "Relax your mind and breathe slowly while looking at the center point.", category: "Relaxation & Focus", preset: "calm" },
  { id: "focus_state", name: "Focus State", instruction: "Maintain deep focus on the target without moving your eyes.", category: "Relaxation & Focus", preset: "focus" },
  { id: "deep_focus", name: "Deep Focus", instruction: "Concentrate fully on a single object or thought for 15 seconds.", category: "Relaxation & Focus", preset: "deep_focus" },
  { id: "relaxed_eyes_closed", name: "Relaxed Eyes Closed", instruction: "Close your eyes and remain mentally calm and relaxed.", category: "Relaxation & Focus", preset: "alpha_burst" },
  { id: "meditation_state", name: "Meditation State", instruction: "Clear your thoughts and focus only on your breathing.", category: "Relaxation & Focus", preset: "meditation" },
  { id: "breath_focus", name: "Breath Focus", instruction: "Focus only on your breathing rhythm.", category: "Relaxation & Focus", preset: "meditation" },
  { id: "resting_baseline", name: "Resting Baseline", instruction: "Sit quietly without focusing on anything.", category: "Relaxation & Focus", preset: "calm" },
  { id: "neural_idle_state", name: "Neural Idle State", instruction: "Remain mentally inactive and relaxed.", category: "Relaxation & Focus", preset: "calm" },
  { id: "low_attention", name: "Low Attention", instruction: "Relax and avoid concentrating on anything specific.", category: "Relaxation & Focus", preset: "calm" },

  // Emotions & Stress
  { id: "stress_state", name: "Stress State", instruction: "Mentally solve a difficult problem under time pressure.", category: "Emotions & Stress", preset: "stress" },
  { id: "high_stress", name: "High Stress", instruction: "Imagine an urgent situation requiring immediate action.", category: "Emotions & Stress", preset: "high_stress" },
  { id: "excitement", name: "Excitement", instruction: "Imagine receiving exciting news or winning a competition.", category: "Emotions & Stress", preset: "excited" },
  { id: "happy_emotion", name: "Happy Emotion", instruction: "Think about a joyful memory that makes you smile.", category: "Emotions & Stress", preset: "happy" },
  { id: "angry_emotion", name: "Angry Emotion", instruction: "Recall a frustrating or irritating experience.", category: "Emotions & Stress", preset: "angry" },
  { id: "sad_emotion", name: "Sad Emotion", instruction: "Think about a disappointing or emotional moment.", category: "Emotions & Stress", preset: "sad" },
  { id: "fear_response", name: "Fear Response", instruction: "Imagine walking alone in a dangerous environment.", category: "Emotions & Stress", preset: "high_stress" },
  { id: "surprise_response", name: "Surprise Response", instruction: "Imagine hearing unexpected shocking news.", category: "Emotions & Stress", preset: "surprise" },
  { id: "pain_response_simulation", name: "Pain Response Simulation", instruction: "Imagine experiencing mild physical discomfort.", category: "Emotions & Stress", preset: "stress" },
  { id: "social_anxiety", name: "Social Anxiety", instruction: "Imagine speaking before a large audience.", category: "Emotions & Stress", preset: "high_stress" },
  { id: "emotional_switching", name: "Emotional Switching", instruction: "Rapidly alternate between happy and sad thoughts.", category: "Emotions & Stress", preset: "stress" },

  // Motor Imagery
  { id: "left_hand_motor_imagery", name: "Left Hand Motor Imagery", instruction: "Imagine continuously moving your left hand.", category: "Motor Imagery", preset: "motor_left" },
  { id: "right_hand_motor_imagery", name: "Right Hand Motor Imagery", instruction: "Imagine continuously moving your right hand.", category: "Motor Imagery", preset: "motor_right" },
  { id: "both_hands_imagery", name: "Both Hands Imagery", instruction: "Imagine moving both hands together repeatedly.", category: "Motor Imagery", preset: "motor_both" },
  { id: "left_leg_imagery", name: "Left Leg Imagery", instruction: "Imagine moving your left leg.", category: "Motor Imagery", preset: "motor_left" },
  { id: "right_leg_imagery", name: "Right Leg Imagery", instruction: "Imagine moving your right leg.", category: "Motor Imagery", preset: "motor_right" },
  { id: "walking_imagery", name: "Walking Imagery", instruction: "Imagine yourself walking naturally.", category: "Motor Imagery", preset: "calm" },
  { id: "running_imagery", name: "Running Imagery", instruction: "Imagine yourself running quickly.", category: "Motor Imagery", preset: "stress" },

  // Cognitive & Memory
  { id: "attention_training", name: "Attention Training", instruction: "Maintain visual attention on the blinking target.", category: "Cognitive & Memory", preset: "focus" },
  { id: "distraction_state", name: "Distraction State", instruction: "Allow your thoughts to wander naturally.", category: "Cognitive & Memory", preset: "calm" },
  { id: "memory_recall", name: "Memory Recall", instruction: "Recall a detailed personal memory.", category: "Cognitive & Memory", preset: "focus" },
  { id: "visualization_task", name: "Visualization Task", instruction: "Visualize a bright moving object clearly in your mind.", category: "Cognitive & Memory", preset: "focus" },
  { id: "math_cognition", name: "Math Cognition", instruction: "Perform mental arithmetic continuously.", category: "Cognitive & Memory", preset: "focus" },
  { id: "language_task", name: "Language Task", instruction: "Mentally repeat a sentence several times.", category: "Cognitive & Memory", preset: "focus" },
  { id: "silent_speech", name: "Silent Speech", instruction: "Imagine saying the word 'START' repeatedly.", category: "Cognitive & Memory", preset: "focus" },
  { id: "mental_fatigue", name: "Mental Fatigue", instruction: "Remain mentally active for an extended period.", category: "Cognitive & Memory", preset: "calm" },
  { id: "high_alertness", name: "High Alertness", instruction: "Stay extremely attentive to sudden changes.", category: "Cognitive & Memory", preset: "focus" },
  { id: "cognitive_load", name: "Cognitive Load", instruction: "Perform multiple mental tasks simultaneously.", category: "Cognitive & Memory", preset: "focus" },
  { id: "decision_making", name: "Decision Making", instruction: "Choose mentally between two options.", category: "Cognitive & Memory", preset: "focus" },
  { id: "visual_memory", name: "Visual Memory", instruction: "Remember the details of a recently seen image.", category: "Cognitive & Memory", preset: "focus" },
  { id: "sound_imagery", name: "Sound Imagery", instruction: "Imagine hearing your favorite song clearly.", category: "Cognitive & Memory", preset: "happy" },
  { id: "face_imagery", name: "Face Imagery", instruction: "Visualize a familiar person's face.", category: "Cognitive & Memory", preset: "happy" },
  { id: "object_imagery", name: "Object Imagery", instruction: "Visualize a rotating 3D object.", category: "Cognitive & Memory", preset: "focus" },
  { id: "reaction_task", name: "Reaction Task", instruction: "Respond mentally as quickly as possible to stimuli.", category: "Cognitive & Memory", preset: "focus" },

  // Spatial & Commands
  { id: "forward_intent", name: "Forward Intent", instruction: "Imagine pushing an object forward.", category: "Spatial & Commands", preset: "focus" },
  { id: "backward_intent", name: "Backward Intent", instruction: "Imagine pulling an object backward.", category: "Spatial & Commands", preset: "focus" },
  { id: "select_command", name: "Select Command", instruction: "Focus mentally on selecting the highlighted option.", category: "Spatial & Commands", preset: "focus" },
  { id: "cancel_command", name: "Cancel Command", instruction: "Mentally reject the current option.", category: "Spatial & Commands", preset: "focus" },
  { id: "yes_response", name: "Yes Response", instruction: "Strongly think 'YES' without speaking.", category: "Spatial & Commands", preset: "focus" },
  { id: "no_response", name: "No Response", instruction: "Strongly think 'NO' without speaking.", category: "Spatial & Commands", preset: "focus" },
  { id: "intent_to_click", name: "Intent to Click", instruction: "Imagine pressing a button with your finger.", category: "Spatial & Commands", preset: "focus" },
  { id: "intent_to_stop", name: "Intent to Stop", instruction: "Mentally command yourself to stop all movement.", category: "Spatial & Commands", preset: "focus" },
  { id: "cursor_left", name: "Cursor Left", instruction: "Imagine moving a cursor toward the left.", category: "Spatial & Commands", preset: "motor_left" },
  { id: "cursor_right", name: "Cursor Right", instruction: "Imagine moving a cursor toward the right.", category: "Spatial & Commands", preset: "motor_right" },
  { id: "cursor_up", name: "Cursor Up", instruction: "Imagine moving a cursor upward.", category: "Spatial & Commands", preset: "focus" },
  { id: "cursor_down", name: "Cursor Down", instruction: "Imagine moving a cursor downward.", category: "Spatial & Commands", preset: "focus" },
  { id: "robot_control", name: "Robot Control", instruction: "Imagine controlling a robotic arm carefully.", category: "Spatial & Commands", preset: "focus" },
  { id: "drone_control", name: "Drone Control", instruction: "Imagine steering a flying drone forward.", category: "Spatial & Commands", preset: "focus" },

  // Sensorimotor & Artifacts
  { id: "blink_detection", name: "Blink Detection", instruction: "Blink rapidly for five seconds.", category: "Sensorimotor & Artifacts", preset: "blink" },
  { id: "jaw_clench", name: "Jaw Clench", instruction: "Clench your jaw gently and repeatedly.", category: "Sensorimotor & Artifacts", preset: "jaw" },
  { id: "head_movement", name: "Head Movement", instruction: "Slowly turn your head left and right.", category: "Sensorimotor & Artifacts", preset: "calm" },
  { id: "eye_movement_left", name: "Eye Movement Left", instruction: "Move only your eyes toward the left.", category: "Sensorimotor & Artifacts", preset: "motor_left" },
  { id: "eye_movement_right", name: "Eye Movement Right", instruction: "Move only your eyes toward the right.", category: "Sensorimotor & Artifacts", preset: "motor_right" },
  { id: "audio_response", name: "Audio Response", instruction: "Focus on the repeating sound carefully.", category: "Sensorimotor & Artifacts", preset: "focus" },
  { id: "visual_response", name: "Visual Response", instruction: "Focus on the flashing visual stimulus.", category: "Sensorimotor & Artifacts", preset: "focus" },
  { id: "ssvep_training", name: "SSVEP Training", instruction: "Look continuously at the flashing target.", category: "Sensorimotor & Artifacts", preset: "ssvep" },
  { id: "p300_target_task", name: "P300 Target Task", instruction: "Mentally notice the rare flashing symbol.", category: "Sensorimotor & Artifacts", preset: "focus" }
];

const TASK_CATEGORIES = [
  "Relaxation & Focus",
  "Emotions & Stress",
  "Motor Imagery",
  "Cognitive & Memory",
  "Spatial & Commands",
  "Sensorimotor & Artifacts"
];

export default function Dashboard() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // States
  const [activeTab, setActiveTab] = useState('simulation'); // simulation or analytics
  const [operator, setOperator] = useState({ username: 'Operator', email: '' });
  const [wsConnected, setWsConnected] = useState(false);
  const [selectedTask, setSelectedTask] = useState(BCI_PROTOCOLS[0]);
  const [selectedCategory, setSelectedCategory] = useState(TASK_CATEGORIES[0]);
  const [predictions, setPredictions] = useState({
    emotion: { label: 'neutral', confidence: 0.95 },
    focus: 0.62,
    stress: 0.28,
    intent: { action: 'none', confidence: 0.99 }
  });
  
  // Analytics States
  const [historyData, setHistoryData] = useState([]);
  const [summaryData, setSummaryData] = useState({
    average_focus: 0.75,
    average_stress: 0.32,
    dominant_emotion: 'neutral',
    total_sessions: 0,
    total_active_time_minutes: 0
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [manualIntent, setManualIntent] = useState(null);

  // Refs for canvas and websocket
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const animationFrameId = useRef(null);
  const rawSignalBuffer = useRef(Array.from({ length: 8 }, () => Array.from({ length: 300 }, () => 0)));
  const incomingStreamQueue = useRef(Array.from({ length: 8 }, () => []));

  // --- Local Storage Helpers ---
  const generateMockHistory = () => {
    const mock = [];
    const now = new Date();
    for (let i = 8; i >= 0; i--) {
      const pastTime = new Date(now.getTime() - i * 15000);
      mock.push({
        timestamp: pastTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        focus: Math.round((0.50 + Math.random() * 0.25) * 100) / 100,
        stress: Math.round((0.15 + Math.random() * 0.20) * 100) / 100,
        emotion: ['neutral', 'focused', 'relaxed'][Math.floor(Math.random() * 3)],
        protocol: 'Resting Baseline'
      });
    }
    return mock;
  };

  const updateSummaryStats = (sessions) => {
    if (!sessions || sessions.length === 0) {
      setSummaryData({
        average_focus: 0.58,
        average_stress: 0.29,
        dominant_emotion: 'Neutral',
        total_sessions: 0,
        total_active_time_minutes: 0
      });
      return;
    }

    const avgFocus = sessions.reduce((acc, curr) => acc + curr.focus, 0) / sessions.length;
    const avgStress = sessions.reduce((acc, curr) => acc + curr.stress, 0) / sessions.length;
    
    const tally = {};
    sessions.forEach(s => {
      const emo = s.emotion ? s.emotion.toLowerCase() : 'neutral';
      tally[emo] = (tally[emo] || 0) + 1;
    });
    
    let dominant = 'neutral';
    let maxCount = 0;
    Object.entries(tally).forEach(([emo, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominant = emo;
      }
    });

    setSummaryData({
      average_focus: avgFocus,
      average_stress: avgStress,
      dominant_emotion: dominant.charAt(0).toUpperCase() + dominant.slice(1),
      total_sessions: sessions.length,
      total_active_time_minutes: Math.round(sessions.length * 1.5)
    });
  };

  const saveSessionMetrics = () => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newSession = {
      timestamp,
      focus: predictions.focus,
      stress: predictions.stress,
      emotion: predictions.emotion.label,
      protocol: selectedTask ? selectedTask.name : 'Neutral Baseline'
    };

    let saved = [];
    try {
      const localData = localStorage.getItem('bci_sessions');
      if (localData) {
        saved = JSON.parse(localData);
      } else {
        saved = generateMockHistory();
      }
    } catch (e) {
      saved = generateMockHistory();
    }

    saved.push(newSession);
    if (saved.length > 12) saved.shift(); // Keep max 12 items for clean SVG line layouts

    localStorage.setItem('bci_sessions', JSON.stringify(saved));
    setHistoryData(saved);
    updateSummaryStats(saved);
    console.log('[LocalStorage] Saved BCI Telemetry Session:', newSession);
  };

  // Fetch operator profile and analytics
  useEffect(() => {
    if (!token) return;

    const fetchDashboardData = async () => {
      try {
        // Try fetching history
        const historyRes = await api.get('/api/analytics/history');
        setHistoryData(historyRes.data);

        const summaryRes = await api.get('/api/analytics/summary');
        setSummaryData(summaryRes.data);
        
        // Setup username from JWT sub or config
        setOperator({ username: 'BCI Operator 01', email: 'active_session@mindflow.io' });
      } catch (err) {
        console.warn('API error; loading analytics from localStorage: ', err.message);
        
        // Load fallback localStorage data
        try {
          const localData = localStorage.getItem('bci_sessions');
          if (localData) {
            const parsed = JSON.parse(localData);
            setHistoryData(parsed);
            updateSummaryStats(parsed);
          } else {
            const mock = generateMockHistory();
            localStorage.setItem('bci_sessions', JSON.stringify(mock));
            setHistoryData(mock);
            updateSummaryStats(mock);
          }
        } catch (e) {
          console.error('Failed to parse local backup sessions:', e);
        }
        
        setOperator({ username: 'BCI Operator 01', email: 'active_session@mindflow.io' });
      }
    };

    fetchDashboardData();
  }, [token]);

  // WebSockets setup - Connects to local Python telemetry server on port 8000
  useEffect(() => {
    if (!token) return;

    let socket;
    let reconnectTimer;
    let fallbackInterval;

    const connectWS = () => {
      console.log('Connecting to WebSocket on ws://localhost:8000 ...');
      socket = new WebSocket('ws://localhost:8000');
      wsRef.current = socket;

      socket.onopen = () => {
        console.log('WebSocket connected to BCI Backend');
        setWsConnected(true);
        setErrorMsg('');
        if (fallbackInterval) {
          clearInterval(fallbackInterval);
          fallbackInterval = null;
        }
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Support standard payloads and custom fields
          const isEEGType = data.type === 'eeg_data' || data.eeg_data || data.samples;

          if (isEEGType) {
            // Map Focus Level (support data.focus_level, data.prediction.focus_level, and data.prediction.focus)
            const focus = data.focus_level !== undefined ? data.focus_level 
                         : (data.prediction && data.prediction.focus_level !== undefined ? data.prediction.focus_level
                         : (data.prediction && data.prediction.focus !== undefined ? data.prediction.focus : 0.58));
            
            // Map Stress Index (support data.stress_index, data.prediction.stress_index, and data.prediction.stress)
            const stress = data.stress_index !== undefined ? data.stress_index 
                          : (data.prediction && data.prediction.stress_index !== undefined ? data.prediction.stress_index
                          : (data.prediction && data.prediction.stress !== undefined ? data.prediction.stress : 0.29));
            
            // Map Decoded Emotion (support data.decoded_emotion and data.prediction.emotion)
            const emotionLabel = data.decoded_emotion !== undefined ? data.decoded_emotion 
                               : (data.prediction && data.prediction.emotion !== undefined ? data.prediction.emotion : 'neutral');
            
            // Map Spatial Intent (support data.spatial_intent and data.prediction.intent)
            const intentAction = data.spatial_intent !== undefined ? data.spatial_intent 
                               : (data.prediction && data.prediction.intent !== undefined ? (data.prediction.intent.action || data.prediction.intent) : 'none');

            setPredictions({
              focus: focus,
              stress: stress,
              emotion: { label: emotionLabel, confidence: 0.95 },
              intent: { action: intentAction, confidence: 0.99 }
            });

            // Map incoming raw waves (CH1-CH8 or samples list)
            let parsedSamples = null;
            if (data.samples && data.samples.length === 8) {
              parsedSamples = data.samples;
            } else if (data.eeg_data) {
              parsedSamples = [
                data.eeg_data.CH1 || [],
                data.eeg_data.CH2 || [],
                data.eeg_data.CH3 || [],
                data.eeg_data.CH4 || [],
                data.eeg_data.CH5 || [],
                data.eeg_data.CH6 || [],
                data.eeg_data.CH7 || [],
                data.eeg_data.CH8 || []
              ];
            }

            if (parsedSamples) {
              for (let ch = 0; ch < 8; ch++) {
                if (incomingStreamQueue.current[ch].length > 1000) {
                  incomingStreamQueue.current[ch] = [];
                }
                incomingStreamQueue.current[ch].push(...parsedSamples[ch]);
              }
            }

            // Update history and stats
            if (data.history) {
              setHistoryData(data.history);
            }
            if (data.summary) {
              setSummaryData(data.summary);
            }
          }
        } catch (e) {
          console.error('WS parse error:', e);
        }
      };

      socket.onerror = (e) => {
        console.error('WS connection error:', e);
      };

      socket.onclose = () => {
        console.log('WebSocket closed. Retrying connection in 3 seconds...');
        setWsConnected(false);
        reconnectTimer = setTimeout(connectWS, 3000);
        
        // Start local simulation fallback while offline
        if (!fallbackInterval) {
          fallbackInterval = setInterval(simulateLocalDecoder, 1000);
        }
      };
    };

    connectWS();

    return () => {
      clearTimeout(reconnectTimer);
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
      if (socket) {
        socket.close();
      }
    };
  }, [token, selectedTask, manualIntent]);

  // Local BCI Simulator Fallback
  const simulateLocalDecoder = () => {
    if (!selectedTask) return;
    const preset = selectedTask.preset || 'calm';
    
    let focus = 0.5;
    let stress = 0.3;
    let emotion = 'neutral';
    let intent = 'none';

    if (preset === 'focus' || preset === 'deep_focus') {
      focus = 0.85 + Math.random() * 0.1;
      stress = 0.15 + Math.random() * 0.1;
    } else if (preset === 'stress' || preset === 'high_stress') {
      focus = 0.42 + Math.random() * 0.15;
      stress = 0.78 + Math.random() * 0.15;
      emotion = 'angry';
    } else if (preset === 'excited' || preset === 'happy') {
      focus = 0.72 + Math.random() * 0.1;
      stress = 0.35 + Math.random() * 0.15;
      emotion = 'happy';
    } else if (preset === 'sad') {
      focus = 0.40 + Math.random() * 0.1;
      stress = 0.30 + Math.random() * 0.1;
      emotion = 'sad';
    } else if (preset === 'surprise') {
      focus = 0.65 + Math.random() * 0.1;
      stress = 0.45 + Math.random() * 0.1;
      emotion = 'surprised';
    } else if (preset === 'meditation' || preset === 'alpha_burst') {
      focus = 0.80 + Math.random() * 0.1;
      stress = 0.10 + Math.random() * 0.08;
    } else {
      focus = 0.58 + Math.random() * 0.1;
      stress = 0.24 + Math.random() * 0.08;
    }

    // Map intent actions based on preset
    const presetL = preset.toLowerCase();
    if (presetL.includes('left')) {
      intent = 'move_left';
    } else if (presetL.includes('right')) {
      intent = 'move_right';
    } else if (presetL.includes('select') || presetL.includes('forward') || presetL.includes('yes') || presetL.includes('click')) {
      intent = 'select';
    } else if (presetL.includes('cancel') || presetL.includes('backward') || presetL.includes('no') || presetL.includes('stop')) {
      intent = 'cancel';
    }

    if (manualIntent) {
      intent = manualIntent;
      setManualIntent(null);
    }

    setPredictions({
      focus: round(focus),
      stress: round(stress),
      emotion: { label: emotion, confidence: round(0.82 + Math.random() * 0.15) },
      intent: { action: intent, confidence: round(0.85 + Math.random() * 0.14) }
    });
  };

  const round = (val, dec = 2) => Math.round(val * Math.pow(10, dec)) / Math.pow(10, dec);

  // 60FPS scrolling brainwave simulator (Canvas based)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.parentElement.clientWidth;
    let height = canvas.height = 400;

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
      }
    };
    window.addEventListener('resize', handleResize);

    const colors = [
      '#06b6d4', // Cyan
      '#10b981', // Emerald
      '#8b5cf6', // Violet
      '#f59e0b', // Amber
      '#ec4899', // Pink
      '#3b82f6', // Blue
      '#f43f5e', // Rose
      '#14b8a6'  // Teal
    ];

    const draw = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.2)'; // semi-transparent background to create trail
      ctx.fillRect(0, 0, width, height);

      // Draw horizontal channel grids
      const channelHeight = height / 8;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * channelHeight);
        ctx.lineTo(width, i * channelHeight);
        ctx.stroke();
      }

      // Fill buffers with scrolling waves
      const preset = selectedTask ? selectedTask.preset : 'calm';

      for (let ch = 0; ch < 8; ch++) {
        const buffer = rawSignalBuffer.current[ch];
        const queue = incomingStreamQueue.current[ch];
        let newPoints = [];

        // If WS is connected and we have samples in our queue, pull them
        if (wsConnected && queue.length > 0) {
          // At 60 FPS and 256Hz sampling rate, we draw ~4.26 samples per frame.
          // Adjust rate dynamically based on buffer queue backlog to prevent latency.
          let samplesToDraw = 4;
          if (queue.length > 512) {
            samplesToDraw = Math.ceil(queue.length / 30);
          } else {
            samplesToDraw = Math.min(queue.length, 4);
          }

          for (let s = 0; s < samplesToDraw; s++) {
            newPoints.push(queue.shift());
          }
        } else {
          // Local fallback simulation when WS is offline
          let newPoint = 0;
          const timeFactor = Date.now() * 0.001;

          if (preset === 'calm' || preset === 'meditation' || preset === 'alpha_burst') {
            // Dominant Alpha waves (8-12Hz) on occipital electrodes (Channel 7 & 8)
            if (ch >= 6) {
              newPoint = Math.sin(timeFactor * 10 * Math.PI + ch) * 20 + (Math.random() - 0.5) * 2;
            } else {
              newPoint = Math.sin(timeFactor * 6 * Math.PI + ch) * 8 + (Math.random() - 0.5) * 1.5;
            }
          } else if (preset === 'focus' || preset === 'deep_focus') {
            // Strong Beta/Gamma waves (18-35Hz) on frontal channels (Channel 1 & 2)
            if (ch < 2) {
              newPoint = Math.sin(timeFactor * 24 * Math.PI) * 12 + Math.sin(timeFactor * 12 * Math.PI) * 6 + (Math.random() - 0.5) * 3;
            } else {
              newPoint = Math.sin(timeFactor * 8 * Math.PI + ch) * 8 + (Math.random() - 0.5) * 2;
            }
          } else if (preset === 'stress' || preset === 'high_stress') {
            // High-amplitude chaotic noise (Beta/muscle tension) across all channels
            newPoint = Math.sin(timeFactor * 15 * Math.PI + ch) * 28 + (Math.random() - 0.5) * 20;
          } else if (preset === 'excited') {
            // High frequency beta activity, moderate amplitude
            newPoint = Math.sin(timeFactor * 18 * Math.PI) * 18 + Math.sin(timeFactor * 7 * Math.PI) * 8;
          } else if (preset === 'blink') {
            // Periodic frontal eye blink artifacts (massive 80uV spikes on Ch 1 & 2)
            const blinkCycle = Date.now() % 2500;
            if (ch < 2 && blinkCycle < 180) {
              newPoint = Math.sin((blinkCycle / 180) * Math.PI) * 65 + (Math.random() - 0.5) * 4;
            } else {
              newPoint = Math.sin(timeFactor * 9 * Math.PI + ch) * 10 + (Math.random() - 0.5) * 2;
            }
          } else if (preset === 'jaw') {
            // Massive muscle tension high-frequency noise (EMG) on temporal channels (Ch 3, 4, 5)
            if (ch >= 2 && ch <= 4) {
              newPoint = (Math.random() - 0.5) * 55 + Math.sin(timeFactor * 40 * Math.PI) * 10;
            } else {
              newPoint = Math.sin(timeFactor * 8 * Math.PI + ch) * 8 + (Math.random() - 0.5) * 4;
            }
          } else if (preset === 'ssvep') {
            // Steady-State Visual Evoked Potential (Clean 15Hz frequency across visual cortex, Ch 7 & 8)
            if (ch >= 6) {
              newPoint = Math.sin(timeFactor * 15 * Math.PI * 2) * 24 + (Math.random() - 0.5) * 1.5;
            } else {
              newPoint = Math.sin(timeFactor * 7 * Math.PI + ch) * 7 + (Math.random() - 0.5) * 1.5;
            }
          } else if (preset.startsWith('motor_')) {
            const isLeft = preset === 'motor_left' || preset === 'motor_leg_left';
            const isRight = preset === 'motor_right' || preset === 'motor_leg_right';
            
            if (isLeft && ch === 2) {
              newPoint = Math.sin(timeFactor * 10 * Math.PI) * 25 + (Math.random() - 0.5) * 4;
            } else if (isRight && ch === 3) {
              newPoint = Math.sin(timeFactor * 10 * Math.PI) * 25 + (Math.random() - 0.5) * 4;
            } else {
              newPoint = Math.sin(timeFactor * 10 * Math.PI) * 8 + (Math.random() - 0.5) * 2;
            }
          } else {
            // Default baseline rhythm
            newPoint = Math.sin(timeFactor * 9 * Math.PI + ch) * 12 + (Math.random() - 0.5) * 2;
          }
          newPoints.push(newPoint);
        }

        // Push new points to rendering buffer
        for (const pt of newPoints) {
          buffer.shift();
          buffer.push(pt);
        }

        // Draw Channel Path
        ctx.beginPath();
        ctx.strokeStyle = colors[ch];
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 4;
        ctx.shadowColor = colors[ch];

        const centerY = ch * channelHeight + channelHeight / 2;
        const step = width / buffer.length;

        for (let i = 0; i < buffer.length; i++) {
          const x = i * step;
          const y = centerY + buffer[i];
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        ctx.shadowBlur = 0; // reset shadow

        // Label channel
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '9px monospace';
        ctx.fillText(`CH ${ch+1}`, 8, centerY - 6);
      }

      animationFrameId.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [selectedTask, predictions.intent, wsConnected, activeTab]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col relative selection:bg-cyan-500 selection:text-black">
      {/* Background radial glows */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-cyan-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-white/5 bg-slate-900/30 px-6 py-4 flex items-center justify-between sticky top-0 backdrop-blur-md z-40">
        <div className="flex items-center gap-3">
          <Brain className="w-7 h-7 text-cyan-400 animate-pulse" />
          <div>
            <h1 className="text-md font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              BCI telemetry dashboard
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">MindFlow Hybrid-AI Simulator v0.1.0</p>
          </div>
        </div>

        {/* Live WS connection indicator */}
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            wsConnected 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-emerald-400 animate-ping' : 'bg-rose-400 animate-pulse'}`} />
            {wsConnected ? 'WS Online (Live)' : 'WS Offline'}
          </div>

          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            <div className="text-right">
              <p className="text-xs font-semibold text-white">{operator.username}</p>
              <p className="text-[9px] font-mono text-slate-500">{operator.email}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 hover:text-red-400 transition-all border border-white/10"
              title="Terminate Connection"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6 relative z-10">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10">
          <button 
            onClick={() => setActiveTab('simulation')}
            className={`px-5 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-[2px] flex items-center gap-2 cursor-pointer ${
              activeTab === 'simulation' 
                ? 'border-cyan-400 text-cyan-400' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" /> Live Neural Simulation
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`px-5 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-[2px] flex items-center gap-2 cursor-pointer ${
              activeTab === 'analytics' 
                ? 'border-cyan-400 text-cyan-400' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-4 h-4" /> Session Analytics
          </button>
        </div>

        {/* Tab 1: Live Neural Simulation */}
        {activeTab === 'simulation' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: EEG Waves Canvas (8 Columns) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="glass p-6 border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-sm font-bold uppercase tracking-wider">Raw EEG Telemetry Streams</h2>
                  </div>
                  <div className="text-right text-[10px] font-mono text-slate-500">
                    8 Channels / 256Hz Sampling / 60FPS scrolling
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded-xl overflow-hidden border border-white/5 relative">
                  <canvas ref={canvasRef} className="w-full block" />
                  {!wsConnected && (
                    <div className="absolute top-3 right-3 text-[9px] bg-slate-950/80 px-2 py-1 rounded border border-white/10 text-slate-400">
                      Offline playback loop
                    </div>
                  )}
                </div>
              </div>

              {/* BCI Protocol Task Selector */}
              <div className="glass p-6 border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <Sliders className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-sm font-bold uppercase tracking-wider">BCI Protocol Tasks</h2>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Select a cognitive task below to alter the simulated EEG waveforms and decode neural patterns.
                </p>

                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {TASK_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold tracking-wide transition-all cursor-pointer border ${
                        selectedCategory === cat
                          ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                          : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Task Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1" style={{scrollbarWidth: 'thin', scrollbarColor: 'rgba(6,182,212,0.3) transparent'}}>
                  {BCI_PROTOCOLS.filter(t => t.category === selectedCategory).map((task) => (
                    <button
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={`p-2.5 rounded-lg border text-[10px] font-semibold tracking-wide transition-all cursor-pointer text-left ${
                        selectedTask && selectedTask.id === task.id
                          ? 'bg-cyan-500/15 border-cyan-400/50 text-white shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                          : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/15 hover:text-slate-200'
                      }`}
                    >
                      {task.name}
                    </button>
                  ))}
                </div>

                {/* Active Task Instruction */}
                {selectedTask && (
                  <div className="mt-4 p-4 bg-slate-900/70 rounded-xl border border-cyan-500/10 relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full" />
                    <div className="pl-3">
                      <span className="text-[9px] font-mono text-cyan-500/70 uppercase tracking-widest block mb-1">Active Protocol</span>
                      <span className="text-sm font-bold text-white block mb-1">{selectedTask.name}</span>
                      <span className="text-xs text-slate-300 italic">"{selectedTask.instruction}"</span>
                    </div>
                    <button
                      onClick={saveSessionMetrics}
                      className="self-start sm:self-center px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-[10px] font-bold rounded-lg transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.25)] border-0"
                    >
                      SELECT PROTOCOL
                    </button>
                  </div>
                )}

                {/* Manual Intent Triggers */}
                <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                  <span className="text-[10px] text-slate-400 font-semibold flex items-center mr-1">Trigger Intent:</span>
                  {['move_left', 'move_right', 'select', 'cancel'].map((action) => (
                    <button
                      key={action}
                      onClick={() => {
                        setManualIntent(action);
                        if (action === 'select') {
                          saveSessionMetrics();
                        }
                      }}
                      className="px-2.5 py-1 bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 text-[9px] font-mono rounded-lg transition-colors cursor-pointer"
                    >
                      {action.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Decoding Panel / Telemetry (4 Columns) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Telemetry Decoder Results */}
              <div className="glass p-6 border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center gap-2 mb-6">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-sm font-bold uppercase tracking-wider">AI Decoding Results</h2>
                </div>

                <div className="space-y-6">
                  {/* Gauge 1: Attention Level */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400">Focus level</span>
                      <span className="text-cyan-400">{Math.round(predictions.focus * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
                        style={{ width: `${predictions.focus * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Gauge 2: Stress Level */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400">Stress index</span>
                      <span className="text-rose-400">{Math.round(predictions.stress * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-500 to-rose-500 transition-all duration-300 shadow-[0_0_10px_rgba(244,63,94,0.5)]" 
                        style={{ width: `${predictions.stress * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Emotion Decoded card */}
                  <div className="p-4 bg-slate-900/60 rounded-xl border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block uppercase">Decoded emotion</span>
                      <span className="text-md font-bold capitalize text-white">{predictions.emotion.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400">{Math.round(predictions.emotion.confidence * 100)}%</span>
                      {predictions.emotion.label.toLowerCase() === 'stressed' || predictions.emotion.label.toLowerCase() === 'stress' ? (
                        <Flame className="w-5 h-5 text-rose-400 animate-pulse" />
                      ) : (
                        <Smile className="w-5 h-5 text-cyan-400" />
                      )}
                    </div>
                  </div>

                  {/* Intent Decoded Card */}
                  <div className="p-4 bg-slate-900/60 rounded-xl border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block uppercase">Spatial Intent</span>
                      <span className={`text-md font-bold capitalize ${
                        predictions.intent.action !== 'none' ? 'text-yellow-400' : 'text-slate-300'
                      }`}>{predictions.intent.action.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400">{Math.round(predictions.intent.confidence * 100)}%</span>
                      <ChevronRight className={`w-5 h-5 ${predictions.intent.action !== 'none' ? 'text-yellow-400 animate-pulse' : 'text-slate-500'}`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* System logs or parameters */}
              <div className="glass p-6 border-white/10 text-xs">
                <h3 className="font-bold uppercase tracking-wider text-slate-400 mb-3">Model parameters</h3>
                <div className="space-y-2 font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>Model Architecture:</span>
                    <span className="text-white">Conv1D + Transformer</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Channels:</span>
                    <span className="text-white">8 (EEG Electrode Grid)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sampling Interval:</span>
                    <span className="text-white">1000ms packet size</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inference latency:</span>
                    <span className="text-white">~14ms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Session Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Top Cards row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="glass p-6 border-white/10">
                <span className="text-[10px] font-mono text-slate-500 block uppercase">Average focus</span>
                <span className="text-3xl font-extrabold text-cyan-400">{Math.round(summaryData.average_focus * 100)}%</span>
              </div>
              <div className="glass p-6 border-white/10">
                <span className="text-[10px] font-mono text-slate-500 block uppercase">Average stress</span>
                <span className="text-3xl font-extrabold text-rose-400">{Math.round(summaryData.average_stress * 100)}%</span>
              </div>
              <div className="glass p-6 border-white/10">
                <span className="text-[10px] font-mono text-slate-500 block uppercase">Dominant emotion</span>
                <span className="text-3xl font-extrabold text-violet-400 capitalize">{summaryData.dominant_emotion}</span>
              </div>
              <div className="glass p-6 border-white/10">
                <span className="text-[10px] font-mono text-slate-500 block uppercase">Telemetry sessions</span>
                <span className="text-3xl font-extrabold text-white">{summaryData.total_sessions} sessions</span>
              </div>
            </div>

            {/* Main historical trend chart (using premium native SVG lines) */}
            <div className="glass p-6 border-white/10">
              <h2 className="text-sm font-bold uppercase tracking-wider mb-6">Historical Cognitive Trends (Focus vs Stress)</h2>
              
              {historyData.length > 0 ? (
                <div className="relative pt-6">
                  {/* SVG Chart */}
                  <svg viewBox="0 0 800 250" className="w-full h-auto overflow-visible">
                    {/* Grid lines */}
                    <line x1="50" y1="200" x2="750" y2="200" stroke="rgba(255,255,255,0.05)" />
                    <line x1="50" y1="150" x2="750" y2="150" stroke="rgba(255,255,255,0.05)" />
                    <line x1="50" y1="100" x2="750" y2="100" stroke="rgba(255,255,255,0.05)" />
                    <line x1="50" y1="50" x2="750" y2="50" stroke="rgba(255,255,255,0.05)" />

                    {/* Chart Paths */}
                    {(() => {
                      const stepX = 700 / (historyData.length - 1 || 1);
                      let focusPoints = "";
                      let stressPoints = "";

                      historyData.forEach((d, idx) => {
                        const x = 50 + idx * stepX;
                        // Map values (0 to 1) to coordinate system (200 down to 50)
                        const yFocus = 200 - (d.focus * 150);
                        const yStress = 200 - (d.stress * 150);

                        focusPoints += `${idx === 0 ? 'M' : 'L'} ${x} ${yFocus} `;
                        stressPoints += `${idx === 0 ? 'M' : 'L'} ${x} ${yStress} `;
                      });

                      return (
                        <>
                          {/* Focus line */}
                          <path d={focusPoints} fill="none" stroke="#06b6d4" strokeWidth="3" filter="drop-shadow(0 0 5px rgba(6,182,212,0.4))" />
                          {/* Stress line */}
                          <path d={stressPoints} fill="none" stroke="#f43f5e" strokeWidth="3" filter="drop-shadow(0 0 5px rgba(244,63,94,0.4))" />

                          {/* Data points */}
                          {historyData.map((d, idx) => {
                            const x = 50 + idx * stepX;
                            const yFocus = 200 - (d.focus * 150);
                            const yStress = 200 - (d.stress * 150);
                            return (
                              <g key={idx}>
                                <circle cx={x} cy={yFocus} r="4" fill="#06b6d4" />
                                <circle cx={x} cy={yStress} r="4" fill="#f43f5e" />
                                <text x={x} y="225" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle" fontFamily="monospace">
                                  {d.timestamp}
                                </text>
                              </g>
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>

                  {/* Legend */}
                  <div className="flex gap-6 mt-6 justify-center text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-cyan-400 rounded-full" /> Focus Index
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-rose-500 rounded-full" /> Stress Level
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-slate-500 text-xs">
                  Gathering historical data metrics...
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
