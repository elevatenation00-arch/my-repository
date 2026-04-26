import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "motion/react";
import { Zap, CreditCard, ArrowRight, TrendingUp, History, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const creditPacks = [
  {
    amount: "10,000",
    price: "$5",
    description: "Perfect for small projects",
    popular: false,
    color: "gray"
  },
  {
    amount: "50,000",
    price: "$20",
    description: "Most popular for creators",
    popular: true,
    color: "brand"
  },
  {
    amount: "150,000",
    price: "$50",
    description: "Best value for professionals",
    popular: false,
    color: "blue"
  },
  {
    amount: "500,000",
    price: "$150",
    description: "For heavy users and teams",
    popular: false,
    color: "purple"
  }
];

export default function Credits() {
  const { user } = useAuth();

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Top Up Credits</h1>
          <p className="text-gray-400 mt-2">Add more characters to your account. Credits never expire.</p>
        </div>
        <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-6 flex items-center gap-6 backdrop-blur-xl">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Current Balance</p>
            <p className="text-2xl font-bold text-white">{user?.credits?.toLocaleString() || "0"}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center">
            <Zap className="text-brand-400" size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {creditPacks.map((pack, index) => (
          <motion.div
            key={pack.amount}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "relative flex flex-col p-8 rounded-[2.5rem] border transition-all duration-500",
              pack.popular 
                ? "bg-brand-500/10 border-brand-500/30 shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)]" 
                : "bg-zinc-900/50 border-white/5 hover:border-white/10"
            )}
          >
            {pack.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-500 text-black text-[10px] font-bold uppercase tracking-widest rounded-full">
                Best Value
              </div>
            )}

            <div className="mb-8">
              <div className="flex items-center gap-2 text-brand-400 mb-4">
                <Zap size={20} />
                <span className="text-xl font-bold">{pack.amount}</span>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-white">{pack.price}</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                {pack.description}
              </p>
            </div>

            <button
              onClick={() => window.open("https://wa.me/923023496197", "_blank")}
              className={cn(
                "w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                pack.popular
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-white/10 text-white hover:bg-white/20"
              )}
            >
              Buy Now
              <ArrowRight size={16} />
            </button>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8 border-white/5 bg-zinc-900/30">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp size={24} className="text-brand-400" />
            <h3 className="text-xl font-bold text-white">Why buy credits?</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="mt-1 p-0.5 rounded-full bg-brand-500/20 text-brand-400">
                <ArrowRight size={12} />
              </div>
              <p className="text-sm text-gray-400"><span className="text-white font-medium">No Expiration:</span> Your purchased credits stay in your account until you use them.</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 p-0.5 rounded-full bg-brand-500/20 text-brand-400">
                <ArrowRight size={12} />
              </div>
              <p className="text-sm text-gray-400"><span className="text-white font-medium">Full Quality:</span> Access all premium voices and high-fidelity generation.</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 p-0.5 rounded-full bg-brand-500/20 text-brand-400">
                <ArrowRight size={12} />
              </div>
              <p className="text-sm text-gray-400"><span className="text-white font-medium">Commercial Rights:</span> Use your generated audio for any commercial project.</p>
            </li>
          </ul>
        </div>

        <div className="glass-card p-8 border-white/5 bg-zinc-900/30">
          <div className="flex items-center gap-3 mb-6">
            <Shield size={24} className="text-purple-400" />
            <h3 className="text-xl font-bold text-white">Secure Checkout</h3>
          </div>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            We use industry-standard encryption to protect your payment information. All transactions are processed via Stripe, ensuring your data is always safe.
          </p>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Stripe Verified</div>
            <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[10px] font-bold text-gray-400 uppercase tracking-widest">SSL Encrypted</div>
          </div>
        </div>
      </div>
    </div>
  );
}
