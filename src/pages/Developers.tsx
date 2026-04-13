import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { 
  Code2, 
  Key, 
  Copy, 
  Check, 
  RefreshCw, 
  Terminal, 
  Book, 
  Zap, 
  ShieldCheck,
  ExternalLink,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Developers() {
  const { user, token, refreshUser } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"curl" | "node" | "python">("curl");

  const handleGenerateKey = async () => {
    if (!token) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/developers/key", {
        method: "POST",
        headers: { "Authorization": token }
      });
      if (res.ok) {
        await refreshUser();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const snippets = {
    curl: `curl -X POST https://api.bglabs.ai/v1/tts \\
  -H "Authorization: Bearer ${user?.apiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Hello world",
    "voice_id": "rachel_v2",
    "model_id": "bg_standard_v1"
  }'`,
    node: `const axios = require('axios');

const generateTTS = async () => {
  const response = await axios.post('https://api.bglabs.ai/v1/tts', {
    text: "Hello world",
    voice_id: "rachel_v2"
  }, {
    headers: {
      'Authorization': 'Bearer ${user?.apiKey || 'YOUR_API_KEY'}'
    }
  });
  
  console.log(response.data);
};`,
    python: `import requests

url = "https://api.bglabs.ai/v1/tts"
headers = {
    "Authorization": "Bearer ${user?.apiKey || 'YOUR_API_KEY'}",
    "Content-Type": "application/json"
}
data = {
    "text": "Hello world",
    "voice_id": "rachel_v2"
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Developer API</h1>
          <p className="text-gray-400 mt-1">Integrate ultra-realistic AI voices directly into your applications.</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-all">
            <Book size={14} />
            Full API Docs
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* API Key Management */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 border-white/5 bg-zinc-900/30 space-y-6">
            <div className="flex items-center gap-2 text-white font-bold">
              <Key size={18} className="text-brand-400" />
              API Authentication
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Your API Key</label>
                <div className="relative group">
                  <input
                    type="text"
                    readOnly
                    value={user?.apiKey || "No API key generated yet"}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 pr-12 text-white font-mono text-xs focus:outline-none transition-all"
                  />
                  {user?.apiKey && (
                    <button
                      onClick={() => handleCopy(user.apiKey!)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-brand-400 transition-colors"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={handleGenerateKey}
                disabled={isGenerating}
                className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <RefreshCw size={16} />
                )}
                {user?.apiKey ? "Regenerate Key" : "Generate API Key"}
              </button>

              <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl flex gap-3">
                <ShieldCheck className="text-yellow-400 shrink-0" size={18} />
                <p className="text-[11px] text-yellow-200/70 leading-relaxed">
                  Keep your API key secret. Do not share it or commit it to version control.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border-white/5 bg-zinc-900/30 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold">
              <Zap size={18} className="text-brand-400" />
              Usage Limits
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Rate Limit</span>
                <span className="text-white font-bold">100 requests / min</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Concurrent Requests</span>
                <span className="text-white font-bold">5 requests</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Max Characters</span>
                <span className="text-white font-bold">10,000 / request</span>
              </div>
            </div>
          </div>
        </div>

        {/* Code Snippets */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card border-white/5 bg-zinc-900/30 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div className="flex items-center gap-2 text-white font-bold">
                <Terminal size={18} className="text-brand-400" />
                Quick Start
              </div>
              <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                {(["curl", "node", "python"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-all",
                      activeTab === tab 
                        ? "bg-white/10 text-white" 
                        : "text-gray-500 hover:text-gray-300"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <pre className="p-6 text-xs font-mono text-gray-300 overflow-x-auto leading-relaxed bg-black/20">
                {snippets[activeTab]}
              </pre>
              <button
                onClick={() => handleCopy(snippets[activeTab])}
                className="absolute top-4 right-4 p-2 bg-white/5 border border-white/10 rounded-lg text-gray-500 hover:text-white transition-all"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 border-white/5 bg-zinc-900/30 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                <Code2 className="text-brand-400" size={20} />
              </div>
              <h3 className="text-white font-bold">SDKs & Libraries</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Official SDKs for Node.js, Python, and Go are available to simplify your integration.
              </p>
              <button className="text-xs text-brand-400 font-bold hover:underline">View on GitHub</button>
            </div>
            <div className="glass-card p-6 border-white/5 bg-zinc-900/30 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                <ShieldCheck className="text-brand-400" size={20} />
              </div>
              <h3 className="text-white font-bold">Webhooks</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Receive real-time notifications for completed generations and credit usage alerts.
              </p>
              <button className="text-xs text-brand-400 font-bold hover:underline">Configure Webhooks</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
