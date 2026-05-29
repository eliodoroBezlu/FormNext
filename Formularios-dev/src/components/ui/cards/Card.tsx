import type React from "react"
import {
  Card as MuiCard,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  type CardProps as MuiCardProps,
} from "@mui/material"

export interface CardProps extends MuiCardProps {
  title?: string 
  subtitle?: string
  actions?: React.ReactNode
}

export const Card: React.FC<CardProps> = ({ title, subtitle, actions, children, ...props }) => {
  return (
    <MuiCard {...props}>
      {(title || subtitle) && (
        <CardHeader title={title && <Typography variant="h6">{title}</Typography>} subheader={subtitle} />
      )}
      <CardContent>{children}</CardContent>
      {actions && <CardActions>{actions}</CardActions>}
    </MuiCard>
  )
}
