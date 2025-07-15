import React, { useState } from "react";
import { List, Divider, ListSubheader, Collapse, Box } from "@mui/material";
import { NavigationItem } from "../molecules/navigation-item/NavigationItem";
import { usePathname, useRouter } from "next/navigation";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { IconName } from "../atoms/Icon";
import {  useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/lib/routePermissions";

type NavigationItemBase = {
  kind?: "header" | "divider";
  title?: string;
  segment?: string;
  icon?: IconName;
  children?: NavigationItem[];
  requiredRoles?: UserRole[]; // Nuevos campos para control de acceso
  excludeRoles?: UserRole[];
};

export type NavigationItem =
  | { kind: "header"; title: string }
  | { kind: "divider" }
  | (NavigationItemBase & {
      segment: string;
      title: string;
      icon: IconName;
      children?: NavigationItem[];
      requiredRoles?: UserRole[];
      excludeRoles?: UserRole[]; 
    });

export const NAVIGATION: NavigationItem[] = [
  {
    kind: "header",
    title: "Mantenimiento Planta",
  },
  {
    segment: "",
    title: "Dashboard",
    icon: "dashboard",
  },
  {
    segment: "config",
    title: "Configuración",
    icon: "settings",
    requiredRoles: ['admin'],
  },
  {
    segment: "inspeccion-sistemas-emergencia",
    title: "Formularios de Inspección de Seguridad",
    icon: "description",
    requiredRoles: ['supervisor'],
    children: [
      {
        segment: "formulario-insp-herr-equi",
        title: "Formularios de Inspeccion de herramientas y equipos",
        icon: "description",
        requiredRoles: ['supervisor'],
        children: [
          {
            segment: "form-sistemas-de-emergencia",
            title: "Formularios Sistemas de emergencia",
            icon: "description",
            requiredRoles: ['supervisor'],
          },
          {
            segment: "inspeccion-arnes",
            title: "Formulario de Chequeo de Arnés y Conectores",
            icon: "description",
            requiredRoles: ['supervisor'],
          },
        ],
      },
      {
        segment: "formularios-IRO-ISOP",
        title: "Formularios IRO's - ISOP",
        icon: "description",
        requiredRoles: ['tecnico'],
        children: [
          {
            segment: "aislamiento",
            title: "Aislamiento(|)",
            icon: "description",
            requiredRoles: ['tecnico'],
          },
          {
            segment: "izaje",
            title: "Izaje(|)",
            icon: "description",
            requiredRoles: ['tecnico'],
          },
          {
            segment: "sustancias",
            title: "Sustancias Peligrosas(|)",
            icon: "description",
            requiredRoles: ['tecnico'],
          },
          {
            segment: "talFreBan",
            title: "Taludes, Frentes de Carguio, Banquinas(|)",
            icon: "description",
            requiredRoles: ['tecnico'],
          },
          {
            segment: "actos",
            title: "Trabajo Eléctrico - Actos(|)",
            icon: "description",
            requiredRoles: ['tecnico'],
          },
          {
            segment: "condiciones",
            title: "Trabajo Eléctrico - Condiciones(|)",
            icon: "description",
            requiredRoles: ['tecnico'],
          },
          {
            segment: "altura",
            title: "Trabajo en Altura(|)",
            icon: "description",
            requiredRoles: ['tecnico'],
          },
          {
            segment: "confinado",
            title: "Trabajo en espacios confinados(|)",
            icon: "description",
            requiredRoles: ['tecnico'],
          },

          {
            segment: "excavaciones",
            title: "Trabajo en excavaciones(|)",
            icon: "description",
            requiredRoles: ['tecnico'],
          },

          {
            segment: "caliente",
            title: "Trabajo en caliente(|)",
            icon: "description",
            requiredRoles: ['tecnico'],
          },

          {
            segment: "isop",
            title: "Inspeccion de Seguridad Operativas(|)",
            icon: "description",
            requiredRoles: ['tecnico'],
          },
        ],
      },
    ],
  },

  {
    segment: "form-med-amb",
    title: "Formulario de Inspección de Medio Ambiente",
    icon: "description",
    requiredRoles: ['admin'],
  },
  {
    kind: "divider",
  },
  {
    kind: "header",
    title: "Analytics",
  },
  {
    segment: "reports",
    title: "Reports",
    icon: "barChart",
    requiredRoles: ['admin'],
    children: [
      {
        segment: "sistemas-de-emergencia",
        title: "Sistemas de emergencia",
        icon: "description",
        requiredRoles: ['admin'],
      },
      {
        segment: "report-iro-isop",
        title: "IRO's-ISOP",
        icon: "description",
        requiredRoles: ['admin'],
      },
    ],
  },
];

export function Navigation({ onNavigate }: { onNavigate: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState<{ [key: string]: boolean }>({});
  const { hasAnyRole, userRole } = useUserRole();

  const handleClick = (segment: string) => {
    setOpen((prevOpen) => ({ ...prevOpen, [segment]: !prevOpen[segment] }));
  };

  const resetOpenMenus = () => {
    setOpen({});
  };

  // Función para verificar si el usuario puede ver un elemento
  const canViewItem = (item: NavigationItem): boolean => {
    if (item.kind === "header" || item.kind === "divider") return true;
    
    // Si no hay roles requeridos, todos pueden ver
    if (!item.requiredRoles || item.requiredRoles.length === 0) return true;
    
    // Si hay roles excluidos, verificar que no esté en ellos
    if (item.excludeRoles && userRole && item.excludeRoles.includes(userRole)) {
      return false;
    }
    
    // Verificar si tiene alguno de los roles requeridos
    return hasAnyRole(item.requiredRoles);
  };

  const renderNavItems = (
    items: NavigationItem[],
    parentSegment = "",
    level = 0
  ) => {
    return items
      .filter(canViewItem) // Filtrar elementos según roles
      .map((item, index) => {
        if (item.kind === "header") {
          return <ListSubheader key={index}>{item.title}</ListSubheader>;
        }
        if (item.kind === "divider") {
          return <Divider key={index} />;
        }

        const fullSegment = parentSegment
          ? `${parentSegment}/${item.segment}`
          : item.segment;
        const fullPath = `/dashboard/${fullSegment}`;
        
        // Filtrar children según roles
        const visibleChildren = item.children?.filter(canViewItem) || [];
        const hasChildren = visibleChildren.length > 0;

        return (
          <React.Fragment key={index}>
            <NavigationItem
              title={item.title}
              icon={item.icon}
              selected={pathname === fullPath}
              onClick={() => {
                if (hasChildren) {
                  handleClick(fullSegment);
                } else {
                  router.push(fullPath);
                  resetOpenMenus();
                  onNavigate();
                }
              }}
            >
              {hasChildren &&
                (open[fullSegment] ? <ExpandLess /> : <ExpandMore />)}
            </NavigationItem>
            {hasChildren && (
              <Collapse in={open[fullSegment]} timeout="auto" unmountOnExit>
                <List
                  component="div"
                  disablePadding
                  sx={{ paddingLeft: level > 0 ? 2 : 3 }}
                >
                  {renderNavItems(visibleChildren, fullSegment, level + 1)}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        );
      });
  };

  return (
    <Box className="navigation-container">
      <List>{renderNavItems(NAVIGATION)}</List>
    </Box>
  );
}

