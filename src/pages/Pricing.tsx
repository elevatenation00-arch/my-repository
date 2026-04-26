import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Check, Sparkles, Zap, Shield, Crown } from 'lucide-react';
import { motion } from 'motion/react';

export default function Pricing() {
  const { user, token } = useAuth();

  const tiers = [
    { name: 'Free', price: '$0', desc: 'Neural exploration plan', plan: 'Free' },
    { name: 'Creator', price: '$19', desc: 'Neural hobbyist features', plan: 'Creator' },
    { name: 'Pro', price: '$49', desc: 'Studio-grade production', plan: 'Pro' },
  ];

  const handleActivate = async (plan: string) => {
    if (!user) {
      window.location.href = "/signup";
      return;
    }

    try {
      const res = await fetch("/api/activate-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token || ""
        },
        body: JSON.stringify({ plan })
      });

      if (res.ok) {
        const adminWhatsApp = import.meta.env.VITE_ADMIN_WHATSAPP_NUMBER || "923122180862";
        const message = encodeURIComponent(`Hi Admin, I want to activate the ${plan} plan for my account: ${user.email}. Please approve my request.`);
        window.open(`https://wa.me/${adminWhatsApp}?text=${message}`, '_blank');
        alert("Activation request sent to admin panel. Redirecting to WhatsApp for confirmation.");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to send request");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto space-y-16 animate-in fade-in duration-1000">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-black text-white tracking-tighter italic uppercase">Universal Access</h1>
        <p className="text-zinc-600 text-lg font-bold italic max-w-2xl mx-auto">Neural synthesis for everyone. Start for free on local hardware or scale with our global bridge.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((tier, i) => (
          <div key={i} className="bg-zinc-950 border border-white/5 rounded-[2.5rem] p-10 space-y-6 group hover:border-brand-500/30 transition-all flex flex-col justify-between">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white italic uppercase tracking-widest">{tier.name}</h3>
                <p className="text-zinc-600 text-xs font-bold leading-relaxed italic">{tier.desc}</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white italic tracking-tighter">{tier.price}</span>
                {tier.price !== 'Custom' && <span className="text-zinc-500 text-xs font-bold italic">/MO</span>}
              </div>
            </div>
            
            <button 
              onClick={() => handleActivate(tier.plan)}
              className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black italic uppercase tracking-widest text-[10px] flex items-center justify-center hover:bg-white hover:text-black transition-all mt-8"
            >
              {user?.plan === tier.plan && user?.isApproved ? "Active Model" : `Activate ${tier.name}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
