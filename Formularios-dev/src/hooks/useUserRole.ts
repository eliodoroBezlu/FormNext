"use client";

import { useMemo, useState, useEffect } from "react";
import {
  getUserRole,
  hasPermission,
  ROLE_HIERARCHY,
  type UserRole,
} from "@/lib/routePermissions";

interface User {
  id: string;
  username: string;
  email?: string;
  fullName?: string;
  roles: string[];
}

export const useUserRole = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        // ✅ Llamar al Route Handler que lee la cookie httpOnly
        const response = await fetch('/api/auth/user', {
          method: 'GET',
          credentials: 'include', // Importante para enviar cookies
          cache: 'no-store',
        });

        if (!response.ok) {
          console.log('❌ [useUserRole] No autenticado');
          setUser(null);
          setIsLoading(false);
          return;
        }

        const data = await response.json();

        if (data.user) {
          console.log('✅ [useUserRole] Usuario obtenido:', data.user.username, '| Roles:', data.user.roles);
          setUser(data.user);
        } else {
          setUser(null);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('💥 [useUserRole] Error:', error);
        setUser(null);
        setIsLoading(false);
      }
    }

    fetchUser();
  }, []);

  const userRole = useMemo((): UserRole | null => {
    if (!user?.roles) return null;
    return getUserRole(user.roles);
  }, [user]);

  const hasRole = (role: UserRole): boolean => {
    if (!userRole) return false;
    const userRolesList = ROLE_HIERARCHY[userRole] || [];
    return userRolesList.includes(role);
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!userRole) return false;
    return hasPermission(userRole, roles);
  };

  return {
    user,
    userRole,
    hasRole,
    hasAnyRole,
    isLoading,
    isAuthenticated: !!user,
  };
};
