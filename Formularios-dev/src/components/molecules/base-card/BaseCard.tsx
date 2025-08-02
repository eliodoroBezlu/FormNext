"use client"

import type React from "react"
import { Card } from "../../atoms/card/Card"
import { Button } from "../../atoms/button/Button"
import { Box } from "@mui/material"

export interface BaseCardAction {
  label: string
  icon: React.ReactNode
  onClick: () => void
  variant?: 'contained' | 'outlined'
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
  size?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
}

export interface BaseCardProps {
  title: string
  subtitle?: string
  children?: React.ReactNode // Para contenido personalizado
  actions: BaseCardAction[]
}

export const BaseCard: React.FC<BaseCardProps> = ({ 
  title, 
  subtitle, 
  children, 
  actions 
}) => {
  const renderActions = () => {
    if (actions.length === 1) {
      const action = actions[0]
      return (
        <Button
          variant={action.variant || 'contained'}
          color={action.color}
          size={action.size}
          fullWidth={action.fullWidth}
          startIcon={action.icon}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )
    }

    return (
      <Box display="flex" gap={1}>
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'outlined'}
            color={action.color}
            size={action.size || 'small'}
            startIcon={action.icon}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        ))}
      </Box>
    )
  }

  return (
    <Card title={title} subtitle={subtitle}>
      {children && <Box mb={2}>{children}</Box>}
      {renderActions()}
    </Card>
  )
}