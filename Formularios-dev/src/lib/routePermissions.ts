export enum Role {
  USER = "user",
  ADMIN = "admin",
  MODERATOR = "moderator",
  SUPER_ADMIN = "super_admin",
  INSPECTOR = "inspector",
  TECNICO = "tecnico",
  SUPERVISOR = "supervisor",
  SUPERINTENDENTE = "superintendente",
  /**
   * Rol de visibilidad acotada: solo ve *Mis Inspecciones*, las plantillas de
   * Herramientas y Equipos asignadas a su rol, y los reportes de esas mismas
   * plantillas. Puede llenar inspecciones, pero no crear la estructura de un
   * formulario (eso sigue siendo de admin).
   *
   * ⚠️ Deliberadamente **fuera de `ROLE_HIERARCHY`**: es restrictivo, no
   * jerárquico. Se evalúa con `tieneRolExacto`, nunca con `hasPermission`.
   */
  INSPECTOR_ASIGNADO = "inspector_asignado",
}

export type UserRole = Role;

export interface RoutePermission {
  path: string;
  requiredRoles: UserRole[];
  requiredPermissions?: string[];
  excludeRoles?: UserRole[];
}

/**
 * Reglas de acceso por ruta. Las aplica `proxy.ts` en cada navegación a
 * `/dashboard/**`, así que son la barrera de verdad del frontend (no solo
 * cosmética como `<Can>`, que se limita a ocultar controles).
 *
 * Reglas de resolución, implementadas en `puedeAccederARuta`:
 *   - gana la coincidencia **más específica** (el prefijo más largo)
 *   - `requiredRoles: []` significa abierta a cualquier usuario autenticado
 *   - una ruta sin regla se considera **cerrada** para los roles
 *     restringidos: así, añadir una pantalla nueva no la expone por olvido
 */
export const ROUTE_PERMISSIONS: RoutePermission[] = [
  // Rutas públicas del dashboard
  { path: "/dashboard", requiredRoles: [] },

  // ── Alcance del rol restringido ─────────────────────────────────────
  // Únicas tres zonas que `inspector_asignado` puede ver. El filtrado fino
  // (qué plantillas concretas) lo hace el backend; aquí solo se abre la
  // puerta de la sección.
  {
    path: "/dashboard/mis-inspecciones",
    requiredRoles: [
      Role.ADMIN,
      Role.SUPERVISOR,
      Role.SUPERINTENDENTE,
      Role.TECNICO,
      Role.INSPECTOR,
      Role.INSPECTOR_ASIGNADO,
      Role.USER,
    ],
  },
  {
    path: "/dashboard/form-herra-equipos",
    requiredRoles: [
      Role.ADMIN,
      Role.SUPERVISOR,
      Role.SUPERINTENDENTE,
      Role.TECNICO,
      Role.INSPECTOR,
      Role.INSPECTOR_ASIGNADO,
    ],
  },

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

  // Matriz de riesgos (1.02.P06.F01). El supervisor elabora; aprobar queda
  // reservado al superintendente, y eso lo gatea el backend, no la ruta.
  {
    path: "/dashboard/matriz-riesgos",
    requiredRoles: [Role.ADMIN, Role.SUPERVISOR, Role.SUPERINTENDENTE],
  },

  // Consolidación matriz → PGR. Se lista solo esta ruta del módulo PGR: es la
  // única que escribe programación derivada de las matrices, y el backend pide
  // los mismos roles para el endpoint.
  {
    path: "/dashboard/pgr/consolidacion",
    requiredRoles: [Role.ADMIN, Role.SUPERVISOR, Role.SUPERINTENDENTE],
  },

  // Catálogos del PGR (unidades de recurso, entregables, grupos de
  // responsables). Solo administración: el backend exige ADMIN para escribir,
  // así que ofrecer la pantalla a otros roles sería mostrar botones que fallan.
  {
    path: "/dashboard/pgr/catalogos",
    requiredRoles: [Role.ADMIN],
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
    // El rol restringido sí entra aquí, pero el backend le devuelve
    // únicamente las inspecciones de las plantillas asignadas a su rol.
    path: "/dashboard/reports/report-herra-equipos",
    requiredRoles: [
      Role.ADMIN,
      Role.SUPERVISOR,
      Role.SUPERINTENDENTE,
      Role.INSPECTOR_ASIGNADO,
    ],
  },
];

/**
 * Resuelve si un usuario puede entrar a una ruta.
 *
 * Se queda con la regla de **prefijo más largo** que coincida, para que
 * `/dashboard/reports/report-herra-equipos` gane sobre `/dashboard/reports`.
 *
 * Si la ruta no tiene ninguna regla:
 *   - usuarios normales → se permite (comportamiento histórico)
 *   - roles restringidos → se **deniega**, porque su alcance es una lista
 *     blanca cerrada y una pantalla nueva no debe quedar expuesta por olvido
 */
