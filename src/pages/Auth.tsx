import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mic2, Mail, Lock, User, ArrowRight, Github, Chrome } from "lucide-react";
import { motion } from "motion/react";

interface AuthProps {
  mode: "login" | "signup";
}

export default function Auth({ mode }: AuthProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate auth
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#050505] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/30 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-500/20 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Mic2 className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-display font-bold text-white">VoxoraAI</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-gray-400">
            {mode === "login"
              ? "Enter your credentials to access your dashboard"
              : "Join 500,000+ creators and start building today"}
          </p>
        </div>

        <div className="glass-card p-8 border-white/5">
          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === "signup" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-medium text-gray-300">Password</label>
                {mode === "login" && (
                  <a href="#" className="text-xs text-brand-400 hover:text-brand-300">Forgot password?</a>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
              {mode === "login" ? "Sign In" : "Create Account"} <ArrowRight size={18} />
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0a0a0a] px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="btn-secondary py-2.5 flex items-center justify-center gap-2 text-sm">
              <Github size={18} /> GitHub
            </button>
            <button className="btn-secondary py-2.5 flex items-center justify-center gap-2 text-sm">
              <Chrome size={18} /> Google
            </button>
          </div>
        </div>

        <p className="text-center mt-8 text-gray-400 text-sm">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-medium">Sign up</Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Log in</Link>
            </>
          )}
        </p>
      </motion.div>
    </div>
  );
}
