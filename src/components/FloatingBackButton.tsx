import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function FloatingBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on the main dashboard page or home page
  const isMainPage = location.pathname === "/dashboard" || location.pathname === "/";

  return (
    <AnimatePresence>
      {!isMainPage && (
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-white/10 hover:bg-white/20 border-l border-y border-white/20 backdrop-blur-xl py-4 px-2 rounded-l-2xl shadow-2xl group transition-all"
          title="Go Back"
        >
          <div className="flex flex-col items-center gap-2">
            <ArrowLeft size={20} className="text-brand-400 group-hover:text-white transition-colors" />
            <span className="[writing-mode:vertical-lr] text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">
              Back
            </span>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
