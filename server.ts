import express from "express";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

dotenv.config();

const firebaseConfig = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));

let firebaseApp: any;
let db: any;

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
  isApproved?: boolean;
  apiKey?: string;
  isBlocked?: boolean;
  favoriteVoices?: string[];
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

interface ActivationRequest {
  id: string;
  userId: string;
  email: string;
  plan: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Pre-hashed password for "passward123@."
const ADMIN_PASSWORD_HASH = "$2b$10$7R.S6R9X8Z.S6R9X8Z.S6R9X8Z.S6R9X8Z.S6R9X8Z.S6R9X8Z.S6"; // This is a placeholder, I'll generate a real one or just hash it at startup

// --- Firestore Helpers ---
async function getUser(id: string): Promise<User | null> {
  const doc = await db.collection("users").doc(id).get();
  return doc.exists ? (doc.data() as User) : null;
}

const audioBuffers = new Map<string, Buffer>();

// --- Middleware ---
const authenticate = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Unauthorized: Missing Authorization header" });
  
  try {
    const user = await getUser(token);
    if (!user) return res.status(401).json({ error: "Unauthorized: Invalid Session" });
    if (user.isBlocked) return res.status(403).json({ error: "Account blocked. Please contact admin." });
    
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ error: "Internal server error during authentication" });
  }
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
  console.log("[System] Node version:", process.version);
  console.log("[System] CWD:", process.cwd());
  console.log("[Firebase] Resolving Firestore connection...");
  
  const envProjectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT;
  const configProjectId = firebaseConfig.projectId;
  
  console.log("[Firebase] Environment Project ID:", envProjectId);
  console.log("[Firebase] Config Project ID:", configProjectId);
  
  const attempts = [
    { name: "Config Project + Config DB", projectId: configProjectId, dbId: firebaseConfig.firestoreDatabaseId },
    { name: "Config Project + Default DB", projectId: configProjectId, dbId: undefined },
    { name: "Env Project + Config DB", projectId: envProjectId, dbId: firebaseConfig.firestoreDatabaseId },
    { name: "Env Project + Default DB", projectId: envProjectId, dbId: undefined },
    { name: "Default (Ambient)", projectId: undefined, dbId: undefined }
  ];

  for (const attempt of attempts) {
    try {
      console.log(`[Firebase] Attempting: ${attempt.name} (Project: ${attempt.projectId || "Default"}, DB: ${attempt.dbId || "Default"})`);
      
      let appToUse: any;
      if (attempt.projectId) {
        const appName = `app-${attempt.projectId}`;
        appToUse = getApps().find(a => a.name === appName) || initializeApp({ projectId: attempt.projectId }, appName);
      } else {
        appToUse = getApps().length > 0 ? getApps()[0] : initializeApp();
      }

      firebaseApp = appToUse; // Update global for future use if needed
      const testDb = attempt.dbId ? getFirestore(appToUse, attempt.dbId) : getFirestore(appToUse);
      
      // Connection test
      await testDb.collection("users").limit(1).get();
      
      db = testDb;
      console.log(`[Firebase] SUCCESS: Connected via ${attempt.name}`);
      break;
    } catch (err: any) {
      console.warn(`[Firebase] ${attempt.name} failed: ${err.message}`);
    }
  }

  if (!db) {
    console.error("[Firebase] CRITICAL: All connection attempts failed. Falling back to default getFirestore().");
    db = getFirestore();
  }

  console.log("[Config] AI Bridge URL:", process.env.LOCAL_AI_BRIDGE_URL || "Default (http://127.0.0.1:8000)");
  console.log("[Config] AI Bridge Secret Status:", process.env.AI_BRIDGE_SECRET_KEY ? "SET" : "NOT SET");
  
  // Seed initial Admin
  try {
    const adminId = "admin-1";
    const adminRef = db.collection("users").doc(adminId);
    const adminSnap = await adminRef.get();
    
    if (!adminSnap.exists) {
      console.log("[Seed] Creating root admin user...");
      const passwordHash = await bcrypt.hash("admin123", 10);
      const adminUser: User = {
        id: adminId,
        email: "bglabs@gmail.com",
        passwordHash,
        credits: 999999,
        totalCredits: 999999,
        plan: "Enterprise",
        expiryDate: "2099-12-31",
        role: "admin",
        isApproved: true,
      };
      await adminRef.set(adminUser);

      // Seed the current user as an additional admin if they don't exist
      const userEmail = "elevatenation00@gmail.com";
      const userSnap = await db.collection("users").where("email", "==", userEmail).get();
      if (userSnap.empty) {
        console.log("[Seed] Creating primary admin user:", userEmail);
        const userId = uuidv4();
        await db.collection("users").doc(userId).set({
          id: userId,
          email: userEmail,
          passwordHash, // Use admin123
          credits: 999999,
          totalCredits: 999999,
          plan: "Enterprise",
          expiryDate: "2099-12-31",
          role: "admin",
          isApproved: true,
        });
      }
    }
  } catch (error) {
    console.error("[Seed] Failed to seed admin:", error);
  }

  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- Auth Routes ---
  app.post("/api/signup", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
    
    try {
      const userSnap = await db.collection("users").where("email", "==", email).get();
      if (!userSnap.empty) {
        return res.status(400).json({ error: "User already exists" });
      }

      const id = uuidv4();
      const passwordHash = await bcrypt.hash(password, 10);
      const newUser: User = {
        id,
        email,
        passwordHash,
        credits: 1000,
        totalCredits: 1000,
        plan: "Free",
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        role: "user",
        isApproved: false,
        favoriteVoices: [],
      };

      await db.collection("users").doc(id).set(newUser);
      
      res.json({ 
        token: newUser.id,
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          credits: newUser.credits,
          totalCredits: newUser.totalCredits,
          plan: newUser.plan,
          expiryDate: newUser.expiryDate,
          favoriteVoices: newUser.favoriteVoices
        }
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Signup failed" });
    }
  });

  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      if (!db) {
        throw new Error("Firestore database not initialized. Check server logs.");
      }
      const userSnap = await db.collection("users").where("email", "==", email).get();
      if (userSnap.empty) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const userDoc = userSnap.docs[0];
      const user = userDoc.data() as User;
      
      if (!(await bcrypt.compare(password, user.passwordHash))) {
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
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/me", authenticate, (req: any, res) => {
    res.json(req.user);
  });

  // --- Favorites Routes ---
  app.get("/api/user/favorites", authenticate, (req: any, res) => {
    res.json(req.user.favoriteVoices || []);
  });

  app.post("/api/user/favorites", authenticate, async (req: any, res) => {
    const { voiceId } = req.body;
    if (!voiceId) return res.status(400).json({ error: "Voice ID is required" });
    
    try {
      const userRef = db.collection("users").doc(req.user.id);
      const userSnap = await userRef.get();
      if (!userSnap.exists) return res.status(404).json({ error: "User not found" });

      const user = userSnap.data() as User;
      const favoriteVoices = user.favoriteVoices || [];
      if (!favoriteVoices.includes(voiceId)) {
        favoriteVoices.push(voiceId);
        await userRef.update({ favoriteVoices });
      }
      res.json(favoriteVoices);
    } catch (error) {
      res.status(500).json({ error: "Failed to update favorites" });
    }
  });

  app.delete("/api/user/favorites/:voiceId", authenticate, async (req: any, res) => {
    try {
      const userRef = db.collection("users").doc(req.user.id);
      const userSnap = await userRef.get();
      if (!userSnap.exists) return res.status(404).json({ error: "User not found" });

      const user = userSnap.data() as User;
      const favoriteVoices = (user.favoriteVoices || []).filter(id => id !== req.params.voiceId);
      await userRef.update({ favoriteVoices });
      res.json(favoriteVoices);
    } catch (error) {
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  });

  // --- User Management (Staff/Admin) ---
  app.get("/api/admin/users", authenticate, staffOnly, async (req, res) => {
    try {
      const snap = await db.collection("users").get();
      const userList = snap.docs.map(doc => {
        const { passwordHash, ...u } = doc.data() as User;
        return u;
      });
      res.json(userList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", authenticate, adminOnly, async (req, res) => {
    const { email, password, credits, totalCredits, plan, expiryDate, role, isBlocked } = req.body;
    
    try {
      const userSnap = await db.collection("users").where("email", "==", email).get();
      if (!userSnap.empty) {
        return res.status(400).json({ error: "User already exists" });
      }

      const id = uuidv4();
      const passwordHash = await bcrypt.hash(password || "123456", 10);

      const newUser: User = {
        id,
        email,
        passwordHash,
        credits: credits || 1000,
        totalCredits: totalCredits || credits || 1000,
        plan: plan || "Free",
        expiryDate: expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        role: role || "user",
        isApproved: true,
        isBlocked: !!isBlocked,
      };

      await db.collection("users").doc(id).set(newUser);
      res.json(newUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.delete("/api/admin/users/:id", authenticate, adminOnly, async (req, res) => {
    try {
      const userRef = db.collection("users").doc(req.params.id);
      const userSnap = await userRef.get();
      if (!userSnap.exists) return res.status(404).json({ error: "User not found" });
      
      const userData = userSnap.data() as User;
      if (userData.role === "admin") return res.status(403).json({ error: "Cannot delete admin" });
      
      await userRef.delete();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  app.patch("/api/admin/users/:id", authenticate, staffOnly, async (req: any, res) => {
    try {
      const userRef = db.collection("users").doc(req.params.id);
      const userSnap = await userRef.get();
      if (!userSnap.exists) return res.status(404).json({ error: "User not found" });

      const user = userSnap.data() as User;

      // Managers cannot edit admins
      if (req.user.role === "manager" && user.role === "admin") {
        return res.status(403).json({ error: "Managers cannot edit admins" });
      }

      const { credits, totalCredits, plan, expiryDate, role, isBlocked, isApproved } = req.body;
      const updates: any = {};
      
      if (credits !== undefined) updates.credits = credits;
      if (totalCredits !== undefined) updates.totalCredits = totalCredits;
      if (plan !== undefined) updates.plan = plan;
      if (expiryDate !== undefined) updates.expiryDate = expiryDate;
      if (isBlocked !== undefined) updates.isBlocked = isBlocked;
      if (isApproved !== undefined) updates.isApproved = isApproved;
      
      if (role !== undefined) {
        if (req.user.role !== "admin") {
          return res.status(403).json({ error: "Only admins can change roles" });
        }
        updates.role = role;
      }

      await userRef.update(updates);
      const updatedSnap = await userRef.get();
      res.json(updatedSnap.data());
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // --- Feedback Routes ---
  app.post("/api/feedback", authenticate, async (req: any, res) => {
    const { email, subject, message } = req.body;
    if (!email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    try {
      const id = uuidv4();
      const newFeedback: Feedback = {
        id,
        userId: req.user.id,
        email,
        subject,
        message,
        timestamp: new Date().toISOString(),
      };

      await db.collection("feedback").doc(id).set(newFeedback);
      res.json({ success: true, feedback: newFeedback });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit feedback" });
    }
  });

  app.get("/api/admin/feedback", authenticate, staffOnly, async (req, res) => {
    try {
      const snap = await db.collection("feedback").get();
      const feedback = snap.docs.map(doc => doc.data());
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  // --- Activation Routes ---
  app.post("/api/activate-request", authenticate, async (req: any, res) => {
    const { plan } = req.body;
    if (!plan) return res.status(400).json({ error: "Plan is required" });

    try {
      const existingSnap = await db.collection("activationRequests")
        .where("userId", "==", req.user.id)
        .where("status", "==", "pending")
        .get();

      if (!existingSnap.empty) {
        return res.json({ success: true, message: "Request already pending", request: existingSnap.docs[0].data() });
      }

      const id = uuidv4();
      const newRequest: ActivationRequest = {
        id,
        userId: req.user.id,
        email: req.user.email,
        plan,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };

      await db.collection("activationRequests").doc(id).set(newRequest);
      res.json({ success: true, request: newRequest });
    } catch (error) {
      res.status(500).json({ error: "Failed to create request" });
    }
  });

  app.get("/api/admin/requests", authenticate, staffOnly, async (req, res) => {
    try {
      const snap = await db.collection("activationRequests").get();
      const requests = snap.docs.map(doc => doc.data());
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch requests" });
    }
  });

  app.post("/api/admin/requests/approve/:id", authenticate, staffOnly, async (req, res) => {
    try {
      const reqRef = db.collection("activationRequests").doc(req.params.id);
      const reqSnap = await reqRef.get();
      if (!reqSnap.exists) return res.status(404).json({ error: "Request not found" });

      const request = reqSnap.data() as ActivationRequest;
      await reqRef.update({ status: 'approved' });
      
      const userRef = db.collection("users").doc(request.userId);
      const userSnap = await userRef.get();
      if (userSnap.exists) {
        const user = userSnap.data() as User;
        let credits = user.credits;
        if (request.plan === 'Creator') credits = Math.max(credits, 10000);
        if (request.plan === 'Pro') credits = Math.max(credits, 50000);
        if (request.plan === 'Enterprise') credits = Math.max(credits, 999999);
        
        await userRef.update({
          isApproved: true,
          plan: request.plan,
          credits
        });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to approve request" });
    }
  });

  app.post("/api/admin/requests/reject/:id", authenticate, staffOnly, async (req, res) => {
    try {
      const reqRef = db.collection("activationRequests").doc(req.params.id);
      await reqRef.update({ status: 'rejected' });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to reject request" });
    }
  });

  // --- Developer Routes ---
  app.post("/api/developers/key", authenticate, async (req: any, res) => {
    try {
      const apiKey = `bg_${uuidv4().replace(/-/g, '')}`;
      await db.collection("users").doc(req.user.id).update({ apiKey });
      res.json({ apiKey });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate API key" });
    }
  });

  const upload = multer({ storage: multer.memoryStorage() });

  // --- AI Server Bridge (FastAPI XTTS v2) ---
  app.post("/api/local/generate", authenticate, upload.single("voice"), async (req: any, res) => {
    const { text, model, language, stability, chunkSize, title } = req.body;
    const voiceFile = req.file;

    console.log("[Bridge-Request]", { 
      text: text?.substring(0, 20) + "...", 
      hasFile: !!voiceFile, 
      model, 
      language, 
      stability, 
      chunkSize 
    });

    if (!text) {
      return res.status(400).json({ error: "Missing required parameter: text" });
    }

    try {
      const formData = new FormData();
      formData.append("text", text);
      
      if (voiceFile) {
        formData.append("voice", new Blob([voiceFile.buffer], { type: voiceFile.mimetype }), voiceFile.originalname);
      }
      
      formData.append("model", model || "xtts_v2");
      formData.append("language", language || "en");
      formData.append("stability", String(stability !== undefined ? stability : "0.5"));
      formData.append("chunkSize", String(chunkSize !== undefined ? chunkSize : "120"));

      const aiServerUrlRaw = process.env.LOCAL_AI_BRIDGE_URL || "http://127.0.0.1:8000";
      let aiServerUrl = aiServerUrlRaw.trim().replace(/\/$/, ""); // Remove trailing slash
      const bridgeSecret = process.env.AI_BRIDGE_SECRET_KEY;

      if (aiServerUrl.includes(":3000") || aiServerUrl.includes(req.get('host') || '')) {
        console.error("[Loop-Detected] Local Gen Loop detected for URL:", aiServerUrl);
        // Attempt to recover by using fallback
        aiServerUrl = "http://127.0.0.1:8000";
        console.log("[Loop-Recovery] Forcing AI Server URL to:", aiServerUrl);
      }

      const fetchHeaders: Record<string, string> = { "Accept": "application/json" };
      if (bridgeSecret) {
        fetchHeaders["Authorization"] = `Bearer ${bridgeSecret}`;
      }

      console.log(`[Local-Gen-Bridge] Calling: ${aiServerUrl}/generate`);
      const response = await fetch(`${aiServerUrl}/generate`, {
        method: "POST",
        body: formData,
        headers: fetchHeaders
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";
        let errorBody = "Unknown error";
        
        if (contentType.includes("text/html")) {
          console.error(`[Local-Gen-Bridge] Received HTML response (likely ngrok error). Status: ${response.status}`);
          errorBody = "Local AI Bridge is unreachable. Ensure your local server is running on port 8000 and ngrok is connected.";
        } else {
          errorBody = await response.text().catch(() => "Unknown error body");
          console.error(`[Local-Gen-Bridge] AI Server Error (Status ${response.status}):`, errorBody);
        }
        
        throw new Error(errorBody);
      }

      const audioBuffer = Buffer.from(await response.arrayBuffer());
      const id = uuidv4();
      audioBuffers.set(id, audioBuffer);
      
      const historyItem: AudioHistory = {
        id,
        userId: req.user.id,
        text: (text || "").substring(0, 100),
        voiceId: "local-xtts-pro",
        title: title || "Pro Studio Synthesis",
        timestamp: new Date().toISOString(),
      };
      await db.collection("history").doc(id).set(historyItem);

      res.set("Content-Type", "audio/mpeg");
      res.set("X-Audio-Id", id);
      res.set("Access-Control-Expose-Headers", "X-Audio-Id");
      res.send(audioBuffer);
    } catch (error) {
      console.error("Local AI Bridge (Generate) Error:", error);
      res.status(502).json({ 
        error: "Local AI Server not reachable", 
        message: (error as Error).message 
      });
    }
  });

  app.post("/api/local/clone-voice", authenticate, upload.single("voice"), async (req: any, res) => {
    const { text, model, chunkSize, title } = req.body;
    const voiceFile = req.file;

    if (!text || !voiceFile) {
      return res.status(400).json({ error: "Text and voice sample are required for cloning" });
    }

    try {
      const formData = new FormData();
      formData.append("text", text);
      formData.append("voice", new Blob([voiceFile.buffer], { type: voiceFile.mimetype }), voiceFile.originalname);
      formData.append("model", model || "xtts_v2");
      formData.append("chunkSize", String(chunkSize || "120"));

      const aiServerUrlRaw = process.env.LOCAL_AI_BRIDGE_URL || "http://127.0.0.1:8000";
      let aiServerUrl = aiServerUrlRaw.trim().replace(/\/$/, ""); 
      const bridgeSecret = process.env.AI_BRIDGE_SECRET_KEY;

      if (aiServerUrl.includes(":3000") || aiServerUrl.includes(req.get('host') || '')) {
        console.error("[Loop-Detected] Clone Loop detected for URL:", aiServerUrl);
        aiServerUrl = "http://127.0.0.1:8000";
        console.log("[Loop-Recovery] Forcing AI Server URL to:", aiServerUrl);
      }

      const fetchHeaders: Record<string, string> = { "Accept": "application/json" };
      if (bridgeSecret) {
        fetchHeaders["Authorization"] = `Bearer ${bridgeSecret}`;
      }

      console.log(`[Clone-Bridge] Calling: ${aiServerUrl}/generate`);
      const response = await fetch(`${aiServerUrl}/generate`, {
        method: "POST",
        body: formData,
        headers: fetchHeaders
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";
        let errorBody = "Unknown error";
        
        if (contentType.includes("text/html")) {
          console.error(`[Clone-Bridge] Received HTML response (likely ngrok error). Status: ${response.status}`);
          errorBody = "Clone Bridge is unreachable. Ensure your local server is running on port 8000 and ngrok is connected.";
        } else {
          errorBody = await response.text().catch(() => "Unknown error body");
          console.error(`[Clone-Bridge] AI Server Error (Status ${response.status}):`, errorBody);
        }
        
        throw new Error(errorBody);
      }

      const audioBuffer = Buffer.from(await response.arrayBuffer());
      const id = uuidv4();
      audioBuffers.set(id, audioBuffer);

      const historyItem: AudioHistory = {
        id,
        userId: req.user.id,
        text,
        voiceId: "local-xtts",
        title: title || "Local AI Clone",
        timestamp: new Date().toISOString(),
      };
      await db.collection("history").doc(id).set(historyItem);

      res.set("Content-Type", "audio/mpeg");
      res.set("X-Audio-Id", id);
      res.set("Access-Control-Expose-Headers", "X-Audio-Id");
      res.send(audioBuffer);
    } catch (error) {
      console.error("Local AI Bridge Error:", error);
      res.status(502).json({ 
        error: "Local AI Server not reachable", 
        details: "Ensure server.py is running on port 8000",
        message: (error as Error).message 
      });
    }
  });

  // --- Voice Library ---
  app.get("/api/voices", async (req, res) => {
    const localVoices = [
      { voice_id: "xtts_v2_sample", name: "Neural Default", category: "local", preview_url: "", provider: "local" },
      { voice_id: "xtts_v2_male", name: "Neural Male", category: "local", preview_url: "", provider: "local" },
      { voice_id: "xtts_v2_female", name: "Neural Female", category: "local", preview_url: "", provider: "local" },
      { voice_id: "xtts_v2_warm", name: "Deep Narrative", category: "local", preview_url: "", provider: "local" },
    ];

    res.json(localVoices);
  });

  app.get("/api/history", authenticate, async (req: any, res) => {
    try {
      const snap = await db.collection("history")
        .where("userId", "==", req.user.id)
        .orderBy("timestamp", "desc")
        .get();
      res.json(snap.docs.map(doc => doc.data()));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  app.delete("/api/history/:id", authenticate, async (req: any, res) => {
    try {
      const docRef = db.collection("history").doc(req.params.id);
      const snap = await docRef.get();
      if (!snap.exists || snap.data()?.userId !== req.user.id) {
        return res.status(404).json({ error: "Not found" });
      }
      await docRef.delete();
      audioBuffers.delete(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete history" });
    }
  });

  app.post("/api/user/subscription", authenticate, async (req: any, res) => {
    const { plan } = req.body;
    if (!plan) return res.status(400).json({ error: "Plan is required" });
    
    try {
      const userRef = db.collection("users").doc(req.user.id);
      const userSnap = await userRef.get();
      if (!userSnap.exists) return res.status(404).json({ error: "User not found" });

      const updates: any = { plan };
      if (plan === 'Creator') updates.credits = 10000;
      if (plan === 'Pro') updates.credits = 50000;
      if (plan === 'Enterprise') updates.credits = 999999;
      
      await userRef.update(updates);
      res.json({ success: true, plan });
    } catch (error) {
      res.status(500).json({ error: "Failed to update subscription" });
    }
  });

  app.get("/api/analytics", authenticate, async (req: any, res) => {
    try {
      const user = req.user;
      const historySnap = await db.collection("history").where("userId", "==", user.id).get();
      const userHistory = historySnap.docs.map(doc => doc.data());
      
      const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dateStr = date.toISOString().split('T')[0];
        const count = userHistory.filter(h => h.timestamp.startsWith(dateStr)).length;
        
        const baseValue = userHistory.length === 0 ? [800, 1200, 1500, 1100, 1900, 2400, 1100][i] : 0;
        
        return { 
          name: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
          value: (count * 450) + baseValue
        };
      });

      const stats = {
        totalGenerations: userHistory.length || 2842,
        latency: "1.2s",
        engine: `LOCAL ${user.plan === 'Enterprise' ? 'PRO' : 'V2'}`,
        plan: user.plan.toUpperCase(),
        creditsUsed: (userHistory.length * 450) || 2257488,
        totalCredits: user.totalCredits || 3000000,
        performanceScore: user.plan === 'Enterprise' ? 99 : user.plan === 'Pro' ? 85 : 65
      };

      res.json({
        usageTrends: last7Days,
        stats,
        distribution: [
          { name: 'Studio', value: 75, color: '#3b82f6' },
          { name: 'Cloning', value: 15, color: '#10b981' },
          { name: 'API', value: 10, color: '#f59e0b' }
        ]
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.get("/api/history/audio/:id", async (req: any, res) => {
    const token = req.query.token || req.headers.authorization;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    
    try {
      const user = await getUser(token);
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      const buffer = audioBuffers.get(req.params.id);
      if (!buffer) return res.status(404).json({ error: "Audio buffer expired or not found" });

      res.set("Content-Type", "audio/mpeg");
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ error: "Internal error" });
    }
  });

  app.post("/api/audio/merge", authenticate, async (req: any, res) => {
    const { chunkIds, title } = req.body;
    if (!chunkIds || !Array.isArray(chunkIds)) {
      return res.status(400).json({ error: "Chunk IDs array is required" });
    }

    try {
      const buffers = chunkIds.map(id => audioBuffers.get(id)).filter(Boolean);
      if (buffers.length === 0) {
        console.warn("[Merge] No chunks found for IDs:", chunkIds);
        return res.status(404).json({ error: "No chunks found to merge" });
      }

      // Concatenate buffers. For more robust MP3 merging we might need specialized tools,
      // but if XTTS outputs are consistent, simple concat often works for streaming.
      const finalBuffer = Buffer.concat(buffers as Buffer[]);
      const id = uuidv4();
      audioBuffers.set(id, finalBuffer);

      const historyItem: AudioHistory = {
        id,
        userId: req.user.id,
        text: "Long-form composite master sequence",
        voiceId: "multi-neural",
        title: title || "Composite Master",
        timestamp: new Date().toISOString(),
      };
      await db.collection("history").doc(id).set(historyItem);

      res.json({ id, title: title || "Composite Master" });
    } catch (error) {
      console.error("Critical Merge Error:", error);
      res.status(500).json({ error: "Failed to merge audio segments" });
    }
  });

  app.post("/api/generate", authenticate, upload.single("voice"), async (req: any, res) => {
    const { text, voiceId, title, model, language, stability, chunkSize, provider } = req.body;
    const voiceFile = req.file;

    if (!text) return res.status(400).json({ error: "Text is required" });

    try {
      const formData = new FormData();
      formData.append("text", text);
      
      // If voiceFile exists, use it. If not, the backend will use a default or error if required.
      if (voiceFile) {
        formData.append("voice", new Blob([voiceFile.buffer], { type: voiceFile.mimetype }), voiceFile.originalname);
      }
      
      formData.append("model", model || "xtts_v2");
      formData.append("language", language || "en");
      formData.append("stability", String(stability !== undefined ? stability : "0.5"));
      formData.append("chunkSize", String(chunkSize !== undefined ? chunkSize : "120"));

      const aiServerUrlRaw = process.env.LOCAL_AI_BRIDGE_URL || "http://127.0.0.1:8000";
      let aiServerUrl = aiServerUrlRaw.trim().replace(/\/$/, "");
      const bridgeSecret = process.env.AI_BRIDGE_SECRET_KEY;

      // Safety check to prevent infinite loops if URL is misconfigured
      if (aiServerUrl.includes(":3000") || aiServerUrl.includes(req.get('host') || '')) {
         console.error("[Loop-Detected] AI Bridge URL points to this server. Forcing 127.0.0.1:8000");
         aiServerUrl = "http://127.0.0.1:8000";
      }

      const fetchHeaders: Record<string, string> = { "Accept": "application/json" };
      if (bridgeSecret) {
        fetchHeaders["Authorization"] = `Bearer ${bridgeSecret}`;
      }

      console.log(`[Synthesis-Bridge] Calling: ${aiServerUrl}/generate`);
      const response = await fetch(`${aiServerUrl}/generate`, {
        method: "POST",
        body: formData,
        headers: fetchHeaders
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";
        let errorBody = "Unknown error";
        
        if (contentType.includes("text/html")) {
          console.error(`[Synthesis-Bridge] Received HTML response (likely ngrok error). Status: ${response.status}`);
          errorBody = "Neural Engine is unreachable. Ensure your local server is running on port 8000 and ngrok is connected.";
        } else {
          errorBody = await response.text().catch(() => "Unknown error body");
          console.error(`[Synthesis-Bridge] AI Server Error (Status ${response.status}):`, errorBody);
        }
        
        throw new Error(errorBody);
      }

      const audioBuffer = Buffer.from(await response.arrayBuffer());
      const id = uuidv4();
      audioBuffers.set(id, audioBuffer);

      const historyItem: AudioHistory = {
        id,
        userId: req.user.id,
        text: (text || "").substring(0, 100),
        voiceId: voiceId || "local-xtts",
        title: title || "Studio Generation",
        timestamp: new Date().toISOString(),
      };
      await db.collection("history").doc(id).set(historyItem);

      res.set("Content-Type", "audio/mpeg");
      res.set("X-Audio-Id", id);
      res.set("Access-Control-Expose-Headers", "X-Audio-Id");
      res.send(audioBuffer);
    } catch (error) {
      console.error("Primary Synthesis Error:", error);
      res.status(502).json({ error: "Local AI Server unreachable" });
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
    const buildPath = path.join(process.cwd(), "build");
    app.use(express.static(buildPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(buildPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
