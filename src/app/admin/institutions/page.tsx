"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";
import { collection, query, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { FiHome, FiPlus, FiTrash2, FiMapPin, FiMail } from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import { motion } from "framer-motion";

interface Institution {
    id: string;
    name: string;
    address: string;
    email: string;
}

export default function ManageInstitutions() {
    const { isAuthorized } = useRoleRedirect({ allowedRoles: ["admin"] });
    const { user } = useAuth();
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [loading, setLoading] = useState(true);

    const [newInst, setNewInst] = useState({ name: "", address: "", email: "" });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchInst = async () => {
            try {
                const snap = await getDocs(collection(db, "institutions"));
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Institution[];
                setInstitutions(data);
            } catch (error) {
                console.error("Error fetching institutions", error);
                toast.error("Failed to load institutions");
            } finally {
                setLoading(false);
            }
        };

        if (isAuthorized) {
            fetchInst();
        }
    }, [isAuthorized]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newInst.name || !newInst.address) {
            toast.error("Name and Address are required");
            return;
        }

        setIsSaving(true);
        const toastId = toast.loading("Adding institution...");
        try {
            const docRef = await addDoc(collection(db, "institutions"), {
                ...newInst,
                createdAt: new Date()
            });
            setInstitutions(prev => [...prev, { id: docRef.id, ...newInst }]);
            setNewInst({ name: "", address: "", email: "" });
            toast.success("Institution added!", { id: toastId });
        } catch (error) {
            toast.error("Failed to add institution", { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to remove ${name}?`)) return;
        const toastId = toast.loading("Removing...");
        try {
            await deleteDoc(doc(db, "institutions", id));
            setInstitutions(prev => prev.filter(i => i.id !== id));
            toast.success("Removed successfully", { id: toastId });
        } catch (error) {
            toast.error("Failed to remove", { id: toastId });
        }
    };

    if (!isAuthorized || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#070514]">
                <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#070514] text-white">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
                <Toaster position="top-right" toastOptions={{ className: 'bg-[#0f172a] text-cyan-50 border border-cyan-500/20 shadow-2xl' }} />
                
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
                        Registered Institutions
                    </h1>
                    <p className="text-cyan-200/60 font-medium">Manage partner colleges and universities for the scholarship network.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Form */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
                        className="lg:col-span-1 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl h-fit shadow-2xl"
                    >
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                            <FiHome className="text-emerald-400" />
                            Add New Institution
                        </h2>
                        
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-white/50 uppercase tracking-wide mb-1.5">Institution Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                    placeholder="e.g. National Institute of Technology"
                                    value={newInst.name}
                                    onChange={e => setNewInst({...newInst, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white/50 uppercase tracking-wide mb-1.5">Address / Region</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                    placeholder="e.g. Delhi, Sector 4"
                                    value={newInst.address}
                                    onChange={e => setNewInst({...newInst, address: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white/50 uppercase tracking-wide mb-1.5">Contact Email (Optional)</label>
                                <input 
                                    type="email" 
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                    placeholder="admin@institute.edu"
                                    value={newInst.email}
                                    onChange={e => setNewInst({...newInst, email: e.target.value})}
                                />
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={isSaving}
                                className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSaving ? <span className="animate-spin h-5 w-5 border-2 border-white/20 border-t-white rounded-full" /> : <FiPlus />}
                                Add Institution
                            </button>
                        </form>
                    </motion.div>

                    {/* List */}
                    <div className="lg:col-span-2 space-y-4">
                        {institutions.length === 0 ? (
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center text-white/50">
                                <FiHome size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="font-medium text-lg">No institutions registered yet.</p>
                                <p className="text-sm mt-1">Add your first institution using the form.</p>
                            </div>
                        ) : (
                            institutions.map((inst, idx) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                                    key={inst.id} 
                                    className="bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 p-5 rounded-2xl flex items-center justify-between group transition-colors"
                                >
                                    <div>
                                        <h3 className="font-bold text-lg text-white mb-1 group-hover:text-emerald-300 transition-colors">{inst.name}</h3>
                                        <div className="flex items-center gap-4 text-sm text-cyan-100/50 font-medium">
                                            <span className="flex items-center gap-1"><FiMapPin /> {inst.address}</span>
                                            {inst.email && <span className="flex items-center gap-1"><FiMail /> {inst.email}</span>}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(inst.id, inst.name)}
                                        className="p-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors hover:text-rose-300"
                                        title="Remove Institution"
                                    >
                                        <FiTrash2 size={20} />
                                    </button>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
