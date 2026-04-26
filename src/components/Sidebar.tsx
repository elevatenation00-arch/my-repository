import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Mic2, 
  History, 
  Settings, 
  LogOut, 
  ChevronRight,
  User,
  Video,
  Languages,
  Wand2,
  Share2,
  CreditCard,
  Crown,
  Terminal,
  Type,
  Mic,
  Library
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const menuGroups = [
  {
    title: "STUDIO",
    items: [
      { icon: Video, label: "AI Video Studio", path: "/dashboard/ai-video-studio", badge: "Live" },
      { icon: Mic2, label: "Podcast", path: "/dashboard/podcast" },
      { icon: Languages, label: "Dubbing", path: "/dashboard/dubbing", badge: "New" },
    ]
  },
  {
    title: "SPEECH",
    items: [
      { icon: Type, label: "Text to Speech", path: "/dashboard/tts" },
      { icon: Mic, label: "Speech to Text", path: "/dashboard/stt", badge: "New" },
      { icon: Library, label: "Voice Library", path: "/dashboard/voice-library" },
    ]
  },
  {
    title: "VOICE",
    items: [
      { icon: Terminal, label: "Advanced Studio", path: "/dashboard/pro-studio", badge: "PRO" },
      { icon: Wand2, label: "Voice Cloning", path: "/dashboard/voice-cloning" },
      { icon: Wand2, label: "Voice Design", path: "/dashboard/voice-design" },
      { icon: Share2, label: "Voice Conversion", path: "/dashboard/voice-conversion", badge: "New" },
    ]
  },
  {
    title: "WORKSPACE",
    items: [
      { icon: History, label: "History", path: "/dashboard/history" },
      { icon: Terminal, label: "Developers", path: "/dashboard/developers" },
    ]
  },
  {
    title: "ACCOUNT",
    items: [
      { icon: Crown, label: "Subscription", path: "/dashboard/subscription" },
      { icon: Settings, label: "Settings", path: "/dashboard/settings" },
    ]
  }
];

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <aside className="w-64 bg-zinc-950 border-r border-white/5 flex flex-col h-screen fixed left-0 top-0 z-40">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
            <span className="text-black font-black text-xl italic uppercase tracking-tighter">BG</span>
          </div>
          <div className="flex flex-col select-none">
            <span className="text-lg font-display font-black text-white leading-none tracking-tight">
              BG LABS
            </span>
            <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1 italic">
              Voice. Innovation. Future.
            </span>
          </div>
        </Link>
      </div>

      <nav className="flex-grow px-4 pb-6 space-y-6 overflow-y-auto scrollbar-hide">
        {menuGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <h3 className="px-4 text-[10px] font-black tracking-[0.2em] text-zinc-600 mb-2">{group.title}</h3>
            {group.items.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={cn(
                  "flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all group border border-transparent",
                  location.pathname === item.path
                    ? "bg-white text-black font-bold"
                    : "text-zinc-500 hover:text-white hover:bg-white/5 hover:border-white/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} strokeWidth={location.pathname === item.path ? 2.5 : 2} />
                  {item.label}
                </div>
                {item.badge && (
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider",
                    item.badge === "New" ? "bg-emerald-500/20 text-emerald-500" : "bg-zinc-800 text-zinc-400"
                  )}>
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500">
              <Zap size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-white">{user?.credits?.toLocaleString()}</span>
              <span className="text-[10px] text-zinc-500 font-bold">Characters</span>
            </div>
            <Link to="/dashboard/subscription" className="ml-auto text-[10px] text-zinc-400 hover:text-white transition-colors">
              Upgrade →
            </Link>
          </div>
          
          <div className="p-3 bg-zinc-800/30 rounded-xl border border-white/5 flex items-center gap-3 group cursor-pointer hover:bg-zinc-800/50 transition-all">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
              <Video size={16} className="text-cyan-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-cyan-400 italic">Video Tool</span>
              <span className="text-[9px] text-zinc-500 leading-tight">AI-powered video generation</span>
            </div>
            <div className="ml-auto px-1.5 py-0.5 bg-cyan-500/10 text-cyan-500 rounded text-[8px] font-black">BETA</div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-2 group cursor-pointer hover:bg-white/5 rounded-xl transition-all">
          <div className="w-8 h-8 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
            <span className="text-xs font-black">{user?.email?.[0].toUpperCase()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black text-white truncate w-24 uppercase italic">{user?.email?.split('@')[0]}</span>
            <span className="text-[10px] text-zinc-500 font-bold">{user?.plan} plan</span>
          </div>
          <LogOut size={16} className="ml-auto text-zinc-600 hover:text-red-500 transition-colors" onClick={handleLogout} />
        </div>
      </div>
    </aside>
  );
}

import { Zap } from "lucide-react";