export function puedeAccederARuta(
  pathname: string,
  rolesDelUsuario: string[],
): boolean {
  const coincidencias = ROUTE_PERMISSIONS.filter(
    (r) => pathname === r.path || pathname.startsWith(`${r.path}/`),
  ).sort((a, b) => b.path.length - a.path.length);

  const regla = coincidencias[0];

  if (!regla) return !esRolRestringido(rolesDelUsuario);
  if (regla.requiredRoles.length === 0) return true;

  // Los roles restringidos se comprueban contra sus roles reales: la
  // jerarquía los absorbería y anularía la restricción.
  if (esRolRestringido(rolesDelUsuario)) {
    return tieneRolExacto(rolesDelUsuario, regla.requiredRoles);
  }

  return hasPermission(getUserRole(rolesDelUsuario), regla.requiredRoles);
}

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

  /**
   * Aislado a propósito: se implica solo a sí mismo.
   *
   * No incluye `USER` —para que no herede lo que ve un usuario genérico— y
   * ningún otro rol lo incluye, así que nadie lo hereda tampoco. Su alcance
   * se decide exclusivamente por lista blanca en `ROUTE_PERMISSIONS` y por
   * el filtrado de plantillas del backend, nunca por jerarquía.
   */
  [Role.INSPECTOR_ASIGNADO]: [Role.INSPECTOR_ASIGNADO],
};

/**
 * Colapsa los roles del usuario a uno solo, del más privilegiado al menos.
 *
 * El orden importa: se evalúa de mayor a menor privilegio y se devuelve el
 * primero que coincida. Antes `USER` se comprobaba antes que
 * `SUPERINTENDENTE`, así que un usuario con ambos roles quedaba degradado a
 * `USER`; y `TECNICO` se comprobaba dos veces.
 *
 * ⚠️ Esta función solo sirve para decidir privilegios "hacia arriba". Para
 * roles restrictivos —que deben ver *menos*, no más— usar `tieneRolExacto`:
 * un rol acotado se pierde aquí, absorbido por la jerarquía.
 */
export function getUserRole(roles: string[]): UserRole {
  if (roles.includes(Role.SUPER_ADMIN)) return Role.SUPER_ADMIN;
  if (roles.includes(Role.ADMIN) || roles.includes("administrator")) {
    return Role.ADMIN;
  }
  if (
    roles.includes(Role.SUPERINTENDENTE) ||
    roles.includes("superintendent")
  ) {
    return Role.SUPERINTENDENTE;
  }
  if (roles.includes(Role.SUPERVISOR) || roles.includes("manager")) {
    return Role.SUPERVISOR;
  }
  if (roles.includes(Role.TECNICO) || roles.includes("technician")) {
    return Role.TECNICO;
  }
  if (roles.includes(Role.INSPECTOR) || roles.includes("inspector")) {
    return Role.INSPECTOR;
  }
  if (roles.includes(Role.MODERATOR)) return Role.MODERATOR;
  return Role.USER; // rol por defecto
}

/**
 * Comprueba los roles **reales** del usuario, sin pasar por `ROLE_HIERARCHY`.
 *
 * `hasPermission` responde «¿su rol implica al requerido?», que sirve para
 * privilegios crecientes pero no sabe expresar restricciones: un rol acotado
 * como `INSPECTOR_ASIGNADO` desaparecería en cuanto el usuario tuviera
 * también `user`. Para decidir *restricciones* hay que mirar el array crudo.
 */
export function tieneRolExacto(
  rolesDelUsuario: string[] | undefined,
  buscados: UserRole | UserRole[],
): boolean {
  if (!rolesDelUsuario?.length) return false;
  const lista = Array.isArray(buscados) ? buscados : [buscados];
  return lista.some((r) => rolesDelUsuario.includes(r));
}

/**
 * Roles con visibilidad acotada: solo ven lo que se les asigna
 * explícitamente. Se evalúan con `tieneRolExacto`, nunca con la jerarquía.
 */
export const ROLES_RESTRINGIDOS: UserRole[] = [Role.INSPECTOR_ASIGNADO];

/**
 * Roles que tiene sentido asignar a una plantilla en el builder.
 *
 * Se omiten admin / superintendente / supervisor a propósito: son
 * `ROLES_VISIBILIDAD_TOTAL` en el backend y ven todas las plantillas pase lo
 * que pase, así que ofrecerlos aquí solo confundiría (parecería que la
 * selección los excluye, y no es así).
 */
export const ROLES_ASIGNABLES_A_PLANTILLA: ReadonlyArray<{
  value: UserRole;
  label: string;
}> = [
  { value: Role.INSPECTOR_ASIGNADO, label: "Inspector asignado" },
  { value: Role.INSPECTOR, label: "Inspector" },
  { value: Role.TECNICO, label: "Técnico" },
  { value: Role.USER, label: "Usuario" },
];

/** `true` si el usuario tiene algún rol de visibilidad acotada. */
export function esRolRestringido(rolesDelUsuario?: string[]): boolean {
  return tieneRolExacto(rolesDelUsuario, ROLES_RESTRINGIDOS);
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
