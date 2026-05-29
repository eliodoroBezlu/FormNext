// src/components/organisms/inspection-form-iro-isop/domain/models/IroIsopDomain.ts

import type { Section, SectionResponse, QuestionResponse } from "@/types/formTypes";
import { valoracionCriterio } from "@/lib/constants";

export type ValoracionValue = "0" | "1" | "2" | "3" | "N/A" | "";

/**
 * Aplana las secciones jerárquicas recursivas de acordeones a un array plano.
 */
export const flattenSections = (sections: Section[]): Section[] => {
  const flattened: Section[] = [];
  const flatten = (section: Section) => {
    if (!section.isParent) {
      flattened.push(section);
    }
    if (section.subsections && section.subsections.length > 0) {
      section.subsections.forEach(flatten);
    }
  };
  sections.forEach(flatten);
  return flattened;
};

/**
 * Inicializa la estructura vacía de respuestas de secciones (SectionResponse[]) basada en la plantilla.
 */
export const createInitialSections = (sections: Section[]): SectionResponse[] => {
  const flatSections = flattenSections(sections);
  return flatSections.map((section) => {
    if (!section._id) {
      throw new Error(
        `La sección "${section.title}" no tiene _id. No se puede inicializar.`
      );
    }
    return {
      sectionId: section._id,
      maxPoints: section.maxPoints,
      questions: section.questions.map((question) => ({
        questionText: question.text,
        response: "" as ValoracionValue,
        points: 0,
        comment: "",
      })),
      obtainedPoints: 0,
      applicablePoints: section.maxPoints,
      naCount: 0,
      compliancePercentage: 0,
      sectionComment: "",
    };
  });
};

/**
 * Retorna las reglas de valoración y criterios de acuerdo con el código del documento.
 */
export const getValoracionMessage = (code: string) => {
  const normalizedCode = code?.toUpperCase() || "";

  if (normalizedCode.includes("1.02.P06.F12")) {
    return {
      title: "VALORACIÓN & CRITERIO",
      showConformacion: true,
      items: [
        {
          valoracion: "0",
          criterio:
            "El ítem NO cumple o cumple menos del 50% de las veces (el ítem tiene más de dos desviaciones)",
          isopMSC: "Supervisor del área inspeccionada.",
          isopEECC: "Supervisor de contrato",
        },
        {
          valoracion: "1",
          criterio:
            "El ítem cumple entre el 51% al 70% de las veces (el ítem tiene dos desviaciones)",
          isopMSC: "Trabajadores del área por lo menos 1.",
          isopEECC: "Responsable de la EECC",
        },
        {
          valoracion: "2",
          criterio:
            "El ítem cumple entre el 71% al 90% de las veces (el ítem tiene máximo una desviación)",
          isopMSC: "Personal de áreas invitadas por lo menos 1",
          isopEECC: "Trabajadores de la EECC por lo menos 1.",
        },
        {
          valoracion: "3",
          criterio:
            "El ítem cumple a cabalidad más del 91% (el ítem no tiene desviaciones)",
          isopMSC: "Comité Mixto por lo menos 1",
          isopEECC: "Personal de MSC invitadas por lo menos 1",
        },
        {
          valoracion: "N/A",
          criterio: "El ítem no es aplicable",
          isopMSC: "",
          isopEECC: "Comité Mixto por lo menos 1 o coordinador",
        },
      ],
      nota: "El ítem en color rojo es obligatorio; si se coloca N/A, se debe justificar en los comentarios el motivo por el cual NO APLICA",
    };
  }

  return {
    title: "VALORACIÓN Y CRITERIO",
    showConformacion: false,
    items: valoracionCriterio.map(item => ({
      valoracion: item.valoracion,
      criterio: item.criterio,
      isopMSC: "",
      isopEECC: ""
    })),
    nota: null,
  };
};

/**
 * Calcula las métricas específicas de una sola sección.
 */
export const calculateSectionMetrics = (questions: QuestionResponse[], maxPoints: number) => {
  const pointsPerQuestion =
    questions.length > 0 ? maxPoints / questions.length : 0;
  let obtained = 0;
  let naCount = 0;

  questions.forEach((q) => {
    if (q.response === "N/A") {
      naCount++;
    } else if (q.response !== "") {
      const points = Number(q.response);
      if (!isNaN(points)) obtained += points;
    }
  });

  const applicable = maxPoints - naCount * pointsPerQuestion;
  const compliance = applicable > 0 ? (obtained / applicable) * 100 : 0;

  return {
    obtained: obtained.toFixed(2),
    applicable: applicable.toFixed(2),
    na: naCount,
    compliance: compliance.toFixed(2),
  };
};

/**
 * Calcula las métricas generales de todo el formulario.
 */
export const calculateOverallMetrics = (sections: SectionResponse[]) => {
  let totalObtained = 0;
  let totalApplicable = 0;
  let totalNA = 0;

  sections.forEach((section) => {
    const totalQuestions = section.questions.length;
    const pointsPerQuestion =
      totalQuestions > 0 ? section.maxPoints / totalQuestions : 0;

    let sectionObtained = 0;
    let sectionNaCount = 0;

    section.questions.forEach((q) => {
      if (q.response === "N/A") {
        sectionNaCount++;
        totalNA++;
      } else if (q.response !== "") {
        const points = Number(q.response);
        if (!isNaN(points)) sectionObtained += points;
      }
    });

    totalObtained += sectionObtained;
    totalApplicable += section.maxPoints - sectionNaCount * pointsPerQuestion;
  });

  const compliance = totalApplicable > 0 ? (totalObtained / totalApplicable) * 100 : 0;

  return {
    totalObtained: totalObtained.toFixed(2),
    totalApplicable: totalApplicable.toFixed(2),
    totalNA,
    compliance: compliance.toFixed(2),
  };
};
