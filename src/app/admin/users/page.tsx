"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";
import { collection, query, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import Link from "next/link";
import { FiArrowLeft, FiEdit2, FiTrash2, FiUser, FiSearch } from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";
import { UserRole } from "@/context/AuthContext";

export default function UserManagement() {
    const { isAuthorized } = useRoleRedirect({ allowedRoles: ["admin"] });
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [editingUser, setEditingUser] = useState<any | null>(null);

    useEffect(() => {
        fetchUsers();
    }, [isAuthorized]);

    const fetchUsers = async () => {
        try {
            const q = query(collection(db, "users"));
            const querySnapshot = await getDocs(q);
            const fetchedUsers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(fetchedUsers);
        } catch (error) {
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (userId: string, newRole: UserRole) => {
        const toastId = toast.loading("Updating role...");
        try {
            await updateDoc(doc(db, "users", userId), { role: newRole });
            toast.success("Role updated successfully!", { id: toastId });
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            setEditingUser(null);
        } catch (error) {
            toast.error("Failed to update role", { id: toastId });
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user record from Firestore? (Note: Authentication deletion requires Admin SDK)")) return;

        const toastId = toast.loading("Deleting user data...");
        try {
            await deleteDoc(doc(db, "users", userId));
            setUsers(users.filter(u => u.id !== userId));
            toast.success("User data deleted!", { id: toastId });
        } catch (error) {
            toast.error("Failed to delete user", { id: toastId });
        }
    };

    if (!isAuthorized || loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500"></div>
            </div>
        );
    }

    const filteredUsers = users.filter(u =>
        u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto px-4 py-24 relative z-10">
            <Toaster position="top-right" toastOptions={{ className: 'bg-[#1a1640] text-purple-100 border border-purple-500/30' }} />

            <Link href="/admin" className="inline-flex items-center text-fuchsia-400 hover:text-fuchsia-300 mb-8 font-bold transition-colors">
                <FiArrowLeft className="mr-2" /> Back to Dashboard
            </Link>

            <div className="mb-10">
                <h1 className="text-4xl font-extrabold text-white tracking-tight">User Management</h1>
                <p className="text-purple-200/70 mt-2 text-lg">Manage system access roles and accounts.</p>
            </div>

            <div className="bg-[#130f2e]/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/50 border border-white/10 overflow-hidden mt-6">
                <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
                    <div className="relative w-full max-w-md">
                        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300/50" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-black/30 border border-white/5 rounded-xl text-white placeholder-purple-200/30 focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-4 p-5 border-b border-white/10 bg-white/5 font-bold text-white text-sm uppercase tracking-wider">
                    <div className="col-span-4">User Details</div>
                    <div className="col-span-3">Role</div>
                    <div className="col-span-3">Joined</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                <div className="divide-y divide-white/5">
                    {filteredUsers.map((u) => (
                        <div key={u.id} className="grid grid-cols-12 gap-4 p-5 items-center hover:bg-white/5 transition-colors text-sm">
                            <div className="col-span-4 flex items-center">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 border border-fuchsia-500/30 text-fuchsia-400 flex items-center justify-center mr-4 flex-shrink-0 font-bold shadow-inner">
                                    {u.fullName?.charAt(0).toUpperCase() || <FiUser size={20} />}
                                </div>
                                <div className="truncate">
                                    <p className="font-bold text-white text-base truncate">{u.fullName || "N/A"}</p>
                                    <p className="text-sm text-purple-200/60 truncate">{u.email}</p>
                                </div>
                            </div>

                            <div className="col-span-3">
                                {editingUser === u.id ? (
                                    <select
                                        autoFocus
                                        defaultValue={u.role}
                                        onChange={(e) => handleUpdateRole(u.id, e.target.value as UserRole)}
                                        onBlur={() => setEditingUser(null)}
                                        className="border border-white/20 rounded-lg py-1.5 px-3 text-sm bg-[#1a1640] text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                                    >
                                        <option value="student">Student</option>
                                        <option value="verifier">Verifier</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                ) : (
                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                    ${u.role === 'admin' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                            u.role === 'verifier' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                                'bg-green-500/20 text-green-300 border border-green-500/30'}`}
                                    >
                                        {u.role?.toUpperCase() || 'STUDENT'}
                                    </span>
                                )}
                            </div>

                            <div className="col-span-3 text-purple-200/60 font-medium">
                                {u.createdAt?.toDate().toLocaleDateString() || "Unknown"}
                            </div>

                            <div className="col-span-2 flex justify-end gap-3">
                                <button
                                    onClick={() => setEditingUser(u.id)}
                                    className="p-2.5 text-fuchsia-400 hover:bg-fuchsia-500/10 hover:text-fuchsia-300 rounded-xl transition-all border border-transparent hover:border-fuchsia-500/30"
                                    title="Edit Role"
                                >
                                    <FiEdit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDeleteUser(u.id)}
                                    className="p-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all border border-transparent hover:border-red-500/30"
                                    title="Delete User"
                                >
                                    <FiTrash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
