import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  Volume2, 
  History, 
  MessageSquare, 
  Home,
  Mic2,
  Type,
  Languages,
  Podcast,
  Clapperboard,
  Code,
  CreditCard,
  Zap,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import FloatingBackButton from "./FloatingBackButton";
import FeedbackModal from "./FeedbackModal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navGroups = [
    {
      title: "SPEECH",
      items: [
        { icon: Type, label: "Text to Speech", path: "/dashboard/tts" },
        { icon: Volume2, label: "Speech to Text", path: "/dashboard/stt", badge: "New" },
      ]
    },
    {
      title: "VOICE",
      items: [
        { icon: Mic2, label: "Voice Cloning", path: "/dashboard/cloning" },
        { icon: Settings, label: "Voice Design", path: "/dashboard/design" },
        { icon: Languages, label: "Voice Conversion", path: "/dashboard/conversion", badge: "New" },
      ]
    },
    {
      title: "STUDIO",
      items: [
        { icon: Podcast, label: "Podcast", path: "/dashboard/podcast" },
        { icon: Clapperboard, label: "Dubbing", path: "/dashboard/dubbing", badge: "New" },
      ]
    },
    {
      title: "WORKSPACE",
      items: [
        { icon: History, label: "History", path: "/dashboard/history" },
        { icon: Code, label: "Developers", path: "/dashboard/developers" },
      ]
    },
    {
      title: "BILLING",
      items: [
        { icon: CreditCard, label: "Subscription", path: "/dashboard/subscription" },
        { icon: CreditCard, label: "Credits", path: "/dashboard/credits" },
      ]
    }
  ];

  const SidebarContent = () => (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-10">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg flex items-center justify-center shadow-lg shadow-neon-blue/20">
            <Zap className="text-white w-5 h-5 fill-current" />
          </div>
          <span className="text-xl font-display font-bold tracking-tighter text-white">
            BG <span className="gradient-text">LABS</span>
          </span>
        </Link>
        <button className="text-gray-600 hover:text-white transition-colors">
          <Settings size={18} />
        </button>
      </div>

      <nav className="flex-grow space-y-8 overflow-y-auto pr-2 custom-scrollbar">
        <Link
          to="/dashboard"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
            location.pathname === "/dashboard" 
              ? "bg-white text-black font-bold" 
              : "text-gray-400 hover:text-white hover:bg-white/5"
          )}
        >
          <LayoutDashboard size={20} />
          <span className="text-sm">Dashboard</span>
        </Link>

        {navGroups.map((group) => (
          <div key={group.title} className="space-y-2">
            <p className="text-[10px] font-bold tracking-widest text-gray-600 uppercase px-4">{group.title}</p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center justify-between px-4 py-2.5 rounded-xl transition-all group",
                    location.pathname === item.path 
                      ? "bg-white text-black font-bold" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 text-[8px] font-bold uppercase">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
        
        {(user?.role === "admin" || user?.role === "manager") && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold tracking-widest text-gray-600 uppercase px-4">ADMIN</p>
            <Link
              to="/dashboard/admin"
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all",
                location.pathname === "/dashboard/admin" 
                  ? "bg-white text-black font-bold" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <ShieldCheck size={18} />
              <span className="text-sm">Admin Panel</span>
            </Link>
          </div>
        )}
      </nav>

      <div className="mt-auto space-y-4 pt-6 border-t border-white/5">
        <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Zap className="text-yellow-500" size={12} fill="currentColor" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Credits</p>
                <p className="text-sm font-bold text-white">{user?.credits?.toLocaleString()}</p>
              </div>
            </div>
            <Link to="/dashboard/credits" className="text-[10px] text-gray-500 hover:text-white transition-colors flex items-center gap-1 font-bold">
              Top up <ChevronRight size={10} />
            </Link>
          </div>
        </div>
        
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{user?.email?.split('@')[0]}</p>
              <p className="text-[10px] text-gray-500 font-medium">{user?.plan || "Free"} plan</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-600 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#030303] text-white flex">
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 right-4 z-[60] p-2 bg-zinc-900 border border-white/10 rounded-xl"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 border-r border-white/5 bg-[#030303] transition-transform duration-300 lg:relative lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto p-4 md:p-8 relative">
        <FloatingBackButton />
        <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
