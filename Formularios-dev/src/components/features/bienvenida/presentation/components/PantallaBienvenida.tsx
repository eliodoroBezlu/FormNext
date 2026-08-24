"use client";

import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { AnimacionCarga } from "./AnimacionCarga";
import type { BienvenidaResuelta } from "../../domain/models/Bienvenida";

interface PantallaBienvenidaProps {
  contenido: BienvenidaResuelta;
  /** `false` la encaja donde esté; `true` la pone a pantalla completa. */
  pantallaCompleta?: boolean;
  /** Se pasó del tiempo esperado: hay que decírselo a quien espera. */
  tarda?: boolean;
}

/**
 * La pantalla que se ve mientras el sistema abre.
 *
 * Sustituye a las dos que había escritas a mano —el «Verificando sesión...» de
 * `AuthGuard` y la barra suelta del panel—, que eran distintas entre sí y no
 * se podían configurar.
 *
 * Todo el color sale de los tokens del tema: dar por hecho un fondo blanco
 * dejaría el texto ilegible en modo oscuro, que es la mitad de las sesiones.
 */
export function PantallaBienvenida({
  contenido,
  pantallaCompleta = true,
  tarda = false,
}: PantallaBienvenidaProps) {
  return (
    <Box
      sx={{
        minHeight: pantallaCompleta ? "100vh" : 320,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        px: 3,
      }}
    >
      <Stack spacing={2.5} alignItems="center" sx={{ maxWidth: 460 }}>
        <AnimacionCarga
          clave={contenido.animacion}
          logoUrl={contenido.logoUrl}
        />

        {/*
          `aria-live` para que un lector de pantalla anuncie el mensaje: sin
          esto la pantalla existe solo para quien la ve. `polite` y no
          `assertive` porque no interrumpe nada.
        */}
        <Box aria-live="polite" sx={{ textAlign: "center" }}>
          <Typography
            variant="h6"
            fontWeight={600}
            color={contenido.esMantenimiento ? "warning.main" : "text.primary"}
          >
            {contenido.mensaje}
          </Typography>

          {contenido.submensaje && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {contenido.submensaje}
            </Typography>
          )}
        </Box>

        {tarda && (
          // No desbloquea nada ni ofrece un atajo: solo evita que la espera
          // parezca un cuelgue. Callar aquí es lo que hace que la gente
          // recargue a ciegas.
          <Typography variant="caption" color="warning.main" textAlign="center">
            Está tardando más de lo normal. Compruebe su conexión.
          </Typography>
        )}

        {contenido.consejo && (
          <Box
            sx={{
              mt: 1,
              px: 2,
              py: 1.25,
              borderRadius: 1,
              border: 1,
              borderColor: "divider",
              bgcolor: "action.hover",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ textAlign: "center" }}
            >
              {contenido.consejo}
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
}
