import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "motion/react";
import { 
  User as UserIcon, 
  Lock, 
  Settings as SettingsIcon, 
  Volume2, 
  Shield, 
  Save, 
  Bell,
  Sliders,
  Server
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'voice' | 'security' | 'notifications'>('profile');
  const [loading, setLoading] = useState(false);

  // Voice Preferences
  const [defaultSpeed, setDefaultSpeed] = useState(1.0);
  const [defaultStability, setDefaultStability] = useState(0.5);
  const [defaultSimilarity, setDefaultSimilarity] = useState(0.75);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'voice', label: 'Voice Global', icon: Volume2 },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ] as const;

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Settings saved successfully!");
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">System Settings</h1>
          <p className="text-zinc-500 text-sm font-bold">Configure your BG LABS experience and default parameters.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="btn-primary flex items-center gap-2 group min-w-[140px] justify-center"
        >
          {loading ? "SAVING..." : (
            <>
              <Save size={18} className="transition-transform group-hover:scale-110" />
              SAVE CHANGES
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation */}
        <div className="lg:col-span-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-6 py-4 rounded-3xl font-black italic uppercase text-[10px] tracking-widest transition-all",
                activeTab === tab.id 
                  ? "bg-white text-black shadow-xl" 
                  : "text-zinc-600 hover:text-zinc-400 hover:bg-white/5"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-zinc-950 border border-white/5 rounded-[3rem] p-10 shadow-2xl space-y-8">
            {activeTab === 'profile' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-zinc-800 to-black border-2 border-white/10 flex items-center justify-center text-white text-3xl font-black italic">
                    {user?.email?.[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white italic uppercase">{user?.email}</h2>
                    <p className="text-emerald-500 font-bold text-[10px] tracking-widest uppercase mt-1">{user?.plan} SUBSCRIPTION ACTIVE</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest pl-2">Display Name</p>
                    <input 
                      type="text" 
                      defaultValue={user?.email.split('@')[0]}
                      className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-white/10"
                    />
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest pl-2">Language Preference</p>
                    <select className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4 text-white font-bold focus:outline-none appearance-none">
                      <option>English (US)</option>
                      <option>Urdu (Pakistan)</option>
                      <option>Hindi (India)</option>
                      <option>German</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'voice' && (
              <div className="space-y-10 animate-in slide-in-from-bottom-2 duration-500">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-zinc-400 font-black italic text-[10px] uppercase tracking-widest">
                    <Sliders size={14} />
                    Default Voice Parameters
                  </div>
                  <p className="text-zinc-600 text-xs font-bold leading-relaxed">
                    These values will be applied as internal defaults for all new projects.
                  </p>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-sm font-black italic text-white uppercase tracking-tighter">Global Speed</label>
                        <span className="text-[10px] font-black text-zinc-500">{defaultSpeed}x</span>
                    </div>
                    <input 
                      type="range" min="0.5" max="2.0" step="0.1" 
                      value={defaultSpeed} onChange={e => setDefaultSpeed(parseFloat(e.target.value))}
                      className="w-full bg-zinc-900 h-1 rounded-full appearance-none accent-white cursor-pointer"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-sm font-black italic text-white uppercase tracking-tighter">Stability (Pitch Variance)</label>
                        <span className="text-[10px] font-black text-zinc-500">{defaultStability * 100}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.05" 
                      value={defaultStability} onChange={e => setDefaultStability(parseFloat(e.target.value))}
                      className="w-full bg-zinc-900 h-1 rounded-full appearance-none accent-white cursor-pointer"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-sm font-black italic text-white uppercase tracking-tighter">Similarity Boost</label>
                        <span className="text-[10px] font-black text-zinc-500">{defaultSimilarity * 100}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.05" 
                      value={defaultSimilarity} onChange={e => setDefaultSimilarity(parseFloat(e.target.value))}
                      className="w-full bg-zinc-900 h-1 rounded-full appearance-none accent-white cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
                <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-3xl flex items-start gap-4">
                  <Shield className="text-red-500 shrink-0 mt-1" size={20} />
                  <div>
                    <h3 className="text-red-500 font-black italic uppercase text-sm">Strict Account Isolation</h3>
                    <p className="text-[10px] text-zinc-600 font-bold mt-1 leading-relaxed italic">
                      Your voice models and data are secured with enterprise-grade encryption. Changing your password will invalidate all current sessions.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest pl-2">New Password</p>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4 pl-12 text-white font-bold focus:outline-none focus:border-white/10"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest pl-2">Confirm New Password</p>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4 pl-12 text-white font-bold focus:outline-none focus:border-white/10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
               <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                 {[
                   { label: 'Generation Completion', desc: 'Notify when long render sequences finish merge.' },
                   { label: 'Credit Balance', desc: 'Warn when balance falls below 5,000 chars.' },
                   { label: 'Security Alerts', desc: 'Login attempts and password changes.' }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center justify-between p-6 bg-zinc-900/50 rounded-3xl border border-white/5">
                     <div>
                       <h4 className="text-sm font-black italic text-white uppercase">{item.label}</h4>
                       <p className="text-[10px] text-zinc-600 font-bold italic">{item.desc}</p>
                     </div>
                     <div className="w-12 h-6 bg-white rounded-full relative cursor-pointer shadow-inner">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-black rounded-full" />
                     </div>
                   </div>
                 ))}
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
