import React, { useEffect, useMemo, useState } from "react";
import { TextField, Autocomplete, CircularProgress } from "@mui/material";
import {
  DataSourceType,
  fetchDataBySource,
} from "@/lib/actions/dataSourceService";
import { esCatalogoEstricto } from "./catalogosEstrictos";

interface AutocompleteCustomProps {
  dataSource?: DataSourceType;
  label?: string;
  placeholder?: string;
  value?: string | null;
  onChange?: (value: string | null) => void;
  onBlur?: () => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  /**
   * ¿Se admite un valor que no esté en la lista?
   *
   * Sin especificar, lo decide el origen de datos: los catálogos cerrados
   * —áreas, superintendencias— no lo admiten y el resto sí. Pasarlo
   * explícitamente sirve para excepciones puntuales.
   */
  permitirTextoLibre?: boolean;
}

const AutocompleteCustom: React.FC<AutocompleteCustomProps> = ({
  dataSource,
  label = "Seleccione o agregue un valor",
  placeholder,
  value = null,
  onChange,
  onBlur,
  error = false,
  helperText,
  disabled = false,
  required = false,
  permitirTextoLibre,
}) => {
  const [lodaedData, setLoadedData] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  const [prevDataSource, setPrevDataSource] = useState(dataSource);
  if (dataSource !== prevDataSource) {
    setPrevDataSource(dataSource);
    if (!dataSource) {
      setLoadedData([]);
      setLoading(false);
    }
  }

  const textoLibre = permitirTextoLibre ?? !esCatalogoEstricto(dataSource);

  /**
   * El valor guardado se añade a la lista si no está en el catálogo.
   *
   * Hace falta para no romper lo que ya existe: hay inspecciones guardadas con
   * áreas que hoy no están en el catálogo —«Taller Soldaduraa», «REVISAR»—, y
   * sin esto, al abrirlas para editarlas, MUI encontraría un valor fuera de sus
   * opciones y **dejaría la casilla en blanco**. Perder el dato al abrir el
   * formulario sería peor que el problema que esto viene a resolver.
   *
   * Aparece en la lista, se puede conservar o cambiar por uno del catálogo,
   * pero **no se puede escribir uno nuevo**: la corrección es progresiva y no
   * borra el pasado.
   */
  const options = useMemo(() => {
    if (!dataSource) return [];

    // Se recorta y se quitan repetidos.
    //
    // MUI usa el propio texto como `key` de cada opción, así que un catálogo
    // con el mismo nombre dos veces —«Generacion» está duplicado en la
    // colección `areas`, con dos `_id` distintos— hace que React avise de
    // claves repetidas y pueda omitir o duplicar elementos de la lista.
    //
    // El recorte va antes que el descarte a propósito: «Generacion» y
    // «Generacion » son entradas distintas para `Set`, pero la misma opción
    // para quien la lee. Sin recortar, la lista mostraría dos veces lo que
    // parece lo mismo.
    //
    // Esto **no arregla el catálogo**, solo evita que su desorden llegue a la
    // pantalla: los duplicados hay que borrarlos en la base.
    const limpias = [...new Set(lodaedData.map((o) => o.trim()).filter(Boolean))];

    const actual = value?.trim();
    if (actual && !limpias.includes(actual)) return [actual, ...limpias];
    return limpias;
  }, [dataSource, lodaedData, value]);

  useEffect(() => {
    if (!dataSource) {
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchDataBySource(dataSource);
        setLoadedData(data);
      } catch (error) {
        console.error("Error cargando datos:", error);
        setLoadedData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dataSource]);

  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: string | null,
  ) => {
    // Se recorta siempre: media docena de áreas de la base solo se diferencian
    // de otra en un espacio final, y eso las convierte en áreas distintas para
    // cualquier agrupación.
    onChange?.(typeof newValue === "string" ? newValue.trim() : newValue);
  };

  const handleInputChange = (
    _event: React.SyntheticEvent,
    newInputValue: string,
  ) => {
    // Con catálogo cerrado, teclear NO cambia el valor: solo filtra la lista.
    // El valor se fija al elegir una opción, y por eso este manejador no hace
    // nada aquí. Escribiendo se guardaba lo tecleado letra a letra, que es
    // como entraron a la base cosas como «4 pulgadas 8000 rpm» en el área.
    if (!textoLibre) return;
    onChange?.(newInputValue || null);
  };

  return (
    <Autocomplete
      freeSolo={textoLibre}
      options={options}
      value={value}
      onChange={handleChange}
      onInputChange={handleInputChange}
      onBlur={onBlur}
      loading={loading}
      disabled={disabled}
      // Comparación recortada: hay valores guardados con espacio final
      // —«Mantenimiento Planta »— que si no, no casarían con su opción y MUI
      // los daría por fuera de la lista. Compara, no reescribe: el valor
      // guardado se queda como está hasta que alguien elija otro.
      isOptionEqualToValue={(opcion, valor) =>
        opcion.trim() === (valor ?? "").trim()
      }
      noOptionsText={
        textoLibre ? "Sin coincidencias" : "No hay ninguna opción con ese texto"
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          required={required}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default AutocompleteCustom;
