import {
  getTemplateHerraEquipoById,
  getTemplatesHerraEquipos,
  type TemplateHerraEquipo,
} from "@/lib/actions/template-herra-equipos";

/**
 * La plantilla **con la que se hizo** una inspección.
 *
 * Con el versionado, un mismo código puede tener varias revisiones: la
 * vigente y las obsoletas. Una inspección vieja se tiene que ver con su
 * revisión, no con la vigente —las respuestas de herramientas se guardan por
 * posición (`section_0.q2`) y con otra revisión quedarían al lado de otras
 * preguntas—. Por eso se carga por `templateId`, que la inspección guarda
 * desde siempre.
 *
 * Buscar por código queda solo como respaldo para una inspección sin
 * `templateId`, que no debería existir.
 */
export async function plantillaDeInspeccion(inspeccion: {
  templateId?: string | { _id: string } | null;
  templateCode?: string;
}): Promise<TemplateHerraEquipo> {
  const id =
    inspeccion.templateId && typeof inspeccion.templateId === "object"
      ? inspeccion.templateId._id
      : inspeccion.templateId;

  if (id) {
    const resultado = await getTemplateHerraEquipoById(id);
    if (!resultado.success) throw new Error(resultado.error || "No se pudo cargar la plantilla de la inspección");
    return resultado.data;
  }

  const lista = await getTemplatesHerraEquipos();
  if (!lista.success) throw new Error(lista.error || "Error al cargar templates");
  const porCodigo = lista.data.find((t) => t.code === inspeccion.templateCode);
  if (!porCodigo) throw new Error(`Template con código ${inspeccion.templateCode} no encontrado`);
  return porCodigo;
}
