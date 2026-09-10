import { InspectionResponse } from "@/lib/actions/inspection-herra-equipos";

/**
 * Campos que llevan «área» en la etiqueta y sin embargo guardan **una
 * persona**: `SUPERVISOR DE ÁREA` contiene un nombre propio, no un lugar.
 */
const ES_DE_PERSONA =
  /SUPERVISOR|RESPONSABLE|INSPECTOR|PERSONA|TRABAJADOR|JEFE|FIRMA/;

/**
 * El área de una inspección.
 *
 * Se busca en dos sitios y en este orden:
 *
 * 1. **El campo `area` del documento**, que el backend extrae al crear la
 *    inspección. Es el bueno: ya está resuelto y es el que consultan los
 *    informes del servidor.
 * 2. **`verification`**, para los documentos anteriores a ese campo o creados
 *    cuando el extractor todavía no reconocía su etiqueta.
 *
 * ── Por qué no vale una lista de grafías ─────────────────────────────────
 *
 * Aquí había una lista fija (`ÁREA`, `Área`, `Area`, `AREA`…) y cada plantilla
 * nombra el campo a su manera, así que se quedaban fuera:
 *
 * ```
 * ÁREA/SECCIÓN                             F19   ← 443 inspecciones
 * UBICACIÓN FÍSICA EL EQUIPO               F39, F40, F42   ← nótese «EL»
 * ÁREA FÍSICA DEL MONTAJE DEL ANDAMIO      F30
 * ```
 *
 * Devolvían `N/A`, y como el filtro por área compara contra esto, **ninguna
 * aparecía al buscar por su área** ni salía su carpeta en «Mis Inspecciones».
 * No daba error: simplemente no estaban.
 *
 * El criterio es el mismo que usa el backend en `extractAreaFromVerification`.
 * Si uno cambia, hay que cambiar el otro o las dos vistas dejarán de coincidir.
 */
export function getArea(i: InspectionResponse): string {
  const denormalizada = i.area?.trim();
  if (denormalizada) return denormalizada;

  if (!i.verification) return "N/A";

  const claves = Object.keys(i.verification).filter(
    (k) => !ES_DE_PERSONA.test(normalizar(k)),
  );

  const primeraConValor = (
    cumple: (claveNormalizada: string) => boolean,
  ): string | undefined => {
    for (const clave of claves) {
      if (!cumple(normalizar(clave))) continue;
      const valor = i.verification![clave];
      const texto = valor === null || valor === undefined ? "" : String(valor).trim();
      if (texto) return texto;
    }
    return undefined;
  };

  // El orden importa: `2.03.P10.F05` pide AREA y UBICACIÓN a la vez. Un área
  // es dónde trabaja la cuadrilla; una ubicación puede ser «Caja soldadura
  // 320», un sitio dentro del área. Gana la primera.
  return (
    primeraConValor((k) => k === "AREA" || k === "AREA/SECCION") ??
    primeraConValor((k) => k.includes("AREA") || k.includes("SECCION")) ??
    primeraConValor((k) => k.includes("UBICAC")) ??
    "N/A"
  );
}

/** Mayúsculas, sin tildes y sin espacios de más, para comparar textos libres. */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * ¿La inspección corresponde al área buscada?
 *
 * Se compara por «contiene» y sin tildes porque el área la escribe cada
 * inspector a mano en su formulario, y en la base conviven `Flotacion`,
 * `flotación`, `Taller Flotacion` y `taller de flotación` para el mismo lugar.
 * Una comparación exacta contra el maestro de áreas dejaría fuera la mayoría.
 */
export function coincideArea(i: InspectionResponse, filtro: string): boolean {
  const buscado = normalizar(filtro);
  if (!buscado) return true;
  return normalizar(getArea(i)).includes(buscado);
}

/**
 * Campos de `verification` que identifican al equipo inspeccionado.
 *
 * Cada plantilla nombra el suyo a su manera, así que no hay forma de deducirlo:
 * hay que declararlo. La lista se revisó plantilla por plantilla contra las
 * 2806 inspecciones de producción y todas las entradas dan cobertura ≥92 %; lo
 * que falta son campos que el inspector dejó en blanco.
 *
 * **Varias etiquetas por plantilla** porque `3.04.P48.F03` usa indistintamente
 * `NÚMERO INTERNO` o `PLACA` según quién la llenara. Se toma la primera con
 * valor.
 *
 * ⚠️ Dos entradas se corrigieron: `1.02.P06.F40` apuntaba a `UBICACIÓN FÍSICA
 * EL EQUIPO` y `1.02.P06.F20` a `Lugar exacto del trabajo/depósito`. Las dos
 * son **dónde está**, no **qué equipo es**; la columna de identificación
 * mostraba una ubicación. Si alguien vuelve a poner ahí un campo de lugar,
 * está repitiendo ese error.
 */
