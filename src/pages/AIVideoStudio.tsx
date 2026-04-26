import { Link } from "react-router-dom";
import { Video, User, Mic2, FileText, Settings, Library } from "lucide-react";
import { cn } from "@/lib/utils";

const tools = [
  { name: "Create Video", path: "/dashboard/ai-video-studio/create", icon: Video, color: "text-neon-blue" },
  { name: "Avatar Library", path: "/dashboard/ai-video-studio/avatars", icon: User, color: "text-brand-400" },
  { name: "Voice Studio", path: "/dashboard/ai-video-studio/voices", icon: Mic2, color: "text-purple-400" },
  { name: "Templates", path: "/dashboard/ai-video-studio/templates", icon: FileText, color: "text-yellow-400" },
  { name: "My Videos", path: "/dashboard/ai-video-studio/my-videos", icon: Library, color: "text-green-400" },
  { name: "Settings", path: "/dashboard/ai-video-studio/settings", icon: Settings, color: "text-gray-400" },
];

export default function AIVideoStudio() {
  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black tracking-[0.2em] text-zinc-600 uppercase mb-2">PRODUCTION STUDIO</p>
          <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">AI Video Studio</h1>
          <p className="text-zinc-500 text-sm font-bold mt-1">Generate professional-grade AI video sequences in real-time.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, i) => (
          <Link
            key={tool.name}
            to={tool.path}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem] blur-xl -z-10" />
            <div className="glass-card p-10 border border-white/5 bg-zinc-950 hover:bg-zinc-900 transition-all flex flex-col items-center text-center space-y-6 rounded-[3rem]">
              <div className={cn(
                "w-20 h-20 rounded-[2rem] bg-zinc-900 flex items-center justify-center transition-all duration-500",
                "group-hover:scale-110 group-hover:-rotate-6 group-hover:bg-white group-hover:text-black",
                tool.color
              )}>
                <tool.icon size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-white font-black italic text-xl uppercase tracking-tight">{tool.name}</h3>
                <div className="w-10 h-0.5 bg-zinc-800 mx-auto group-hover:w-20 transition-all" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
