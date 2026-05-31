"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { FiSend, FiBell, FiAlertCircle, FiUsers, FiUser } from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import { motion } from "framer-motion";

export default function AdminNotifications() {
    const { isAuthorized } = useRoleRedirect({ allowedRoles: ["admin"] });
    const { user } = useAuth();
    
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [recipient, setRecipient] = useState("all_students"); 
    const [targetUid, setTargetUid] = useState("");
    const [isSending, setIsSending] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !message) {
            toast.error("Title and Message are required");
            return;
        }

        if (recipient === "specific" && !targetUid) {
            toast.error("Please enter the target UID");
            return;
        }

        setIsSending(true);
        const toastId = toast.loading("Broadcasting notification...");
        try {
            await addDoc(collection(db, "notifications"), {
                title,
                message,
                recipient: recipient === "all_students" ? "all" : targetUid,
                senderId: user?.uid,
                createdAt: new Date(),
                readBy: []
            });
            setTitle("");
            setMessage("");
            setTargetUid("");
            toast.success("Notification sent successfully!", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Failed to send notification", { id: toastId });
        } finally {
            setIsSending(false);
        }
    };

    if (!isAuthorized) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#070514]">
                <div className="w-16 h-16 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#070514] text-white">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 relative">
                
                {/* Background glow */}
                <div className="absolute top-20 right-0 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                <Toaster position="top-right" toastOptions={{ className: 'bg-[#0f172a] text-fuchsia-50 border border-fuchsia-500/20 shadow-2xl' }} />
                
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-400 mb-2 flex items-center gap-3">
                        <FiBell className="text-fuchsia-400" /> System Notifications
                    </h1>
                    <p className="text-fuchsia-200/60 font-medium">Broadcast alerts or send targeted updates to specific students regarding their applications.</p>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                    className="bg-[#1a0b2e]/60 backdrop-blur-2xl border border-fuchsia-500/20 p-8 rounded-3xl shadow-[0_10px_40px_rgba(217,70,239,0.15)] relative z-10"
                >
                    <form onSubmit={handleSend} className="space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-fuchsia-300 uppercase tracking-wide mb-2">Notification Title</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="w-full bg-black/40 border border-fuchsia-500/20 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-fuchsia-500/60 transition-colors shadow-inner"
                                    placeholder="e.g. Scholarship Deadline Extended"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-fuchsia-300 uppercase tracking-wide mb-2">Message Body</label>
                                <textarea 
                                    required 
                                    rows={4}
                                    className="w-full bg-black/40 border border-fuchsia-500/20 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-fuchsia-500/60 transition-colors shadow-inner resize-none"
                                    placeholder="Type your official announcement or update here..."
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-fuchsia-300 uppercase tracking-wide mb-2">Target Audience</label>
                                <div className="flex gap-4">
                                    <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border cursor-pointer transition-all ${recipient === 'all_students' ? 'bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-300' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}>
                                        <input type="radio" className="hidden" name="recipient" value="all_students" checked={recipient === 'all_students'} onChange={() => setRecipient('all_students')} />
                                        <FiUsers /> All Students
                                    </label>
                                    <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border cursor-pointer transition-all ${recipient === 'specific' ? 'bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-300' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}>
                                        <input type="radio" className="hidden" name="recipient" value="specific" checked={recipient === 'specific'} onChange={() => setRecipient('specific')} />
                                        <FiUser /> Specific User
                                    </label>
                                </div>
                            </div>

                            {recipient === 'specific' && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                    <label className="block text-xs font-bold text-fuchsia-300 uppercase tracking-wide mb-2 flex items-center gap-2">
                                        User ID <FiAlertCircle className="text-fuchsia-500/50" />
                                    </label>
                                    <input 
                                        type="text" 
                                        required={recipient === 'specific'}
                                        className="w-full bg-black/40 border border-fuchsia-500/20 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-fuchsia-500/60 transition-colors shadow-inner"
                                        placeholder="Paste Student UID here"
                                        value={targetUid}
                                        onChange={e => setTargetUid(e.target.value)}
                                    />
                                </motion.div>
                            )}
                        </div>
                        
                        <div className="pt-4 border-t border-fuchsia-500/20 text-right">
                            <button 
                                type="submit" 
                                disabled={isSending}
                                className="inline-flex items-center gap-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-xl shadow-[0_0_20px_rgba(217,70,239,0.4)] transition-all disabled:opacity-50"
                            >
                                {isSending ? <span className="animate-spin h-5 w-5 border-2 border-white/20 border-t-white rounded-full" /> : <FiSend />}
                                Dispatch Notification
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