const CAMPOS_CODIGO: Record<string, string[]> = {
  "3.04.P48.F03": ["NÚMERO INTERNO", "PLACA"],
  "1.02.P06.F37": ["PLACA/N° INTERNO"],
  "1.02.P06.F33": ["CÓDIGO DE LA ESCALERA"],
  "3.04.P37.F24": ["TAG"],
  "3.04.P37.F25": ["TAG"],
  "3.04.P04.F35": ["Tag del puente grúa"],
  "3.04.P04.F23": ["TAG del Puente Grúa"],
  "2.03.P10.F05": ["CÓDIGO TALADRO"],
  "1.02.P06.F39": ["IDENTIFICACIÓN INTERNA DEL EQUIPO"],
  "1.02.P06.F40": ["IDENTIFICACIÓN INTERNA DEL EQUIPO"],
  "1.02.P06.F42": ["IDENTIFICACIÓN INTERNA DEL EQUIPO"],
  "1.02.P06.F20": ["Descripción del trabajo"],
  "1.02.P06.F30": ["PROYECTO/Nº DE ORDEN DE TRABAJO"],
};

/**
 * SPCC: los códigos viven en el bloque «Fuera de Servicio», uno por elemento.
 *
 * Una inspección cubre de uno a cuatro elementos —el trabajador lleva lo que
 * lleva— así que aquí no hay «un código», hay los que haya. En producción: 374
 * inspecciones con uno, 82 con dos, 18 con tres y 172 con los cuatro.
 *
 * El orden es el del formulario, no alfabético: es el que espera quien lo
 * llenó.
 */
const CODIGOS_SPCC = [
  "codArnes",
  "codAutoRetractil",
  "codConectorAnclaje",
  "codConector",
] as const;

/** Nombres legibles de los accesorios de izaje; la clave es la del formulario. */
const ETIQUETAS_ACCESORIOS: Record<string, string> = {
  eslinga_sintetica: "Eslinga sintética",
  eslinga_cable: "Eslinga de cable",
  grillete: "Grillete",
  gancho: "Gancho",
};

const textoDe = (valor: unknown): string =>
  valor === null || valor === undefined ? "" : String(valor).trim();

/**
 * «No aplica» escrito a mano, en sus muchas formas.
 *
 * En el SPCC el formulario pide los cuatro códigos aunque el trabajador lleve
 * uno solo, y quien lo llena escribe `NA`, `N/A` o `No aplica` en los que le
 * sobran. Son 60 de los 1280 valores registrados. Pintarlos como si fueran
 * códigos llena la columna de ruido.
 *
 * Filtrarlos es seguro: **ninguna** de las 646 inspecciones se queda sin
 * código al hacerlo.
 */
const ES_NO_APLICA = /^(NA|N\/A|N\.A\.?|NO APLICA|NINGUNO|-+|0)$/i;

/**
 * Todos los identificadores del equipo inspeccionado, en el orden del
 * formulario. Lista vacía si no hay ninguno.
 *
 * Tres formas distintas, porque el dato vive en tres sitios según la
 * plantilla:
 *
 * 1. **`verification`** — el caso normal, un código por inspección.
 * 2. **`outOfService`** (SPCC) — hasta cuatro, uno por elemento.
 * 3. **`accesoriosConfig`** (izaje) — no son códigos sino cantidades por tipo
 *    de accesorio, así que se devuelve «Etiqueta cantidad».
 *
 * Antes solo existía el primer caso y los otros dos devolvían `N/A`: eran 660
 * inspecciones —el 24 % del total— sin nada en la columna que las identifica.
 */
export function getEquipmentIds(i: InspectionResponse): string[] {
  if (i.templateCode === "1.02.P06.F19") {
    const bloque = i.outOfService ?? {};
    return CODIGOS_SPCC.map((clave) => textoDe(bloque[clave])).filter(
      (codigo) => codigo && !ES_NO_APLICA.test(codigo),
    );
  }

  if (i.templateCode === "3.04.P37.F19") {
    return (
      Object.entries(i.accesoriosConfig ?? {})
        // Cantidad cero significa «de este accesorio no había», y el formulario
        // guarda los cuatro tipos siempre. Sin este filtro casi la mitad de los
        // chips —24 de 56 en producción— dirían «Gancho 0».
        .filter(([, dato]) => Number(textoDe(dato?.cantidad)) > 0)
        .map(([clave, dato]) => {
          const etiqueta =
            ETIQUETAS_ACCESORIOS[clave] ?? clave.replace(/_/g, " ");
          return `${etiqueta} ${textoDe(dato.cantidad)}`;
        })
    );
  }

  const campos = CAMPOS_CODIGO[i.templateCode];
  if (!campos || !i.verification) return [];

  for (const campo of campos) {
    const valor = textoDe(i.verification[campo]);
    if (valor) return [valor];
  }
  return [];
}

/**
 * El identificador principal, como texto.
 *
 * Se conserva porque hay vistas que solo pueden mostrar una línea. Donde quepan
 * varios —las tablas— conviene `getEquipmentIds`, que no esconde los demás.
 */
export function getEquipmentId(i: InspectionResponse): string {
  return getEquipmentIds(i)[0] ?? "N/A";
}
