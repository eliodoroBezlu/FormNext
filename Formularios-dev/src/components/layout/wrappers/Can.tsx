"use client";

import React, { ReactNode } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { Role, UserRole } from "@/lib/routePermissions";
import { AppPermission } from "@/lib/permissions";

interface CanProps {
  perform?: AppPermission | AppPermission[]; // Un solo permiso o un array (cualquiera)
  role?: UserRole | UserRole[]; // Un solo rol o un array (cualquiera)
  children: ReactNode;
  fallback?: ReactNode; // Qué mostrar si no tiene permisos (por defecto oculta completamente)
}

export const Can: React.FC<CanProps> = ({
  perform,
  role,
  children,
  fallback = null,
}) => {
  const { hasGranularPermission, hasRole, hasAnyRole, isLoading } =
    useUserRole();

  if (isLoading) {
    return null;
  }

  let hasAccess = true;

  if (perform) {
    if (Array.isArray(perform)) {
      hasAccess = perform.some((perm) => hasGranularPermission(perm));
    } else {
      hasAccess = hasGranularPermission(perform);
    }
  }

  if (role) {
    let hasRequiredRole = false;
    if (Array.isArray(role)) {
      hasRequiredRole = hasAnyRole(role);
    } else {
      hasRequiredRole = hasRole(role);
    }

    if (!perform) {
      hasAccess = hasRequiredRole;
    } else if (perform && !hasAccess && hasRequiredRole) {
      hasAccess = true;
    }
  }

  const isGlobalAdmin = hasRole(Role.ADMIN);

  if (hasAccess || isGlobalAdmin) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
