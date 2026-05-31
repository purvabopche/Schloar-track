"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
    const { user, role, signOut, loading } = useAuth();
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const getDashboardLink = () => {
        switch (role) {
            case "admin": return "/admin";
            case "verifier": return "/verifier";
            case "student": return "/student";
            default: return "/";
        }
    };

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#0f0c29]/80 backdrop-blur-lg border-b border-white/10 py-3' : 'bg-transparent py-5'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="text-2xl font-black tracking-tighter text-white flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
                                <span className="text-white text-lg leading-none">S</span>
                            </div>
                            Scholar<span className="text-fuchsia-400 font-light">Track</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-6">
                        {!loading && (
                            <>
                                {user ? (
                                    <>
                                        <Link
                                            href={getDashboardLink()}
                                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${pathname === getDashboardLink() ? 'bg-white/10 text-white backdrop-blur-md shadow-inner border border-white/5' : 'text-purple-200 hover:text-white hover:bg-white/5'}`}
                                        >
                                            Dashboard
                                        </Link>
                                        {role === "student" && (
                                            <Link
                                                href="/student/profile"
                                                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${pathname === '/student/profile' ? 'bg-fuchsia-500/20 text-fuchsia-100 backdrop-blur-md shadow-inner border border-fuchsia-500/30' : 'text-purple-200 hover:text-white hover:bg-white/5'}`}
                                            >
                                                Profile
                                            </Link>
                                        )}
                                        <button
                                            onClick={signOut}
                                            className="px-5 py-2.5 bg-gradient-to-r from-red-500/80 to-pink-600/80 text-white hover:from-red-500 hover:to-pink-600 rounded-xl text-sm font-semibold shadow-lg shadow-red-500/20 transition-all border border-white/10"
                                        >
                                            Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/login" className="text-sm font-semibold text-purple-200 hover:text-white transition-colors">
                                            Log In
                                        </Link>
                                        <Link href="/register" className="px-6 py-2.5 bg-white text-purple-900 hover:bg-purple-50 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all border border-transparent hover:border-white/20">
                                            Register
                                        </Link>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
