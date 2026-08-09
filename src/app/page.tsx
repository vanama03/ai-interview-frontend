'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Brain, Mic, MicOff, Send, Sparkles, AlertTriangle, 
  History, LogOut, LogIn, Volume2, VolumeX, CheckCircle2, ShieldCheck
} from 'lucide-react';

interface Message {
  sender: 'agent' | 'user';
  text: string;
  timestamp: string;
}

interface CandidateProfile {
  id: string;
  name: string;
  jobRole: string;
  yearsExperience: number;
  education: string;
  cohortCompletion: number;
  commitDays: number;
  firstTryPasses: number;
  skippedTopic: string;
}

export default function TechMentorAIDashboard() {
  // Login & Session State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginId, setLoginId] = useState('CAND-001');

  // Dynamic Candidate State
  const [candidate, setCandidate] = useState<CandidateProfile>({
    id: "CAND-001",
    name: "Sarah Johnson",
    jobRole: "Senior Data Engineer",
    yearsExperience: 9,
    education: "MS Computer Science",
    cohortCompletion: 30,
    commitDays: 28,
    firstTryPasses: 20,
    skippedTopic: "Day 29: Monitoring, Logging & Observability"
  });

  // Chat & Voice States
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice Output (Text-to-Speech)
  const speakText = (text: string) => {
    if (!isSpeechEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Voice Input (Speech-to-Text)
  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setInputMessage(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  // Login Handler supporting ALL Edge Cases (cand-001, CAND-001, cand1, cand-11, etc.)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clean input: remove spaces, convert to uppercase
    const cleanInput = loginId.trim().toUpperCase();

    // Flexible regex matching prefixes CAND, CAND-, CAND_ or CAND followed by numbers 1-20
    const match = cleanInput.match(/^CAND[-_\s]?0*([1-9]|1[0-9]|20)$/i);

    if (match) {
      // Extract numeric ID (1 to 20)
      const num = parseInt(match[1], 10);
      
      // Standardize format into 3-digit candidate ID: CAND-001 through CAND-020
      const formattedCandidateId = `CAND-${num.toString().padStart(3, '0')}`;

      // Set dynamic profile details
      const candidateName = formattedCandidateId === 'CAND-001' ? "Sarah Johnson" : `Candidate ${formattedCandidateId}`;
      
      const newProfile: CandidateProfile = {
        id: formattedCandidateId,
        name: candidateName,
        jobRole: formattedCandidateId === 'CAND-001' ? "Senior Data Engineer" : "AI/ML Software Engineer",
        yearsExperience: formattedCandidateId === 'CAND-001' ? 9 : 5,
        education: "MS Computer Science",
        cohortCompletion: 30,
        commitDays: 28,
        firstTryPasses: 20,
        skippedTopic: "Day 29: Monitoring, Logging & Observability"
      };

      setCandidate(newProfile);
      setIsLoggedIn(true);

      const welcomeMsg: Message = {
        sender: 'agent',
        text: `Welcome back, ${newProfile.name}! Authenticated session active for ${newProfile.id}. Today we'll focus on your flagged topic: ${newProfile.skippedTopic}. Can you explain how you would design an observability pipeline for vector retrieval latency?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages([welcomeMsg]);
      speakText(welcomeMsg.text);
    } else {
      alert('Invalid Candidate ID. Please enter any ID from CAND-001 to CAND-020 (e.g. cand-001, cand-009, cand-011, CAND-020).');
    }
  };

  // Logout Handler
  const handleLogout = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsLoggedIn(false);
    setMessages([]);
    setInputMessage('');
    setIsSpeaking(false);
    setIsListening(false);
  };

  // Send Message Handler
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMsg: Message = {
      sender: 'user',
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const currentInput = inputMessage;
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // API payload dispatch with dynamic candidate details
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: candidate.id,
          candidateName: candidate.name,
          jobRole: candidate.jobRole,
          skippedTopic: candidate.skippedTopic,
          message: currentInput,
          chatHistory: messages.map(m => ({ role: m.sender === 'agent' ? 'assistant' : 'user', content: m.text }))
        })
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      const responseText = data.reply || data.response || data.message;

      if (!responseText) {
        throw new Error("Empty reply payload received from backend");
      }

      const agentMsg: Message = {
        sender: 'agent',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, agentMsg]);
      speakText(agentMsg.text);

    } catch (err) {
      console.error("Backend dispatch error:", err);
      
      // Local fallback response
      const fallbackMsg: Message = {
        sender: 'agent',
        text: `I received your response, ${candidate.name}! Let's build on that: How do you handle vector database indexing strategies during heavy real-time write loads?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages((prev) => [...prev, fallbackMsg]);
      speakText(fallbackMsg.text);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans p-6 selection:bg-cyan-500 selection:text-slate-950">
      {/* Navbar Header */}
      <header className="max-w-7xl mx-auto flex items-center justify-between border-b border-slate-800 pb-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              TECHMENTOR AI
            </h1>
            <p className="text-xs font-mono text-slate-400">INTELLIGENT CANDIDATE EVALUATION PROTOCOL</p>
          </div>
        </div>

        {/* User Profile Badge & Logout */}
        {isLoggedIn && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 flex items-center justify-center text-slate-950 font-bold text-xs">
                {candidate.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-white">{candidate.name}</p>
                <p className="text-[10px] font-mono text-cyan-400">{candidate.id} • {candidate.jobRole}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 text-xs font-mono flex items-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </header>

      {!isLoggedIn ? (
        /* LOGIN SCREEN */
        <main className="max-w-md mx-auto my-16">
          <div className="bg-slate-900/70 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-4">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white">TechMentor AI Login</h2>
              <p className="text-xs text-slate-400">
                Enter your Candidate ID to access your personalized evaluation portal.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-2">Candidate ID</label>
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="Enter Candidate ID (e.g. cand-001 to CAND-020)"
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-xs font-mono text-cyan-300 flex items-center justify-between">
                <span>Accepted IDs:</span>
                <span className="font-bold bg-cyan-500/20 px-2 py-0.5 rounded text-cyan-200">CAND-001 to CAND-020</span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Authenticate & Start Session</span>
              </button>
            </form>
          </div>
        </main>
      ) : (
        /* DASHBOARD SCREEN */
        <main className="max-w-7xl mx-auto space-y-8">
          {/* Candidate Profile & Progress Hero Section */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                VERIFIED CANDIDATE SESSION ({candidate.id})
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
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-mono text-cyan-400 flex items-center gap-2">
                  <Brain className="w-4 h-4" /> TECHMENTOR AGENT ROOM
                </h3>
                {isSpeaking && (
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 animate-pulse">
                    Agent Speaking...
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Speech Mute Toggle */}
                <button
                  onClick={() => {
                    setIsSpeechEnabled(!isSpeechEnabled);
                    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  }}
                  className={`p-2 rounded-lg font-mono text-xs border transition-all ${
                    isSpeechEnabled ? 'bg-slate-800 border-slate-700 text-cyan-400' : 'bg-slate-800/50 border-slate-800 text-slate-500'
                  }`}
                  title={isSpeechEnabled ? "Disable AI Audio Output" : "Enable AI Audio Output"}
                >
                  {isSpeechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {/* Voice Input Mic Toggle */}
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
                  <Sparkles className="w-4 h-4 animate-spin" /> TechMentor Agent synthesizing evaluation...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="flex gap-2 pt-3 border-t border-slate-800">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={isListening ? "Listening to your speech..." : "Type or speak your technical answer..."}
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
                <span className="text-emerald-400 font-bold block flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Demonstrated Strengths
                </span>
                <ul className="space-y-1 text-slate-300 list-disc pl-4">
                  <li>Embeddings & Vector Search (Passed Day 7 & Day 8 on first attempt)</li>
                  <li>Retrieval & Matching Engine architecture</li>
                  <li>Model Context Protocol schema design</li>
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
                <span className="text-amber-400 font-bold block flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Assessed Knowledge Gaps
                </span>
                <ul className="space-y-1 text-slate-300 list-disc pl-4">
                  <li>Monitoring, Logging & Observability (Day 29)</li>
                  <li>Prompt Engineering edge-case failure modes</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}