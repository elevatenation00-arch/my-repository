import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Check, 
  Crown, 
  Zap, 
  Mic2,
  Shield,
  Clock,
  ChevronRight,
  Sparkles,
  Type
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

const plans = [
  {
    level: 'Free',
    price: '$0',
    desc: 'Perfect for exploring the local synthesis engine.',
    features: [
      '1,000 characters per month',
      'Standard XTTS v2 model',
      'Normal quality output',
      'Community support'
    ],
    color: 'emerald',
    current: true
  },
  {
    level: 'Creator',
    price: '$19',
    desc: 'For content creators and creative hobbyists.',
    features: [
      '10,000 characters per month',
      'High-fidelity cloning',
      'Pro voice profiles',
      'Email support'
    ],
    color: 'blue'
  },
  {
    level: 'Pro',
    price: '$49',
    desc: 'Studio-grade features for professional projects.',
    features: [
      '50,000 characters per month',
      'Zero latency generation',
      'Custom emotion tagging',
      'API access included'
    ],
    color: 'brand',
    popular: true
  },
  {
    level: 'Enterprise',
    price: 'Custom',
    desc: 'Unrestricted scalability for high-volume needs.',
    features: [
      'Unlimited characters',
      'Custom model training',
      'Dedicated GPU bridge',
      '24/7 Priority support'
    ],
    color: 'zinc'
  }
];

export default function Subscription() {
  const { user, token, refreshUser } = useAuth();

  const handleUpgrade = async (plan: string) => {
    try {
      const res = await fetch('/api/user/subscription', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token || ''
        },
        body: JSON.stringify({ plan })
      });
      if (res.ok) {
        await refreshUser();
        alert(`Successfully activated ${plan} tier!`);
      } else {
        throw new Error('Failed to update plan');
      }
    } catch (err) {
      console.error(err);
      alert('Subscription update failed. Please try again.');
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="text-center space-y-4">
        <p className="text-[10px] font-black tracking-[0.3em] text-brand-500 uppercase">SYNTHESIS ACCESS</p>
        <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase">Universal Tiers</h1>
        <p className="text-zinc-500 text-sm font-bold max-w-xl mx-auto italic">Scale your neural production with unrestricted access to our local XTTS bridge.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.level}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "relative bg-zinc-950 border rounded-[2.5rem] p-8 space-y-8 flex flex-col group transition-all duration-500 hover:scale-[1.02]",
              plan.popular ? "border-brand-500/50 shadow-2xl shadow-brand-500/10" : "border-white/5",
              user?.plan === plan.level && "border-white/20 bg-zinc-900/50"
            )}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-500 text-black text-[10px] font-black uppercase italic tracking-widest px-4 py-1.5 rounded-full shadow-xl">
                MOST POPULAR
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                  plan.color === 'emerald' && "bg-emerald-500/10 text-emerald-500",
                  plan.color === 'blue' && "bg-blue-500/10 text-blue-500",
                  plan.color === 'brand' && "bg-brand-500/10 text-brand-500",
                  plan.color === 'zinc' && "bg-zinc-800 text-zinc-400"
                )}>
                  {plan.level}
                </span>
                {user?.plan === plan.level && <Check size={16} className="text-emerald-500" />}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white italic tracking-tighter">{plan.price}</span>
                {plan.price !== 'Custom' && <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest">/mo</span>}
              </div>
              <p className="text-[10px] text-zinc-600 font-bold leading-relaxed">{plan.desc}</p>
            </div>

            <div className="flex-grow space-y-4 pt-6 border-t border-white/5">
              {plan.features.map((feature, j) => (
                <div key={j} className="flex items-start gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-zinc-800 shrink-0" />
                  <span className="text-[11px] text-zinc-400 font-medium tracking-tight italic leading-tight">{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleUpgrade(plan.level)}
              disabled={user?.plan === plan.level}
              className={cn(
                "w-full py-5 rounded-[1.5rem] font-black italic uppercase tracking-widest text-[10px] transition-all active:scale-95",
                user?.plan === plan.level 
                  ? "bg-zinc-900 text-zinc-600 cursor-default" 
                  : plan.popular 
                    ? "bg-brand-500 text-black hover:shadow-xl hover:shadow-brand-500/20" 
                    : "bg-white text-black hover:bg-zinc-200"
              )}
            >
              {user?.plan === plan.level ? 'ACTIVE MODEL' : `Activate ${plan.level}`}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 max-w-5xl mx-auto shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 blur-[100px] -mr-32 -mt-32 transition-all group-hover:bg-brand-500/10" />
        
        <div className="space-y-3 relative z-10">
          <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Enterprise Custom Build</h3>
          <p className="text-zinc-500 text-xs font-bold italic">Need dedicated GPU resources or self-hosted deployment? Let's engineer a solution.</p>
        </div>
        
        <a 
          href="https://wa.me/923023496197" 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-10 py-5 bg-white text-black font-black italic uppercase tracking-widest text-xs rounded-2xl hover:bg-zinc-200 transition-all active:scale-95 relative z-10 shrink-0"
        >
          Contact Engineering
        </a>
      </div>
    </div>
  );
}
