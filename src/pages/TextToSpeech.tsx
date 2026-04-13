import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { 
  Volume2, 
  Settings, 
  Upload, 
  Play, 
  ChevronDown, 
  Zap, 
  Crown,
  Info,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Voice {
  voice_id: string;
  name: string;
  preview_url: string;
  category: string;
}

export default function TextToSpeech() {
  const { user, token, refreshUser } = useAuth();
  const [text, setText] = useState("");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [model, setModel] = useState<"basic" | "premium">("basic");
  const [speed, setSpeed] = useState(1.0);
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("English");

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const languages = [
    "English", "Spanish", "French", "German", "Italian", "Portuguese", "Dutch", "Polish", "Swedish", "Finnish",
    "Czech", "Hindi", "Japanese", "Korean", "Chinese", "Arabic", "Turkish", "Hungarian", "Romanian",
    "Bulgarian", "Danish", "Norwegian", "Slovak", "Ukrainian", "Indonesian", "Malay", "Vietnamese"
  ];

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const creditsToDeduct = wordCount * 4;

  useEffect(() => {
    const fetchVoices = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/voices");
        if (res.ok) {
          const data = await res.json();
          setVoices(data);
          if (data.length > 0) setSelectedVoice(data[0].voice_id);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVoices();
  }, []);

  const handleGenerate = async () => {
    if (!text || !selectedVoice || !token) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify({ text, voiceId: selectedVoice, title })
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        refreshUser();
      } else {
        const err = await res.json();
        if (err.detail?.code === "paid_plan_required") {
          alert("This voice requires a paid ElevenLabs plan. Please select a different voice.");
        } else {
          alert(err.error || "Generation failed");
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const samples = ["Narration", "Conversational", "News", "Story"];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Voice Studio</h1>
          <p className="text-gray-400 mt-1">Generate studio-grade AI voice from your text.</p>
        </div>
        <div className="flex items-center gap-2 text-brand-400 font-medium text-sm">
          <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
          {user?.credits?.toLocaleString()} credits
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 border-white/5 bg-zinc-900/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {samples.map((s) => (
                  <button
                    key={s}
                    className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                <Upload size={14} />
                Upload .txt
              </button>
            </div>

            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Start typing, paste your script, or choose a sample above..."
                className="w-full h-64 bg-transparent border-none focus:ring-0 text-white placeholder-gray-600 resize-none text-lg leading-relaxed"
                maxLength={600000}
              />
              <div className="absolute bottom-0 right-0 text-xs text-gray-500 font-medium">
                {text.length.toLocaleString()} / 600,000
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row gap-4">
              <div className="flex-grow relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Volume2 size={18} className="text-brand-400" />
                    <span>{voices.find(v => v.voice_id === selectedVoice)?.name || "Select a voice..."}</span>
                  </div>
                  <ChevronDown className={cn("transition-transform", isDropdownOpen && "rotate-180")} size={16} />
                </button>
                
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full mb-2 left-0 right-0 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-64 overflow-y-auto"
                    >
                      <div className="p-2 grid grid-cols-1 gap-1">
                        {voices.map((voice) => (
                          <div
                            key={voice.voice_id}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all",
                              selectedVoice === voice.voice_id ? "bg-brand-500/10 text-brand-400" : "text-gray-400 hover:bg-white/5 hover:text-white"
                            )}
                            onClick={() => {
                              setSelectedVoice(voice.voice_id);
                              setIsDropdownOpen(false);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-current" />
                              <span className="font-medium">{voice.name}</span>
                              <span className="text-[10px] opacity-50 uppercase tracking-widest">{voice.category}</span>
                            </div>
                            {voice.preview_url && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const audio = new Audio(voice.preview_url);
                                  audio.play();
                                }}
                                className="p-1.5 rounded-lg hover:bg-white/10 transition-all"
                              >
                                <Play size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex-grow relative">
                <button 
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🌐</span>
                    <span>{language}</span>
                  </div>
                  <ChevronDown className={cn("transition-transform", isLangDropdownOpen && "rotate-180")} size={16} />
                </button>
                
                <AnimatePresence>
                  {isLangDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full mb-2 left-0 right-0 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-64 overflow-y-auto"
                    >
                      <div className="p-2 grid grid-cols-1 gap-1">
                        {languages.map((lang) => (
                          <div
                            key={lang}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all",
                              language === lang ? "bg-brand-500/10 text-brand-400" : "text-gray-400 hover:bg-white/5 hover:text-white"
                            )}
                            onClick={() => {
                              setLanguage(lang);
                              setIsLangDropdownOpen(false);
                            }}
                          >
                            <span className="font-medium">{lang}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500 font-medium px-2">
            <div className="flex items-center gap-1">
              <Zap size={14} className="text-yellow-500" />
              {creditsToDeduct.toLocaleString()} credits · 4× rate
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !text}
            className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Volume2 size={20} />
            )}
            {isGenerating ? "Generating..." : "Generate Voice"}
          </button>

          {audioUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 border-brand-500/20 bg-brand-500/5 space-y-4"
            >
              <div className="flex items-center gap-1 h-8 justify-center">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      height: [8, Math.random() * 24 + 8, 8],
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 0.5 + Math.random() * 0.5,
                      ease: "easeInOut"
                    }}
                    className="w-1 bg-brand-500/40 rounded-full"
                  />
                ))}
              </div>
              <audio src={audioUrl} controls className="w-full" />
              <a
                href={audioUrl}
                download={`${title || "generated-voice"}.mp3`}
                className="w-full py-3 bg-brand-500/20 text-brand-400 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-brand-500/30 transition-all"
              >
                Download Audio
              </a>
            </motion.div>
          )}
        </div>

        {/* Settings Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-6 border-white/5 bg-zinc-900/30 space-y-6">
            <div className="flex items-center gap-2 text-white font-bold">
              <Settings size={18} className="text-gray-400" />
              Settings
            </div>

            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Model</p>
              <div className="space-y-2">
                <button
                  onClick={() => setModel("basic")}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left",
                    model === "basic" 
                      ? "bg-white border-white text-black" 
                      : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Zap size={20} className={model === "basic" ? "text-black" : "text-gray-400"} />
                    <div>
                      <p className="font-bold text-sm">Basic</p>
                      <p className={cn("text-[10px]", model === "basic" ? "text-black/60" : "text-gray-500")}>Fast generation, standard quality</p>
                    </div>
                  </div>
                  {model === "basic" && <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-white" /></div>}
                  {model !== "basic" && <div className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold">Free</div>}
                </button>

                <button
                  onClick={() => setModel("premium")}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left",
                    model === "premium" 
                      ? "bg-white border-white text-black" 
                      : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Crown size={20} className={model === "premium" ? "text-black" : "text-gray-400"} />
                    <div>
                      <p className="font-bold text-sm">Premium</p>
                      <p className={cn("text-[10px]", model === "premium" ? "text-black/60" : "text-gray-500")}>Richer emotion, higher fidelity</p>
                    </div>
                  </div>
                  {model === "premium" && <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-white" /></div>}
                  {model !== "premium" && <div className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-400 text-[10px] font-bold">+1× credits</div>}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Speed</p>
                <span className="text-xs text-white font-bold">Normal {speed}×</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-bold">
                <span>0.5×</span>
                <span>1.0×</span>
                <span>2.0×</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border-white/5 bg-zinc-900/30 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Speech title</p>
              <Info size={14} className="text-gray-600" />
            </div>
            <p className="text-[10px] text-gray-500">Used for downloads and history</p>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Product announcement"
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
