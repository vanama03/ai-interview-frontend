'use client';

import React, { useState } from 'react';
import { 
  Brain, Mic, MicOff, Send, Sparkles, AlertTriangle, 
  ArrowRight, History, RotateCcw, Award, CheckCircle2, User, ChevronRight
} from 'lucide-react';

export default function SingleCandidateDashboard() {
  // Hardcoded logged-in candidate CAND-001 (Sarah Johnson)
  const candidate = {
    id: "CAND-001",
    name: "Sarah Johnson",
    jobRole: "Senior Data Engineer",
    yearsExperience: 9,
    education: "MS Computer Science",
    cohortCompletion: 30, // 30 of 31 days
    commitDays: 28,
    firstTryPasses: 20,
    skippedTopic: "Day 29: Monitoring, Logging & Observability"
  };

  const [messages, setMessages] = useState([
    {
      sender: 'agent',
      text: `Welcome back, Sarah! I see you completed 30 of 31 cohort missions. Today we'll focus on your flagged topic: ${candidate.skippedTopic}. Can you explain how you would design an observability pipeline for vector retrieval latency?`,
      timestamp: '10:00 AM'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      setInputMessage(event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMsg = {
      sender: 'user',
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text })
      });
      const data = await res.json();

      const agentMsg = {
        sender: 'agent',
        text: data.reply || "Good explanation! Moving forward: How do you manage vector index updates without impacting read throughput?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'agent',
            text: "Received! Let's touch on Model Context Protocol (MCP): How would you secure a tool server from executing unintended side-effects?",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setIsLoading(false);
      }, 800);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans p-6">
      {/* Top Navbar */}
      <header className="max-w-7xl mx-auto flex items-center justify-between border-b border-slate-800 pb-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              NEURAL INTERVIEW COMMAND CENTER
            </h1>
            <p className="text-xs font-mono text-slate-400">PERSONALIZED CANDIDATE EVALUATION PROTOCOL</p>
          </div>
        </div>

        {/* User Profile Badge */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 flex items-center justify-center text-slate-950 font-bold text-xs">
            SJ
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-white">{candidate.name}</p>
            <p className="text-[10px] font-mono text-cyan-400">{candidate.id} • {candidate.jobRole}</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        {/* Candidate Profile & Progress Hero Section */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              VERIFIED CANDIDATE SESSION
            </div>
            <h2 className="text-2xl font-bold text-white">Welcome back, {candidate.name}</h2>
            <p className="text-xs text-slate-400">
              Your technical interview is dynamically tailored to your 31-day AI Cohort performance logs and targeted learning gaps.
            </p>

            <div className="pt-2">
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Cohort Completion Rate</span>
                <span className="text-cyan-400 font-bold">30 / 31 Days (96%)</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 w-[96%]" />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs font-mono text-slate-400">PERFORMANCE SIGNALS</span>
            <div className="space-y-2 my-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Commit Days:</span>
                <span className="font-mono text-cyan-400 font-bold">{candidate.commitDays} Days</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">First-Try Passes:</span>
                <span className="font-mono text-emerald-400 font-bold">{candidate.firstTryPasses} Missions</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Verified via Cohort Telemetry</span>
          </div>

          {/* Flagged Knowledge Gaps */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs font-mono text-amber-400 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> TARGETED KNOWLEDGE GAP
            </span>
            <div className="my-2">
              <p className="text-xs font-semibold text-slate-200">{candidate.skippedTopic}</p>
              <p className="text-[10px] text-slate-400 mt-1">Skipped during cohort; prioritized for evaluation today.</p>
            </div>
            <span className="text-[10px] font-mono text-amber-400/80">Priority Focus Area</span>
          </div>
        </div>

        {/* Live Technical Evaluation Chat */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 flex flex-col h-[520px]">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-sm font-mono text-cyan-400 flex items-center gap-2">
              <Brain className="w-4 h-4" /> AI EVALUATION INTERVIEW ROOM
            </h3>
            <button 
              onClick={toggleVoiceInput}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs flex items-center gap-2 border transition-all ${
                isListening 
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse' 
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              {isListening ? 'Listening...' : 'Voice Input'}
            </button>
          </div>

          {/* Chat Messages Container */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                  msg.sender === 'user' 
                    ? 'bg-cyan-600/20 border border-cyan-500/30 text-cyan-100 rounded-br-none' 
                    : 'bg-slate-800/80 border border-slate-700/80 text-slate-200 rounded-bl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span className="text-[10px] font-mono text-slate-500 mt-2 block text-right">{msg.timestamp}</span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <Sparkles className="w-4 h-4 animate-spin" /> AI Synthesizing response...
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="flex gap-2 pt-3 border-t border-slate-800">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your technical answer here..."
              className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading}
              className="px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center justify-center transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Evaluation History Section */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-mono text-slate-400 flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-cyan-400" /> EVALUATION HISTORY FOR {candidate.id}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
              <span className="text-emerald-400 font-bold block">Demonstrated Strengths</span>
              <ul className="space-y-1 text-slate-300 list-disc pl-4">
                <li>Embeddings & Vector Search (Passed Day 7 & Day 8 on first attempt)</li>
                <li>Retrieval & Matching Engine architecture</li>
                <li>Model Context Protocol schema design</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
              <span className="text-amber-400 font-bold block">Assessed Knowledge Gaps</span>
              <ul className="space-y-1 text-slate-300 list-disc pl-4">
                <li>Monitoring, Logging & Observability (Day 29)</li>
                <li>Prompt Engineering edge-case failure modes</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}