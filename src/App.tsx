import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import PublicLayout from "./components/PublicLayout";
import About from "./pages/About";
import Services from "./pages/Services";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import TextToSpeech from "./pages/TextToSpeech";
import VoiceCloning from "./pages/VoiceCloning";
import CreateVideo from "./pages/CreateVideo";
import AIVideoStudio from "./pages/AIVideoStudio";
import Podcast from "./pages/Podcast";
import CRM from "./pages/CRM";
import Sales from "./pages/Sales";
import Accounting from "./pages/Accounting";
import Inventory from "./pages/Inventory";
import Employees from "./pages/Employees";
import Projects from "./pages/Projects";
import Settings from "./pages/Settings";
import Developers from "./pages/Developers";
import Admin from "./pages/Admin";
import History from "./pages/History";
import Subscription from "./pages/Subscription";
import Credits from "./pages/Credits";
import PlaceholderPage from "./components/PlaceholderPage";
import DashboardLayout from "./components/DashboardLayout";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ staffOnly = false }: { staffOnly?: boolean }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-500" size={48} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.isBlocked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="glass-card p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Account Blocked</h2>
          <p className="text-gray-400 mb-6">Your account has been blocked. Please contact the administrator for assistance.</p>
          <a 
            href="https://wa.me/923006713668" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-primary inline-block"
          >
            Contact Admin on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  if (staffOnly && user.role !== "admin" && user.role !== "manager") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
          </Route>
          <Route path="/login" element={<Login />} />

          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/tts" element={<TextToSpeech />} />
            <Route path="/dashboard/ai-video-studio" element={<AIVideoStudio />} />
            <Route path="/dashboard/ai-video-studio/create" element={<CreateVideo />} />
            <Route path="/dashboard/podcast" element={<Podcast />} />
            <Route path="/dashboard/crm" element={<CRM />} />
            <Route path="/dashboard/sales" element={<Sales />} />
            <Route path="/dashboard/accounting" element={<Accounting />} />
            <Route path="/dashboard/inventory" element={<Inventory />} />
            <Route path="/dashboard/employees" element={<Employees />} />
            <Route path="/dashboard/projects" element={<Projects />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="/dashboard/stt" element={<PlaceholderPage title="Speech to Text" />} />
            <Route path="/dashboard/cloning" element={<VoiceCloning />} />
            <Route path="/dashboard/design" element={<PlaceholderPage title="Voice Design" />} />
            <Route path="/dashboard/conversion" element={<PlaceholderPage title="Voice Conversion" />} />
            <Route path="/dashboard/podcast" element={<PlaceholderPage title="Podcast" />} />
            <Route path="/dashboard/dubbing" element={<PlaceholderPage title="Dubbing" />} />
            <Route path="/dashboard/history" element={<History />} />
            <Route path="/dashboard/developers" element={<Developers />} />
            <Route path="/dashboard/subscription" element={<Subscription />} />
            <Route path="/dashboard/credits" element={<Credits />} />
          </Route>

          {/* Staff Only Routes */}
          <Route element={<ProtectedRoute staffOnly />}>
            <Route path="/dashboard/admin" element={<Admin />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
