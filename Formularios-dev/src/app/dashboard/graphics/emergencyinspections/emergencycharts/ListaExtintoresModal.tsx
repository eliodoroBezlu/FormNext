"use client";

import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, IconButton } from "@mui/material";
import { Close, Download } from "@mui/icons-material";
import { ExtintorDelMes, FueraDeCatalogo } from "../utils/coberturaMensual";
import { TablaExtintores, TablaFueraDeCatalogo, descargarCsv } from "./TablaExtintores";

export interface ListaExtintores {
  titulo: string;
  periodo: string;
  extintores: ExtintorDelMes[];
  /** Solo en la vista de códigos que no cuentan. */
  fueraDeCatalogo?: FueraDeCatalogo[];
}

interface ListaExtintoresModalProps {
  lista: ListaExtintores | null;
  onClose: () => void;
}

/** «No inspeccionado» → «no-inspeccionado», para el nombre del archivo. */
const slug = (texto = "") =>
  texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Lista de extintores de un estado (al hacer clic en la torta) o de los códigos que no cuentan. */
export function ListaExtintoresModal({ lista, onClose }: ListaExtintoresModalProps) {
  const extintores = lista?.extintores ?? [];
  const fuera = lista?.fueraDeCatalogo ?? [];
  const archivo = `extintores-${slug(lista?.titulo)}-${slug(lista?.periodo)}.csv`;

  return (
    <Dialog open={!!lista} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight="bold" component="div">
            {lista?.titulo}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {lista?.periodo} · {fuera.length > 0 ? `${fuera.length} códigos` : `${extintores.length} extintores`}
          </Typography>
        </Box>
        <IconButton type="button" onClick={onClose} size="small" aria-label="Cerrar">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {fuera.length > 0 ? (
          <>
            <Typography variant="body2" color="text.secondary" mb={1.5}>
              Se inspeccionaron en el mes, pero no corresponden a un extintor activo del catálogo. Si el extintor
              sigue en su lugar, hay que reactivarlo o darlo de alta con ese código; si ya no está, hay que dejar de
              anotarlo en el formulario.
            </Typography>
            <TablaFueraDeCatalogo fuera={fuera} />
          </>
        ) : extintores.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
            No hay extintores en este estado.
          </Typography>
        ) : (
          <TablaExtintores extintores={extintores} conTag maxHeight={520} />
        )}
      </DialogContent>

      <DialogActions>
        {extintores.length > 0 && (
          <Button type="button" startIcon={<Download />} onClick={() => descargarCsv(archivo, extintores)}>
            Descargar CSV
          </Button>
        )}
        <Button type="button" onClick={onClose}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
