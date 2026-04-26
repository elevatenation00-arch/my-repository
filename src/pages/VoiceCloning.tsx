import React, { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import { 
  Mic2, 
  Upload, 
  Play, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  Shield,
  Sparkles,
  Info,
  Clock,
  AudioWaveform as Waveform,
  Download,
  Share2,
  HelpCircle,
  ChevronRight,
  Volume2,
  Cpu,
  Cloud
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GenerationChunk {
  id: number;
  text: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  audioUrl?: string;
}

export default function VoiceCloning() {
  const { user, token } = useAuth();
  const [text, setText] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [chunks, setChunks] = useState<GenerationChunk[]>([]);
  const [outputUrl, setOutputUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState<'local'>('local');

  const fileInputRef = useRef<HTMLInputElement>(null);

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
              Account restricted. Voice cloning requires an <span className="text-white">approved identity</span>. Please activate your professional plan to continue.
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
              Verify & Activate
            </motion.a>
            <p className="text-[10px] text-zinc-700 font-bold italic uppercase tracking-widest leading-relaxed">
              Contact our studio team via WhatsApp if you've already submitted a request.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 20 * 1024 * 1024) {
        setError("Reference audio must be under 20MB");
        return;
      }
      setAudioFile(file);
      setError(null);
    }
  };

  const chunkText = (input: string, size = 120) => {
    const words = input.trim().split(/\s+/);
    let parts: string[] = [];
    for (let i = 0; i < words.length; i += size) {
      parts.push(words.slice(i, i + size).join(" "));
    }
    return parts;
  };

  const handleGenerate = async () => {
    if (!text || !audioFile) {
      setError("Please provide both a script and a reference voice sample.");
      return;
    }

    setLoading(true);
    setProgress(0);
    setOutputUrl("");
    setError(null);

    const parts = chunkText(text, 120);
    const initialChunks = parts.map((p, i) => ({
      id: i,
      text: p,
      status: 'pending' as const
    }));
    setChunks(initialChunks);

    try {
      // LOCAL XTTS v2 MODE (FastAPI)
      const formData = new FormData();
      formData.append("text", text);
      if (audioFile) {
        formData.append("voice", audioFile);
      }
      formData.append("model", "xtts_v2");
      formData.append("chunkSize", "120");
      
      for (let pair of formData.entries()) {
        console.log(`[Clone-Debug] ${pair[0]}:`, pair[1]);
      }

      const response = await axios.post("/api/local/clone-voice", formData, {
        headers: { 
          "Authorization": token || ""
        },
        onUploadProgress: (progressEvent) => {
           const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
           setProgress(percentCompleted);
        },
        validateStatus: (status) => status < 500 // Allow 4xx to be caught in catch block with response data
      });

      const audioId = response.headers['x-audio-id'];
      if (response.status === 200 && audioId) {
        setOutputUrl(`/api/history/audio/${audioId}`);
        setProgress(100);
      } else {
        throw new Error(response.data?.error || "Neural Splicing Failed");
      }
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.message);
      } else {
        setError("An error occurred during cloning.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black tracking-[0.2em] text-zinc-600 uppercase mb-2">ADVANCED STUDIO</p>
          <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">Voice Cloning</h1>
          <p className="text-zinc-500 text-sm font-bold mt-1">Transform any script into a digital twin of your reference voice.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-zinc-400 font-black text-[10px] italic bg-zinc-900/50 px-4 py-3 border border-white/5 rounded-2xl">
            <Zap size={14} className="text-zinc-600" />
            PROFESSIONAL GRADE
          </div>
          <div className="flex items-center gap-2 text-white font-black text-[10px] italic bg-zinc-900 px-4 py-3 border border-white/5 rounded-2xl">
            <Clock size={14} className="text-zinc-600" />
            2.4x SPEED
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {[
          { label: 'ENGINE', value: 'XTTS v2 NEXT-GEN', icon: Cpu },
          { label: 'LATENCY', value: '1.2ms (EDGE)', icon: Zap },
          { label: 'SECURITY', value: 'LOCAL-FIRST (OFFLINE)', icon: Waveform },
        ].map((item, i) => (
          <div key={i} className="p-6 rounded-[2rem] bg-zinc-950 border border-white/5 space-y-2 group">
            <div className="flex items-center gap-3 text-zinc-600">
              <item.icon size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </div>
            <p className="text-sm font-black text-white italic uppercase tracking-tighter">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Controls */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-zinc-950 border border-white/5 rounded-[3rem] p-8 space-y-8 shadow-2xl">
            {/* Reference Upload */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Reference Voice</p>
                <HelpCircle size={14} className="text-zinc-800" />
              </div>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative group cursor-pointer transition-all duration-500",
                  audioFile ? "scale-100" : "hover:scale-[1.01]"
                )}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="audio/*"
                  className="hidden" 
                />
                <div className={cn(
                  "w-full rounded-[2.5rem] border-2 border-dashed p-10 flex flex-col items-center gap-4 transition-all",
                  audioFile 
                    ? "bg-zinc-900/50 border-white/20" 
                    : "bg-zinc-900/20 border-white/5 hover:bg-zinc-900/40 hover:border-white/10"
                )}>
                  {audioFile ? (
                    <>
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-black shadow-2xl">
                        <CheckCircle2 size={32} />
                      </div>
                      <div className="text-center">
                        <p className="text-white font-black italic uppercase tracking-tight text-lg">{audioFile.name}</p>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase mt-1">{(audioFile.size / 1024 / 1024).toFixed(2)} MB • READY TO CLONE</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-700 group-hover:text-zinc-500 transition-colors">
                        <Upload size={32} />
                      </div>
                      <div className="text-center">
                        <p className="text-zinc-400 font-black italic uppercase tracking-tight text-lg">Upload Voice Sample</p>
                        <p className="text-[10px] text-zinc-700 font-bold uppercase mt-1 tracking-widest">WAV / MP3 • 30s-1m recommended</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Script Textarea */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Clone Script</p>
                <span className="text-[10px] text-zinc-800 font-bold">{text.length.toLocaleString()} CHARS</span>
              </div>
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your long-form script here... BG LABS will automatically chunk and process it for optimal quality."
                  className="w-full h-64 bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 text-white placeholder-zinc-800 focus:outline-none focus:border-white/10 transition-all resize-none font-medium italic text-lg leading-relaxed shadow-inner"
                />
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-500 text-xs font-bold italic"
                >
                  <AlertCircle size={16} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !text || !audioFile}
              className={cn(
                "w-full h-20 rounded-[2.5rem] flex items-center justify-center gap-4 transition-all font-black text-xl italic uppercase tracking-tighter shadow-2xl",
                loading || !text || !audioFile
                  ? "bg-zinc-900 text-zinc-700 cursor-not-allowed"
                  : "bg-white text-black hover:scale-[0.98] hover:shadow-white/10 active:scale-95"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Cloning Sequences...
                </>
              ) : (
                <>
                  <Zap size={24} />
                  Initialize Clone
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sidebar / Progress */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-950 border border-white/5 rounded-[3rem] p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Processing Status</p>
              {loading && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
            </div>
            
            {loading ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-white italic">{progress}%</span>
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-600 font-bold uppercase leading-none mb-1">SEQUENCES</p>
                    <p className="text-white font-black italic">{chunks.length}</p>
                  </div>
                </div>
                <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-white shadow-[0_0_20px_white]"
                  />
                </div>
                
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {chunks.map((chunk, i) => (
                    <div key={i} className="flex items-center justify-between gap-4 p-4 bg-zinc-900/30 rounded-2xl border border-white/5 transition-all">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          chunk.status === 'completed' ? "bg-white" : chunk.status === 'processing' ? "bg-zinc-500 animate-pulse" : "bg-zinc-800"
                        )} />
                        <p className="text-[10px] text-zinc-500 font-bold uppercase truncate max-w-[150px]">Sequence #{i + 1}</p>
                      </div>
                      {chunk.status === 'completed' ? (
                        <CheckCircle2 size={12} className="text-zinc-600" />
                      ) : chunk.status === 'processing' ? (
                        <Loader2 size={12} className="text-zinc-400 animate-spin" />
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : outputUrl ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8 py-4"
              >
                <div className="relative">
                  <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center text-black mx-auto shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                    <Waveform size={40} />
                  </div>
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-white/20 rounded-full blur-2xl"
                  />
                </div>
                
                <div className="text-center space-y-1">
                  <h3 className="text-white font-black italic text-2xl uppercase tracking-tight">Clone Ready</h3>
                  <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">Composite sequence generated</p>
                </div>
                
                <div className="p-2 bg-zinc-900 rounded-[1.5rem] border border-white/5">
                  <audio src={outputUrl} controls className="w-full h-12 grayscale invert" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <a 
                    href={outputUrl} 
                    download={`${title || 'cloned-voice'}.mp3`}
                    className="col-span-1 h-14 bg-white text-black rounded-2xl flex items-center justify-center gap-2 font-black italic text-sm hover:scale-[0.98] transition-all"
                  >
                    <Download size={16} />
                    SAVE
                  </a>
                  <button className="col-span-1 h-14 bg-zinc-900 border border-white/5 rounded-2xl flex items-center justify-center gap-2 text-zinc-400 font-bold italic text-sm hover:text-white transition-all">
                    <Share2 size={16} />
                    SHARE
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="py-20 text-center space-y-6">
                <div className="w-20 h-20 bg-zinc-900 rounded-[2rem] flex items-center justify-center text-zinc-800 mx-auto border border-white/5">
                  <Mic2 size={32} />
                </div>
                <div className="space-y-2">
                  <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em]">Waiting for sync</p>
                  <p className="text-zinc-800 text-xs font-bold leading-relaxed px-8">
                    Upload a reference and paste your script to begin the cloning sequence.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Project Details Footer */}
          <div className="bg-zinc-950 border border-white/5 rounded-[3rem] p-8 space-y-6 shadow-xl">
             <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4">PROJECT IDENTITY</p>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="UNNAMED_CLONE_01"
                className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-4 px-6 text-white text-sm font-black italic placeholder-zinc-800 focus:outline-none focus:border-white/20 transition-all"
              />
            </div>
            
            <div className="p-6 bg-zinc-900/40 rounded-[2rem] border border-white/5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                  <Info size={14} />
                </div>
                <p className="text-[10px] text-zinc-500 font-black uppercase">Studio Notes</p>
              </div>
              <p className="text-[11px] text-zinc-600 font-bold leading-relaxed italic">
                Advanced cloning uses state-of-the-art neural splicing. Long texts are accurately maintained by processing individual emotional beats across sequences.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
