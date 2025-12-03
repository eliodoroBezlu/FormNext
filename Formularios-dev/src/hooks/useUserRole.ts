import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { getUserRole, hasPermission, ROLE_HIERARCHY, type UserRole } from "@/lib/routePermissions";

export const useUserRole = () => {
  const { data: session, status } = useSession();
  
  const userRole = useMemo((): UserRole | null => {
    if (!session?.roles) return null;
    
    const allRoles = [...(session.roles || [])];
    return getUserRole(allRoles);
  }, [session]);

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
    userRole,
    hasRole,
    hasAnyRole,
    isLoading: status === 'loading',
    isAuthenticated: !!session
  };
};