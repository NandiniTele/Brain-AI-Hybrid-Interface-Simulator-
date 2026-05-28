import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Activity, Cpu, Shield, TrendingUp, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative font-sans selection:bg-cyan-500 selection:text-black">
      {/* Decorative Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/70 border-b border-white/5 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto rounded-b-2xl">
        <div className="flex items-center gap-2">
          <Brain className="w-8 h-8 text-cyan-400 animate-pulse" />
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            MindFlow AI
          </span>
        </div>
        <nav className="flex items-center gap-6">
          <Link to="/login" className="px-4 py-2 text-sm font-medium hover:text-cyan-400 transition-colors">
            Login
          </Link>
          <Link 
            to="/login" 
            className="px-4 py-2 text-sm font-medium bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all hover:scale-105"
          >
            Launch Console
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20 relative z-10 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-cyan-300 mb-8 animate-bounce">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          Live BCI Neural Decoders Online
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl leading-tight">
          Simulate the Future of{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
            Brain–AI Co-Processing
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
          MindFlow bridges electroencephalography (EEG) signals with state-of-the-art neural networks to decode human emotions, intents, and focus patterns in real-time.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all hover:scale-105 active:scale-95 group"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="flex items-center justify-center px-8 py-4 text-base font-semibold bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all"
          >
            Create Account
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl text-left">
          {/* Card 1 */}
          <div className="glass p-8 group hover:border-cyan-500/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors" />
            <Activity className="w-10 h-10 text-cyan-400 mb-6" />
            <h3 className="text-xl font-bold mb-2">Live EEG Streaming</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Visualize raw 8-channel brainwave simulations in high-fidelity 60 FPS charts. Simulate and stream signal impulses over persistent WebSockets.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass p-8 group hover:border-blue-500/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
            <Cpu className="w-10 h-10 text-blue-400 mb-6" />
            <h3 className="text-xl font-bold mb-2">Cognitive ML Decoder</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Leverage custom deep neural networks to extract attention levels, stress responses, emotional labels, and spatial movement intent values.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass p-8 group hover:border-indigo-500/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
            <TrendingUp className="w-10 h-10 text-indigo-400 mb-6" />
            <h3 className="text-xl font-bold mb-2">Advanced Analytics</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Track cognitive changes over time. Aggregate session average focus, stress tolerance limits, and dominant emotions through interactive graphs.
            </p>
          </div>
        </section>

        {/* Info Banner */}
        <div className="mt-24 p-6 rounded-2xl border border-white/5 bg-slate-900/40 w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
          <div>
            <h4 className="text-base font-semibold text-white mb-1">Secure Hybrid BCI Simulation Environment</h4>
            <p className="text-slate-400 text-xs">Uses cryptographic JWT authorization, SQLModel architecture, and standard CORS policies.</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              <Shield className="w-4 h-4" /> Secure API Connection
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-20 text-center text-xs text-slate-600 max-w-7xl mx-auto">
        &copy; 2026 MindFlow Brain-AI Hybrid Interface Simulator. Built using FastAPI & SQLModel backend + React & Tailwind frontend.
      </footer>
    </div>
  );
}
