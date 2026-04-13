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
      alert("Avatar generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">AI Avatar System</h1>
          <p className="text-gray-400 mt-1">Create interactive AI avatars that speak your content.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 border-white/5 bg-zinc-900/30 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Script</p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter the script for your avatar to speak..."
              className="w-full h-48 bg-transparent border border-white/5 rounded-xl p-4 focus:ring-1 focus:ring-brand-500/30 text-white placeholder-gray-600 resize-none text-lg leading-relaxed"
            />
            
            <div className="relative">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Select Avatar</p>
              <button 
                onClick={() => setIsAvatarDropdownOpen(!isAvatarDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <User size={18} className="text-brand-400" />
                  <span>{AVATARS.find(a => a.id === selectedAvatar)?.name}</span>
                </div>
                <ChevronDown className={cn("transition-transform", isAvatarDropdownOpen && "rotate-180")} size={16} />
              </button>
              
              <AnimatePresence>
                {isAvatarDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full mb-2 left-0 right-0 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-64 overflow-y-auto"
                  >
                    <div className="p-2 grid grid-cols-1 gap-1">
                      {AVATARS.map((avatar) => (
                        <div
                          key={avatar.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
                            selectedAvatar === avatar.id ? "bg-brand-500/10 text-brand-400" : "text-gray-400 hover:bg-white/5 hover:text-white"
                          )}
                          onClick={() => {
                            setSelectedAvatar(avatar.id);
                            setIsAvatarDropdownOpen(false);
                          }}
                        >
                          <img src={avatar.thumbnail} alt={avatar.name} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                          <div>
                            <p className="font-bold text-sm">{avatar.name}</p>
                            <p className="text-[10px] opacity-50 uppercase tracking-widest">{avatar.style}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {!hasApiKey ? (
            <div className="glass-card p-12 border-brand-500/20 bg-brand-500/5 flex flex-col items-center text-center space-y-6">
              <Crown className="text-brand-400" size={40} />
              <button onClick={handleOpenSelectKey} className="px-8 py-4 bg-brand-500 text-white font-bold rounded-2xl">Select API Key</button>
            </div>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !text}
              className="w-full py-4 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold rounded-2xl"
            >
              {isGenerating ? "Generating..." : "Generate Avatar Speech"}
            </button>
          )}
        </div>
        
        <div className="space-y-6">
          <div className="glass-card p-6 border-white/5 bg-zinc-900/30">
            <h2 className="text-white font-bold mb-4">Avatar Settings</h2>
            {/* Add more avatar-specific settings here */}
          </div>
        </div>
      </div>
    </div>
  );
}
