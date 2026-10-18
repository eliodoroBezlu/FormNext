"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Stack,
  TextField,
} from "@mui/material";
import {
  CheckCircleOutline,
  DeleteOutline,
  SaveOutlined,
  SendOutlined,
  Undo,
} from "@mui/icons-material";
import type { AccionesReporte } from "../../domain/accionesReporte";

interface Props {
  acciones: AccionesReporte;
  trabajando: boolean;
  onGuardar: () => void;
  onDarDeBaja: () => void;
  onDevolver: (motivo: string) => void;
  onEmitir: () => void;
}

/**
 * Las acciones del reporte, fijas al pie (`save-submit-buttons`). «Enviar a
 * revisión» es el único `submit`: dispara la revisión de lo que falta.
 */
export function BarraAccionesReporte({
  acciones,
  trabajando,
  onGuardar,
  onDarDeBaja,
  onDevolver,
  onEmitir,
}: Props) {
  const [dialogo, setDialogo] = useState<"devolver" | "emitir" | "baja" | null>(null);
  const [motivo, setMotivo] = useState("");
  const cerrar = () => setDialogo(null);
  const icono = (i: React.ReactNode) => (trabajando ? <CircularProgress size={16} color="inherit" /> : i);

  const nada = !acciones.editar && !acciones.enviar && !acciones.revisar;

  return (
    <Box
      className="save-submit-buttons"
      sx={{ position: "sticky", bottom: 0, zIndex: 10, bgcolor: "background.paper", mt: 3 }}
    >
      <Divider />
      <Box sx={{ py: 2, boxShadow: "0 -4px 20px rgba(0,0,0,0.06)" }}>
        {nada ? (
          <Alert severity="info">{acciones.aviso}</Alert>
        ) : (
          <Stack direction={{ xs: "column", sm: "row" }} gap={1} justifyContent="flex-end">
            {acciones.darDeBaja && (
              <Button
                type="button"
                color="error"
                startIcon={<DeleteOutline />}
                disabled={trabajando}
                onClick={() => setDialogo("baja")}
              >
                Descartar borrador
              </Button>
            )}
            {acciones.editar && (
              <Button
                type="button"
                variant="outlined"
                startIcon={icono(<SaveOutlined />)}
                disabled={trabajando}
                onClick={onGuardar}
              >
                Guardar borrador
              </Button>
            )}
            {acciones.enviar && (
              <Button type="submit" variant="contained" startIcon={icono(<SendOutlined />)} disabled={trabajando}>
                Enviar a revisión
              </Button>
            )}
            {acciones.revisar && (
              <>
                <Button
                  type="button"
                  variant="outlined"
                  color="warning"
                  startIcon={icono(<Undo />)}
                  disabled={trabajando}
                  onClick={() => setDialogo("devolver")}
                >
                  Devolver
                </Button>
                <Button
                  type="button"
                  variant="contained"
                  color="success"
                  startIcon={icono(<CheckCircleOutline />)}
                  disabled={trabajando}
                  onClick={() => setDialogo("emitir")}
                >
                  Emitir
                </Button>
              </>
            )}
          </Stack>
        )}
      </Box>

      <Dialog open={dialogo === "devolver"} onClose={cerrar} fullWidth maxWidth="sm">
        <DialogTitle>Devolver el reporte</DialogTitle>
        <DialogContent>
          <DialogContentText mb={2}>
            Vuelve a borrador para que quien lo elaboró lo corrija. Diga qué hay que cambiar.
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            label="Motivo"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={cerrar}>
            Cancelar
          </Button>
          <Button
            type="button"
            color="warning"
            variant="contained"
            disabled={!motivo.trim()}
            onClick={() => {
              onDevolver(motivo.trim());
              setMotivo("");
              cerrar();
            }}
          >
            Devolver
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogo === "emitir"} onClose={cerrar}>
        <DialogTitle>Emitir el reporte</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Se le asigna su código interno y queda a su nombre como revisor. Un reporte emitido ya
            no se modifica.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={cerrar}>
            Cancelar
          </Button>
          <Button
            type="button"
            color="success"
            variant="contained"
            onClick={() => {
              onEmitir();
              cerrar();
            }}
          >
            Emitir
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogo === "baja"} onClose={cerrar}>
        <DialogTitle>Descartar el borrador</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sale de la lista. No se borra de la base: queda dado de baja, con quién y cuándo.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={cerrar}>
            Cancelar
          </Button>
          <Button
            type="button"
            color="error"
            variant="contained"
            onClick={() => {
              onDarDeBaja();
              cerrar();
            }}
          >
            Descartar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
