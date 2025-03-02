import type React from "react"
import type { SvgIconProps } from "@mui/material"
import DashboardIcon from "@mui/icons-material/Dashboard"
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"
import BarChartIcon from "@mui/icons-material/BarChart"
import DescriptionIcon from "@mui/icons-material/Description"
import LayersIcon from "@mui/icons-material/Layers"

type IconName = "dashboard" | "shoppingCart" | "barChart" | "description" | "layers"

interface IconProps extends SvgIconProps {
  name: IconName
}

const iconMap: Record<IconName, React.ElementType> = {
  dashboard: DashboardIcon,
  shoppingCart: ShoppingCartIcon,
  barChart: BarChartIcon,
  description: DescriptionIcon,
  layers: LayersIcon,
}

export function Icon({ name, ...props }: IconProps) {
  const IconComponent = iconMap[name]
  return <IconComponent {...props} />
}
