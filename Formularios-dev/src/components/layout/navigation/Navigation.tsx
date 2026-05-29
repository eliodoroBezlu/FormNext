import React, { useState } from "react";
import { List, Divider, ListSubheader, Collapse, Box } from "@mui/material";
import { NavigationItem, type IconName } from "./NavigationItem";
import { usePathname, useRouter } from "next/navigation";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { Role, UserRole } from "@/lib/routePermissions";
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
    requiredRoles: [Role.ADMIN],
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
    requiredRoles: [Role.ADMIN, Role.SUPERVISOR, Role.SUPERINTENDENTE],
  },
  {
    segment: "pgr",
    title: "PGR",
    icon: "settings",
    requiredRoles: [Role.ADMIN, Role.SUPERINTENDENTE],
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
    requiredRoles: [Role.ADMIN, Role.SUPERINTENDENTE],
    children: [
      {
        segment: "emergencyinspections",
        title: "inspecciones de sistemas de emergencia",
        icon: "description",
        requiredRoles: [Role.ADMIN, Role.SUPERINTENDENTE],
      },
      {
        segment: "extinguishers",
        title: "Extintores",
        icon: "description",
        requiredRoles: [Role.ADMIN, Role.SUPERINTENDENTE],
      },
      {
        segment: "inspectionschedule",
        title: "IRO's ISOP",
        icon: "description",
        requiredRoles: [Role.ADMIN, Role.SUPERINTENDENTE],
      },
      {
        segment: "pgr",
        title: "PGR's",
        icon: "description",
        requiredRoles: [Role.ADMIN, Role.SUPERINTENDENTE],
      },
    ],
  },
  {
    segment: "reports",
    title: "Reports",
    icon: "barChart",
    requiredRoles: [Role.ADMIN, Role.SUPERINTENDENTE, Role.SUPERVISOR],
    children: [
      {
        segment: "sistemas-de-emergencia",
        title: "Sistemas de emergencia",
        icon: "description",
        requiredRoles: [Role.ADMIN, Role.SUPERINTENDENTE, Role.SUPERVISOR],
      },
      {
        segment: "report-iro-isop",
        title: "IRO's-ISOP",
        icon: "description",
        requiredRoles: [Role.ADMIN, Role.SUPERINTENDENTE, Role.SUPERVISOR],
      },
      {
        segment: "report-herra-equipos",
        title: "Herramientas Equipos",
        icon: "description",
        requiredRoles: [Role.ADMIN, Role.SUPERINTENDENTE, Role.SUPERVISOR],
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

  const canViewItem = (item: NavigationItem): boolean => {
    if (item.kind === "header" || item.kind === "divider") return true;

    if (!item.requiredRoles || item.requiredRoles.length === 0) return true;

    if (item.excludeRoles && userRole && item.excludeRoles.includes(userRole)) {
      return false;
    }

    return hasAnyRole(item.requiredRoles);
  };

  const renderNavItems = (
    items: NavigationItem[],
    parentSegment = "",
    level = 0,
  ) => {
    return items
      .filter(canViewItem)
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
