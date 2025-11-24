import React, { useState } from "react";
import { List, Divider, ListSubheader, Collapse, Box } from "@mui/material";
import { NavigationItem } from "../molecules/navigation-item/NavigationItem";
import { usePathname, useRouter } from "next/navigation";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { IconName } from "../atoms/Icon";

type NavigationItemBase = {
  kind?: "header" | "divider";
  title?: string;
  segment?: string;
  icon?: IconName;
  children?: NavigationItem[];
};

export type NavigationItem =
  | { kind: "header"; title: string }
  | { kind: "divider" }
  | (NavigationItemBase & {
      segment: string;
      title: string;
      icon: IconName;
      children?: NavigationItem[];
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
  // {
  //   segment: "config",
  //   title: "Configuración",
  //   icon: "settings",
  //   //requiredRoles: ['admin'],
  // },
  {
    segment: "formularios-de-inspeccion",
    title: "Formularios de Inspección de Seguridad",
    icon: "description",
    //requiredRoles: ['supervisor'],
    
  },

  {
    segment: "form-herra-equipos",
    title: "Formulario de Inspección de herramientas y equipos",
    icon: "description",
    //requiredRoles: ['admin'],
  },

  {
    segment: "plan-accion",
    title: "Planes de accion",
    icon: "settings",
    //requiredRoles: ['admin'],
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
    //requiredRoles: ['admin'],
    children: [
      {
        segment: "sistemas-de-emergencia",
        title: "Sistemas de emergencia",
        icon: "description",
        //requiredRoles: ['admin'],
      },
      {
        segment: "report-iro-isop",
        title: "IRO's-ISOP",
        icon: "description",
        //requiredRoles: ['admin'],
      },
      {
        segment: "report-herra-equipos",
        title: "Herramientas Equipos",
        icon: "description",
        //requiredRoles: ['admin'],
      },
    ],
  },
];
export function Navigation({ onNavigate }: { onNavigate: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState<{ [key: string]: boolean }>({});

  const handleClick = (segment: string) => {
    setOpen((prevOpen) => ({ ...prevOpen, [segment]: !prevOpen[segment] }));
  };

  const resetOpenMenus = () => {
    setOpen({});
  };

  const renderNavItems = (
    items: NavigationItem[],
    parentSegment = "",
    level = 0
  ) => {
    return items.map((item, index) => {
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
      const hasChildren = item.children && item.children.length > 0;

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
                {renderNavItems(item.children!, fullSegment, level + 1)}
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