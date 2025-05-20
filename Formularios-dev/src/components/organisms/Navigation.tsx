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
  {
    segment: "inspeccion-sistemas-emergencia",
    title: "Formularios de Inspección de Seguridad",
    icon: "description",
    children: [
      {
        segment: "formulario-insp-herr-equi",
        title: "Formularios de Inspeccion de herramientas y equipos",
        icon: "description",
        children: [
          {
            segment: "form-sistemas-de-emergencia",
            title: "Formularios Sistemas de emergencia",
            icon: "description",
          },
          {
            segment: "inspeccion-arnes",
            title: "Formulario de Chequeo de Arnés y Conectores",
            icon: "description",
          },
        ],
      },
      {
        segment: "formularios-IRO-ISOP",
        title: "Formularios IRO's - ISOP",
        icon: "description",
        children: [
          {
            segment: "aislamiento",
            title: "Aislamiento(|)",
            icon: "description",
          },
          {
            segment: "izaje",
            title: "Izaje(|)",
            icon: "description",
          },
          {
            segment: "sustancias",
            title: "Sustancias Peligrosas(|)",
            icon: "description",
          },
          {
            segment: "talFreBan",
            title: "Taludes, Frentes de Carguio, Banquinas(|)",
            icon: "description",
          },
          {
            segment: "actos",
            title: "Trabajo Eléctrico - Actos(|)",
            icon: "description",
          },
          {
            segment: "condiciones",
            title: "Trabajo Eléctrico - Condiciones(|)",
            icon: "description",
          },
          {
            segment: "altura",
            title: "Trabajo en Altura(|)",
            icon: "description",
          },
          {
            segment: "confinado",
            title: "Trabajo en espacios confinados(|)",
            icon: "description",
          },

          {
            segment: "excavaciones",
            title: "Trabajo en excavaciones(|)",
            icon: "description",
          },

          {
            segment: "caliente",
            title: "Trabajo en caliente(|)",
            icon: "description",
          },

          {
            segment: "isop",
            title: "Inspeccion de Seguridad Operativas(|)",
            icon: "description",
          },
        ],
      },
    ],
  },

  {
    segment: "form-med-amb",
    title: "Formulario de Inspección de Medio Ambiente",
    icon: "description",
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
    children: [
      {
        segment: "sistemas-de-emergencia",
        title: "Sistemas de emergencia",
        icon: "description",
      },
      {
        segment: "report-iro-isop",
        title: "IRO's-ISOP",
        icon: "description",
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
