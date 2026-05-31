"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import Link from "next/link";
import { FiClock, FiCheckCircle, FiXCircle, FiFileText, FiSearch, FiFilter, FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";

interface Application {
    id: string;
    scholarshipTitle: string;
    fullName: string;
    status: "submitted" | "under_verification" | "approved" | "rejected" | "disbursed";
    submittedAt: any;
}

const statusConfig = {
    submitted: { color: "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]", icon: <FiClock className="mr-1.5" />, label: "Pending Review" },
    under_verification: { color: "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]", icon: <FiFileText className="mr-1.5" />, label: "Under Verification" },
    approved: { color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]", icon: <FiCheckCircle className="mr-1.5" />, label: "Approved (Pending Admin)" },
    rejected: { color: "bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.2)]", icon: <FiXCircle className="mr-1.5" />, label: "Rejected" },
    disbursed: { color: "bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 shadow-[0_0_10px_rgba(217,70,239,0.2)]", icon: <FiCheckCircle className="mr-1.5" />, label: "Disbursed" },
};

export default function VerifierDashboard() {
    const { isAuthorized } = useRoleRedirect({ allowedRoles: ["verifier"] });
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const q = query(
                    collection(db, "applications"),
                    orderBy("submittedAt", "desc")
                );
                const querySnapshot = await getDocs(q);
                const appsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Application[];
                setApplications(appsData);
            } catch (error) {
                console.error("Error fetching applications:", error);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthorized) {
            fetchApplications();
        }
    }, [isAuthorized]);

    if (!isAuthorized || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#070514]">
                <div className="relative w-24 h-24">
                    <div className="absolute inset-0 rounded-full border-t-2 border-amber-500 animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-r-2 border-orange-500 animate-spin border-opacity-60" style={{ animationDuration: '1.5s' }}></div>
                    <div className="absolute inset-4 rounded-full border-b-2 border-yellow-500 animate-spin border-opacity-40" style={{ animationDuration: '2s' }}></div>
                </div>
            </div>
        );
    }

    // Filter out disbursed, and apply search/status filters
    const filteredApps = applications.filter(app => {
        if (app.status === "disbursed") return false; // Verifiers shouldn't care about disbursed apps

        const matchesSearch = app.fullName.toLowerCase().includes(search.toLowerCase()) ||
            app.id.toLowerCase().includes(search.toLowerCase());

        if (filter === "all") return matchesSearch && ["submitted", "under_verification"].includes(app.status);
        return matchesSearch && app.status === filter;
    });

    return (
        <div className="min-h-screen bg-[#070514] font-sans relative overflow-hidden pb-20">
            {/* Dynamic Abstract Background for Verifier Dashboard */}
            <div className="fixed top-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-gradient-to-b from-amber-600/10 to-orange-600/10 blur-[140px] mix-blend-screen pointer-events-none"></div>
            <div className="fixed bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-rose-600/10 to-fuchsia-600/10 blur-[130px] mix-blend-screen pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                        Verification Portal
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-300 tracking-tight">
                        Review Console
                    </h1>
                    <p className="text-amber-200/60 mt-3 text-lg max-w-xl font-medium">
                        Examine application details and perform due diligence on student documents.
                    </p>
                </motion.div>

                {/* Controls */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex flex-col md:flex-row bg-[#0f0c29]/60 backdrop-blur-2xl p-5 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/5 gap-4 mb-8 relative"
                >
                    <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-transparent via-amber-500/50 to-transparent rounded-t-3xl"></div>

                    <div className="relative flex-1 group">
                        <FiSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-amber-300/40 group-focus-within:text-amber-400 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search by student name or application ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-14 pr-5 py-4 bg-black/40 border border-white/10 rounded-2xl text-white placeholder-amber-200/30 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 outline-none transition-all shadow-inner font-medium"
                        />
                    </div>
                    <div className="flex items-center gap-3 relative group">
                        <div className="absolute left-5 text-amber-300/40 pointer-events-none group-focus-within:text-amber-400 transition-colors z-10">
                            <FiFilter size={20} />
                        </div>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="pl-14 pr-12 py-4 bg-black/40 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 outline-none font-bold tracking-wide appearance-none shadow-inner w-full md:w-auto min-w-[240px] transition-all cursor-pointer"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23fbbf24' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 1.25rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
                        >
                            <option value="all" className="bg-[#120e2b] text-white py-2">🟢 Needs Attention</option>
                            <option value="submitted" className="bg-[#120e2b] text-white py-2">⭐ New Submissions</option>
                            <option value="under_verification" className="bg-[#120e2b] text-white py-2">🔍 Currently Reviewing</option>
                            <option value="approved" className="bg-[#120e2b] text-white py-2">✅ Approved by Me</option>
                            <option value="rejected" className="bg-[#120e2b] text-white py-2">❌ Rejected by Me</option>
                        </select>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="bg-[#0f0c29]/60 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/5 overflow-hidden"
                >
                    <div className="grid grid-cols-12 gap-6 p-6 border-b border-white/5 bg-white/[0.02] font-black text-amber-200/50 text-xs hidden md:grid tracking-widest uppercase">
                        <div className="col-span-5 lg:col-span-4">Applicant details</div>
                        <div className="col-span-4 lg:col-span-3">Date Submitted</div>
                        <div className="col-span-3 lg:col-span-3">Current Status</div>
                        <div className="col-span-12 lg:col-span-2 text-right">Action</div>
                    </div>

                    {filteredApps.length === 0 ? (
                        <div className="p-24 text-center">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-400 mb-6 shadow-inner"
                            >
                                <FiCheckCircle size={40} className="opacity-80" />
                            </motion.div>
                            <h3 className="text-2xl font-bold text-white mb-3">All caught up!</h3>
                            <p className="text-amber-200/50 max-w-sm mx-auto font-medium">No applications found matching your criteria. Great job staying on top of the queue.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {filteredApps.map((app, index) => {
                                const statusInfo = statusConfig[app.status] || statusConfig.submitted;

                                return (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + (index * 0.05) }}
                                        whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                                        key={app.id}
                                        className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 md:p-8 items-center transition-colors group"
                                    >
                                        <div className="md:col-span-5 lg:col-span-4">
                                            <p className="font-bold text-white text-lg group-hover:text-amber-300 transition-colors">{app.fullName}</p>
                                            <p className="text-sm font-medium text-amber-100/60 mt-1">{app.scholarshipTitle}</p>
                                            <div className="text-[10px] text-amber-300/40 bg-black/40 px-2.5 py-1 rounded border border-white/5 inline-block font-mono font-bold uppercase tracking-widest mt-3">ID: {app.id.substring(0, 8)}...</div>
                                        </div>

                                        <div className="md:col-span-4 lg:col-span-3 flex items-center md:items-start text-amber-200/50 font-medium md:text-sm">
                                            <FiClock className="mr-2 md:hidden" />
                                            {app.submittedAt?.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) || "Recent"}
                                        </div>

                                        <div className="md:col-span-3 lg:col-span-3">
                                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${statusInfo.color}`}>
                                                {statusInfo.icon}
                                                <span className="truncate">{statusInfo.label}</span>
                                            </span>
                                        </div>

                                        <div className="md:col-span-12 lg:col-span-2 md:text-right mt-4 md:mt-0">
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block w-full md:w-auto">
                                                <Link
                                                    href={`/verifier/review/${app.id}`}
                                                    className="w-full md:w-auto inline-flex items-center justify-center text-sm font-bold text-amber-400 hover:text-white bg-amber-500/10 hover:bg-gradient-to-r hover:from-amber-600 hover:to-orange-600 px-6 py-3 rounded-xl transition-all border border-amber-500/20 hover:border-transparent shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] flex-shrink-0"
                                                >
                                                    Review Case <FiArrowRight className="ml-2" />
                                                </Link>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
