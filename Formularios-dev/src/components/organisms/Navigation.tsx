import React, { useState } from "react";
import { List, Divider, ListSubheader, Collapse, Box } from "@mui/material";
import { NavigationItem } from "../molecules/navigation-item/NavigationItem";
import { usePathname, useRouter } from "next/navigation";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { IconName } from "../atoms/Icon";
import { UserRole } from "@/lib/routePermissions";
import { useUserRole } from "@/hooks/useUserRole";

type NavigationItemBase = {
  kind?: "header" | "divider";
  title?: string;
  segment?: string;
  icon?: IconName;
  children?: NavigationItem[];
  requiredRoles?: UserRole[];
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
    requiredRoles: ["admin"],
  },
  {
    segment: "formularios-de-inspeccion",
    title: "Formularios de Inspección de Seguridad",
    icon: "description",
  },
  {
    segment: "form-herra-equipos",
    title: "Formulario de Inspección de herramientas y equipos",
    icon: "description",
    
  },
  {
    segment: "plan-accion",
    title: "Planes de accion",
    icon: "settings",
    requiredRoles: ["admin", "supervisor", "superintendente"],
  },
  {
    kind: "divider",
  },
  {
    kind: "header",
    title: "Analytics",
  },
  {
    segment: "graphics",
    title: "graficas",
    icon: "barChart",
    requiredRoles: ["admin", "superintendente", "supervisor"],
    children: [
      {
        segment: "emergencyinspections",
        title: "inspecciones de sistemas de emergencia",
        icon: "description",
        requiredRoles: ["admin", "superintendente", "supervisor"],
      },
      {
        segment: "extinguishers",
        title: "Extintores",
        icon: "description",
        requiredRoles: ["admin", "superintendente", "supervisor"],
      },
    ],
  },
  {
    segment: "reports",
    title: "Reports",
    icon: "barChart",
    requiredRoles: ["admin", "superintendente", "supervisor"],
    children: [
      {
        segment: "sistemas-de-emergencia",
        title: "Sistemas de emergencia",
        icon: "description",
        requiredRoles: ["admin", "superintendente", "supervisor"],
      },
      {
        segment: "report-iro-isop",
        title: "IRO's-ISOP",
        icon: "description",
        requiredRoles: ["admin", "superintendente", "supervisor"],
      },
      {
        segment: "report-herra-equipos",
        title: "Herramientas Equipos",
        icon: "description",
        requiredRoles: ["admin", "superintendente", "supervisor"],
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