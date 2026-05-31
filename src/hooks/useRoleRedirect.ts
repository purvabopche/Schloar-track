"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/context/AuthContext";

interface UseRoleRedirectProps {
    allowedRoles: UserRole[];
    redirectTo?: string;
}

export const useRoleRedirect = ({ allowedRoles, redirectTo = "/login" }: UseRoleRedirectProps) => {
    const { role, loading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Not logged in
                router.push(redirectTo);
            } else if (role && !allowedRoles.includes(role)) {
                // Logged in but wrong role, push to their respective dashboard
                switch (role) {
                    case "admin": router.push("/admin"); break;
                    case "verifier": router.push("/verifier"); break;
                    case "student": router.push("/student"); break;
                    default: router.push("/"); break;
                }
            }
        }
    }, [role, loading, user, router, allowedRoles, redirectTo]);

    return { isAuthorized: !loading && user && role && allowedRoles.includes(role) };
};
