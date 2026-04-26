import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Play, 
  Pause, 
  Download, 
  Trash2, 
  Clock, 
  Search,
  CheckCircle2,
  AlertCircle,
  FileAudio
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface HistoryItem {
  id: string;
  text: string;
  voiceId: string;
  title: string;
  timestamp: string;
}

export default function History() {
  const { user, token } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const fetchHistory = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/history', {
        headers: { 'Authorization': token }
      });
      const contentType = res.headers.get("content-type");
      if (res.ok && contentType?.includes("application/json")) {
        const data = await res.json();
        setHistory(data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const togglePlay = (id: string) => {
    if (playingId === id) {
      audio?.pause();
      setPlayingId(null);
      return;
    }

    if (audio) {
      audio.pause();
    }

    const newAudio = new Audio(`/api/history/audio/${id}?token=${token}`);
    newAudio.onended = () => setPlayingId(null);
    newAudio.play();
    setAudio(newAudio);
    setPlayingId(id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this synthesis?')) return;

    try {
      const res = await fetch(`/api/history/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token || '' }
      });
      if (res.ok) {
        setHistory(prev => prev.filter(h => h.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredHistory = history.filter(h => 
    h.title?.toLowerCase().includes(search.toLowerCase()) || 
    h.text?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase mb-2">NEURAL ARCHIVE</p>
          <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">Synthesis History</h1>
          <p className="text-zinc-500 text-sm font-bold mt-1 tracking-tight">Review and manage your previously generated masters.</p>
        </div>
        
        <div className="relative group w-full md:w-72">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-brand-500" />
          <input 
            type="text"
            placeholder="Search generations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-white text-xs font-bold placeholder-zinc-700 focus:outline-none focus:border-brand-500/50 transition-all"
          />
        </div>
      </div>

      <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] text-zinc-600 uppercase">Master Title</th>
                <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] text-zinc-600 uppercase">Text Snippet</th>
                <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] text-zinc-600 uppercase">Generated</th>
                <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] text-zinc-600 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-8 py-8 h-12 bg-white/5" />
                  </tr>
                ))
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-zinc-600 font-black italic uppercase text-xs tracking-widest">
                    No synthesis data found in archive
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="group hover:bg-zinc-900/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-600 group-hover:text-brand-500 transition-colors">
                          <FileAudio size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-white italic truncate max-w-[200px]">{item.title || 'Untitled'}</span>
                          <span className="text-[10px] text-zinc-600 font-bold uppercase">{item.voiceId === 'local-xtts-pro' ? 'XTTS PRO' : 'Neural'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-[11px] text-zinc-500 font-medium leading-relaxed max-w-[300px] truncate italic">{item.text}</p>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2 text-zinc-600">
                         <Clock size={12} />
                         <span className="text-[10px] font-bold uppercase tracking-tighter">
                           {new Date(item.timestamp).toLocaleDateString()}
                         </span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right space-x-2">
                       <button 
                        onClick={() => togglePlay(item.id)}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-black/20",
                          playingId === item.id ? "bg-white text-black" : "bg-zinc-900 text-white hover:bg-zinc-800"
                        )}
                       >
                         {playingId === item.id ? <Pause size={18} /> : <Play size={18} />}
                       </button>
                       <a 
                        href={`/api/history/audio/${item.id}?token=${token}`}
                        download={`${item.title || 'synthesis'}.mp3`}
                        className="w-10 h-10 rounded-xl bg-zinc-900 text-zinc-600 flex items-center justify-center hover:bg-white hover:text-black transition-all active:scale-95 shadow-lg shadow-black/20"
                       >
                         <Download size={18} />
                       </a>
                       <button 
                        onClick={() => handleDelete(item.id)}
                        className="w-10 h-10 rounded-xl bg-zinc-900 text-zinc-800 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all active:scale-95 shadow-lg shadow-black/20"
                       >
                         <Trash2 size={18} />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
