import type {
  ControlSemestral,
  SemestreInfo,
  EstadoSemestre,
  TemplateInstance,
  TemplateItem,
} from "../types/IControlSemestral";

/**
 * Analiza las instancias de un semestre y determina su estado.
 * Filtra instancias completadas (excluye borrador y cancelado),
 * luego clasifica por fecha límite del semestre.
 */
function analizarSemestres(
  instancias: TemplateInstance[],
  año: number
): { primerSemestre: SemestreInfo; segundoSemestre: SemestreInfo } {
  const fechaLimitePrimerSemestre = new Date(año, 5, 30);
  const fechaLimiteSegundoSemestre = new Date(año, 11, 31);
  const hoy = new Date();

  // Fixed: removed duplicate 'completado' check from original code
  const instanciasCompletadas = instancias.filter(
    (inst: TemplateInstance) =>
      inst.status === "completado" ||
      inst.status === "aprobado" ||
      inst.status === "revisado" ||
      (inst.status !== "borrador" && inst.status !== "cancelado")
  );

  instanciasCompletadas.sort(
    (a: TemplateInstance, b: TemplateInstance) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const instanciasPrimerSemestre = instanciasCompletadas.filter(
    (inst: TemplateInstance) => {
      const fechaInstancia = new Date(inst.createdAt);
      return fechaInstancia <= fechaLimitePrimerSemestre;
    }
  );

  const instanciasSegundoSemestre = instanciasCompletadas.filter(
    (inst: TemplateInstance) => {
      const fechaInstancia = new Date(inst.createdAt);
      return (
        fechaInstancia > fechaLimitePrimerSemestre &&
        fechaInstancia <= fechaLimiteSegundoSemestre
      );
    }
  );

  let primerSemestre: SemestreInfo = {
    llenado: false,
    fechaLlenado: undefined,
    formularioId: undefined,
    estado: "PENDIENTE" as EstadoSemestre,
    porcentaje: 0,
  };

  if (instanciasPrimerSemestre.length > 0) {
    const ultimaInstancia = instanciasPrimerSemestre[0];
    const fechaInstancia = new Date(ultimaInstancia.createdAt);

    primerSemestre = {
      llenado: true,
      fechaLlenado: ultimaInstancia.createdAt,
      formularioId: ultimaInstancia._id,
      estado:
        fechaInstancia <= fechaLimitePrimerSemestre
          ? "CUMPLIDO"
          : "FUERA_PLAZO",
      porcentaje: ultimaInstancia.overallCompliancePercentage || 0,
    };
  } else if (hoy > fechaLimitePrimerSemestre) {
    primerSemestre.estado = "CRITICO";
  }

  let segundoSemestre: SemestreInfo = {
    llenado: false,
    fechaLlenado: undefined,
    formularioId: undefined,
    estado: "PENDIENTE" as EstadoSemestre,
    porcentaje: 0,
  };

  if (instanciasSegundoSemestre.length > 0) {
    const ultimaInstancia = instanciasSegundoSemestre[0];
    const fechaInstancia = new Date(ultimaInstancia.createdAt);

    segundoSemestre = {
      llenado: true,
      fechaLlenado: ultimaInstancia.createdAt,
      formularioId: ultimaInstancia._id,
      estado:
        fechaInstancia <= fechaLimiteSegundoSemestre
          ? "CUMPLIDO"
          : "FUERA_PLAZO",
      porcentaje: ultimaInstancia.overallCompliancePercentage || 0,
    };
  } else if (hoy > fechaLimiteSegundoSemestre) {
    segundoSemestre.estado = "CRITICO";
  }

  return { primerSemestre, segundoSemestre };
}

/**
 * Procesa los templates y sus instancias para generar los datos
 * de control semestral. Para cada template, filtra instancias del
 * año seleccionado y analiza ambos semestres.
 */
export function procesarDatosControl(
  templates: TemplateItem[],
  instances: TemplateInstance[],
  año: number
): ControlSemestral[] {
  const controlData: ControlSemestral[] = [];

  for (const template of templates) {
    const instanciasTemplate = instances.filter(
      (instancia: TemplateInstance) => {
        if (!instancia.templateId) {
          return false;
        }

        const templateId =
          typeof instancia.templateId === "object"
            ? instancia.templateId._id
            : instancia.templateId;
        const templateIdStr = templateId.toString();
        const currentTemplateIdStr = template._id.toString();

        if (templateIdStr !== currentTemplateIdStr) {
          return false;
        }

        const fechaInstancia = new Date(instancia.createdAt);
        const añoInstancia = fechaInstancia.getFullYear();

        return añoInstancia === año;
      }
    );

    const instanciasOrdenadas = [...instanciasTemplate].sort(
      (a: TemplateInstance, b: TemplateInstance) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const { primerSemestre, segundoSemestre } = analizarSemestres(
      instanciasTemplate,
      año
    );

    const ultimaInstancia =
      instanciasOrdenadas.length > 0 ? instanciasOrdenadas[0] : undefined;

    controlData.push({
      formularioId: template._id,
      nombreFormulario: template.name,
      año,
      primerSemestre,
      segundoSemestre,
      alerta:
        primerSemestre.estado === "CRITICO" ||
        segundoSemestre.estado === "CRITICO",
      instancias: instanciasTemplate,
      totalInstancias: instanciasTemplate.length,
      ultimaInstancia,
    });
  }

  return controlData;
}
