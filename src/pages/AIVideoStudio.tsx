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
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">AI Video Studio</h1>
        <p className="text-gray-400 mt-1">Create professional AI videos in minutes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Link
            key={tool.name}
            to={tool.path}
            className="glass-card p-8 border-white/5 bg-zinc-900/30 hover:bg-white/5 transition-all group flex flex-col items-center text-center space-y-4"
          >
            <div className={cn("w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform", tool.color)}>
              <tool.icon size={32} />
            </div>
            <h3 className="text-white font-bold text-lg">{tool.name}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
