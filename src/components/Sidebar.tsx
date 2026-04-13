import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Mic2, 
  History, 
  Key, 
  Settings, 
  LogOut, 
  ChevronRight,
  User,
  Video,
  Users,
  ShoppingCart,
  Calculator,
  Package,
  Briefcase,
  FolderKanban
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
  { icon: Users, label: "CRM", path: "/dashboard/crm" },
  { icon: ShoppingCart, label: "Sales", path: "/dashboard/sales" },
  { icon: Calculator, label: "Accounting", path: "/dashboard/accounting" },
  { icon: Package, label: "Inventory", path: "/dashboard/inventory" },
  { icon: User, label: "Employees", path: "/dashboard/employees" },
  { icon: FolderKanban, label: "Projects", path: "/dashboard/projects" },
  { icon: Video, label: "AI Video Studio", path: "/dashboard/ai-video-studio" },
  { icon: Mic2, label: "Podcast", path: "/dashboard/podcast" },
  { icon: History, label: "History", path: "/dashboard/history" },
  { icon: Key, label: "API Keys", path: "/dashboard/api-keys" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-black border-r border-white/10 flex flex-col h-screen fixed left-0 top-0 z-40">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Mic2 className="text-white w-5 h-5" />
          </div>
          <span className="text-lg font-display font-bold text-white tracking-tight">
            Voxora<span className="text-brand-500">AI</span>
          </span>
        </Link>
      </div>

      <nav className="flex-grow px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={cn(
              "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all group",
              location.pathname === item.path
                ? "bg-brand-500/10 text-brand-400 border border-brand-500/20"
                : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon size={18} />
              {item.label}
            </div>
            {location.pathname === item.path && <ChevronRight size={14} />}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3 mb-4">
          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
            <User size={16} className="text-gray-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">John Doe</span>
            <span className="text-[10px] text-gray-500">Free Plan</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <Link
            to="/dashboard/settings"
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <Settings size={18} />
            Settings
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            <LogOut size={18} />
            Log out
          </Link>
        </div>
      </div>
    </aside>
  );
}
