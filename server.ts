import express from "express";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- In-Memory Database ---
interface User {
  id: string;
  email: string;
  passwordHash: string;
  credits: number;
  totalCredits: number;
  plan: 'Free' | 'Creator' | 'Pro' | 'Enterprise';
  expiryDate: string;
  role: 'admin' | 'manager' | 'user';
  apiKey?: string;
  isBlocked?: boolean;
}

interface ClonedVoice {
  id: string;
  userId: string;
  name: string;
  sampleUrl: string;
  timestamp: string;
}

interface AudioHistory {
  id: string;
  userId: string;
  text: string;
  voiceId: string;
  title?: string;
  timestamp: string;
}

interface Feedback {
  id: string;
  userId: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
}

// Pre-hashed password for "passward123@."
const ADMIN_PASSWORD_HASH = "$2b$10$7R.S6R9X8Z.S6R9X8Z.S6R9X8Z.S6R9X8Z.S6R9X8Z.S6R9X8Z.S6"; // This is a placeholder, I'll generate a real one or just hash it at startup

const users: User[] = [
  {
    id: "admin-1",
    email: "bglabs@gmail.com",
    passwordHash: "", // Will be set in startServer
    credits: 999999,
    totalCredits: 999999,
    plan: "Enterprise",
    expiryDate: "2099-12-31",
    role: "admin",
  },
];

const history: AudioHistory[] = [];
const feedbackList: Feedback[] = [];
const clonedVoices: ClonedVoice[] = [];

// --- Middleware ---
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  
  const user = users.find(u => u.id === token);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  if (user.isBlocked) return res.status(403).json({ error: "Account blocked. Please contact admin." });
  
  req.user = user;
  next();
};

const adminOnly = (req: any, res: any, next: any) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden: Admin access required" });
  next();
};

const staffOnly = (req: any, res: any, next: any) => {
  if (req.user.role !== "admin" && req.user.role !== "manager") {
    return res.status(403).json({ error: "Forbidden: Staff access required" });
  }
  next();
};

