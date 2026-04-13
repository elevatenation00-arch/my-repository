import { motion } from "motion/react";
import { Construction } from "lucide-react";

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-20 h-20 bg-brand-500/10 rounded-3xl flex items-center justify-center"
      >
        <Construction className="text-brand-400" size={40} />
      </motion.div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
        <p className="text-gray-500 max-w-md mx-auto">
          This feature is currently under development. We're working hard to bring you the best experience possible.
        </p>
      </div>
      <button 
        onClick={() => window.history.back()}
        className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white hover:bg-white/10 transition-all"
      >
        Go Back
      </button>
    </div>
  );
}
