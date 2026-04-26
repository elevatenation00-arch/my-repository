import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { 
  Terminal, 
  Settings, 
  Server, 
  Cpu, 
  Play, 
  Loader2, 
  Upload, 
  History as HistoryIcon,
  Zap,
  Activity,
  Layers,
  Shield,
  ExternalLink,
  ChevronRight,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

export default function AdvancedVoiceStudio() {
  const { token, user } = useAuth();
  const [text, setText] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioURL, setAudioURL] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // Advanced Config
  const [serverURL, setServerURL] = useState("http://localhost:8000");
  const [model, setModel] = useState("xtts_v2");
  const [chunkSize, setChunkSize] = useState(120);
  const [language, setLanguage] = useState("en");
  const [stability, setStability] = useState(50);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const addLog = (msg: string, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      message: msg,
      type
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const handleGenerate = async () => {
    if (!text) {
      addLog("Generation blocked: Text script is empty", 'warning');
      return;
    }

    setLoading(true);
    setProgress(0);
    setAudioURL("");
    addLog("Initializing Generation Cycle...", 'info');

    try {
      const formData = new FormData();
      formData.append("text", text);
      if (audioFile) {
        formData.append("voice", audioFile);
        addLog(`Voice sample attached: ${audioFile.name}`, 'info');
      }
      formData.append("model", model);
      formData.append("language", language);
      formData.append("stability", (stability / 100).toString());
      formData.append("chunkSize", chunkSize.toString());

      // Use internal proxy
      const actualServerURL = "/api/local/generate";
      
      for (let pair of formData.entries()) {
        console.log(`[Neural-Debug] ${pair[0]}:`, pair[1]);
      }
      
      const response = await axios.post(actualServerURL, formData, {
        responseType: 'blob',
        headers: {
          "Authorization": token || "",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setProgress(percentCompleted);
          if (percentCompleted < 100) {
            addLog(`Uplinking data: ${percentCompleted}%`, 'info');
          }
        }
      });

      addLog("Neural processing complete. Staging audio stream...", 'success');

      const url = URL.createObjectURL(response.data);
      setAudioURL(url);
      setProgress(100);
      addLog("Voice Synthesis Finalized.", 'success');
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.message;
      addLog(`Terminal Error: ${errMsg}`, 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="px-2 py-0.5 bg-brand-500/10 text-brand-500 rounded text-[10px] font-black uppercase tracking-widest italic">PRO Edition</div>
            <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
              <Database size={12} className="text-zinc-700" />
              Hybrid Cloud/Local
            </div>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter italic flex items-center gap-3">
            <Terminal className="text-brand-500" size={32} />
            Advanced Studio
          </h1>
          <p className="text-zinc-500 text-sm font-bold mt-1 uppercase tracking-tight">Full-stack neuro-synthesis console.</p>
        </div>

        <div className="flex items-center gap-2 px-4 py-3 bg-zinc-950 border border-white/5 rounded-2xl">
          <Activity size={14} className="text-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-white italic uppercase">BGL BRAIN LINK ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Workstation */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] p-8 space-y-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 blur-[100px] -mr-32 -mt-32 transition-all group-hover:bg-brand-500/10" />
            
            <div className="space-y-6 relative">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Neural Input / Script</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-700 italic">
                    <Layers size={12} />
                    Chunking: {chunkSize} words
                  </div>
                </div>
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Initialize neural script sequence here..."
                className="w-full h-80 bg-transparent border-none focus:ring-0 text-white placeholder-zinc-800 resize-none text-2xl font-bold leading-relaxed scrollbar-hide selection:bg-brand-500/30"
              />

              <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-white/5">
                <div className="flex-grow">
                   <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-4 mb-2">Voice Template (.wav/.mp3)</p>
                   <label className="flex items-center justify-between px-6 py-4 bg-zinc-900/30 border border-white/5 rounded-3xl cursor-pointer hover:bg-zinc-900 transition-all group">
                     <div className="flex items-center gap-3">
                       <Upload size={16} className="text-brand-500" />
                       <span className="text-sm font-bold text-zinc-400 italic">
                         {audioFile ? audioFile.name : "Select Reference Sample"}
                       </span>
                     </div>
                     <input 
                       type="file" 
                       className="hidden" 
                       accept="audio/*"
                       onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                     />
                     <div className="px-2 py-1 bg-white/5 rounded text-[8px] font-black text-zinc-500 group-hover:text-white transition-colors">OS BROWSE</div>
                   </label>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !text}
            className="w-full h-20 bg-brand-500 rounded-3xl text-black font-black italic uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 shadow-2xl shadow-brand-500/20 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <Zap size={24} fill="currentColor" />
            )}
            {loading ? "Synthesizing Neurons..." : "Execute Synthesis Cycle"}
          </button>

          {loading && (
            <div className="bg-zinc-950 border border-white/5 rounded-3xl p-6 space-y-3">
              <div className="flex items-center justify-between text-[10px] font-black italic uppercase text-zinc-500">
                <span>Neural Linking</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-brand-500 shadow-[0_0_20px_rgba(255,102,0,0.5)]"
                />
              </div>
            </div>
          )}

          <AnimatePresence>
            {audioURL && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-950 border border-brand-500/20 rounded-[2.5rem] p-8 space-y-6 shadow-2xl shadow-brand-500/10"
              >
                <div className="flex items-center justify-between mb-2">
                   <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">Master Output</h3>
                   <div className="px-3 py-1 bg-brand-500/20 text-brand-500 rounded-full text-[10px] font-black italic uppercase">WAV HQ</div>
                </div>
                <audio src={audioURL} controls className="w-full accent-brand-500" />
                <div className="flex gap-4">
                  <a
                    href={audioURL}
                    download="pro-synthesis-output.wav"
                    className="flex-grow py-5 bg-white text-black rounded-3xl font-black italic uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all shadow-xl"
                  >
                    Export High-Fidelity Master
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* System Console & Config */}
        <div className="space-y-6">
          <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] p-8 space-y-8 shadow-xl">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-white font-black italic uppercase tracking-tighter text-lg">
                  <Settings size={20} className="text-brand-500" />
                  Kernel Config
                </div>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-zinc-700 hover:text-white transition-colors">
                   <Shield size={16} />
                </button>
             </div>

             <div className="space-y-6">
               <div className="space-y-3">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Synthesis Engine</p>
                 <select 
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-4 px-6 text-white text-sm font-bold italic appearance-none focus:outline-none focus:border-brand-500/50 transition-all"
                 >
                    <option value="xtts_v2">XTTS v2 (Neural Engine)</option>
                    <option value="xtts_v2_fast">Fast Neural (Low Latency)</option>
                 </select>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-3">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Language</p>
                   <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-4 px-6 text-white text-[10px] font-bold italic appearance-none focus:outline-none focus:border-brand-500/50 transition-all"
                   >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                      <option value="hi">Hindi</option>
                   </select>
                 </div>

                 <div className="space-y-3">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Stability</p>
                   <div className="flex items-center gap-3 bg-zinc-900 border border-white/5 rounded-2xl py-4 px-6">
                     <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={stability}
                        onChange={(e) => setStability(parseInt(e.target.value))}
                        className="flex-grow accent-brand-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                     />
                     <span className="text-[10px] font-black text-white italic w-6">{stability}%</span>
                   </div>
                 </div>
               </div>

               <div className="space-y-3">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Payload Chunking</p>
                 <div className="grid grid-cols-3 gap-2">
                    {[60, 120, 240].map(size => (
                      <button 
                        key={size}
                        onClick={() => setChunkSize(size)}
                        className={cn(
                          "py-3 rounded-xl text-[10px] font-black italic transition-all border",
                          chunkSize === size ? "bg-brand-500 border-brand-500 text-black shadow-lg" : "bg-zinc-900 border-white/5 text-zinc-500 hover:text-white"
                        )}
                      >
                        {size} Words
                      </button>
                    ))}
                 </div>
               </div>
             </div>
          </div>

          <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] p-8 shadow-xl flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-white font-black italic uppercase tracking-tighter text-sm">
                  <Activity size={16} className="text-emerald-500" />
                  Terminal Logs
                </div>
                <button 
                  onClick={() => setLogs([])}
                  className="text-[10px] font-black text-zinc-700 hover:text-zinc-400 uppercase tracking-widest transition-colors"
                >
                  Clear
                </button>
            </div>

            <div className="flex-grow overflow-y-auto space-y-3 scrollbar-hide font-mono">
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-800 space-y-2">
                   <Cpu size={32} />
                   <p className="text-[10px] font-black uppercase italic">Standby Mode</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="group border-l-2 border-zinc-900 pl-3 py-1 hover:border-brand-500/50 transition-all">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[8px] text-zinc-700 font-bold tracking-tighter uppercase">{log.timestamp}</span>
                      <span className={cn(
                        "text-[8px] font-black px-1 rounded uppercase tracking-tighter",
                        log.type === 'info' && "bg-blue-500/10 text-blue-500",
                        log.type === 'success' && "bg-emerald-500/10 text-emerald-500",
                        log.type === 'error' && "bg-red-500/10 text-red-500",
                        log.type === 'warning' && "bg-orange-500/10 text-orange-500"
                      )}>
                        {log.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">{log.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
