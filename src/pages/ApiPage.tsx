import { Code, Copy, Terminal, Check } from "lucide-react";
import { useState } from "react";

export default function ApiPage() {
  const [copied, setCopied] = useState(false);
  
  const codeSample = `const response = await fetch('https://api.voxora.ai/v1/tts', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: 'Hello world',
    voice_id: 'kore_v2',
    model_id: 'voxora-turbo-1'
  })
});

const audioBuffer = await response.arrayBuffer();`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeSample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-32 pb-24">
      <div className="max-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-wider mb-6">
              Developer First
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-8">
              Build with the world's <br />
              <span className="gradient-text">Best AI Voices</span>
            </h1>
            <p className="text-lg text-gray-400 mb-10 leading-relaxed">
              Integrate Voxora AI into your applications with our simple yet powerful REST API. 
              Get low-latency, high-fidelity speech generation in any environment.
            </p>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Terminal className="text-brand-400 w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">Simple REST API</h3>
                  <p className="text-sm text-gray-400">Standard HTTP requests with JSON payloads. No complex SDKs required.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="text-brand-400 w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">Ultra-low Latency</h3>
                  <p className="text-sm text-gray-400">Optimized for real-time applications like gaming, assistants, and accessibility.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Globe className="text-brand-400 w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">Global Edge Network</h3>
                  <p className="text-sm text-gray-400">Served from 20+ regions worldwide to ensure fast delivery everywhere.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-brand-500/10 blur-[100px] -z-10" />
            <div className="glass-card overflow-hidden border-white/10 shadow-2xl">
              <div className="bg-white/5 px-6 py-3 border-b border-white/10 flex justify-between items-center">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-xs font-medium"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy code"}
                </button>
              </div>
              <div className="p-6 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300 leading-relaxed">
                  <code>{codeSample}</code>
                </pre>
              </div>
            </div>
            
            <div className="mt-8 glass-card p-6 border-white/5">
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-brand-400" />
                API Key Management
              </h4>
              <p className="text-sm text-gray-400 mb-6">
                Your API keys are sensitive. Never share them or expose them in client-side code.
              </p>
              <div className="flex gap-3">
                <input 
                  type="password" 
                  readOnly 
                  value="vx_live_7823947239847239847" 
                  className="flex-grow bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-gray-500 font-mono"
                />
                <button className="btn-secondary py-2 px-4 text-sm whitespace-nowrap">
                  Regenerate
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Zap({ className, size }: { className?: string; size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M4 14.71 14 2l-1.5 8.29H20L10 22l1.5-8.29H4z" />
    </svg>
  );
}

function Globe({ className, size }: { className?: string; size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20" />
      <path d="M12 2a14.5 14.5 0 0 1 0 20" />
      <path d="M2 12h20" />
    </svg>
  );
}
