import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Type, 
  Wand2, 
  Mic2, 
  Zap, 
  Crown,
  History,
  Library,
  ChevronRight,
  TrendingUp,
  LayoutDashboard,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/analytics', {
          headers: { 'Authorization': token }
        });
        const contentType = res.headers.get("content-type");
        if (res.ok && contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setAnalytics(data);
        } else {
          console.warn("Analytics fetch failed or returned non-JSON", res.status);
        }
      } catch (err) {
        console.error("Analytics Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [token]);

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-xs font-black text-zinc-500 uppercase tracking-widest italic">Syncing Neural Metrics...</p>
        </div>
      </div>
    );
  }

  const { stats, usageTrends, distribution } = analytics || {};

  const used = stats?.creditsUsed || 0;
  const total = stats?.totalCredits || 1000;
  const remaining = total - used;
  const percentUsed = Math.round((used / total) * 100);

  const pieData = [
    { name: "Used", value: used, color: "#f43f5e" },
    { name: "Remaining", value: remaining > 0 ? remaining : 0, color: "#27272a" },
  ];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Top Cards
  const statCards = [
    { label: "GENERATIONS", value: stats?.totalGenerations?.toLocaleString() || "0", icon: Type, sub: "Local Studio Master" },
    { label: "LATENCY", value: stats?.latency || "1.2s", icon: Zap, sub: "Neural link throughput" },
    { label: "ENGINE", value: stats?.engine || "LOCAL V2", icon: Zap, sub: "Edge XTTS Compute", accent: true },
    { label: "PLAN", value: stats?.plan || "CREATOR", icon: Crown, sub: "Enterprise Status" },
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase mb-2">DASHBOARD</p>
          <h1 className="text-4xl font-black text-white tracking-tighter italic">
            {greeting()}, <span className="text-white">{user?.email?.split('@')[0].toUpperCase()}</span>
          </h1>
          <p className="text-zinc-500 text-sm font-bold mt-1 tracking-tight">System Status: <span className="text-emerald-500">OPTIMAL</span></p>
        </div>
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 bg-brand-500/10 border border-brand-500/20 rounded-full",
          "text-brand-500 text-xs font-black italic tracking-tight"
        )}>
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
          {user?.plan || "PRO"} ENGINE ACTIVE
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-6 hover:bg-zinc-900 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black tracking-[0.2em] text-zinc-600">{stat.label}</span>
              <stat.icon size={16} className={cn("text-zinc-600 group-hover:text-white transition-colors", stat.accent && "text-zinc-600")} />
            </div>
            <p className="text-3xl font-black text-white tracking-tighter italic mb-1">{stat.value}</p>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wide">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Synthesis Load Chart */}
        <div className="lg:col-span-2 bg-zinc-900/50 border border-white/5 rounded-[2rem] p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <TrendingUp size={18} className="text-orange-500" />
              <span className="text-sm font-black text-white tracking-tight italic uppercase">Synthesis load trend</span>
            </div>
            <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest bg-zinc-950 px-3 py-1 rounded-full border border-white/5">
              Characters synthesized (7D)
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#52525b', fontSize: 10, fontWeight: 900 }} 
                />
                <YAxis 
                   hide
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)', radius: 8 }}
                  contentStyle={{ 
                    backgroundColor: '#09090b', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#fff',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#ffffff05" 
                  stroke="#ffffff10"
                  radius={[12, 12, 12, 12]}
                >
                  {usageTrends?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index === usageTrends.length - 1 ? "#3b82f6" : "#ffffff08"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Character Consumption */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center">
          <div className="space-y-1 mb-8 w-full text-left">
            <div className="flex items-center gap-3">
              <Zap size={18} className="text-brand-500" />
              <span className="text-sm font-black text-white tracking-tight italic uppercase">Neural capacity</span>
            </div>
          </div>
          <div className="relative h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#09090b', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-white italic tracking-tighter">{percentUsed}%</span>
              <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Utilized</span>
            </div>
          </div>
          <div className="w-full space-y-4 mt-4">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
              <span className="text-zinc-600">Consumed</span>
              <span className="text-white">{used.toLocaleString()} chars</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
              <span className="text-zinc-600">Neural Limit</span>
              <span className="text-white">{total.toLocaleString()} chars</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
         {/* Subscription Analysis */}
         <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <Crown size={18} className="text-brand-500" />
                  <span className="text-sm font-black text-white tracking-tight italic uppercase">Performance Index</span>
               </div>
               <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  {stats?.performanceScore}% Efficient
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
               <div className="bg-zinc-950/50 border border-white/5 rounded-3xl p-6 space-y-2">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Uptime Metric</p>
                  <p className="text-2xl font-black text-white italic tracking-tighter">99.98%</p>
                  <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[99.98%]" />
                  </div>
               </div>
               <div className="bg-zinc-950/50 border border-white/5 rounded-3xl p-6 space-y-2">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Throughput</p>
                  <p className="text-2xl font-black text-white italic tracking-tighter">142 Mbps</p>
                  <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[70%]" />
                  </div>
               </div>
            </div>
            <p className="text-[10px] text-zinc-600 font-bold mt-8 italic leading-relaxed">
               Neural performance is optimized for the <span className="text-white">{stats?.plan}</span> tier. Upgrading to Enterprise will unlock dedicated GPU priority and zero-latency synthesis clusters.
            </p>
         </div>

         {/* Model Distribution */}
         <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8">
            <div className="flex items-center gap-3 mb-8">
               <Sparkles size={18} className="text-purple-500" />
               <span className="text-sm font-black text-white tracking-tight italic uppercase">Feature Distribution</span>
            </div>
            <div className="space-y-6">
               {distribution?.map((item: any, i: number) => (
                  <div key={i} className="space-y-2">
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{item.name}</span>
                        <span className="text-[10px] font-black text-zinc-500 italic">{item.value}%</span>
                     </div>
                     <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-white/5 p-0.5">
                        <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${item.value}%` }}
                           transition={{ duration: 1, delay: i * 0.1 }}
                           style={{ backgroundColor: item.color }}
                           className="h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)]" 
                        />
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4 text-center sm:text-left">
        <h3 className="text-[10px] font-black tracking-[0.2em] text-zinc-600 uppercase ml-4">QUICK ACTIONS</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Text to Speech", desc: "Generate studio-grade AI voice", icon: Mic2, path: "/dashboard/tts" },
            { label: "Voice Cloning", desc: "Clone and train your own voice", icon: Mic2, path: "/dashboard/voice-cloning" },
            { label: "Synthesis Archive", desc: "Browse previously generated masters", icon: History, path: "/dashboard/history" },
            { label: "Voice Library", desc: "Browse and manage saved voices", icon: Library, path: "/dashboard/voice-library" },
          ].map((action, i) => (
            <Link 
              key={i} 
              to={action.path}
              className="bg-zinc-900/50 border border-white/5 rounded-[1.5rem] p-6 flex items-center justify-between group hover:bg-zinc-900 transition-all hover:border-white/10"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-white group-hover:text-black transition-all group-hover:rotate-6">
                  <action.icon size={24} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-black text-white transition-colors uppercase italic">{action.label}</span>
                  <span className="text-[10px] text-zinc-600 font-bold tracking-tight">{action.desc}</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-zinc-800 group-hover:text-white transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
