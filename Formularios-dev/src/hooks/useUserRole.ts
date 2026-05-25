"use client";

import { useMemo, useState, useEffect } from "react";
import {
  getUserRole,
  hasPermission,
  ROLE_HIERARCHY,
  type UserRole,
} from "@/lib/routePermissions";
import { Permission } from "@/lib/permissions";
import { obtenerTrabajadorPorUsername } from "@/lib/actions/trabajador-actions";

export const AVAILABLE_PERMISSIONS = [
  { value: Permission.CREATE_WORKER, label: "Crear Trabajador" },
  { value: Permission.READ_WORKER, label: "Ver Trabajadores" },
  { value: Permission.UPDATE_WORKER, label: "Editar Trabajador" },
  { value: Permission.DELETE_WORKER, label: "Eliminar Trabajador" },
  {
    value: Permission.MANAGE_WORKER_USER,
    label: "Gestionar Usuario-Trabajador",
  },
  { value: Permission.READ_USER, label: "Ver Usuarios" },
  { value: Permission.MANAGE_USERS, label: "Gestionar Usuarios (General)" },
  { value: Permission.CREATE_FORM, label: "Crear Formulario" },
  { value: Permission.READ_FORM, label: "Ver Formularios" },
  { value: Permission.UPDATE_FORM, label: "Editar Formulario" },
  { value: Permission.DELETE_FORM, label: "Eliminar Formulario" },
  { value: Permission.APPROVE_FORM, label: "Aprobar Formulario" },
  { value: Permission.VIEW_REPORTS, label: "Ver Reportes" },
  { value: Permission.MANAGE_SETTINGS, label: "Gestionar Sistema" },
  { value: Permission.MANAGE_ACTION_PLAN, label: "Gestionar Plan Acción" },
];

interface User {
  id: string;
  username: string;
  email?: string;
  fullName?: string;
  roles: string[];
  permissions?: string[];
  area?: string; // área del Trabajador vinculado
}

// Caché global para evitar múltiples peticiones concurrentes
let cachedUser: User | null = null;
let fetchPromise: Promise<User | null> | null = null;

export const useUserRole = () => {
  const [user, setUser] = useState<User | null>(cachedUser);
  const [isLoading, setIsLoading] = useState(!cachedUser);

  useEffect(() => {
    // Si ya tenemos el usuario en caché, no hacer nada
    if (cachedUser) {
      setUser(cachedUser);
      setIsLoading(false);
      return;
    }

    // Si no hay una petición en curso, iniciarla
    if (!fetchPromise) {
      fetchPromise = (async () => {
        try {
          const response = await fetch("/api/auth/user", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          });

          if (!response.ok) {
            console.log("❌ [useUserRole] No autenticado");
            return null;
          }

          const data = await response.json();

          if (data.user) {
            const baseUser: User = data.user;

            if (baseUser.username) {
              try {
                const trabajador = await obtenerTrabajadorPorUsername(
                  baseUser.username,
                );
                if (trabajador?.area) {
                  baseUser.area = trabajador.area;
                }
              } catch (error) {
                console.error(
                  "💥 [useUserRole] Error al obtener trabajador:",
                  error,
                );
                // Silencioso, el usuario puede no tener Trabajador vinculado
              }
            }

            cachedUser = baseUser;
            return baseUser;
          }

          return null;
        } catch (error) {
          console.error("💥 [useUserRole] Error:", error);
          return null;
        }
      })();
    }

    // Suscribirse a la petición en curso
    fetchPromise.then((resolvedUser) => {
      if (resolvedUser) {
        setUser(resolvedUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // Cleanup: En este enfoque básico, mantenemos la caché durante la sesión en cliente.
    // Si necesitas limpiar la caché al hacer logout, podrías exportar una función `clearUserCache()`.
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

  const hasGranularPermission = (permission: string): boolean => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  return {
    user,
    userRole,
    hasRole,
    hasAnyRole,
    hasGranularPermission,
    isLoading,
    isAuthenticated: !!user,
  };
};
