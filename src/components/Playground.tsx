import { useState, useRef } from "react";
import { Play, Square, Loader2, Volume2, ChevronDown, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { VOICES, generateSpeech } from "@/services/voiceService";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export default function Playground() {
  const { user, token, refreshUser } = useAuth();
  const [text, setText] = useState("Experience the future of AI voice generation. Enter any text and hear it come to life with human-like emotion and clarity.");
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallbackActive, setFallbackActive] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleGenerate = async () => {
    if (!text.trim() || isGenerating || !token) return;
    
    setIsGenerating(true);
    setError(null);
    setFallbackActive(false);
    try {
      const { url, isFallback } = await generateSpeech(text, selectedVoice.id, token);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioUrl(url);
      setFallbackActive(isFallback);
      await refreshUser(); // Refresh credits
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="glass-card p-6 md:p-8 max-w-4xl mx-auto shadow-2xl shadow-brand-500/10">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-500/20 rounded-lg flex items-center justify-center">
              <Volume2 className="text-brand-400 w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Voice Playground</h3>
              <p className="text-sm text-gray-400">Test our ultra-realistic voices</p>
            </div>
          </div>
          
          <div className="relative group w-full md:w-auto">
            <select
              value={selectedVoice.id}
              onChange={(e) => setSelectedVoice(VOICES.find(v => v.id === e.target.value) || VOICES[0])}
              className="w-full md:w-48 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
            >
              {VOICES.map((voice) => (
                <option key={voice.id} value={voice.id} className="bg-gray-900">
                  {voice.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
          </div>
        </div>

        {/* Text Input */}
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type something here..."
            className={cn(
              "w-full h-40 md:h-48 bg-black/40 border rounded-2xl p-6 text-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 transition-all resize-none",
              error ? "border-red-500/50 focus:ring-red-500/30" : "border-white/10 focus:ring-brand-500/30"
            )}
            maxLength={1000}
          />
          <div className="absolute bottom-4 right-6 text-xs text-gray-500">
            {text.length} / 1000 characters
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400"
          >
            {error}
          </motion.div>
        )}

        {fallbackActive && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-brand-500/10 border border-brand-500/20 rounded-xl text-sm text-brand-400 flex items-center gap-2"
          >
            <Zap size={16} />
            ElevenLabs plan restricted. Using high-quality AI fallback voice.
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !text.trim()}
            className={cn(
              "btn-primary w-full md:w-auto flex items-center justify-center gap-2 min-w-[160px]",
              isGenerating && "opacity-70 cursor-not-allowed"
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                Generate Voice
              </>
            )}
          </button>

          <AnimatePresence>
            {audioUrl && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-4 w-full md:w-auto bg-white/5 rounded-xl p-2 pr-4 border border-white/10"
              >
                <button
                  onClick={togglePlayback}
                  className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center text-white hover:bg-brand-600 transition-colors"
                >
                  {isPlaying ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                </button>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-white">Generated Audio</span>
                  <span className="text-[10px] text-gray-500">Ready to play</span>
                </div>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
