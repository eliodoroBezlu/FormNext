export type UserRole = 'admin' | 'supervisor' | 'tecnico' | 'viewer';

export interface RoutePermission {
  path: string;
  requiredRoles: UserRole[];
  excludeRoles?: UserRole[];
}

export const ROUTE_PERMISSIONS: RoutePermission[] = [
  // Rutas públicas del dashboard
  { path: '/dashboard', requiredRoles: [] },
  
  // Formularios de inspección de seguridad - solo supervisor
  { path: '/dashboard/inspeccion-sistemas-emergencia', requiredRoles: ['supervisor'] },
  { path: '/dashboard/inspeccion-sistemas-emergencia/formulario-insp-herr-equi', requiredRoles: ['supervisor'] },
  { path: '/dashboard/inspeccion-sistemas-emergencia/formulario-insp-herr-equi/form-sistemas-de-emergencia', requiredRoles: ['supervisor'] },
  { path: '/dashboard/inspeccion-sistemas-emergencia/formulario-insp-herr-equi/inspeccion-arnes', requiredRoles: ['supervisor'] },
  
  // Formularios IRO-ISOP - técnicos
  { path: '/dashboard/inspeccion-sistemas-emergencia/formularios-IRO-ISOP', requiredRoles: ['tecnico'] },
  { path: '/dashboard/inspeccion-sistemas-emergencia/formularios-IRO-ISOP/aislamiento', requiredRoles: ['tecnico'] },
  { path: '/dashboard/inspeccion-sistemas-emergencia/formularios-IRO-ISOP/izaje', requiredRoles: ['tecnico'] },
  { path: '/dashboard/inspeccion-sistemas-emergencia/formularios-IRO-ISOP/sustancias', requiredRoles: ['tecnico'] },
  { path: '/dashboard/inspeccion-sistemas-emergencia/formularios-IRO-ISOP/talFreBan', requiredRoles: ['tecnico'] },
  { path: '/dashboard/inspeccion-sistemas-emergencia/formularios-IRO-ISOP/actos', requiredRoles: ['tecnico'] },
  { path: '/dashboard/inspeccion-sistemas-emergencia/formularios-IRO-ISOP/condiciones', requiredRoles: ['tecnico'] },
  { path: '/dashboard/inspeccion-sistemas-emergencia/formularios-IRO-ISOP/altura', requiredRoles: ['tecnico'] },
  { path: '/dashboard/inspeccion-sistemas-emergencia/formularios-IRO-ISOP/confinado', requiredRoles: ['tecnico'] },
  { path: '/dashboard/inspeccion-sistemas-emergencia/formularios-IRO-ISOP/excavaciones', requiredRoles: ['tecnico'] },
  { path: '/dashboard/inspeccion-sistemas-emergencia/formularios-IRO-ISOP/caliente', requiredRoles: ['tecnico'] },
  { path: '/dashboard/inspeccion-sistemas-emergencia/formularios-IRO-ISOP/isop', requiredRoles: ['tecnico'] },
  
  // Formularios de medio ambiente - solo admin
  { path: '/dashboard/form-med-amb', requiredRoles: ['admin'] },
  
  // Reportes - admin
  { path: '/dashboard/reports', requiredRoles: ['admin'] },
  { path: '/dashboard/reports/sistemas-de-emergencia', requiredRoles: ['admin'] },
  { path: '/dashboard/reports/report-iro-isop', requiredRoles: ['admin'] },
];

export const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  admin: ['admin', 'supervisor', 'tecnico', 'viewer'],
  supervisor: ['supervisor', 'tecnico', 'viewer'],
  tecnico: ['tecnico', 'viewer'],
  viewer: ['viewer']
};

export function getUserRole(roles: string[]): UserRole {
  if (roles.includes('admin') || roles.includes('administrator')) {
    return 'admin';
  }
  if (roles.includes('supervisor') || roles.includes('manager')) {
    return 'supervisor';
  }
  if (roles.includes('tecnico') || roles.includes('technician')) {
    return 'tecnico';
  }
  if (roles.includes('viewer') || roles.includes('readonly')) {
    return 'viewer';
  }
  return 'viewer'; // rol por defecto
}

export function hasPermission(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  if (requiredRoles.length === 0) return true;
  
  const userRolesList = ROLE_HIERARCHY[userRole] || [];
  return requiredRoles.some(role => userRolesList.includes(role));
}

export function getRoutePermission(pathname: string): RoutePermission | undefined {
  // Buscar coincidencia exacta primero
  const exactMatch = ROUTE_PERMISSIONS.find(route => route.path === pathname);
  if (exactMatch) return exactMatch;
  
  // Buscar coincidencia por prefijo (más específica primero)
  const prefixMatches = ROUTE_PERMISSIONS
    .filter(route => pathname.startsWith(route.path) && route.path !== '/dashboard')
    .sort((a, b) => b.path.length - a.path.length);
  
  return prefixMatches[0];
}