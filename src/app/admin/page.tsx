"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";
import { collection, query, getDocs, updateDoc, doc, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import Link from "next/link";
import { FiUsers, FiFileText, FiDollarSign, FiAward, FiCheckCircle, FiCpu, FiZap } from "react-icons/fi";
import { generateAdminInsights } from "@/app/actions/geminiAnalytics";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

export default function AdminDashboard() {
    const { isAuthorized } = useRoleRedirect({ allowedRoles: ["admin"] });
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalApplications: 0,
        approved: 0,
        rejected: 0,
        totalDisbursed: 0
    });
    const [recentApps, setRecentApps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [loadingAi, setLoadingAi] = useState(false);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                // Fetch Users count
                const usersSnap = await getDocs(collection(db, "users"));
                const totalUsers = usersSnap.size;

                // Fetch Applications
                const appsQuery = query(collection(db, "applications"), orderBy("submittedAt", "desc"));
                const appsSnap = await getDocs(appsQuery);

                const apps = appsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

                const approved = apps.filter(a => a.status === "approved").length;
                const rejected = apps.filter(a => a.status === "rejected").length;
                const totalDisbursed = apps.filter(a => a.status === "disbursed").length;

                setStats({
                    totalUsers,
                    totalApplications: apps.length,
                    approved,
                    rejected,
                    totalDisbursed
                });

                // Get top 5 recent apps needing admin final approval (status === 'approved')
                setRecentApps(apps.filter(a => a.status === "approved").slice(0, 5));

            } catch (error) {
                toast.error("Error loading admin data");
            } finally {
                setLoading(false);
            }
        };

        if (isAuthorized) {
            fetchAdminData();
        }
    }, [isAuthorized]);

    const fetchInsights = async () => {
        setLoadingAi(true);
        const insight = await generateAdminInsights(stats, recentApps);
        setAiInsight(insight);
        setLoadingAi(false);
    };

    const handleDisburse = async (appId: string) => {
        if (!confirm("Are you sure you want to mark this scholarship as disbursed? This action is final.")) return;

        const toastId = toast.loading("Processing secure disbursement...");
        try {
            await updateDoc(doc(db, "applications", appId), {
                status: "disbursed"
            });
            toast.success("Funds marked as disbursed successfully", { id: toastId });

            // Update local state
            setRecentApps(prev => prev.filter(app => app.id !== appId));
            setStats(prev => ({
                ...prev,
                approved: prev.approved - 1,
                totalDisbursed: prev.totalDisbursed + 1
            }));
        } catch (error) {
            toast.error("Failed to disburse funds", { id: toastId });
        }
    };

    if (!isAuthorized || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#070514]">
                <div className="relative w-24 h-24">
                    <div className="absolute inset-0 rounded-full border-t-2 border-emerald-500 animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-r-2 border-cyan-500 animate-spin border-opacity-60" style={{ animationDuration: '1.5s' }}></div>
                    <div className="absolute inset-4 rounded-full border-b-2 border-teal-500 animate-spin border-opacity-40" style={{ animationDuration: '2s' }}></div>
                </div>
            </div>
        );
    }

    const chartData = [
        { name: 'Total apps', value: stats.totalApplications, color: '#0ea5e9' }, // sky-500
        { name: 'Approved', value: stats.approved, color: '#10b981' }, // emerald-500
        { name: 'Rejected', value: stats.rejected, color: '#f43f5e' }, // rose-500
        { name: 'Disbursed', value: stats.totalDisbursed, color: '#8b5cf6' }, // violet-500
    ];

    return (
        <div className="min-h-screen bg-[#070514] font-sans relative overflow-hidden pb-20">
            {/* Dynamic Abstract Background for Admin Dashboard */}
            <div className="fixed top-[-10%] right-[-5%] w-[60%] h-[60%] rounded-full bg-gradient-to-b from-cyan-600/10 to-blue-600/10 blur-[140px] mix-blend-screen pointer-events-none"></div>
            <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-emerald-600/10 to-teal-600/10 blur-[130px] mix-blend-screen pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 relative z-10">
                <Toaster position="top-right" toastOptions={{ className: 'bg-[#0f172a] text-cyan-50 border border-cyan-500/20 shadow-2xl' }} />

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6"
                >
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                            Admin Console
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-300 tracking-tight">
                            System Overview
                        </h1>
                        <p className="text-cyan-200/60 mt-3 text-lg max-w-xl font-medium">
                            Monitor platform health, manage users, and finalize scholarship disbursements.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-6 md:mt-0 justify-end">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link href="/admin/users" className="px-5 py-3.5 bg-black/40 border border-white/10 text-white hover:bg-white/5 rounded-xl shadow-lg transition-all font-bold backdrop-blur-md flex items-center shadow-[0_0_15px_rgba(255,255,255,0.05)] text-sm">
                                <FiUsers className="mr-2 text-cyan-400" /> Users
                            </Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link href="/admin/scholarships" className="px-5 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all font-bold flex items-center text-sm">
                                <FiFileText className="mr-2 text-cyan-100" /> Scholarships
                            </Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link href="/admin/institutions" className="px-5 py-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-xl transition-all font-bold flex items-center text-sm">
                                Institutions
                            </Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link href="/admin/notifications" className="px-5 py-3.5 bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 hover:bg-fuchsia-500/20 rounded-xl transition-all font-bold flex items-center text-sm">
                                Notify
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>

                {/* AI Insights Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mb-12 bg-[#1a0b2e]/60 backdrop-blur-2xl rounded-3xl border border-fuchsia-500/20 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-[0_10px_40px_rgba(217,70,239,0.15)] relative overflow-hidden group hover:border-fuchsia-500/40 transition-all"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-fuchsia-500/20 transition-colors"></div>
                    <div className="flex-1 relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="p-2.5 bg-fuchsia-500/20 text-fuchsia-300 rounded-xl shadow-inner border border-fuchsia-500/30"><FiCpu size={24} /></span>
                            <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                                System AI Analyst <span className="text-[10px] font-mono tracking-widest text-fuchsia-300 uppercase border border-fuchsia-500/30 px-2 py-1 rounded bg-fuchsia-500/10">Powered by Gemini</span>
                            </h3>
                        </div>
                        <p className="text-fuchsia-100/70 text-base font-medium leading-relaxed max-w-4xl">
                            {aiInsight ? aiInsight : "Generate a smart summary of the platform's current state based on real-time data and application metrics using Gemini AI."}
                        </p>
                    </div>
                    <div className="flex-shrink-0 relative z-10 w-full sm:w-auto mt-4 sm:mt-0">
                        <button
                            onClick={fetchInsights}
                            disabled={loadingAi}
                            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold transition-all shadow-lg text-sm
                                ${loadingAi 
                                    ? 'bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white shadow-[0_0_30px_rgba(217,70,239,0.4)] hover:shadow-[0_0_40px_rgba(217,70,239,0.6)] border border-fuchsia-400/30'
                                }`}
                        >
                            {loadingAi ? (
                                <><span className="w-5 h-5 rounded-full border-2 border-fuchsia-300 border-t-transparent animate-spin"></span> Processing Analysis...</>
                            ) : (
                                <><FiZap size={18} /> Generate Analysis</>
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* Stats Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
                >
                    <StatCard title="Registered Users" value={stats.totalUsers} icon={<FiUsers />} color="from-cyan-500 to-blue-500" shadowColor="rgba(6,182,212,0.2)" delay={0} />
                    <StatCard title="Total Applications" value={stats.totalApplications} icon={<FiFileText />} color="from-blue-500 to-indigo-500" shadowColor="rgba(59,130,246,0.2)" delay={0.1} />
                    <StatCard title="Awaiting Disbursement" value={stats.approved} icon={<FiCheckCircle />} color="from-emerald-400 to-teal-500" shadowColor="rgba(16,185,129,0.2)" delay={0.2} />
                    <StatCard title="Funds Disbursed" value={stats.totalDisbursed} icon={<FiDollarSign />} color="from-yellow-400 to-orange-500" shadowColor="rgba(245,158,11,0.2)" delay={0.3} />
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Analytics Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="lg:col-span-2 bg-[#0f0c29]/60 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/5 p-8 relative overflow-hidden group hover:border-white/10 transition-colors"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-colors pointer-events-none"></div>
                        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2 relative z-10">
                            Volume Analytics
                        </h2>
                        <p className="text-cyan-200/50 mb-8 font-medium text-sm relative z-10">Platform application funnel visualization</p>

                        <div className="h-[300px] w-full relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600 }} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis allowDecimals={false} stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600 }} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', color: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                                        itemStyle={{ color: 'white', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="value" radius={[8, 8, 8, 8]} maxBarSize={60}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Pending Financial Approvals (Disbursements) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="bg-[#0f0c29]/60 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/5 overflow-hidden flex flex-col relative"
                    >
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>

                        <div className="bg-white/5 px-8 py-6 border-b border-white/5 relative z-10">
                            <h2 className="text-xl font-bold text-white flex items-center">
                                <span className="bg-emerald-500/20 text-emerald-400 p-2 rounded-xl mr-3 shadow-inner">
                                    <FiAward size={20} />
                                </span>
                                Final Approvals
                            </h2>
                            <p className="text-sm text-emerald-200/50 mt-2 font-medium">Awaiting final disbursement authorization</p>
                        </div>

                        <div className="divide-y divide-white/5 flex-grow relative z-10">
                            {recentApps.length === 0 ? (
                                <div className="p-16 text-center text-emerald-200/40 text-sm font-bold flex flex-col items-center justify-center h-full">
                                    <FiCheckCircle size={32} className="mb-4 text-emerald-500/30" />
                                    All clear!<br />No pending disbursements.
                                </div>
                            ) : (
                                recentApps.map((app) => (
                                    <div key={app.id} className="p-6 hover:bg-white/[0.03] transition-colors group">
                                        <div className="flex justify-between items-start mb-5">
                                            <div>
                                                <p className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">{app.fullName}</p>
                                                <p className="text-sm text-cyan-200/50 truncate max-w-[200px] mt-1 font-medium">{app.scholarshipTitle}</p>
                                            </div>
                                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-black/40 text-cyan-200/50 px-2 py-1 rounded-md border border-white/5 shadow-inner">ID: {app.id.substring(0, 5)}</span>
                                        </div>
                                        <div className="flex gap-3">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleDisburse(app.id)}
                                                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] shadow-inner"
                                            >
                                                Authorize
                                            </motion.button>
                                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                                                <Link
                                                    href={`/verifier/review/${app.id}`}
                                                    className="w-full h-full bg-white/5 border border-white/10 text-white hover:bg-white/10 text-xs font-bold py-3 rounded-xl transition-all text-center flex items-center justify-center backdrop-blur-sm shadow-inner"
                                                >
                                                    Review
                                                </Link>
                                            </motion.div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {recentApps.length > 0 && (
                            <div className="p-5 text-center bg-black/20 border-t border-white/5 mt-auto relative z-10">
                                <Link href="/verifier?filter=approved" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-bold tracking-wide">
                                    View all queue <span className="ml-1">→</span>
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

const StatCard = ({ title, value, icon, color, shadowColor, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 + delay }}
        className="bg-[#0f0c29]/60 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/5 p-8 flex items-center relative overflow-hidden group hover:border-white/20 transition-all cursor-default"
        style={{ boxShadow: `0 10px 30px ${shadowColor}` }}
    >
        <div className={`absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br ${color} rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${color} text-white shadow-xl shadow-black/20 mr-5 z-10 border border-white/20`}>
            {React.cloneElement(icon, { size: 28 })}
        </div>
        <div className="z-10">
            <p className="text-sm font-bold text-white/50 mb-1 tracking-wide uppercase">{title}</p>
            <p className={`text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r ${color} tracking-tight`}>{value}</p>
        </div>
    </motion.div>
);
