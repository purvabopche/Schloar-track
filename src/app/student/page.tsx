"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import Link from "next/link";
import { FiPlus, FiClock, FiCheckCircle, FiXCircle, FiFileText, FiArrowRight, FiAward } from "react-icons/fi";
import { motion } from "framer-motion";

interface Application {
    id: string;
    scholarshipTitle: string;
    status: "submitted" | "under_verification" | "approved" | "rejected" | "disbursed";
    submittedAt: any;
    remarks?: string;
}

const statusConfig = {
    submitted: { color: "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]", icon: <FiClock className="mr-1.5" />, label: "Submitted" },
    under_verification: { color: "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]", icon: <FiFileText className="mr-1.5" />, label: "Under Verification" },
    approved: { color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]", icon: <FiCheckCircle className="mr-1.5" />, label: "Approved" },
    rejected: { color: "bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.2)]", icon: <FiXCircle className="mr-1.5" />, label: "Rejected" },
    disbursed: { color: "bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 shadow-[0_0_10px_rgba(217,70,239,0.2)]", icon: <FiAward className="mr-1.5" />, label: "Disbursed" },
};

export default function StudentDashboard() {
    const { isAuthorized } = useRoleRedirect({ allowedRoles: ["student"] });
    const { user } = useAuth();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplications = async () => {
            if (!user) return;
            try {
                const q = query(
                    collection(db, "applications"),
                    where("studentId", "==", user.uid),
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
    }, [user, isAuthorized]);

    if (!isAuthorized || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#070514]">
                <div className="relative w-24 h-24">
                    <div className="absolute inset-0 rounded-full border-t-2 border-fuchsia-500 animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-r-2 border-indigo-500 animate-spin border-opacity-60" style={{ animationDuration: '1.5s' }}></div>
                    <div className="absolute inset-4 rounded-full border-b-2 border-purple-500 animate-spin border-opacity-40" style={{ animationDuration: '2s' }}></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#070514] font-sans relative overflow-hidden pb-20">
            {/* Dynamic Abstract Background for Student Dashboard */}
            <div className="fixed top-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-gradient-to-b from-indigo-600/10 to-purple-600/10 blur-[120px] mix-blend-screen pointer-events-none"></div>
            <div className="fixed bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-fuchsia-600/10 to-pink-600/10 blur-[130px] mix-blend-screen pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 relative z-10">

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6"
                >
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
                            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                            Student Portal
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300 tracking-tight">
                            My Dashboard
                        </h1>
                        <p className="text-indigo-200/60 mt-3 text-lg max-w-xl font-medium">
                            Manage your scholarship applications, track statuses, and explore new opportunities.
                        </p>
                    </div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Link
                            href="/student/apply"
                            className="inline-flex items-center px-7 py-3.5 bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all font-bold group"
                        >
                            <FiPlus className="mr-2 group-hover:rotate-90 transition-transform duration-300" size={20} />
                            Apply for Scholarship
                        </Link>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-[#0f0c29]/60 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/5 overflow-hidden relative"
                >
                    {/* Subtle top highlight */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

                    <div className="border-b border-white/5 px-8 py-6 bg-white/[0.02] flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FiFileText className="text-indigo-400" />
                            Active Applications
                        </h2>
                        <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full border border-indigo-500/20">
                            {applications.length} Total
                        </span>
                    </div>

                    {applications.length === 0 ? (
                        <div className="p-20 text-center">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 border border-indigo-500/20 text-indigo-400 mb-6 shadow-inner"
                            >
                                <FiFileText size={40} className="opacity-80" />
                            </motion.div>
                            <h3 className="text-2xl font-bold text-white mb-3">No applications found</h3>
                            <p className="text-indigo-200/50 max-w-sm mx-auto mb-8 font-medium">You haven't submitted any scholarship applications yet. Ready to take the next step?</p>
                            <Link
                                href="/student/apply"
                                className="inline-flex items-center px-6 py-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-xl shadow-sm transition-all font-bold hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                            >
                                Discover Scholarships <FiArrowRight className="ml-2" />
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {applications.map((app, index) => {
                                const statusInfo = statusConfig[app.status] || statusConfig.submitted;

                                return (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + (index * 0.1) }}
                                        whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                                        key={app.id}
                                        className="p-8 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-6 group"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">{app.scholarshipTitle}</h3>
                                            </div>
                                            <p className="text-sm text-indigo-200/40 font-medium flex items-center gap-1.5 flex-wrap">
                                                <span className="bg-black/40 px-2.5 py-1 rounded-md border border-white/5 tracking-wider uppercase text-xs">ID: {app.id.substring(0, 8)}</span>
                                                <span>•</span>
                                                <FiClock className="opacity-70" /> Submitted on {app.submittedAt?.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) || "Recently"}
                                            </p>

                                            {app.remarks && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="mt-5 bg-gradient-to-r from-red-500/10 to-transparent p-4 rounded-xl border-l-2 border-red-500 relative overflow-hidden"
                                                >
                                                    <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-red-500/5 to-transparent pointer-events-none"></div>
                                                    <span className="font-bold text-red-400 block mb-1 text-sm uppercase tracking-wider flex items-center gap-2">
                                                        <FiXCircle /> Verifier Remarks
                                                    </span>
                                                    <p className="text-red-200/80 text-sm leading-relaxed">{app.remarks}</p>
                                                </motion.div>
                                            )}
                                        </div>

                                        <div className="flex flex-col sm:items-end gap-5 min-w-[180px]">
                                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${statusInfo.color}`}>
                                                {statusInfo.icon}
                                                {statusInfo.label}
                                            </span>

                                            <Link
                                                href={`/student/application/${app.id}`}
                                                className="inline-flex items-center justify-center text-sm font-bold text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/30 px-5 py-2.5 rounded-xl transition-all w-full sm:w-auto border border-indigo-500/20 flex-shrink-0"
                                            >
                                                View Details <FiArrowRight className="ml-1.5" />
                                            </Link>
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
