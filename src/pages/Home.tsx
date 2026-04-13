import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "motion/react";
import { 
  Play, 
  ChevronRight, 
  Mic2, 
  Globe, 
  Zap, 
  Cpu, 
  Users, 
  MessageSquare, 
  Star, 
  ArrowRight,
  Volume2,
  CheckCircle2,
  Twitter,
  Github,
  Linkedin
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";

// --- Components ---

interface StatCounterProps {
  key?: any;
  value: number;
  label: string;
  suffix?: string;
}

const StatCounter = ({ value, label, suffix = "" }: StatCounterProps) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const duration = 2000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <div ref={ref} className="flex flex-col items-center text-center p-6 glass-card border-none bg-transparent">
      <span className="text-5xl md:text-6xl font-display font-bold gradient-text mb-2">
        {count.toLocaleString()}{suffix}
      </span>
      <span className="text-gray-400 font-medium uppercase tracking-widest text-xs">{label}</span>
    </div>
  );
};

interface FeatureCardProps {
  key?: any;
  icon: any;
  title: string;
  description: string;
  index: number;
}

const FeatureCard = ({ icon: Icon, title, description, index }: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="glass-card p-8 group hover:border-neon-blue/30 transition-all duration-500"
    >
      <div className="w-14 h-14 bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
        <Icon className="text-neon-blue w-7 h-7" />
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed text-sm">{description}</p>
    </motion.div>
  );
};

interface TestimonialCardProps {
  key?: any;
  name: string;
  role: string;
  comment: string;
  avatar: string;
}

const TestimonialCard = ({ name, role, comment, avatar }: TestimonialCardProps) => {
  return (
    <div className="glass-card p-8 min-w-[300px] md:min-w-[400px] mx-4">
      <div className="flex items-center gap-4 mb-6">
        <img src={avatar} alt={name} className="w-12 h-12 rounded-full border-2 border-neon-blue/30" referrerPolicy="no-referrer" />
        <div>
          <h4 className="text-white font-bold">{name}</h4>
          <p className="text-xs text-gray-500">{role}</p>
        </div>
      </div>
      <p className="text-gray-300 italic leading-relaxed">"{comment}"</p>
      <div className="flex gap-1 mt-6">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
        ))}
      </div>
    </div>
  );
};

// --- Main Page ---

