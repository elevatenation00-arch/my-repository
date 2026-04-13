import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface VoiceOption {
  id: string;
  name: string;
  description: string;
  previewUrl?: string;
  isGemini?: boolean;
}

// ElevenLabs default voices + Gemini fallbacks
export const VOICES: VoiceOption[] = [
  { id: "Kore", name: "Kore (AI)", description: "Warm and professional", isGemini: true },
  { id: "Zephyr", name: "Zephyr (AI)", description: "Cheerful and bright", isGemini: true },
  { id: "Puck", name: "Puck (AI)", description: "Friendly and energetic", isGemini: true },
  { id: "Charon", name: "Charon (AI)", description: "Deep and authoritative", isGemini: true },
  { id: "Fenrir", name: "Fenrir (AI)", description: "Calm and soothing", isGemini: true },
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel (Premium)", description: "Soft and gentle" },
  { id: "AZnzlk1XhkUvSthB98n0", name: "Domi (Premium)", description: "Strong and confident" },
  { id: "ErXw7ePBqByxCqv9HKmM", name: "Antoni (Premium)", description: "Well-rounded and deep" },
  { id: "MF3mGyEYCl7XYW7LecjN", name: "Elli (Premium)", description: "Narrative and warm" },
];

export async function generateSpeech(text: string, voiceId: string, token: string): Promise<{ url: string; isFallback: boolean }> {
  const voice = VOICES.find(v => v.id === voiceId);
  
  if (voice?.isGemini) {
    const url = await generateGeminiSpeech(text, voiceId);
    return { url, isFallback: false };
  }

  try {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      body: JSON.stringify({ text, voiceId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // If ElevenLabs fails due to plan restrictions OR missing voices, auto-fallback to Gemini
      const isRestricted = 
        errorData.detail?.code === "paid_plan_required" || 
        errorData.detail?.type === "payment_required" ||
        errorData.detail?.status === "payment_required";

      const isNotFound = 
        errorData.detail?.code === "voice_not_found" || 
        errorData.detail?.status === "voice_not_found";

      if (isRestricted || isNotFound) {
        console.warn(`ElevenLabs error (${errorData.detail?.code}). Falling back to Gemini AI Voice...`);
        const url = await generateGeminiSpeech(text, "Kore");
        return { url, isFallback: true };
      }
      
      const message = errorData.detail?.message || errorData.error?.message || errorData.message || errorData.error || "Failed to generate speech";
      throw new Error(message);
    }

    const blob = await response.blob();
    return { url: URL.createObjectURL(blob), isFallback: false };
  } catch (error) {
    console.error("Speech generation failed:", error);
    // Final fallback for any plan-related or missing voice errors
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (errorMsg.includes("paid_plan_required") || errorMsg.includes("payment_required") || errorMsg.includes("voice_not_found")) {
      const url = await generateGeminiSpeech(text, "Kore");
      return { url, isFallback: true };
    }
    throw error;
  }
}

async function generateGeminiSpeech(text: string, voiceName: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { 
              voiceName: ["Kore", "Zephyr", "Puck", "Charon", "Fenrir"].includes(voiceName) ? voiceName : "Kore" 
            },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data from Gemini");

    const binary = atob(base64Audio);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    
    const wavHeader = createWavHeader(bytes.length, 24000);
    const wavBytes = new Uint8Array(wavHeader.length + bytes.length);
    wavBytes.set(wavHeader, 0);
    wavBytes.set(bytes, wavHeader.length);

    return URL.createObjectURL(new Blob([wavBytes], { type: "audio/wav" }));
  } catch (error) {
    console.error("Gemini fallback failed:", error);
    throw error;
  }
}

function createWavHeader(dataLength: number, sampleRate: number): Uint8Array {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataLength, true);

  return new Uint8Array(header);
}
