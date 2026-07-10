import { EquipoBackend } from "@/lib/actions/equipo-actions";

// Mapea el código de plantilla al/los tipo(s) de equipo del inventario que debe
// ofrecer para autocompletar (ver módulo equipos/ubicacion/clasificacion del backend).
export const TEMPLATE_EQUIPMENT_MAP: Record<string, string[]> = {
  '1.02.P06.F39': ['Amoladora'],
  '1.02.P06.F40': ['Esmeril de banco'],
  '2.03.P10.F05': ['TALADRO', 'Taldro de banco'],
  '1.02.P06.F42': ['EquiposSoldar'],
  '1.02.P06.F33': ['Escalera'],
};

const normalizeLabel = (label: string): string =>
  label.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

export const isEquipmentCodeField = (label: string): boolean => {
  const clean = normalizeLabel(label);
  return (
    clean.includes("CODIGO") ||
    clean.includes("TAG") ||
    clean.includes("PLACA") ||
    clean.includes("NUMERO INTERNO") ||
    clean.includes("N° INTERNO") ||
    clean.includes("NRO INTERNO") ||
    clean.includes("IDENTIFICACION")
  );
};

export const isAreaField = (label: string): boolean => {
  const norm = normalizeLabel(label);
  return (
    norm === "AREA" ||
    norm === "AREA FISICA" ||
    norm === "SECCION" ||
    norm === "AREA/SECCION" ||
    norm === "AREA FISICA DE UBICACION DE LA ESCALERA" ||
    norm.includes("AREA")
  );
};

export const isUbicacionField = (label: string): boolean => {
  const norm = normalizeLabel(label);
  return (
    norm === "UBICACION" ||
    norm === "UBICACION FISICA" ||
    norm === "UBICACION FISICA DEL EQUIPO" ||
    norm.includes("UBICACION")
  );
};

export const isMarcaModeloField = (label: string): boolean => {
  const norm = normalizeLabel(label);
  return norm.includes("MARCA") || norm.includes("MODELO");
};

export const isSuperintendenciaField = (label: string): boolean => {
  const norm = normalizeLabel(label);
  return norm.includes("SUPERINTENDENCIA");
};

// Campos "Tipo de equipo/herramienta" — excluye "TIPO VEHICULO", que pertenece
// a otro dominio (formularios de vehículos) y no debe recibir tipo_equipo.
export const isTipoField = (label: string): boolean => {
  const norm = normalizeLabel(label);
  return norm.includes("TIPO") && norm !== "TIPO VEHICULO";
};

export const getTechnicalSpecValue = (equipo: EquipoBackend | undefined, label: string): string => {
  if (!equipo || !equipo.especificaciones) return "";
  const norm = normalizeLabel(label);

  const specKeys = Object.keys(equipo.especificaciones);
  const matchKey = specKeys.find((k) => {
    const normKey = normalizeLabel(k);
    return normKey === norm || norm.includes(normKey) || normKey.includes(norm);
  });

  return matchKey ? String(equipo.especificaciones[matchKey]) : "";
};

/**
 * Resuelve el valor de autofill para UN campo de verificación dado un equipo
 * seleccionado del inventario. `area`/`code` son los valores ya conocidos por
 * el llamador (seleccionados por el usuario o extraídos del propio equipo).
 * Retorna undefined si no hay ningún valor aplicable para ese campo.
 */
export const resolveAutofillValue = (
  label: string,
  area: string,
  code: string,
  equipo?: EquipoBackend,
): string | undefined => {
  if (isEquipmentCodeField(label)) {
    return code || undefined;
  }
  if (isAreaField(label)) {
    return area || undefined;
  }
  if (isUbicacionField(label)) {
    return equipo?.ubicacion_id?.nombre || undefined;
  }
  if (isMarcaModeloField(label)) {
    const marca = equipo?.marca || "";
    const modelo = equipo?.modelo || "";
    const val = marca && modelo ? `${marca} / ${modelo}` : marca || modelo;
    return val || undefined;
  }
  if (isSuperintendenciaField(label)) {
    return equipo?.area_id?.superintendencia?.nombre || undefined;
  }
  if (isTipoField(label)) {
    return equipo?.tipo_equipo || undefined;
  }
  return getTechnicalSpecValue(equipo, label) || undefined;
};

export const autofillEquipmentFields = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: any,
  templateFields: { label: string }[],
  area: string,
  code: string,
  equipo?: EquipoBackend,
) => {
  templateFields.forEach((field) => {
    const targetKey = `verification.${field.label}`;
    const value = resolveAutofillValue(field.label, area, code, equipo);
    if (value !== undefined) {
      setValue(targetKey, value, { shouldValidate: true, shouldDirty: true });
    }
  });
};
