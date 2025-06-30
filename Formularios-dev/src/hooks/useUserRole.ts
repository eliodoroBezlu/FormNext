import { useSession } from "next-auth/react";
import { useMemo } from "react";

export type UserRole = 'admin' | 'supervisor' | 'tecnico' | 'viewer';

export const useUserRole = () => {
  const { data: session, status } = useSession();
  
  const userRole = useMemo((): UserRole | null => {
    if (!session?.roles && !session?.clientRoles) return null;
    
    // Prioridad de roles (de mayor a menor)
    const allRoles = [...(session.roles || []), ...(session.clientRoles || [])];
    
    if (allRoles.includes('admin') || allRoles.includes('administrator')) {
      return 'admin';
    }
    if (allRoles.includes('supervisor') || allRoles.includes('manager')) {
      return 'supervisor';
    }
    if (allRoles.includes('tecnico') || allRoles.includes('technician')) {
      return 'tecnico';
    }
    if (allRoles.includes('viewer') || allRoles.includes('readonly')) {
      return 'viewer';
    }
    
    // Rol por defecto
    return 'viewer';
  }, [session]);

  const hasRole = (role: UserRole): boolean => {
    if (!userRole) return false;
    
    // Jerarquía de roles
    const roleHierarchy = {
      admin: ['admin', 'supervisor', 'operator', 'viewer'],
      supervisor: ['supervisor', 'operator', 'viewer'],
      tecnico: ['tecnico', 'viewer'],
      viewer: ['viewer']
    };
    
    return roleHierarchy[userRole].includes(role);
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  return {
    userRole,
    hasRole,
    hasAnyRole,
    isLoading: status === 'loading',
    isAuthenticated: !!session
  };
};