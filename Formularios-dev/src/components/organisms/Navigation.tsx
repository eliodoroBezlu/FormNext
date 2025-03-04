import React, { useState } from "react";
import { List, Divider, ListSubheader, Collapse } from "@mui/material";
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
    title: "Main items",
  },
  {
    segment: "",
    title: "Dashboard",
    icon: "dashboard",
  },
  {
    segment: "orders",
    title: "Orders",
    icon: "shoppingCart",
  },
  {
    segment: "Otro-form",
    title: "otro formulario",
    icon: "description",
  },
  {
    segment: "inspecciones",
    title: "inspecciones",
    icon: "description",
  },
  {
    segment: "inspeccion-sistemas-emergencia",
    title: "Inspeccion sistemas de emergencia",
    icon: "description",
  },
  {
    segment: "inspeccion-arnes",
    title: "Inspección de Arnés",
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
        segment: "sales",
        title: "Sales",
        icon: "description",
      },
      {
        segment: "traffic",
        title: "Traffic",
        icon: "description",
      },
    ],
  },
  {
    segment: "integrations",
    title: "Integrations",
    icon: "layers",
  },
];

export function Navigation({ onNavigate }: { onNavigate: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState<{ [key: string]: boolean }>({});

  const handleClick = (segment: string) => {
    setOpen((prevOpen) => ({ ...prevOpen, [segment]: !prevOpen[segment] }));
  };

  const renderNavItems = (items: NavigationItem[], parentSegment = "", level = 0) => {
    return items.map((item, index) => {
      if (item.kind === "header") {
        return <ListSubheader key={index}>{item.title}</ListSubheader>;
      }
      if (item.kind === "divider") {
        return <Divider key={index} />;
      }

      const fullSegment = parentSegment ? `${parentSegment}/${item.segment}` : item.segment;
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
                onNavigate();
              }
            }}
          >
            {hasChildren && (open[fullSegment] ? <ExpandLess /> : <ExpandMore />)}
          </NavigationItem>
          {hasChildren && (
            <Collapse in={open[fullSegment]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {renderNavItems(item.children!, fullSegment, level + 1)}
              </List>
            </Collapse>
          )}
        </React.Fragment>
      );
    });
  };

  return <List>{renderNavItems(NAVIGATION)}</List>;
}