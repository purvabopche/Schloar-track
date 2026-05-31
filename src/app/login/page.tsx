"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { user, role, loading } = useAuth();

    useEffect(() => {
        if (!loading && user) {
            router.replace(role === "admin" ? "/admin" : role === "verifier" ? "/verifier" : "/student");
        }
    }, [user, loading, role, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const toastId = toast.loading("Verifying credentials...");

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
            const user = userCredential.user;

            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const role = userDoc.data().role;
                toast.success("Welcome back!", { id: toastId });

                setTimeout(() => {
                    if (role === "admin") router.push("/admin");
                    else if (role === "verifier") router.push("/verifier");
                    else router.push("/student");
                }, 800);
            } else {
                toast.error("User profile not found.", { id: toastId });
                setIsLoading(false);
            }
        } catch (error: any) {
            let errorMessage = "Failed to log in";
            if (error.code === 'auth/invalid-credential') {
                errorMessage = "Invalid email or password.";
            } else if (error.code === 'auth/user-not-found') {
                errorMessage = "No account found with this email.";
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = "Incorrect password.";
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = "Too many failed attempts. Please try again later.";
            } else {
                errorMessage = error.message.replace("Firebase: ", "");
            }
            toast.error(errorMessage, { id: toastId });
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email address first to reset password.");
            return;
        }

        const toastId = toast.loading("Sending reset link...");
        try {
            await sendPasswordResetEmail(auth, email);
            toast.success("Password reset link sent to your email!", { id: toastId });
        } catch (error: any) {
            let errorMessage = "Failed to send reset link";
            if (error.code === 'auth/invalid-email') errorMessage = "Invalid email address.";
            else if (error.code === 'auth/user-not-found') errorMessage = "No account found with this email.";
            toast.error(errorMessage, { id: toastId });
        }
    };

    return (
        <div className="min-h-screen bg-[#070514] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
            {/* Highly Professional Background Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-indigo-600/20 to-purple-600/20 blur-[120px] mix-blend-screen pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-fuchsia-600/20 to-pink-600/20 blur-[100px] mix-blend-screen pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
            >
                <div className="text-center mb-8">
                    <motion.div
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-indigo-600 items-center justify-center shadow-[0_0_30px_rgba(217,70,239,0.3)] mb-6 ring-1 ring-white/10"
                    >
                        <span className="text-white text-3xl font-black leading-none tracking-tighter">ST</span>
                    </motion.div>
                    <h2 className="text-center text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 tracking-tight">
                        Welcome Back
                    </h2>
                    <p className="mt-3 text-center text-sm text-indigo-200/60 font-medium">
                        Enter your details to access your dashboard
                    </p>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
            >
                <Toaster position="top-center" toastOptions={{ className: 'bg-[#120e2b] text-indigo-50 border border-indigo-500/20 shadow-2xl' }} />

                <div className="bg-[#0f0c29]/60 py-10 px-6 sm:px-10 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/5 backdrop-blur-2xl relative overflow-hidden">
                    {/* Inner subtle glow */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent"></div>

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-sm font-medium text-indigo-100/80 mb-2">
                                Email Address
                            </label>
                            <div className="mt-1 relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FiMail className="h-5 w-5 text-indigo-300/40 group-focus-within:text-fuchsia-400 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    suppressHydrationWarning
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3.5 border border-white/10 rounded-xl bg-black/40 text-white placeholder-indigo-200/20 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50 transition-all sm:text-sm shadow-inner"
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
                                    <FiLock className="h-5 w-5 text-indigo-300/40 group-focus-within:text-fuchsia-400 transition-colors" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    suppressHydrationWarning
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-12 py-3.5 border border-white/10 rounded-xl bg-black/40 text-white placeholder-indigo-200/20 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50 transition-all sm:text-sm shadow-inner"
                                    placeholder="••••••••"
                                />
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-indigo-300/40 hover:text-fuchsia-400 focus:outline-none transition-colors"
                                    >
                                        {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-fuchsia-500 focus:ring-fuchsia-500/50 border-white/10 bg-black/40 rounded cursor-pointer transition-colors"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-indigo-200/60 cursor-pointer hover:text-indigo-200/80 transition-colors">
                                    Remember me
                                </label>
                            </div>
                            <div className="text-sm">
                                <button type="button" onClick={handleForgotPassword} className="font-medium text-fuchsia-400 hover:text-fuchsia-300 transition-colors hover:underline underline-offset-4">
                                    Forgot password?
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-[0_0_20px_rgba(217,70,239,0.2)] text-sm font-bold text-white bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-500 focus:ring-offset-[#0f0c29] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Authenticating...
                                    </span>
                                ) : "Sign In securely"}
                            </motion.button>
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5">
                        <div className="text-center">
                            <span className="text-sm text-indigo-200/50">
                                Don't have an account?{' '}
                            </span>
                            <Link href="/register" className="text-sm font-bold text-fuchsia-400 hover:text-fuchsia-300 transition-colors hover:underline underline-offset-4 ml-1">
                                Create an account
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