async function startServer() {
  // Hash the initial admin password
  users[0].passwordHash = await bcrypt.hash("passward123@.", 10);

  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- Auth Routes ---
  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    if (user.isBlocked) return res.status(403).json({ error: "Account blocked. Please contact admin." });
    
    res.json({ 
      token: user.id, 
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        credits: user.credits,
        totalCredits: user.totalCredits,
        plan: user.plan,
        expiryDate: user.expiryDate,
        apiKey: user.apiKey
      } 
    });
  });

  app.get("/api/me", authenticate, (req: any, res) => {
    res.json(req.user);
  });

  // --- User Management (Staff/Admin) ---
  app.get("/api/admin/users", authenticate, staffOnly, (req, res) => {
    res.json(users.map(({ passwordHash, ...u }) => u));
  });

  app.post("/api/admin/users", authenticate, adminOnly, async (req, res) => {
    const { email, password, credits, totalCredits, plan, expiryDate, role, isBlocked } = req.body;
    
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password || "123456", 10);

    const newUser: User = {
      id: uuidv4(),
      email,
      passwordHash,
      credits: credits || 1000,
      totalCredits: totalCredits || credits || 1000,
      plan: plan || "Free",
      expiryDate: expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      role: role || "user",
      isBlocked: !!isBlocked,
    };

    users.push(newUser);
    res.json(newUser);
  });

  app.delete("/api/admin/users/:id", authenticate, adminOnly, (req, res) => {
    const index = users.findIndex(u => u.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "User not found" });
    if (users[index].role === "admin") return res.status(403).json({ error: "Cannot delete admin" });
    
    users.splice(index, 1);
    res.json({ success: true });
  });

  app.patch("/api/admin/users/:id", authenticate, staffOnly, (req: any, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Managers cannot edit admins
    if (req.user.role === "manager" && user.role === "admin") {
      return res.status(403).json({ error: "Managers cannot edit admins" });
    }

    const { credits, totalCredits, plan, expiryDate, role, isBlocked } = req.body;
    
    if (credits !== undefined) user.credits = credits;
    if (totalCredits !== undefined) user.totalCredits = totalCredits;
    if (plan !== undefined) user.plan = plan;
    if (expiryDate !== undefined) user.expiryDate = expiryDate;
    if (isBlocked !== undefined) user.isBlocked = isBlocked;
    
    // Only admins can change roles
    if (role !== undefined) {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Only admins can change roles" });
      }
      user.role = role;
    }

    res.json(user);
  });

  // --- Feedback Routes ---
  app.post("/api/feedback", authenticate, (req: any, res) => {
    const { email, subject, message } = req.body;
    if (!email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newFeedback: Feedback = {
      id: uuidv4(),
      userId: req.user.id,
      email,
      subject,
      message,
      timestamp: new Date().toISOString(),
    };

    feedbackList.push(newFeedback);
    res.json({ success: true, feedback: newFeedback });
  });

  app.get("/api/admin/feedback", authenticate, staffOnly, (req, res) => {
    res.json(feedbackList);
  });

  // --- Developer Routes ---
  app.post("/api/developers/key", authenticate, (req: any, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.apiKey = `bg_${uuidv4().replace(/-/g, '')}`;
    res.json({ apiKey: user.apiKey });
  });

  const upload = multer({ storage: multer.memoryStorage() });

  // --- Voice Cloning Routes ---
  app.get("/api/cloning", authenticate, (req: any, res) => {
    const userVoices = clonedVoices.filter(v => v.userId === req.user.id);
    res.json(userVoices);
  });

  app.post("/api/cloning", authenticate, upload.single("file"), async (req: any, res) => {
    const { name } = req.body;
    const file = req.file;
    if (!name || !file) return res.status(400).json({ error: "Name and file are required" });

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "ELEVENLABS_API_KEY is not configured" });

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("files", new Blob([file.buffer], { type: file.mimetype }), file.originalname);

      const response = await fetch("https://api.elevenlabs.io/v1/voices/add", {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json(errorData);
      }

      const data = await response.json();
      const newVoice: ClonedVoice = {
        id: data.voice_id,
        userId: req.user.id,
        name,
        sampleUrl: "", // ElevenLabs doesn't return the sample URL directly
        timestamp: new Date().toISOString(),
      };

      clonedVoices.push(newVoice);
      res.json(newVoice);
    } catch (error) {
      console.error("ElevenLabs Cloning Error:", error);
      res.status(500).json({ error: "Cloning failed" });
    }
  });

  // --- Admin Stats ---
  app.get("/api/admin/stats", authenticate, staffOnly, (req, res) => {
    const totalUsers = users.length;
    const totalGenerations = history.length;
    const totalCharacters = history.reduce((acc, h) => acc + h.text.length, 0);
    const totalFeedback = feedbackList.length;
    const totalClonedVoices = clonedVoices.length;

    // Most used voices
    const voiceUsage: Record<string, number> = {};
    history.forEach(h => {
      voiceUsage[h.voiceId] = (voiceUsage[h.voiceId] || 0) + 1;
    });

    const topVoices = Object.entries(voiceUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id, count]) => ({ id, count }));

    res.json({
      totalUsers,
      totalGenerations,
      totalCharacters,
      totalFeedback,
      totalClonedVoices,
      topVoices
    });
  });

  // --- Podcast Routes ---
  app.post("/api/podcast", authenticate, async (req: any, res) => {
    const { topic, hostAvatar, guestAvatar, hostVoice, guestVoice } = req.body;
    if (!topic) return res.status(400).json({ error: "Topic is required" });

    // In a real app, you would call HeyGen API here using process.env.HEYGEN_API_KEY
    // const apiKey = process.env.HEYGEN_API_KEY;
    
    console.log("Generating podcast for:", topic, hostAvatar, guestAvatar, hostVoice, guestVoice);

    // Mock response
    res.json({ success: true, message: "Podcast generation started" });
  });

  // --- AI / TTS Routes ---
  app.get("/api/voices", async (req, res) => {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      // Return mock voices if no API key
      return res.json([
        { voice_id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", category: "premade", preview_url: "" },
        { voice_id: "AZnzlk1XhkDUD96E2EEI", name: "Domi", category: "premade", preview_url: "" },
        { voice_id: "EXAVITQu4vr4xnNLPrIn", name: "Bella", category: "premade", preview_url: "" },
        { voice_id: "ErXw9S1q39YNo94nEnDx", name: "Antoni", category: "premade", preview_url: "" },
        { voice_id: "MF3mGyEYCl7XYW7ICZTi", name: "Josh", category: "premade", preview_url: "" },
        { voice_id: "TxGEqnHW47ic3KoP1L9U", name: "Josh", category: "premade", preview_url: "" },
        { voice_id: "VR6AewLTigWG4xSOukaG", name: "Arnold", category: "premade", preview_url: "" },
        { voice_id: "pNInz6obpgDQGcFmaJgB", name: "Adam", category: "premade", preview_url: "" },
        { voice_id: "yoZ06aH8qzB2hoSmc9qe", name: "Sam", category: "premade", preview_url: "" },
      ]);
    }

    try {
      const response = await fetch("https://api.elevenlabs.io/v1/voices", {
        headers: { "xi-api-key": apiKey }
      });
      if (response.ok) {
        const data = await response.json();
        res.json(data.voices);
      } else {
        throw new Error("Failed to fetch voices from ElevenLabs");
      }
    } catch (error) {
      console.error("Voices Fetch Error:", error);
      res.json([
        { voice_id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", category: "premade", preview_url: "" },
        { voice_id: "AZnzlk1XhkDUD96E2EEI", name: "Domi", category: "premade", preview_url: "" },
        { voice_id: "EXAVITQu4vr4xnNLPrIn", name: "Bella", category: "premade", preview_url: "" },
        { voice_id: "ErXw9S1q39YNo94nEnDx", name: "Antoni", category: "premade", preview_url: "" },
        { voice_id: "MF3mGyEYCl7XYW7ICZTi", name: "Josh", category: "premade", preview_url: "" },
        { voice_id: "TxGEqnHW47ic3KoP1L9U", name: "Josh", category: "premade", preview_url: "" },
        { voice_id: "VR6AewLTigWG4xSOukaG", name: "Arnold", category: "premade", preview_url: "" },
        { voice_id: "pNInz6obpgDQGcFmaJgB", name: "Adam", category: "premade", preview_url: "" },
        { voice_id: "yoZ06aH8qzB2hoSmc9qe", name: "Sam", category: "premade", preview_url: "" },
      ]);
    }
  });

  app.get("/api/history", authenticate, (req: any, res) => {
    const userHistory = history.filter(h => h.userId === req.user.id);
    res.json(userHistory);
  });

  app.post("/api/generate", authenticate, async (req: any, res) => {
    const { text, voiceId, title } = req.body;
    const user = users.find(u => u.id === req.user.id);
    
    if (!user) return res.status(401).json({ error: "User not found" });

    // Check expiry
    if (new Date(user.expiryDate) < new Date()) {
      return res.status(403).json({ error: "Plan expired. Please contact admin." });
    }

    // Check credits
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const creditsToDeduct = wordCount * 4;
    if (user.credits < creditsToDeduct) {
      return res.status(403).json({ error: "Insufficient credits" });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "ELEVENLABS_API_KEY is not configured" });
    }

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ElevenLabs API error response:", errorText);
        try {
          const errorData = JSON.parse(errorText);
          return res.status(response.status).json(errorData);
        } catch (e) {
          return res.status(response.status).send(errorText);
        }
      }

      // Deduct credits
      user.credits -= creditsToDeduct;

      // Add to history
      history.push({
        id: uuidv4(),
        userId: user.id,
        text,
        voiceId,
        title: title || "Untitled",
        timestamp: new Date().toISOString(),
      });

      const audioBuffer = await response.arrayBuffer();
      res.set("Content-Type", "audio/mpeg");
      res.send(Buffer.from(audioBuffer));
    } catch (error) {
      console.error("ElevenLabs Proxy Error:", error);
      res.status(500).json({ 
        error: "Failed to generate speech", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
