import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mic, 
  Upload, 
  Play, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Trash2,
  Volume2,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ClonedVoice {
  id: string;
  name: string;
  sampleUrl: string;
  timestamp: string;
}

export default function VoiceCloning() {
  const { token } = useAuth();
  const [voices, setVoices] = useState<ClonedVoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCloning, setIsCloning] = useState(false);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchVoices = async () => {
      if (!token) return;
      try {
        const res = await fetch("/api/cloning", {
          headers: { "Authorization": token }
        });
        if (res.ok) {
          const data = await res.json();
          setVoices(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVoices();
  }, [token]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleClone = async () => {
    if (!name || !file || !token) return;
    setIsCloning(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("file", file);
      
      const res = await fetch("/api/cloning", {
        method: "POST",
        headers: {
          "Authorization": token
        },
        body: formData
      });

      if (res.ok) {
        const newVoice = await res.json();
        setVoices([newVoice, ...voices]);
        setSuccess(true);
        setName("");
        setFile(null);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to clone voice");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Voice Cloning</h1>
        <p className="text-gray-400 mt-1">Create a digital twin of any voice with just 30 seconds of audio.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Clone Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 border-white/5 bg-zinc-900/30 space-y-6">
            <div className="flex items-center gap-2 text-white font-bold">
              <Plus size={18} className="text-brand-400" />
              New Clone
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Voice Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. My Professional Voice"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Audio Sample</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="voice-upload"
                  />
                  <label
                    htmlFor="voice-upload"
                    className={cn(
                      "flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all",
                      file 
                        ? "border-brand-500/50 bg-brand-500/5" 
                        : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                    )}
                  >
                    {file ? (
                      <>
                        <CheckCircle2 className="text-brand-400" size={32} />
                        <div className="text-center">
                          <p className="text-sm text-white font-medium truncate max-w-[200px]">{file.name}</p>
                          <p className="text-[10px] text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="text-gray-500" size={32} />
                        <div className="text-center">
                          <p className="text-sm text-gray-300 font-medium">Click to upload</p>
                          <p className="text-[10px] text-gray-500">WAV, MP3 up to 10MB</p>
                        </div>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl flex gap-3">
                <Mic className="text-blue-400 shrink-0" size={18} />
                <p className="text-[11px] text-blue-200/70 leading-relaxed">
                  For best results, use a high-quality recording with no background noise, 15-30 seconds long.
                </p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs"
                  >
                    <AlertCircle size={14} />
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-2 text-green-400 text-xs"
                  >
                    <CheckCircle2 size={14} />
                    Voice cloned successfully!
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleClone}
                disabled={isCloning || !name || !file}
                className="w-full py-4 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:hover:bg-brand-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/20"
              >
                {isCloning ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Zap size={20} />
                )}
                {isCloning ? "Processing..." : "Clone Voice"}
              </button>
            </div>
          </div>
        </div>

        {/* Cloned Voices List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Your Clones</h2>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">
              {voices.length} / 10 slots used
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-brand-500" size={40} />
                <p className="text-gray-500 font-medium">Loading your voices...</p>
              </div>
            ) : voices.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-zinc-900/30 border border-white/5 rounded-3xl">
                <Mic className="mx-auto text-gray-700 mb-4" size={48} />
                <p className="text-gray-500 font-medium">No cloned voices yet.</p>
                <p className="text-xs text-gray-600 mt-1">Upload a sample to get started.</p>
              </div>
            ) : (
              voices.map((voice) => (
                <motion.div
                  key={voice.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card p-5 border-white/5 bg-zinc-900/40 hover:bg-zinc-900/60 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                        <Volume2 className="text-brand-400" size={20} />
                      </div>
                      <div>
                        <h3 className="text-white font-bold">{voice.name}</h3>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                          {new Date(voice.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button className="p-2 text-gray-600 hover:text-red-400 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="flex-grow flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-300 hover:bg-white/10 transition-all">
                      <Play size={14} />
                      Play Sample
                    </button>
                    <button className="px-4 py-2.5 bg-brand-500/10 border border-brand-500/20 rounded-xl text-xs font-bold text-brand-400 hover:bg-brand-500/20 transition-all">
                      Use Voice
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
