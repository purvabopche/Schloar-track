"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";
import { collection, query, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import Link from "next/link";
import { FiArrowLeft, FiPlus, FiTrash2, FiTarget } from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";

export default function ScholarshipManagement() {
    const { isAuthorized } = useRoleRedirect({ allowedRoles: ["admin"] });
    const [scholarships, setScholarships] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Add modal state
    const [isAdding, setIsAdding] = useState(false);
    const [newScholarship, setNewScholarship] = useState({
        title: "",
        description: "",
        amount: "",
        deadline: "",
        eligibility: ""
    });

    useEffect(() => {
        fetchScholarships();
    }, [isAuthorized]);

    const fetchScholarships = async () => {
        try {
            const q = query(collection(db, "scholarships"));
            const querySnapshot = await getDocs(q);
            const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setScholarships(fetched);
        } catch (error) {
            toast.error("Failed to fetch scholarships");
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const toastId = toast.loading("Adding scholarship...");

        try {
            const docRef = await addDoc(collection(db, "scholarships"), {
                ...newScholarship,
                createdAt: serverTimestamp(),
                active: true
            });

            setScholarships([{ id: docRef.id, ...newScholarship, active: true }, ...scholarships]);
            setIsAdding(false);
            setNewScholarship({ title: "", description: "", amount: "", deadline: "", eligibility: "" });
            toast.success("Scholarship added successfully!", { id: toastId });
        } catch (error) {
            toast.error("Failed to add scholarship", { id: toastId });
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"? This won't affect existing applications but students won't apply to it anymore.`)) return;

        const toastId = toast.loading("Deleting scholarship...");
        try {
            await deleteDoc(doc(db, "scholarships", id));
            setScholarships(scholarships.filter(s => s.id !== id));
            toast.success("Scholarship deleted!", { id: toastId });
        } catch (error) {
            toast.error("Failed to delete scholarship", { id: toastId });
        }
    };

    if (!isAuthorized || loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-24 relative z-10">
            <Toaster position="top-right" toastOptions={{ className: 'bg-[#1a1640] text-purple-100 border border-purple-500/30' }} />

            <Link href="/admin" className="inline-flex items-center text-fuchsia-400 hover:text-fuchsia-300 mb-8 font-bold transition-colors">
                <FiArrowLeft className="mr-2" /> Back to Dashboard
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Scholarships Directory</h1>
                    <p className="text-purple-200/70 mt-2 text-lg">Manage available scholarships and funding programs.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-fuchsia-500/20 transition-all font-bold"
                >
                    <FiPlus className="mr-2" /> New Program
                </button>
            </div>

            {isAdding && (
                <div className="bg-[#130f2e]/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/50 border border-fuchsia-500/30 p-8 mb-12 mt-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Add Scholarship Program</h2>
                    <form onSubmit={handleAddSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-purple-200/80 mb-2 uppercase tracking-wider">Title</label>
                                <input required type="text" value={newScholarship.title} onChange={e => setNewScholarship({ ...newScholarship, title: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-200/30 outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all font-medium" placeholder="e.g. Merit Based 2026" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-purple-200/80 mb-2 uppercase tracking-wider">Amount (₹)</label>
                                <input required type="number" value={newScholarship.amount} onChange={e => setNewScholarship({ ...newScholarship, amount: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-200/30 outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all font-medium" placeholder="e.g. 50000" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-purple-200/80 mb-2 uppercase tracking-wider">Description</label>
                                <textarea required rows={3} value={newScholarship.description} onChange={e => setNewScholarship({ ...newScholarship, description: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-200/30 outline-none focus:ring-2 focus:ring-fuchsia-500 resize-none transition-all font-medium" placeholder="Program overview..."></textarea>
                            </div>
                            <div className="md:col-span-2 mt-2">
                                <label className="block text-sm font-bold text-purple-200/80 mb-2 uppercase tracking-wider">Eligibility Criteria</label>
                                <input required type="text" value={newScholarship.eligibility} onChange={e => setNewScholarship({ ...newScholarship, eligibility: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-200/30 outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all font-medium" placeholder="e.g. Income < 8LPA, CGPA > 8.0" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-purple-200/80 mb-2 uppercase tracking-wider">Application Deadline</label>
                                <input required type="date" value={newScholarship.deadline} onChange={e => setNewScholarship({ ...newScholarship, deadline: e.target.value })} className="w-full bg-[#130f2e]/90 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all font-medium" style={{ colorScheme: 'dark' }} />
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-white/10">
                            <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-xl transition-all font-bold">Cancel</button>
                            <button type="submit" className="px-6 py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-fuchsia-500/20 transition-all font-bold">Save Program</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scholarships.length === 0 && !isAdding ? (
                    <div className="col-span-full bg-[#130f2e]/80 p-16 text-center rounded-3xl border border-white/10 backdrop-blur-xl">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 border border-purple-500/30 text-fuchsia-400 mb-6 shadow-inner">
                            <FiTarget size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">No scholarships available</h3>
                        <p className="text-purple-200/60 font-medium">Create your first scholarship program to allow students to apply.</p>
                    </div>
                ) : (
                    scholarships.map(s => (
                        <div key={s.id} className="bg-[#130f2e]/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/20 border border-white/10 hover:border-white/20 transition-all overflow-hidden flex flex-col group">
                            <div className="p-8 flex-grow relative">
                                <div className="absolute -right-10 -top-10 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-3xl group-hover:bg-fuchsia-500/20 transition-colors pointer-events-none"></div>
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <h3 className="text-xl font-extrabold text-white leading-tight pr-4">{s.title || "Untitled Program"}</h3>
                                    <span className="inline-flex bg-green-500/20 border border-green-500/30 text-green-300 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider flex-shrink-0">Active</span>
                                </div>
                                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-400 mb-4 relative z-10">₹{s.amount || "0"}</div>
                                <p className="text-sm text-purple-200/70 mb-6 line-clamp-3 font-medium relative z-10">{s.description}</p>
                                <div className="space-y-3 mt-auto relative z-10">
                                    <div className="text-xs bg-black/30 px-3 py-2 rounded-lg text-purple-100/90 border border-white/5">
                                        <span className="font-bold text-fuchsia-300 uppercase tracking-wider text-[10px] block mb-1">Eligibility:</span> {s.eligibility}
                                    </div>
                                    <div className="text-xs bg-red-900/20 border border-red-500/20 px-3 py-2 rounded-lg text-red-200">
                                        <span className="font-bold text-red-400 uppercase tracking-wider text-[10px] block mb-1">Deadline:</span> {s.deadline ? new Date(s.deadline).toLocaleDateString() : "TBD"}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/5 px-8 py-4 border-t border-white/10 flex justify-end">
                                <button
                                    onClick={() => handleDelete(s.id, s.title)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center transition-all"
                                >
                                    <FiTrash2 className="mr-2" /> Remove
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
