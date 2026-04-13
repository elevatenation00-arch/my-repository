import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Welcome, {user?.email?.split('@')[0]}</h1>
        <p className="text-gray-400 mt-1">Manage your credits and usage.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-8 border-white/5 bg-zinc-900/30">
          <h2 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">Available Credits</h2>
          <p className="text-5xl font-bold text-white">2,500</p>
        </div>
        <div className="glass-card p-8 border-white/5 bg-zinc-900/30">
          <h2 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">Used This Month</h2>
          <p className="text-5xl font-bold text-white">1,200</p>
        </div>
        <div className="glass-card p-8 border-white/5 bg-zinc-900/30 flex items-center justify-center">
          <button className="px-8 py-4 bg-neon-blue text-white font-bold rounded-2xl hover:bg-neon-blue/80 transition-colors">Buy More Credits</button>
        </div>
      </div>
    </div>
  );
}
