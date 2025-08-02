"use client"

import type React from "react"
import { Box, Typography, Chip } from "@mui/material"
import { FormTemplate } from "@/types/formTypes"
import { BaseCard, BaseCardAction } from "../base-card/BaseCard"

export interface TemplateCardProps {
  template: FormTemplate
  actions: BaseCardAction[]
  variant?: 'default' | 'inspection'
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ 
  template, 
  actions, 
  variant = 'default' 
}) => {
  const totalQuestions = template.sections.reduce(
    (acc, section) => acc + section.questions.length, 
    0
  )

  const renderTemplateContent = () => {
    if (variant === 'inspection') {
      return (
        <>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {template.sections.length} secciones disponibles
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {totalQuestions} preguntas en total
          </Typography>
          <Box mt={1} display="flex" flexWrap="wrap" gap={0.5}>
            {template.sections.slice(0, 3).map((section) => (
              <Chip 
                key={section._id} 
                label={section.title} 
                size="small" 
                variant="outlined" 
              />
            ))}
            {template.sections.length > 3 && (
              <Chip 
                label={`+${template.sections.length - 3} más`} 
                size="small" 
                variant="outlined" 
              />
            )}
          </Box>
        </>
      )
    }

    return (
      <>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Secciones:</strong> {template.sections.length}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Total Preguntas:</strong> {totalQuestions}
        </Typography>
        <Box mt={1}>
          <Chip 
            label={template.revision} 
            size="small" 
            variant="outlined" 
            sx={{ mr: 1 }} 
          />
          <Chip 
            label={template.type} 
            size="small" 
            color="primary" 
            variant="outlined" 
          />
        </Box>
      </>
    )
  }

  return (
    <BaseCard
      title={template.name}
      subtitle={template.code}
      actions={actions}
    >
      {renderTemplateContent()}
    </BaseCard>
  )
}