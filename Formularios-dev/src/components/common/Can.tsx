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

  // Si aún está cargando la sesión del usuario, podríamos ocultarlo momentáneamente o mostrar fallback
  if (isLoading) {
    return null;
  }

  let hasAccess = true;

  // 1. Verificación de Permisos Granulares
  if (perform) {
    if (Array.isArray(perform)) {
      hasAccess = perform.some((perm) => hasGranularPermission(perm));
    } else {
      hasAccess = hasGranularPermission(perform);
    }
  }

  // 2. Verificación de Roles (Adicional o en lugar de permisos)
  // Nota: Si se especifican ambos, se asume un "O" lógico en este enfoque (es decir, si tiene el rol O tiene el permiso)
  // Pero para mayor seguridad, vamos a priorizar: Si falló el permiso, tal vez su rol se lo permite (ej: admin).
  if (role) {
    let hasRequiredRole = false;
    if (Array.isArray(role)) {
      hasRequiredRole = hasAnyRole(role);
    } else {
      hasRequiredRole = hasRole(role);
    }

    // Si 'perform' falló, pero tiene el 'role', le damos acceso.
    // Si solo se pasó 'role', evaluamos solo el rol.
    if (!perform) {
      hasAccess = hasRequiredRole;
    } else if (perform && !hasAccess && hasRequiredRole) {
      hasAccess = true; // Por ejemplo, el 'admin' siempre pasa si se especifica su rol
    }
  }

  // Admin override global opcional (Si se desea que los admin se salten todo)
  const isGlobalAdmin = hasRole(Role.ADMIN);

  if (hasAccess || isGlobalAdmin) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
