// Adaptador de descargas de archivos para Planes de Acción.
// A diferencia de los demás adapters de este módulo, esto NO es un Server
// Action ("use server") — la descarga se dispara desde el navegador
// (necesita `window`/`document` para el <a download>), así que envuelve la
// utilidad cliente de `@/lib/actions/client` para que `presentation/` no
// dependa de esa ruta directamente.

import { descargarExcelPlanAccionCliente } from "@/lib/actions/client";

export const downloadAdapter = {
  async downloadPlanExcel(planId: string): Promise<void> {
    return descargarExcelPlanAccionCliente(planId);
  },
};
