import { EquipoBackend } from "@/lib/actions/equipo-actions";

// Mapea el código de plantilla al/los tipo(s) de equipo del inventario que debe
// ofrecer para autocompletar (ver módulo equipos/ubicacion/clasificacion del backend).
export const TEMPLATE_EQUIPMENT_MAP: Record<string, string[]> = {
  '1.02.P06.F39': ['Amoladora'],
  '1.02.P06.F40': ['Esmeril de banco'],
  '2.03.P10.F05': ['TALADRO', 'Taldro de banco'],
  '1.02.P06.F42': ['EquiposSoldar'],
  '1.02.P06.F33': ['Escalera'],
  // SPCC — arneses, conectores, autorretráctiles y fajas. El mismo código
  // sirve a las dos plantillas de caídas (la de arnés y conectores y la de
  // SPCC completa) porque comparten el inventario.
  '1.02.P06.F19': ['ArnesAuConAncl'],
  '3.04.P48.F03': ['Vehiculos'],
};

const normalizeLabel = (label: string): string =>
  label.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

// RHF separa su path interno de get/set por cada "." \u2014 una etiqueta de
// plantilla que ya trae un punto (ej. "A\u00d1O VEH./EQU.") rompe esa resoluci\u00f3n
// y termina anidada o perdida en vez de guardarse como una sola clave plana.
// Se sanea el punto SOLO para el path interno de RHF (Controller `name`,
// `setValue`, `getValues`, `trigger`, `watch`); la etiqueta real de la
// plantilla sigue siendo siempre la clave del objeto final que ve el resto
// del sistema (backend, Excel/PDF, reportes).
const DOT_PLACEHOLDER = "\u2024"; // ONE DOT LEADER \u2014 no es "." "," "[" "]"

export const sanitizeFieldKey = (label: string): string =>
  label.replace(/\./g, DOT_PLACEHOLDER);

export const verificationFieldPath = (label: string): string =>
  `verification.${sanitizeFieldKey(label)}`;

// Convierte un objeto `verification` con claves reales (como llega del
// backend en modo edici\u00f3n) a uno con claves saneadas, para hidratar el
// estado inicial de RHF de forma consistente con `verificationFieldPath`.
export const sanitizeVerificationObject = <T extends Record<string, unknown>>(
  verification: T | undefined,
): T => {
  if (!verification) return {} as T;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(verification)) {
    result[sanitizeFieldKey(key)] = value;
  }
  return result as T;
};

/**
 * Campo que pide la **placa** del vehículo.
 *
 * Se distingue del número interno a propósito: son dos identificadores
 * distintos del mismo vehículo, y la plantilla de vehículos los pide en dos
 * campos separados. Llenar los dos con el mismo valor —que es lo que se hacía—
 * da una inspección que dice que la placa y el número interno son iguales.
 */
export const isPlacaField = (label: string): boolean =>
  normalizeLabel(label).includes("PLACA");

/** Campo que pide el código o número interno del equipo. */
export const isNumeroInternoField = (label: string): boolean => {
  const clean = normalizeLabel(label);
  return (
    clean.includes("CODIGO") ||
    clean.includes("TAG") ||
    clean.includes("NUMERO INTERNO") ||
    clean.includes("N° INTERNO") ||
    clean.includes("NRO INTERNO") ||
    clean.includes("IDENTIFICACION")
  );
};

/**
 * Cualquier campo que identifique al equipo — número interno o placa.
 *
 * Sirve para agrupar: es lo que decide qué campos van al paso 1 del
 * formulario. Para **rellenar** hay que usar la variante concreta, porque cada
 * una recibe un valor distinto.
 */
export const isEquipmentCodeField = (label: string): boolean =>
  isNumeroInternoField(label) || isPlacaField(label);

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

// Palabras que no distinguen un campo de otro al emparejar etiquetas.
const PALABRAS_VACIAS = new Set(["DE", "DEL", "LA", "LAS", "LOS", "EL", "Y"]);

const palabrasClave = (texto: string): string[] =>
  normalizeLabel(texto)
    .split(/[^A-Z0-9]+/)
    .filter((p) => p.length >= 3 && !PALABRAS_VACIAS.has(p));

/**
 * ¿La etiqueta de la plantilla y la clave de la especificación nombran lo
 * mismo? Se compara por palabras porque las dos fuentes escriben distinto:
 * la plantilla dice «TIPO VEHÍCULO» y el inventario «Tipo de vehiculo». Ni son
 * iguales ni una contiene a la otra, así que comparar por texto los daba por
 * distintos y el campo se quedaba vacío.
 */
