import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mic2, 
  Settings, 
  Play, 
  ChevronDown, 
  Zap, 
  Crown,
  Info,
  Loader2,
  Download,
  Share2,
  User,
  Radio
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VOICES } from "@/services/voiceService";

interface Avatar {
  id: string;
  name: string;
  style: string;
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
  { id: "marcus", name: "Marcus (Professional)", style: "Professional" },
  { id: "elena", name: "Elena (Professional)", style: "Professional" },
  { id: "david", name: "David (Casual)", style: "Casual" },
  { id: "sophie", name: "Sophie (Casual)", style: "Casual" },
];

export default function Podcast() {
  const { user, token } = useAuth();
  const [topic, setTopic] = useState("");
  const [hostAvatar, setHostAvatar] = useState<string>(AVATARS[0].id);
  const [guestAvatar, setGuestAvatar] = useState<string>(AVATARS[1].id);
  const [hostVoice, setHostVoice] = useState<string>(VOICES[0].id);
  const [guestVoice, setGuestVoice] = useState<string>(VOICES[1].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [podcastUrl, setPodcastUrl] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);

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
    if (!topic || !token) return;
    setIsGenerating(true);
    setProgress(10);
    setPodcastUrl(null);

    try {
      // In a real implementation, this would call the backend which proxies to HeyGen
      // const res = await fetch("/api/podcast", { ... });
      
      // Mock generation progress
      for (let i = 20; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProgress(i);
      }
      
      // Mock result
      setPodcastUrl("https://example.com/mock-podcast.mp4");
    } catch (error) {
      console.error("Podcast generation failed:", error);
      alert("Podcast generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">AI Podcast Studio</h1>
          <p className="text-gray-400 mt-1">Generate engaging podcast conversations between AI avatars.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 border-white/5 bg-zinc-900/30 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Podcast Topic</p>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter the topic or script for your podcast..."
              className="w-full h-32 bg-transparent border border-white/5 rounded-xl p-4 focus:ring-1 focus:ring-brand-500/30 text-white placeholder-gray-600 resize-none text-lg leading-relaxed"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Host</p>
                <select 
                  value={hostAvatar}
                  onChange={(e) => setHostAvatar(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm"
                >
                  {AVATARS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Guest</p>
                <select 
                  value={guestAvatar}
                  onChange={(e) => setGuestAvatar(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm"
                >
                  {AVATARS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
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
              disabled={isGenerating || !topic}
              className="w-full py-4 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold rounded-2xl"
            >
              {isGenerating ? "Generating..." : "Generate Podcast"}
            </button>
          )}
        </div>
        
        <div className="space-y-6">
          <div className="glass-card p-6 border-white/5 bg-zinc-900/30">
            <h2 className="text-white font-bold mb-4">Podcast Settings</h2>
            {/* Add more settings here */}
          </div>
        </div>
      </div>
    </div>
  );
}
