import { Section } from "../types/IProps";

/**
 * Filtra recursivamente las secciones según las selecciones
 */
export const filterSectionsBySelections = (
  sections: Section[],
  selectedItems: Record<string, string[]>,
  currentPath: string = ""
): Section[] => {
  return sections.map((section) => {
    const sectionPath = currentPath ? `${currentPath}.${section.title}` : section.title;
    
    // Verificar si esta sección tiene items seleccionados
    const selectedSubitems = selectedItems[sectionPath];
    
    if (!selectedSubitems || selectedSubitems.length === 0) {
      // Si no hay selección, mostrar la sección completa
      return section;
    }
    
    // Filtrar subsecciones según lo seleccionado
    if (section.subsections && section.subsections.length > 0) {
      const filteredSubsections = section.subsections
        .filter(sub => selectedSubitems.includes(sub.title))
        .map(sub => {
          // Recursión: filtrar subsecciones de subsecciones
          return {
            ...sub,
            subsections: sub.subsections 
              ? filterSectionsBySelections([sub], selectedItems, sectionPath)[0]?.subsections 
              : sub.subsections
          };
        });
      
      return {
        ...section,
        subsections: filteredSubsections
      };
    }
    
    return section;
  });
};

/**
 * Verifica si hay algún item seleccionado
 */
export const hasAnySelection = (
  selectedItems: Record<string, string[]>
): boolean => {
  return Object.values(selectedItems).some(items => items.length > 0);
};

/**
 * Valida que todos los selectores requeridos tengan al menos una selección
 */
export const validateRequiredSelections = (
  selectedItems: Record<string, string[]>,
  configs: Array<{ sectionTitle: string; required?: boolean }>
): { valid: boolean; missing: string[] } => {
  const missing: string[] = [];
  
  for (const config of configs) {
    if (config.required) {
      const selected = selectedItems[config.sectionTitle] || [];
      if (selected.length === 0) {
        missing.push(config.sectionTitle);
      }
    }
  }
  
  return {
    valid: missing.length === 0,
    missing
  };
};