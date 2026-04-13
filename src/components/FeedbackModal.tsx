import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, MessageSquare, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { user, token } = useAuth();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !user) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          email: user.email,
          subject,
          message,
        }),
      });

      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setSubject("");
          setMessage("");
          onClose();
        }, 2000);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to submit feedback");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
          >
            {/* Success Overlay */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-zinc-900 z-10 flex flex-col items-center justify-center text-center p-8"
                >
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <Send className="text-green-400" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
                  <p className="text-gray-400">Your feedback has been submitted successfully. We appreciate your input!</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-500/20 rounded-xl flex items-center justify-center">
                  <MessageSquare className="text-brand-400" size={20} />
                </div>
                <h2 className="text-2xl font-bold text-white">Feedback</h2>
              </div>
              <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-all">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Your Email</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white opacity-50 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Suggestion, Bug Report, etc."
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's on your mind..."
                  required
                  rows={4}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Submit Feedback
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
