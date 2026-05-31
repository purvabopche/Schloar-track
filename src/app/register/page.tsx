"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiUser, FiBriefcase, FiEye, FiEyeOff } from "react-icons/fi";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "student"
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { user, role, loading } = useAuth();

    useEffect(() => {
        if (!loading && user) {
            router.replace(role === "admin" ? "/admin" : role === "verifier" ? "/verifier" : "/student");
        }
    }, [user, loading, role, router]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const toastId = toast.loading("Creating your account securely...");

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email.trim(), formData.password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                createdAt: serverTimestamp()
            });

            toast.success("Account created successfully!", { id: toastId });

            setTimeout(() => {
                if (formData.role === "admin") router.push("/admin");
                else if (formData.role === "verifier") router.push("/verifier");
                else router.push("/student");
            }, 1000);

        } catch (error: any) {
            console.warn("Registration error:", error?.message || error);

            const errorString = typeof error === 'string' ? error : (error?.message || "");

            if (
                error?.code === 'auth/email-already-in-use' ||
                errorString.includes('email-already-in-use') ||
                errorString.includes('EMAIL_EXISTS')
            ) {
                toast.error("An account with this email already exists. Please log in.", { id: toastId });
                setTimeout(() => router.push("/login"), 1500);
            } else if (error?.code === 'auth/weak-password') {
                toast.error("Password should be at least 6 characters.", { id: toastId });
            } else if (error?.code === 'auth/invalid-email') {
                toast.error("Please enter a valid email address.", { id: toastId });
            } else {
                const displayError = error?.message ? error.message.replace("Firebase: ", "") : "Failed to create account. Please try again.";
                toast.error(displayError, { id: toastId });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#070514] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
            {/* Highly Professional Background Orbs */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-indigo-600/20 to-blue-600/20 blur-[130px] mix-blend-screen pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-purple-700/20 to-fuchsia-600/20 blur-[120px] mix-blend-screen pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
            >
                <div className="text-center mb-8">
                    <motion.div
                        whileHover={{ scale: 1.05, rotate: -5 }}
                        className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)] mb-6 ring-1 ring-white/10"
                    >
                        <span className="text-white text-3xl font-black leading-none tracking-tighter">ST</span>
                    </motion.div>
                    <h2 className="text-center text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 tracking-tight">
                        Create Account
                    </h2>
                    <p className="mt-3 text-center text-sm text-indigo-200/60 font-medium">
                        Join ScholarTrack to unlock your potential
                    </p>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0"
            >
                <Toaster position="top-center" toastOptions={{ className: 'bg-[#120e2b] text-indigo-50 border border-indigo-500/20 shadow-2xl' }} />

                <div className="bg-[#0f0c29]/60 py-8 px-6 sm:px-10 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/5 backdrop-blur-2xl relative overflow-hidden">
                    {/* Inner subtle glow */}
                    <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-transparent via-indigo-500/50 to-transparent"></div>

                    <form className="space-y-5" onSubmit={handleRegister}>
                        <div>
                            <label className="block text-sm font-medium text-indigo-100/80 mb-2">
                                Full Name
                            </label>
                            <div className="mt-1 relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FiUser className="h-5 w-5 text-indigo-300/40 group-focus-within:text-indigo-400 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    suppressHydrationWarning
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="block w-full pl-11 pr-4 py-3.5 border border-white/10 rounded-xl bg-black/40 text-white placeholder-indigo-200/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all sm:text-sm shadow-inner"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-indigo-100/80 mb-2">
                                Email Address
                            </label>
                            <div className="mt-1 relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FiMail className="h-5 w-5 text-indigo-300/40 group-focus-within:text-indigo-400 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    suppressHydrationWarning
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="block w-full pl-11 pr-4 py-3.5 border border-white/10 rounded-xl bg-black/40 text-white placeholder-indigo-200/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all sm:text-sm shadow-inner"
                                    placeholder="name@university.edu"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-indigo-100/80 mb-2">
                                Password
                            </label>
                            <div className="mt-1 relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FiLock className="h-5 w-5 text-indigo-300/40 group-focus-within:text-indigo-400 transition-colors" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={6}
                                    suppressHydrationWarning
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="block w-full pl-11 pr-12 py-3.5 border border-white/10 rounded-xl bg-black/40 text-white placeholder-indigo-200/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all sm:text-sm shadow-inner"
                                    placeholder="••••••••"
                                />
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-indigo-300/40 hover:text-indigo-400 focus:outline-none transition-colors"
                                    >
                                        {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-indigo-100/80 mb-2 flex justify-between items-center">
                                <span>Role Selection</span>
                                <span className="text-indigo-300/40 font-normal text-xs bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/10">Demo Mode</span>
                            </label>
                            <div className="mt-1 relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FiBriefcase className="h-5 w-5 text-indigo-300/40 group-focus-within:text-indigo-400 transition-colors" />
                                </div>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="block w-full pl-11 pr-10 py-3.5 border border-white/10 rounded-xl bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all sm:text-sm appearance-none shadow-inner cursor-pointer"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23818cf8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 1rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
                                >
                                    <option value="student" className="bg-[#120e2b] text-white py-2">👨‍🎓 Student (Applicant)</option>
                                    <option value="verifier" className="bg-[#120e2b] text-white py-2">🔍 Verification Officer</option>
                                    <option value="admin" className="bg-[#120e2b] text-white py-2">🛡️ Administrator</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-4">
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.2)] text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-[#0f0c29] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Enrolling...
                                    </span>
                                ) : "Complete Registration"}
                            </motion.button>
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <span className="text-sm text-indigo-200/50">
                            Already have an account?{' '}
                        </span>
                        <Link href="/login" className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors hover:underline underline-offset-4 ml-1">
                            Sign in securely
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
