"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { FiUser, FiSave, FiEdit3, FiMail } from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import { motion } from "framer-motion";

export default function StudentProfile() {
    const { isAuthorized } = useRoleRedirect({ allowedRoles: ["student"] });
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [profile, setProfile] = useState({
        fullName: "",
        phone: "",
        address: "",
        income: "",
        institution: ""
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setProfile({
                        fullName: data.fullName || "",
                        phone: data.phone || "",
                        address: data.address || "",
                        income: data.income || "",
                        institution: data.institution || ""
                    });
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                toast.error("Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };

        if (isAuthorized) fetchProfile();
    }, [user, isAuthorized]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        const toastId = toast.loading("Saving profile...");
        try {
            const docRef = doc(db, "users", user.uid);
            await updateDoc(docRef, profile);
            toast.success("Profile updated successfully!", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile", { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    if (!isAuthorized || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#070514]">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#070514] text-white">
            <Navbar />
            
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 relative">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-[100px] pointer-events-none"></div>

                <Toaster position="top-right" toastOptions={{ className: 'bg-[#0f172a] text-indigo-50 border border-indigo-500/20 shadow-2xl' }} />
                
                <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 border border-indigo-500/30 flex items-center justify-center shadow-inner">
                        <FiUser size={40} className="text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400 mb-2">
                            My Profile
                        </h1>
                        <p className="text-indigo-200/60 font-medium">Keep your personal and academic details up to date for faster verification.</p>
                    </div>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                    className="bg-[#1a0b2e]/60 backdrop-blur-2xl border border-indigo-500/20 p-8 sm:p-10 rounded-3xl shadow-[0_10px_40px_rgba(99,102,241,0.15)] relative z-10"
                >
                    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300">
                            <FiEdit3 size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Personal Details</h2>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wide mb-2">Registered Email</label>
                                <div className="flex items-center px-5 py-4 bg-black/40 border border-white/5 rounded-xl text-white/50 cursor-not-allowed">
                                    <FiMail className="mr-3 text-indigo-500/50" />
                                    {user?.email}
                                </div>
                                <p className="text-[10px] text-white/30 mt-1 uppercase tracking-wider">Email cannot be changed</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wide mb-2">Full Name</label>
                                <input 
                                    type="text" required 
                                    className="w-full bg-black/40 border border-indigo-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/60 transition-colors shadow-inner"
                                    value={profile.fullName}
                                    onChange={e => setProfile({...profile, fullName: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wide mb-2">Phone Number</label>
                                <input 
                                    type="tel" required 
                                    className="w-full bg-black/40 border border-indigo-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/60 transition-colors shadow-inner"
                                    value={profile.phone}
                                    onChange={e => setProfile({...profile, phone: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wide mb-2">Institution Name</label>
                                <input 
                                    type="text" required 
                                    className="w-full bg-black/40 border border-indigo-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/60 transition-colors shadow-inner"
                                    placeholder="e.g. National Institute of Technology"
                                    value={profile.institution}
                                    onChange={e => setProfile({...profile, institution: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wide mb-2">Annual Family Income (₹)</label>
                                <input 
                                    type="number" required 
                                    className="w-full bg-black/40 border border-indigo-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/60 transition-colors shadow-inner"
                                    placeholder="e.g. 250000"
                                    value={profile.income}
                                    onChange={e => setProfile({...profile, income: e.target.value})}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wide mb-2">Residential Address</label>
                                <textarea 
                                    required rows={3}
                                    className="w-full bg-black/40 border border-indigo-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/60 transition-colors shadow-inner resize-none"
                                    value={profile.address}
                                    onChange={e => setProfile({...profile, address: e.target.value})}
                                />
                            </div>
                            
                        </div>
                        
                        <div className="pt-6 border-t border-indigo-500/20 flex justify-end">
                            <button 
                                type="submit" 
                                disabled={saving}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white font-bold py-3.5 px-8 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all disabled:opacity-50"
                            >
                                {saving ? <span className="animate-spin h-5 w-5 border-2 border-white/20 border-t-white rounded-full" /> : <FiSave />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
