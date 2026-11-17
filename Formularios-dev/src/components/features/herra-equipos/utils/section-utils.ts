import type { Section } from "../types/IProps";

/**
 * Filtra recursivamente las secciones según las selecciones
 */
export const filterSectionsBySelections = (
  sections: Section[],
  selectedItems: Record<string, string[]>,
  currentPath: string = ""
): Section[] => {
  let activeSections = sections;
  
  // Si estamos en la raíz y hay selecciones para "ROOT", filtrar las secciones raíz
  if (currentPath === "") {
    const rootSelections = selectedItems["ROOT"];
    if (rootSelections && rootSelections.length > 0) {
      activeSections = sections.filter(sec => rootSelections.includes(sec.title));
    }
  }

  return activeSections.map((section) => {
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
 * Las secciones que se muestran al revisar una inspección, cada una con su
 * posición en la plantilla (`responses.section_N`).
 *
 * Las subsecciones no conservan su posición: el formulario guarda las respuestas
 * del primer tipo elegido en `sub0`, del segundo en `sub1`, y así (numera solo
 * las visibles). Por eso hay que filtrarlas igual que el formulario antes de
 * leerlas: recorrer la plantilla completa le atribuía las respuestas de la
 * escalera telescópica a la escalera simple.
 */
export const seccionesParaRevisar = (
  sections: Section[],
  selectedItems: Record<string, string[]> | undefined,
  conSelector: boolean,
): { section: Section; indice: number }[] => {
  const visibles = conSelector
    ? filterSectionsBySelections(sections, selectedItems ?? {})
    : sections;
  return visibles.map((section) => ({
    section,
    indice: sections.findIndex(
      (s) => (!!section._id && s._id === section._id) || s.title === section.title,
    ),
  }));
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