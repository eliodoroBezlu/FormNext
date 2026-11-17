"use client";

import { Box, Checkbox, Chip, Paper, Stack, Typography } from "@mui/material";
import type { ItemDelPlan } from "../../../domain/models/sincronizacionTrabajadores";

interface Props {
  titulo: string;
  descripcion: string;
  /** Ya filtrados por la búsqueda. */
  items: ItemDelPlan[];
  /** Total del grupo sin filtrar, para el contador. */
  total: number;
  /** Los problemas no se eligen: se corrigen en el Portal IAM. */
  seleccionable: boolean;
  seleccion: Set<string>;
  alternar: (idIam: string) => void;
  marcarVarios: (ids: string[], marcar: boolean) => void;
  color: "success" | "info" | "warning" | "error";
}

/** Un grupo de la vista previa: nuevos, con cambios, bajas o problemas. */
export function GrupoDelPlan({
  titulo, descripcion, items, total, seleccionable, seleccion, alternar, marcarVarios, color,
}: Props) {
  if (total === 0) return null;

  const ids = items.map((i) => i.idIam);
  const marcados = ids.filter((id) => seleccion.has(id)).length;
  const idTitulo = `grupo-${titulo.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <Paper variant="outlined" component="section" aria-labelledby={idTitulo} sx={{ mb: 2 }}>
      <Stack direction="row" alignItems="center" gap={1} sx={{ px: 1.5, py: 1, borderBottom: 1, borderColor: "divider" }}>
        {seleccionable && items.length > 0 && (
          <Checkbox
            checked={marcados === ids.length}
            indeterminate={marcados > 0 && marcados < ids.length}
            onChange={(e) => marcarVarios(ids, e.target.checked)}
            slotProps={{ input: { "aria-label": `Marcar todos: ${titulo}` } }}
          />
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography id={idTitulo} variant="subtitle1" component="h3" sx={{ fontWeight: 600 }}>
            {titulo}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {descripcion}
          </Typography>
        </Box>
        <Chip size="small" color={color} label={seleccionable ? `${marcados} de ${total}` : total} />
      </Stack>

      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1.5 }}>
          Ninguno coincide con la búsqueda.
        </Typography>
      ) : (
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
          {items.map((item) => (
            <Box
              component="li"
              key={item.idIam}
              sx={{ display: "flex", gap: 1, px: 1.5, py: 1, borderBottom: 1, borderColor: "divider", "&:last-child": { borderBottom: 0 } }}
            >
              {seleccionable && (
                <Checkbox
                  checked={seleccion.has(item.idIam)}
                  onChange={() => alternar(item.idIam)}
                  slotProps={{ input: { "aria-label": `Aplicar: ${item.nomina}` } }}
                  sx={{ alignSelf: "flex-start" }}
                />
              )}
              <Box sx={{ minWidth: 0, py: seleccionable ? 0.75 : 0 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {item.nomina}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {[item.ci && `CI ${item.ci}`, item.puesto].filter(Boolean).join(" · ")}
                </Typography>
                {item.motivo && (
                  <Typography variant="body2" color={item.tipo === "problema" ? "error.main" : "text.primary"} sx={{ mt: 0.5 }}>
                    {item.motivo}
                  </Typography>
                )}
                {item.tipo === "cambio" &&
                  item.cambios.map((c) => (
                    <Typography key={c.campo} variant="body2" sx={{ mt: 0.25 }}>
                      <Box component="span" sx={{ color: "text.secondary" }}>{c.etiqueta}: </Box>
                      <Box component="span" sx={{ textDecoration: "line-through", color: "text.secondary" }}>{c.antes}</Box>
                      {" → "}
                      <Box component="span" sx={{ fontWeight: 600 }}>{c.despues}</Box>
                    </Typography>
                  ))}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
}