const nombranLoMismo = (a: string, b: string): boolean => {
  const pa = palabrasClave(a);
  const pb = palabrasClave(b);
  if (pa.length === 0 || pb.length === 0) return false;
  const [corta, larga] = pa.length <= pb.length ? [pa, pb] : [pb, pa];
  // Hacen falta al menos dos palabras en común. Con una sola, una etiqueta
  // genérica como «TIPO» empataría con «Tipo de vehiculo» y se llevaría un
  // valor que no le corresponde.
  if (corta.length < 2) return false;
  return corta.every((p) => larga.includes(p));
};

export const getTechnicalSpecValue = (equipo: EquipoBackend | undefined, label: string): string => {
  if (!equipo || !equipo.especificaciones) return "";
  const norm = normalizeLabel(label);

  const specKeys = Object.keys(equipo.especificaciones);
  const matchKey =
    specKeys.find((k) => {
      const normKey = normalizeLabel(k);
      return normKey === norm || norm.includes(normKey) || normKey.includes(norm);
    }) ?? specKeys.find((k) => nombranLoMismo(k, label));

  return matchKey ? String(equipo.especificaciones[matchKey]) : "";
};

/**
 * Igual que `getTechnicalSpecValue` pero **sin** el emparejado por contención.
 *
 * Ese emparejado es útil para «Diámetro de Disco (pulgadas)» ↔ «Diametro de
 * disco», pero es demasiado ancho cuando la etiqueta es de una sola palabra:
 * «TIPO» está contenido en «Tipo de vehiculo» y se llevaba «Camioneta» a un
 * campo de tecles. Aquí solo vale la igualdad o el nombre equivalente.
 */
const getSpecPorNombreExacto = (
  equipo: EquipoBackend | undefined,
  label: string,
): string => {
  if (!equipo?.especificaciones) return "";
  const norm = normalizeLabel(label);
  const key = Object.keys(equipo.especificaciones).find(
    (k) => normalizeLabel(k) === norm || nombranLoMismo(k, label),
  );
  return key ? String(equipo.especificaciones[key]) : "";
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
  // La placa se pregunta antes que el número interno: hay vehículos cuyo
  // «código» del inventario es en realidad la placa, y en ese caso es el único
  // identificador que tenemos. Si no hay placa cargada, el campo se deja vacío
  // para que lo escriba el inspector — antes se rellenaba con el número
  // interno, que es un dato distinto.
  if (isPlacaField(label)) {
    // «PLACA/N° INTERNO» (Man Lift) es un solo campo para cualquiera de los
    // dos: ahí el código sirve de respaldo. En una plantilla que los pide por
    // separado, no — el campo queda vacío para que lo escriba el inspector.
    const admiteAmbos = isNumeroInternoField(label);
    return equipo?.placa || (admiteAmbos ? code : "") || undefined;
  }
  if (isNumeroInternoField(label)) {
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
    // Un equipo de ámbito superintendencia o gerencia no tiene área, así que
    // no hay de dónde deducirla por ahí: la referencia directa es la única.
    return (
      equipo?.superintendencia_id?.nombre ||
      equipo?.area_id?.superintendencia?.nombre ||
      undefined
    );
  }
  if (isTipoField(label)) {
    // Una especificación que nombra el campo gana sobre el tipo genérico:
    // «TIPO DE ESCALERA» pide «Tijera», no «Escalera». Un «TIPO» a secas no
    // nombra ninguna, así que se queda con el tipo de equipo.
    return (
      getSpecPorNombreExacto(equipo, label) || equipo?.tipo_equipo || undefined
    );
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
    const targetKey = verificationFieldPath(field.label);
    const value = resolveAutofillValue(field.label, area, code, equipo);
    if (value !== undefined) {
      setValue(targetKey, value, { shouldValidate: true, shouldDirty: true });
    }
  });

  // Fuera de `verification`: no es un campo del formulario, es la identidad
  // del equipo elegido. Se guarda siempre —también vacío— para que reelegir
  // un equipo sin RFID no arrastre el del anterior.
  setValue("rfidEquipo", equipo?.rfid ?? undefined, { shouldDirty: true });
};

/**
 * Reconstruye `verification` como objeto plano con las etiquetas reales de
 * la plantilla como clave, justo antes de enviarlo al backend. Lee cada
 * valor por el mismo path saneado (`verificationFieldPath`) con el que se
 * registró el campo, así que siempre recupera el valor correcto sin
 * importar si la etiqueta trae puntos.
 */
export const rebuildVerification = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getValues: any,
  templateFields: { label: string }[],
): Record<string, string> => {
  const result: Record<string, string> = {};
  templateFields.forEach((field) => {
    const value = getValues(verificationFieldPath(field.label));
    result[field.label] = (value as string) ?? "";
  });
  return result;
};
