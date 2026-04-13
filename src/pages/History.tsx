import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { History as HistoryIcon, Loader2, Play, Volume2, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface HistoryItem {
  id: string;
  text: string;
  voiceId: string;
  title?: string;
  timestamp: string;
}

export default function History() {
  const { token } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) return;
      try {
        const res = await fetch("/api/history", {
          headers: { "Authorization": token }
        });
        if (res.ok) {
          const data = await res.json();
          setHistory(data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [token]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Generation History</h1>
        <p className="text-gray-400 mt-1">Review and replay your previously generated audio.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="animate-spin text-brand-500" size={32} />
          </div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center bg-zinc-900/30 border border-white/5 rounded-3xl">
            <HistoryIcon className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-500">No history found. Start generating to see your records here.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {history.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 hover:bg-white/5 transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-bold group-hover:text-brand-400 transition-colors">
                        {item.title || "Untitled"}
                      </p>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-500 font-bold uppercase tracking-widest">
                        {item.voiceId}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-1 mb-4">
                      {item.text}
                    </p>
                    <div className="flex items-center gap-4 text-[10px] text-gray-600 uppercase tracking-widest font-bold">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(item.timestamp).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <button className="bg-white/5 hover:bg-white/10 p-3 rounded-xl transition-all text-brand-400">
                    <Play size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
