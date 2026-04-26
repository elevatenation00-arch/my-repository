import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { 
  Volume2, 
  Settings, 
  Upload, 
  Play, 
  ChevronDown, 
  Sparkles,
  Shield,
  Zap, 
  Crown,
  MessageCircle,
  HelpCircle,
  ChevronRight,
  Square
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TextToSpeech() {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [title, setTitle] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoiceURI) {
        // Try to find a nice English voice by default
        const preferred = availableVoices.find(v => v.lang.includes("en-US") || v.lang.includes("en-GB")) || availableVoices[0];
        setSelectedVoiceURI(preferred.voiceURI);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleGenerate = () => {
    if (!text || !selectedVoiceURI) return;
    
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find(v => v.voiceURI === selectedVoiceURI);
    if (voice) utterance.voice = voice;
    
    utterance.rate = speed;
    utterance.pitch = pitch;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const samples = ["Hello! This is a test of the local neural browser synthesis.", "The quick brown fox jumps over the lazy dog.", "Welcome to the future of unlimited AI speech generation."];

  if (user && user.role !== 'admin' && user.isApproved === false) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-zinc-950 border border-white/5 rounded-[3rem] p-12 text-center space-y-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent" />
          <div className="w-20 h-20 bg-brand-500/10 rounded-3xl flex items-center justify-center text-brand-400 mx-auto animate-pulse">
            <Shield size={40} />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Activation Required</h2>
            <p className="text-zinc-500 text-sm font-bold italic leading-relaxed">
              Your account is currently in <span className="text-white">pending status</span>. Please activate your plan.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <motion.a 
              href="/pricing"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-5 bg-white text-black rounded-2xl font-black italic uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all"
            >
              <Sparkles size={16} />
              Go to Pricing
            </motion.a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black tracking-[0.2em] text-zinc-600 uppercase mb-2">LOCAL SYNTHESIS STUDIO</p>
          <h1 className="text-4xl font-black text-white tracking-tighter italic">Browser Speech</h1>
          <p className="text-zinc-500 text-sm font-bold mt-1">Unlimited, free, and instant voice generation.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-zinc-400 font-black text-[10px] italic bg-zinc-900/50 px-4 py-3 border border-white/5 rounded-2xl">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            BROWSER ENGINE ACTIVE
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mr-2">Samples:</span>
                {samples.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setText(s)}
                    className="px-4 py-1.5 rounded-xl bg-zinc-900 border border-white/5 text-[10px] font-black italic text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all uppercase tracking-tight"
                  >
                    Short Sample {i + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Start typing script here..."
                className="w-full h-80 bg-transparent border-none focus:ring-0 text-white placeholder-zinc-800 resize-none text-xl font-bold leading-relaxed scrollbar-hide"
              />
              <div className="absolute bottom-0 right-0 p-4">
                <span className="text-[10px] text-zinc-600 font-black italic uppercase">
                  {text.length.toLocaleString()} CHARS
                </span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] p-6 lg:p-8 space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow relative">
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-4 mb-2">SELECT VOICE</p>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between px-6 py-4 bg-zinc-900/50 border border-white/5 rounded-3xl text-sm italic font-black text-zinc-400 hover:bg-zinc-900 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-600 italic">🎤</span>
                    <span>{voices.find(v => v.voiceURI === selectedVoiceURI)?.name || "Detecting voices..."}</span>
                  </div>
                  <ChevronDown className={cn("transition-transform text-zinc-700", isDropdownOpen && "rotate-180")} size={16} />
                </button>
                
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full mb-4 left-0 right-0 bg-zinc-950 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto scrollbar-hide p-2"
                    >
                      <div className="grid grid-cols-1 gap-1">
                        {voices.map((voice) => (
                          <div
                            key={voice.voiceURI}
                            className={cn(
                              "flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all",
                              selectedVoiceURI === voice.voiceURI ? "bg-white text-black font-black italic shadow-xl" : "text-zinc-500 hover:bg-white/5 hover:text-white"
                            )}
                            onClick={() => {
                              setSelectedVoiceURI(voice.voiceURI);
                              setIsDropdownOpen(false);
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="font-bold">{voice.name}</span>
                              <span className="text-[9px] opacity-50 uppercase tracking-widest font-black">{voice.lang}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleGenerate}
                disabled={isSpeaking || !text}
                className="flex-grow h-16 bg-white text-black rounded-3xl font-black italic uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all disabled:opacity-50 group"
              >
                <Play size={20} fill="currentColor" className="group-hover:translate-x-1 transition-transform" />
                {isSpeaking ? "Speaking..." : "Start Playback"}
              </button>

              {isSpeaking && (
                <button
                  onClick={handleStop}
                  className="w-16 h-16 bg-red-500 text-white rounded-3xl flex items-center justify-center hover:bg-red-600 transition-all shadow-2xl shadow-red-500/20"
                >
                  <Square size={20} fill="currentColor" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="basis-1/3 space-y-4">
          <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] p-8 space-y-8">
            <div className="flex items-center gap-3 text-white font-black italic uppercase tracking-tighter text-xl">
              <Settings size={22} className="text-zinc-600" />
              Settings
            </div>

            <div className="space-y-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Speed Control</p>
              <div className="space-y-4">
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full h-1 bg-zinc-900 rounded-full appearance-none cursor-pointer accent-white"
                />
                <div className="flex justify-between text-[9px] text-zinc-700 font-black italic uppercase px-1">
                  <span>Slow</span>
                  <span>1.0x</span>
                  <span>Fast</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Pitch Control</p>
              <div className="space-y-4">
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-full h-1 bg-zinc-900 rounded-full appearance-none cursor-pointer accent-white"
                />
                <div className="flex justify-between text-[9px] text-zinc-700 font-black italic uppercase px-1">
                  <span>Deep</span>
                  <span>Normal</span>
                  <span>High</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-8">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Sparkles size={12} />
              Unlimited Free Mode
            </p>
            <p className="text-xs text-zinc-500 font-bold italic leading-relaxed">
              You are currently using the built-in browser engine. Enjoy unlimited synthesis with zero credit usage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
