/**
 * Las opciones de «Semana recomendada de ejecución»: las semanas del año del
 * reporte (semanas ISO 8601, de lunes a domingo; algunos años tienen 53) y
 * «Según plan», como se escribía en el Excel. Un reporte de diciembre ofrece
 * además las del año siguiente.
 *
 * TypeScript «borrable»: sus pruebas corren con `yarn test`.
 */

export const SEGUN_PLAN = "Según plan";

/** Un año ISO tiene 53 semanas si empieza en jueves, o en miércoles siendo bisiesto. */
export function semanasDelAnio(anio: number): number {
  const diaDeLaSemana = new Date(Date.UTC(anio, 0, 1)).getUTCDay(); // 0 = domingo
  const bisiesto = (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0;
  return diaDeLaSemana === 4 || (bisiesto && diaDeLaSemana === 3) ? 53 : 52;
}

/** La semana ISO de un día (`aaaa-mm-dd`) y el año al que pertenece. */
export function semanaISO(dia: string): { anio: number; semana: number } | null {
  const [a, m, d] = dia.split("-").map(Number);
  if (!a || !m || !d) return null;
  const fecha = new Date(Date.UTC(a, m - 1, d));
  if (Number.isNaN(fecha.getTime())) return null;
  // El jueves de esa semana decide el año ISO.
  const jueves = new Date(fecha);
  jueves.setUTCDate(fecha.getUTCDate() + 3 - ((fecha.getUTCDay() + 6) % 7));
  const anio = jueves.getUTCFullYear();
  const primero = new Date(Date.UTC(anio, 0, 1));
  const semana = Math.floor((jueves.getTime() - primero.getTime()) / 86_400_000 / 7) + 1;
  return { anio, semana };
}

/** «Semana 12», o «Semana 2 de 2028» si no es del año del reporte. */
export const etiquetaDeSemana = (semana: number, anio?: number): string =>
  anio === undefined ? `Semana ${semana}` : `Semana ${semana} de ${anio}`;

/** Las opciones para un reporte de esa fecha (`aaaa-mm-dd`). */
export function opcionesDeSemana(dia: string): string[] {
  const anio = Number(dia.slice(0, 4)) || new Date().getFullYear();
  const mes = Number(dia.slice(5, 7));
  const opciones = [SEGUN_PLAN];
  for (let s = 1; s <= semanasDelAnio(anio); s++) opciones.push(etiquetaDeSemana(s));
  if (mes === 12) {
    for (let s = 1; s <= semanasDelAnio(anio + 1); s++) {
      opciones.push(etiquetaDeSemana(s, anio + 1));
    }
  }
  return opciones;
}
