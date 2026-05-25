export enum Role {
  USER = "user",
  ADMIN = "admin",
  MODERATOR = "moderator",
  SUPER_ADMIN = "super_admin",
  INSPECTOR = "inspector",
  TECNICO = "tecnico",
  SUPERVISOR = "supervisor",
  SUPERINTENDENTE = "superintendente",
}

export type UserRole = Role;

export interface RoutePermission {
  path: string;
  requiredRoles: UserRole[];
  requiredPermissions?: string[];
  excludeRoles?: UserRole[];
}

export const ROUTE_PERMISSIONS: RoutePermission[] = [
  // Rutas públicas del dashboard
  { path: "/dashboard", requiredRoles: [] },

  // Formularios de inspección de seguridad - solo supervisor
  {
    path: "/dashboard/inspeccion-sistemas-emergencia",
    requiredRoles: [Role.SUPERVISOR],
  },
  {
    path: "/dashboard/inspeccion-sistemas-emergencia/formulario-insp-herr-equi",
    requiredRoles: [Role.SUPERVISOR],
  },
  {
    path: "/dashboard/inspeccion-sistemas-emergencia/formulario-insp-herr-equi/form-sistemas-de-emergencia",
    requiredRoles: [Role.SUPERVISOR],
  },
  {
    path: "/dashboard/inspeccion-sistemas-emergencia/formulario-insp-herr-equi/inspeccion-arnes",
    requiredRoles: [Role.SUPERVISOR],
  },

  // Formularios IRO-ISOP - técnicos
  {
    path: "/dashboard/inspeccion-sistemas-emergencia/formularios-IRO-ISOP",
    requiredRoles: [Role.TECNICO],
  },
  {
    path: "/dashboard/inspeccion-sistemas-emergencia/formularios-IRO-ISOP/aislamiento",
    requiredRoles: [Role.TECNICO],
  },
  {
    path: "/dashboard/inspeccion-sistemas-emergencia/formularios-IRO-ISOP/izaje",
    requiredRoles: [Role.TECNICO],
  },
  {
    path: "/dashboard/inspeccion-sistemas-emergencia/formularios-IRO-ISOP/sustancias",
    requiredRoles: [Role.TECNICO],
  },
  {
    path: "/dashboard/inspeccion-sistemas-emergencia/formularios-IRO-ISOP/talFreBan",
    requiredRoles: [Role.TECNICO],
  },
  {
    path: "/dashboard/inspeccion-sistemas-emergencia/formularios-IRO-ISOP/actos",
    requiredRoles: [Role.TECNICO],
  },
  {
    path: "/dashboard/inspeccion-sistemas-emergencia/formularios-IRO-ISOP/condiciones",
    requiredRoles: [Role.TECNICO],
  },
  {
    path: "/dashboard/inspeccion-sistemas-emergencia/formularios-IRO-ISOP/altura",
    requiredRoles: [Role.TECNICO],
  },
  {
    path: "/dashboard/inspeccion-sistemas-emergencia/formularios-IRO-ISOP/confinado",
    requiredRoles: [Role.TECNICO],
  },
  {
    path: "/dashboard/inspeccion-sistemas-emergencia/formularios-IRO-ISOP/excavaciones",
    requiredRoles: [Role.TECNICO],
  },
  {
    path: "/dashboard/inspeccion-sistemas-emergencia/formularios-IRO-ISOP/caliente",
    requiredRoles: [Role.TECNICO],
  },
  {
    path: "/dashboard/inspeccion-sistemas-emergencia/formularios-IRO-ISOP/isop",
    requiredRoles: [Role.TECNICO],
  },

  // Formularios de medio ambiente - solo admin
  { path: "/dashboard/form-med-amb", requiredRoles: [Role.ADMIN] },
  { path: "/dashboard/config", requiredRoles: [Role.ADMIN] },
  {
    path: "/dashboard/plan-accion",
    requiredRoles: [Role.ADMIN, Role.SUPERVISOR, Role.SUPERINTENDENTE],
  },

  // Reportes - admin
  {
    path: "/dashboard/reports",
    requiredRoles: [Role.ADMIN, Role.SUPERVISOR, Role.SUPERINTENDENTE],
  },
  {
    path: "/dashboard/reports/sistemas-de-emergencia",
    requiredRoles: [Role.ADMIN, Role.SUPERVISOR, Role.SUPERINTENDENTE],
  },
  {
    path: "/dashboard/reports/report-iro-isop",
    requiredRoles: [Role.ADMIN, Role.SUPERVISOR, Role.SUPERINTENDENTE],
  },
  {
    path: "/dashboard/reports/report-herra-equipos",
    requiredRoles: [Role.ADMIN, Role.SUPERVISOR, Role.SUPERINTENDENTE],
  },
];

