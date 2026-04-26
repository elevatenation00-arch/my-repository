import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  Settings, 
  Play, 
  ChevronDown, 
  Zap, 
  Crown,
  Loader2,
  Download,
  Share2,
  Mic2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Avatar {
  id: string;
  name: string;
  style: string;
  thumbnail: string;
}

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const AVATARS: Avatar[] = [
  { id: "marcus", name: "Marcus (Professional)", style: "Professional", thumbnail: "https://picsum.photos/seed/marcus/400/400" },
  { id: "elena", name: "Elena (Professional)", style: "Professional", thumbnail: "https://picsum.photos/seed/elena/400/400" },
  { id: "david", name: "David (Casual)", style: "Casual", thumbnail: "https://picsum.photos/seed/david/400/400" },
  { id: "sophie", name: "Sophie (Casual)", style: "Casual", thumbnail: "https://picsum.photos/seed/sophie/400/400" },
];

export default function AvatarSystem() {
  const { user, token } = useAuth();
  const [text, setText] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string>(AVATARS[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      } else {
        setHasApiKey(true);
      }
    };
    checkApiKey();
  }, []);

  const handleOpenSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleGenerate = async () => {
    if (!text || !token) return;
    setIsGenerating(true);
    setProgress(10);
    setResultUrl(null);

    try {
      // Mock generation progress
      for (let i = 20; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setProgress(i);
      }
      
      // Mock result
      setResultUrl("https://example.com/mock-avatar-result.mp4");
    } catch (error) {
      console.error("Avatar generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black tracking-[0.2em] text-zinc-600 uppercase mb-2">IMMERSIVE PERSPECTIVE</p>
          <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">Avatar System</h1>
          <p className="text-zinc-500 text-sm font-bold mt-1">Create interactive AI avatars that speak and express your content.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-zinc-950 border border-white/5 rounded-[3rem] p-8 space-y-8 shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">PRODUCTION SCRIPT</p>
                <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold">
                  {text.length} CHARS
                </div>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter the script for your avatar to speak... The avatar will perform with natural emotion and timing based on your text."
                className="w-full h-64 bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 text-white placeholder-zinc-800 focus:outline-none focus:border-white/10 transition-all resize-none font-medium italic text-lg leading-relaxed shadow-inner"
              />
            </div>
            
            <div className="relative">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4 px-2">Cast Selection</p>
              <button 
                onClick={() => setIsAvatarDropdownOpen(!isAvatarDropdownOpen)}
                className="w-full flex items-center justify-between px-6 py-5 bg-zinc-900/50 border border-white/5 rounded-[2rem] text-white hover:bg-zinc-900 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black group-hover:rotate-12 transition-transform">
                    <User size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black italic uppercase tracking-tight leading-none mb-1">
                      {AVATARS.find(a => a.id === selectedAvatar)?.name}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{AVATARS.find(a => a.id === selectedAvatar)?.style}</p>
                  </div>
                </div>
                <ChevronDown className={cn("transition-transform text-zinc-600", isAvatarDropdownOpen && "rotate-180")} size={16} />
              </button>
              
              <AnimatePresence>
                {isAvatarDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full mb-4 left-0 right-0 bg-zinc-950 border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden z-50 p-2"
                  >
                    <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto custom-scrollbar">
                      {AVATARS.map((avatar) => (
                        <div
                          key={avatar.id}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-3xl cursor-pointer transition-all",
                            selectedAvatar === avatar.id ? "bg-white text-black" : "text-zinc-500 hover:bg-zinc-900 hover:text-white"
                          )}
                          onClick={() => {
                            setSelectedAvatar(avatar.id);
                            setIsAvatarDropdownOpen(false);
                          }}
                        >
                          <img src={avatar.thumbnail} alt={avatar.name} className="w-12 h-12 rounded-xl object-cover grayscale brightness-75 hover:grayscale-0 hover:brightness-100 transition-all" referrerPolicy="no-referrer" />
                          <div className="text-left">
                            <p className="font-black italic uppercase tracking-tight text-sm leading-none mb-1">{avatar.name}</p>
                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-50">{avatar.style}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!hasApiKey ? (
              <div className="p-12 border-2 border-dashed border-zinc-900 rounded-[2.5rem] flex flex-col items-center text-center space-y-6">
                <Crown className="text-zinc-800" size={48} />
                <div className="space-y-2">
                  <p className="text-white font-black italic uppercase tracking-tight text-xl">Identity Verification Required</p>
                  <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest max-w-xs mx-auto">Select your production environment keys to enable avatar synthesis.</p>
                </div>
                <button onClick={handleOpenSelectKey} className="h-14 px-10 bg-white text-black font-black italic uppercase tracking-tighter rounded-2xl hover:scale-95 transition-all">Select API Key</button>
              </div>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !text}
                className={cn(
                  "w-full h-20 rounded-[2.5rem] flex items-center justify-center gap-4 transition-all font-black text-xl italic uppercase tracking-tighter shadow-2xl",
                  isGenerating || !text
                    ? "bg-zinc-900 text-zinc-700 cursor-not-allowed"
                    : "bg-white text-black hover:scale-[0.98] shadow-white/10"
                )}
              >
                {isGenerating ? (
                   <>
                    <Loader2 className="animate-spin" size={24} />
                    Synthesizing Performance... {progress}%
                  </>
                ) : (
                  <>
                    <Zap size={24} />
                    Render Performance
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-950 border border-white/5 rounded-[3rem] p-8 space-y-8 shadow-xl">
             <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 px-2">Visual settings</p>
              <div className="space-y-3">
                 <div className="flex items-center justify-between p-4 bg-zinc-900/30 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">Frame Rate</p>
                    <p className="text-white font-black italic text-sm">60 FPS</p>
                 </div>
                 <div className="flex items-center justify-between p-4 bg-zinc-900/30 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">Resolution</p>
                    <p className="text-white font-black italic text-sm">4K ULTRA</p>
                 </div>
                 <div className="flex items-center justify-between p-4 bg-zinc-900/30 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">Lighting</p>
                    <p className="text-white font-black italic text-sm">STUDIO SOFT</p>
                 </div>
              </div>
             </div>

             <div className="pt-8 border-t border-white/5">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 px-2 mb-6">Production Output</p>
               {resultUrl ? (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="space-y-6"
                 >
                   <div className="aspect-square bg-zinc-900 rounded-[2.5rem] flex items-center justify-center text-zinc-800 border border-white/5 overflow-hidden group relative">
                      <img src={AVATARS.find(a => a.id === selectedAvatar)?.thumbnail} className="w-full h-full object-cover grayscale opacity-50 blur-[2px] scale-110" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black">
                            <Play size={24} fill="black" className="ml-1" />
                         </div>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                      <button className="h-14 bg-white text-black rounded-2xl font-black italic uppercase tracking-tighter text-xs">Download</button>
                      <button className="h-14 bg-zinc-900 border border-white/5 text-zinc-500 rounded-2xl font-bold uppercase tracking-widest text-[10px]">Export</button>
                   </div>
                 </motion.div>
               ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-zinc-900 rounded-[2rem] flex items-center justify-center text-zinc-800 mx-auto border border-white/5">
                    <Settings size={32} />
                  </div>
                  <p className="text-zinc-800 font-bold uppercase text-[10px] tracking-widest leading-relaxed">System ready for initialization</p>
                </div>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
