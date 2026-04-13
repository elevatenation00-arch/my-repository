import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "motion/react";
import { Check, Crown, Zap, Star, Shield, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for testing our AI voices",
    features: [
      "10,000 characters per month",
      "Standard voice quality",
      "Access to 10+ voices",
      "Community support"
    ],
    buttonText: "Current Plan",
    current: true,
    color: "gray"
  },
  {
    name: "Creator",
    price: "$19",
    description: "For content creators and hobbyists",
    features: [
      "100,000 characters per month",
      "High-quality AI voices",
      "Access to all 100+ voices",
      "Commercial rights",
      "Email support"
    ],
    buttonText: "Upgrade to Creator",
    current: false,
    color: "green"
  },
  {
    name: "Pro",
    price: "$49",
    description: "For professionals and small teams",
    features: [
      "500,000 characters per month",
      "Ultra-high quality voices",
      "Voice cloning (3 slots)",
      "Priority support",
      "API access"
    ],
    buttonText: "Upgrade to Pro",
    current: false,
    popular: true,
    color: "blue"
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large scale production",
    features: [
      "Unlimited characters",
      "Custom voice cloning",
      "Dedicated account manager",
      "99.9% SLA",
      "Custom integrations"
    ],
    buttonText: "Contact Sales",
    current: false,
    color: "purple"
  }
];

export default function Subscription() {
  const { user } = useAuth();

  return (
    <div className="space-y-12 pb-20">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white tracking-tight">Subscription Plans</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Choose the perfect plan for your voice generation needs. Scale your content with our state-of-the-art AI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan, index) => {
          const isCurrent = user?.plan === plan.name;
          
          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative flex flex-col p-8 rounded-[2.5rem] border transition-all duration-500",
                plan.popular 
                  ? "bg-brand-500/10 border-brand-500/30 shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)]" 
                  : "bg-zinc-900/50 border-white/5 hover:border-white/10"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-500 text-black text-[10px] font-bold uppercase tracking-widest rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-gray-500 text-sm">/mo</span>}
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="flex-grow space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="mt-1 p-0.5 rounded-full bg-brand-500/20 text-brand-400">
                      <Check size={12} />
                    </div>
                    <span className="text-sm text-gray-400">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                disabled={isCurrent}
                onClick={() => {
                  if (plan.name === "Enterprise") {
                    window.open("https://wa.me/923006713668", "_blank");
                  } else {
                    window.open("https://wa.me/923006713668", "_blank");
                  }
                }}
                className={cn(
                  "w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                  isCurrent
                    ? "bg-white/5 text-gray-500 cursor-default"
                    : plan.popular
                    ? "bg-white text-black hover:bg-gray-200"
                    : "bg-white/10 text-white hover:bg-white/20"
                )}
              >
                {isCurrent ? "Current Plan" : plan.buttonText}
                {!isCurrent && <ArrowRight size={16} />}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* FAQ or Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-white/5">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center shrink-0">
            <Shield className="text-brand-400" size={24} />
          </div>
          <div>
            <h4 className="text-white font-bold mb-2">Secure Payments</h4>
            <p className="text-sm text-gray-500">All transactions are encrypted and processed securely via Stripe.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0">
            <Star className="text-purple-400" size={24} />
          </div>
          <div>
            <h4 className="text-white font-bold mb-2">Cancel Anytime</h4>
            <p className="text-sm text-gray-500">No long-term contracts. You can cancel your subscription at any time.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <Zap className="text-blue-400" size={24} />
          </div>
          <div>
            <h4 className="text-white font-bold mb-2">Instant Setup</h4>
            <p className="text-sm text-gray-500">Your credits are added to your account immediately after purchase.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