export const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  [Role.SUPER_ADMIN]: [
    Role.SUPER_ADMIN,
    Role.ADMIN,
    Role.SUPERINTENDENTE,
    Role.SUPERVISOR,
    Role.TECNICO,
    Role.INSPECTOR,
    Role.MODERATOR,
    Role.USER,
  ],
  [Role.ADMIN]: [
    Role.ADMIN,
    Role.SUPERINTENDENTE,
    Role.SUPERVISOR,
    Role.TECNICO,
    Role.INSPECTOR,
    Role.USER,
  ],
  [Role.SUPERINTENDENTE]: [
    Role.SUPERINTENDENTE,
    Role.SUPERVISOR,
    Role.TECNICO,
    Role.INSPECTOR,
    Role.USER,
  ],
  [Role.SUPERVISOR]: [
    Role.SUPERVISOR,
    Role.TECNICO,
    Role.INSPECTOR,
    Role.USER,
  ],
  [Role.TECNICO]: [Role.TECNICO, Role.USER],
  [Role.INSPECTOR]: [Role.INSPECTOR, Role.USER],
  [Role.MODERATOR]: [Role.MODERATOR, Role.USER],
  [Role.USER]: [Role.USER],
};

export function getUserRole(roles: string[]): UserRole {
  if (roles.includes(Role.ADMIN) || roles.includes("administrator")) {
    return Role.ADMIN;
  }
  if (roles.includes(Role.SUPERVISOR) || roles.includes("manager")) {
    return Role.SUPERVISOR;
  }
  if (roles.includes(Role.TECNICO) || roles.includes("technician")) {
    return Role.TECNICO;
  }
  if (roles.includes(Role.USER) || roles.includes("readonly")) {
    return Role.USER;
  }

  if (
    roles.includes(Role.TECNICO) ||
    roles.includes(Role.TECNICO) ||
    roles.includes("inspector")
  ) {
    return Role.TECNICO;
  }
  if (
    roles.includes(Role.SUPERINTENDENTE) ||
    roles.includes("superintendent")
  ) {
    return Role.SUPERINTENDENTE;
  }
  return Role.USER; // rol por defecto
}

export function hasPermission(
  userRole: UserRole,
  requiredRoles: UserRole[],
): boolean {
  if (requiredRoles.length === 0) return true;

  const userRolesList = ROLE_HIERARCHY[userRole] || [];
  return requiredRoles.some((role) => userRolesList.includes(role));
}

export function getRoutePermission(
  pathname: string,
): RoutePermission | undefined {
  // Buscar coincidencia exacta primero
  const exactMatch = ROUTE_PERMISSIONS.find((route) => route.path === pathname);
  if (exactMatch) return exactMatch;

  // Buscar coincidencia por prefijo (más específica primero)
  const prefixMatches = ROUTE_PERMISSIONS.filter(
    (route) => pathname.startsWith(route.path) && route.path !== "/dashboard",
  ).sort((a, b) => b.path.length - a.path.length);

  return prefixMatches[0];
}
