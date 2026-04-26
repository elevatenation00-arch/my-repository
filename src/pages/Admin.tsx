import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, Edit2, Loader2, UserPlus, Shield, CreditCard, Calendar, X, MessageSquare, Users, Zap, Type, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  email: string;
  credits: number;
  totalCredits: number;
  plan: string;
  expiryDate: string;
  role: string;
  isBlocked?: boolean;
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

export default function Admin() {
  const { user: currentUser, token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [requests, setRequests] = useState<ActivationRequest[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'feedback' | 'requests'>('users');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const isAdmin = currentUser?.role === "admin";

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [credits, setCredits] = useState(1000);
  const [totalCredits, setTotalCredits] = useState(1000);
  const [plan, setPlan] = useState("Free");
  const [expiryDate, setExpiryDate] = useState("");
  const [role, setRole] = useState("user");
  const [isBlocked, setIsBlocked] = useState(false);

  const fetchData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [usersRes, feedbackRes, statsRes, requestsRes] = await Promise.all([
        fetch("/api/admin/users", { headers: { "Authorization": token } }),
        fetch("/api/admin/feedback", { headers: { "Authorization": token } }),
        fetch("/api/admin/stats", { headers: { "Authorization": token } }),
        fetch("/api/admin/requests", { headers: { "Authorization": token } })
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (feedbackRes.ok) setFeedback(await feedbackRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (requestsRes.ok) setRequests(await requestsRes.json());
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const url = editingUser ? `/api/admin/users/${editingUser.id}` : "/api/admin/users";
    const method = editingUser ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify({ email, password, credits, totalCredits, plan, expiryDate, role, isBlocked })
      });

      if (res.ok) {
        fetchData();
        closeModal();
      } else {
        const err = await res.json();
        alert(err.error || "Operation failed");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleApprove = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/requests/approve/${id}`, {
        method: "POST",
        headers: { "Authorization": token }
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/requests/reject/${id}`, {
        method: "POST",
        headers: { "Authorization": token }
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { "Authorization": token }
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setEmail(user.email);
      setCredits(user.credits);
      setTotalCredits(user.totalCredits);
      setPlan(user.plan);
      setExpiryDate(user.expiryDate);
      setRole(user.role);
      setIsBlocked(!!user.isBlocked);
    } else {
      setEditingUser(null);
      setEmail("");
      setPassword("");
      setCredits(1000);
      setTotalCredits(1000);
      setPlan("Free");
      setExpiryDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setRole("user");
      setIsBlocked(false);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Admin Panel</h1>
          <p className="text-gray-400 mt-1">Manage users and view system feedback.</p>
        </div>
        {isAdmin && activeTab === 'users' && (
          <button
            onClick={() => openModal()}
            className="bg-white text-black px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-gray-200 transition-all"
          >
            <UserPlus size={20} />
            Add User
          </button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-6 border-white/5 bg-zinc-900/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <Users className="text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Total Users</p>
              <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-6 border-white/5 bg-zinc-900/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center">
              <Zap className="text-brand-400" size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Generations</p>
              <p className="text-2xl font-bold text-white">{stats?.totalGenerations || 0}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-6 border-white/5 bg-zinc-900/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
              <Type className="text-green-400" size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Characters</p>
              <p className="text-2xl font-bold text-white">{(stats?.totalCharacters || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-6 border-white/5 bg-zinc-900/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
              <Mic className="text-purple-400" size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Cloned Voices</p>
              <p className="text-2xl font-bold text-white">{stats?.totalClonedVoices || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 p-1 bg-white/5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('users')}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all",
            activeTab === 'users' ? "bg-white text-black" : "text-gray-400 hover:text-white"
          )}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all relative",
            activeTab === 'requests' ? "bg-white text-black" : "text-gray-400 hover:text-white"
          )}
        >
          Requests
          {requests.filter(r => r.status === 'pending').length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center border-2 border-black">
              {requests.filter(r => r.status === 'pending').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all",
            activeTab === 'feedback' ? "bg-white text-black" : "text-gray-400 hover:text-white"
          )}
        >
          Feedback ({feedback.length})
        </button>
      </div>

      {activeTab === 'users' ? (
        /* Users Table */
        <div className="bg-zinc-900/50 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-4 text-sm font-semibold text-gray-400">User</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Plan</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Credits</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Expiry</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {users.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-all"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-400 font-bold">
                          {user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.email}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">{user.role}</p>
                            {user.isBlocked && <span className="text-xs text-red-500 font-bold uppercase tracking-wider">Blocked</span>}
                            {user.isApproved === false && <span className="text-xs text-yellow-500 font-bold uppercase tracking-wider">Pending</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                        user.plan === "Enterprise" ? "bg-purple-500/20 text-purple-400" :
                        user.plan === "Pro" ? "bg-blue-500/20 text-blue-400" :
                        user.plan === "Creator" ? "bg-green-500/20 text-green-400" :
                        "bg-gray-500/20 text-gray-400"
                      )}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-brand-400">
                      {user.credits.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {user.expiryDate}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openModal(user)}
                          disabled={!isAdmin && user.role === "admin"}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Edit2 size={18} />
                        </button>
                        {isAdmin && user.role !== "admin" && (
                          <button 
                            onClick={() => handleDelete(user.id)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {isLoading && (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="animate-spin text-brand-500" size={32} />
            </div>
          )}
        </div>
      ) : activeTab === 'requests' ? (
        /* Requests List */
        <div className="bg-zinc-900/50 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-4 text-sm font-semibold text-gray-400">User</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Plan</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {requests.slice().reverse().map((req) => (
                  <motion.tr
                    key={req.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-all"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{req.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">{req.plan}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                        req.status === 'pending' ? "bg-yellow-500/20 text-yellow-500" :
                        req.status === 'approved' ? "bg-green-500/20 text-green-500" :
                        "bg-red-500/20 text-red-500"
                      )}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(req.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {req.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleApprove(req.id)}
                            className="bg-green-500 text-black px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-400 transition-all font-bold"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleReject(req.id)}
                            className="bg-red-500/20 text-red-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all font-bold"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {requests.length === 0 && !isLoading && (
            <div className="p-12 text-center text-gray-500 font-bold italic">
              No activation requests found.
            </div>
          )}
        </div>
      ) : (
        /* Feedback List */
        <div className="grid gap-4">
          {feedback.length === 0 ? (
            <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-12 text-center">
              <MessageSquare className="mx-auto text-gray-600 mb-4" size={48} />
              <p className="text-gray-400">No feedback received yet.</p>
            </div>
          ) : (
            feedback.map((f) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{f.subject}</h3>
                    <p className="text-sm text-gray-400">{f.email} • {new Date(f.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="px-3 py-1 bg-brand-500/10 text-brand-400 rounded-full text-xs font-bold uppercase tracking-wider">
                    Feedback
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">{f.message}</p>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">
                {editingUser ? "Edit User" : "Create New User"}
              </h2>
              <button onClick={closeModal} className="p-2 text-gray-500 hover:text-white transition-all">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!!editingUser || !isAdmin}
                  placeholder="user@example.com"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all disabled:opacity-50"
                />
              </div>

              {!editingUser && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 ml-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 ml-1">Credits</label>
                  <input
                    type="number"
                    value={credits}
                    onChange={(e) => setCredits(parseInt(e.target.value))}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 ml-1">Total</label>
                  <input
                    type="number"
                    value={totalCredits}
                    onChange={(e) => setTotalCredits(parseInt(e.target.value))}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 ml-1">Plan</label>
                  <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                  >
                    <option value="Free">Free</option>
                    <option value="Creator">Creator</option>
                    <option value="Pro">Pro</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 ml-1">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 ml-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={!isAdmin}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all disabled:opacity-50"
                  >
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isBlocked}
                  onChange={(e) => setIsBlocked(e.target.checked)}
                  className="w-5 h-5 rounded border-white/10 bg-black/40 text-brand-500 focus:ring-brand-500/30"
                />
                <label className="text-sm font-medium text-gray-400">Block User</label>
              </div>

              <button
                type="submit"
                className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all mt-4"
              >
                {editingUser ? "Save Changes" : "Create User"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