export default function Home() {
  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);
  const [demoText, setDemoText] = useState("Experience the future of AI voice generation with BG LABS.");
  const [isGenerating, setIsGenerating] = useState(false);

  const stats = [
    { value: 50000, label: "Users", suffix: "+" },
    { value: 150, label: "Voices", suffix: "+" },
    { value: 10, label: "Languages", suffix: "+" },
    { value: 1, label: "Billion Characters", suffix: "M" },
  ];

  const features = [
    {
      icon: Mic2,
      title: "Realistic AI Voices",
      description: "Our neural networks generate speech with human-like emotion, intonation, and clarity that's indistinguishable from real recordings."
    },
    {
      icon: Globe,
      title: "Multi-language Support",
      description: "Break language barriers with support for over 20+ languages and accents, perfectly localized for your global audience."
    },
    {
      icon: Zap,
      title: "Low Latency Generation",
      description: "Generate high-quality audio in milliseconds. Our optimized infrastructure ensures your projects move at the speed of thought."
    },
    {
      icon: Cpu,
      title: "Advanced Voice Cloning",
      description: "Clone any voice with just 30 seconds of audio. Perfect for maintaining brand consistency or personalizing content."
    }
  ];

  const pricing = [
    { name: "Free", price: "0", features: ["10,000 Characters", "Standard Voices", "Community Support"] },
    { name: "Creator", price: "19", features: ["50,000 Characters", "Premium Voices", "Voice Cloning", "Priority Support"], popular: true },
    { name: "Pro", price: "49", features: ["250,000 Characters", "All Features", "API Access", "Dedicated Support"] },
    { name: "Enterprise", price: "Custom", features: ["Unlimited Characters", "Custom Voice Models", "SLA Guarantee", "24/7 Support"] },
  ];

  const testimonials = [
    {
      name: "Alex Rivera",
      role: "Content Creator",
      comment: "The voice quality is absolutely insane. I've used it for my entire YouTube channel and nobody can tell it's AI.",
      avatar: "https://picsum.photos/seed/alex/100/100"
    },
    {
      name: "Sarah Chen",
      role: "Product Manager",
      comment: "BG LABS has completely transformed our localization workflow. We can now launch in 10 languages simultaneously.",
      avatar: "https://picsum.photos/seed/sarah/100/100"
    },
    {
      name: "Marcus Thorne",
      role: "Game Developer",
      comment: "The low latency is a game-changer for our real-time NPC interactions. Simply the best TTS on the market.",
      avatar: "https://picsum.photos/seed/marcus/100/100"
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#030303] overflow-x-hidden">
      <Navbar />

      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-blue/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-purple/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-neon-blue/5 blur-[100px] rounded-full" />
      </div>

      {/* --- Hero Section --- */}
      <section ref={heroRef} className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-neon-blue mb-8 backdrop-blur-md"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Introducing BG LABS v2.0</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-display font-bold tracking-tighter text-white mb-8 leading-[0.9]"
          >
            Next-Gen <br />
            <span className="gradient-text">AI Voices</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Ultra-realistic text-to-speech & voice cloning for creators, 
            developers, and global brands. Indistinguishable from human speech.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/dashboard/tts" className="btn-primary group flex items-center gap-2">
              Generate Voice
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#demo" className="btn-secondary flex items-center gap-2">
              View Demo
            </a>
          </motion.div>

          {/* Hero Image/Animation Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-20 relative max-w-5xl mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent z-10" />
            <div className="glass-card p-4 border-white/5 bg-white/[0.01] overflow-hidden">
              <img 
                src="https://picsum.photos/seed/dashboard/1920/1080?blur=2" 
                alt="Dashboard Preview" 
                className="rounded-2xl opacity-50 grayscale hover:grayscale-0 transition-all duration-1000"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- Features Section --- */}
      <section id="features" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Powerful Features for <br /> <span className="gradient-text">Modern Creators</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Everything you need to create high-quality audio content at scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <FeatureCard 
                key={i} 
                icon={feature.icon} 
                title={feature.title} 
                description={feature.description} 
                index={i} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* --- Live Playground Section --- */}
      <section id="demo" className="py-24 px-6 bg-white/[0.01] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-blue/5 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="text-neon-blue font-bold tracking-widest text-xs uppercase mb-4 block">Interactive Demo</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white">Try it Yourself</h2>
          </div>

          <div className="glass-card p-8 md:p-12 shadow-2xl shadow-neon-blue/10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 ml-1">Input Text</label>
                  <textarea
                    value={demoText}
                    onChange={(e) => setDemoText(e.target.value)}
                    className="w-full h-48 bg-black/40 border border-white/10 rounded-2xl p-6 text-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-neon-blue/30 transition-all resize-none"
                    placeholder="Type something to hear the magic..."
                  />
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => setIsGenerating(true)}
                    disabled={isGenerating}
                    className="btn-primary flex items-center gap-2 min-w-[180px] justify-center"
                  >
                    {isGenerating ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      >
                        <Zap className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <Play className="w-5 h-5 fill-current" />
                    )}
                    {isGenerating ? "Generating..." : "Generate Audio"}
                  </button>
                  
                  <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300">
                    <Mic2 className="w-4 h-4 text-neon-blue" />
                    <span>Voice: Adam (Professional)</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col justify-center gap-6">
                <div className="glass-card p-6 border-white/5 bg-white/[0.02]">
                  <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-neon-blue" />
                    Output Preview
                  </h4>
                  
                  <div className="h-24 flex items-end gap-1 mb-6">
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          height: isGenerating ? [10, 40, 20, 60, 30] : 10 
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 0.5, 
                          delay: i * 0.05,
                          ease: "easeInOut"
                        }}
                        className="flex-1 bg-gradient-to-t from-neon-blue to-neon-purple rounded-full min-h-[4px]"
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>0:00</span>
                    <span>0:12</span>
                  </div>
                </div>

                <div className="p-4 bg-neon-blue/10 border border-neon-blue/20 rounded-xl text-xs text-neon-blue font-medium text-center">
                  Sign up to unlock all 150+ premium voices
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Stats Section --- */}
      <section id="stats" className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <StatCounter 
              key={i} 
              value={stat.value} 
              label={stat.label} 
              suffix={stat.suffix} 
            />
          ))}
        </div>
      </section>

      {/* --- Pricing Teaser Section --- */}
      <section id="pricing" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Simple, Transparent <span className="gradient-text">Pricing</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Choose the plan that's right for your creative journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricing.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "glass-card p-8 flex flex-col relative overflow-hidden group",
                  plan.popular && "border-neon-blue/50 ring-1 ring-neon-blue/20"
                )}
              >
                {plan.popular && (
                  <div className="absolute top-4 right-[-35px] rotate-45 bg-neon-blue text-black text-[10px] font-bold py-1 px-10">
                    POPULAR
                  </div>
                )}
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-white">${plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-gray-500 text-sm">/mo</span>}
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-gray-400">
                      <CheckCircle2 className="w-4 h-4 text-neon-blue shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <a 
                  href="https://wa.me/923006713668" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={cn(
                    "w-full py-3 rounded-xl font-bold transition-all text-center",
                    plan.popular ? "btn-primary" : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                  )}
                >
                  Get Started
                </a>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link to="/login" className="text-neon-blue font-bold flex items-center justify-center gap-2 group">
              View full pricing details
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* --- Testimonials Section --- */}
      <section className="py-24 px-6 bg-white/[0.01] overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Loved by <span className="gradient-text">Thousands</span>
            </h2>
          </div>

          <div className="flex animate-scroll hover:pause">
            <div className="flex">
              {testimonials.map((t, i) => (
                <TestimonialCard 
                  key={i} 
                  name={t.name} 
                  role={t.role} 
                  comment={t.comment} 
                  avatar={t.avatar} 
                />
              ))}
            </div>
            {/* Duplicate for infinite scroll */}
            <div className="flex">
              {testimonials.map((t, i) => (
                <TestimonialCard 
                  key={i + 10} 
                  name={t.name} 
                  role={t.role} 
                  comment={t.comment} 
                  avatar={t.avatar} 
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/10 to-neon-purple/10 pointer-events-none" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-8">
                Ready to find your <br /> <span className="gradient-text">Perfect Voice?</span>
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto mb-12 text-lg">
                Join 50,000+ creators and start generating ultra-realistic AI voices today.
              </p>
              <Link to="/login" className="btn-primary inline-flex items-center gap-2">
                Get Started for Free
                <ChevronRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-20 px-6 border-t border-white/10 bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center shadow-lg shadow-neon-blue/20">
                <Zap className="text-white w-6 h-6 fill-current" />
              </div>
              <span className="text-2xl font-display font-bold tracking-tighter text-white">
                BG <span className="gradient-text">LABS</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              The world's most advanced AI voice platform. 
              Creating human-like speech for the next generation of content.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-neon-blue hover:border-neon-blue/30 transition-all">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-neon-blue hover:border-neon-blue/30 transition-all">
                <Github size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-neon-blue hover:border-neon-blue/30 transition-all">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a href="#features" className="hover:text-neon-blue transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-neon-blue transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-neon-blue transition-colors">Voice Cloning</a></li>
              <li><a href="#" className="hover:text-neon-blue transition-colors">API Reference</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Resources</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a href="#" className="hover:text-neon-blue transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-neon-blue transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-neon-blue transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-neon-blue transition-colors">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a href="#" className="hover:text-neon-blue transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-neon-blue transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-neon-blue transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-neon-blue transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-600 text-xs">
          <p>© 2026 BG LABS AI. All rights reserved.</p>
          <p>Built with ❤️ for the future of audio.</p>
        </div>
      </footer>

      {/* Custom Scroll Animation Style */}
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        .pause:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
