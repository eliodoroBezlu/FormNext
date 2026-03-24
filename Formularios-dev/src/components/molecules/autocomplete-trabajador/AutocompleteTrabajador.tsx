import { TextField, Autocomplete, CircularProgress } from "@mui/material";
import { obtenerTrabajadoresCompletos } from "@/lib/actions/trabajador-actions";
import { useEffect, useState } from "react";

export interface TrabajadorOption {
  nomina: string;
  ci: string;
  puesto?: string;
}

interface AutocompleteTrabajadorProps {
  label?: string;
  placeholder?: string;
  value?: string | null;
  onChange?: (
    nomina: string | null,
    trabajadorCompleto?: TrabajadorOption,
  ) => void;
  onBlur?: () => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
}

const AutocompleteTrabajador: React.FC<AutocompleteTrabajadorProps> = ({
  label = "Trabajador",
  placeholder = "Seleccione o escriba un nombre",
  value = null,
  onChange,
  onBlur,
  error = false,
  helperText,
  disabled = false,
  required = false,
}) => {
  const [options, setOptions] = useState<TrabajadorOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const loadTrabajadores = async () => {
      setLoading(true);
      try {
        const data = await obtenerTrabajadoresCompletos();
        if (Array.isArray(data) && data.length > 0) {
          const filtered = data.filter((t) => t.nomina && t.ci);
          setOptions(filtered);
        } else {
          setOptions([]);
        }
      } catch (error) {
        console.error("❌ Error cargando trabajadores:", error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };
    loadTrabajadores();
  }, []);

  // ✅ Sincronizar inputValue cuando value cambia externamente
  useEffect(() => {
    if (value && value !== inputValue) {
      setInputValue(value);
    }
    if (!value) {
      setInputValue("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: TrabajadorOption | string | null,
  ) => {
    if (!newValue) {
      onChange?.(null);
      return;
    }
    if (typeof newValue === "object") {
      onChange?.(newValue.nomina, newValue);
    } else {
      onChange?.(newValue, undefined);
    }
  };

  const handleInputChange = (
    _event: React.SyntheticEvent,
    newInputValue: string,
  ) => {
    setInputValue(newInputValue);

    if (newInputValue.trim() !== "") {
      const found = options.find(
        (opt) => opt.nomina.toLowerCase() === newInputValue.toLowerCase(),
      );
      if (found) {
        onChange?.(found.nomina, found);
      } else {
        onChange?.(newInputValue, undefined);
      }
    } else {
      onChange?.(null);
    }
  };

  const handleBlur = () => {
    if (inputValue && inputValue.trim() !== "") {
      const found = options.find(
        (opt) => opt.nomina.toLowerCase() === inputValue.toLowerCase(),
      );
      if (found) {
        onChange?.(found.nomina, found);
      } else {
        onChange?.(inputValue, undefined);
      }
    }
    onBlur?.();
  };

  const getOptionLabel = (option: TrabajadorOption | string): string => {
    if (typeof option === "string") return option;
    return option.nomina;
  };

  const isOptionEqualToValue = (
    option: TrabajadorOption | string,
    value: TrabajadorOption | string,
  ): boolean => {
    if (typeof option === "string" && typeof value === "string")
      return option === value;
    if (typeof option === "object" && typeof value === "string")
      return option.nomina === value;
    if (typeof option === "string" && typeof value === "object")
      return option === value.nomina;
    if (typeof option === "object" && typeof value === "object")
      return option.ci === value.ci;
    return false;
  };

  const getCurrentValue = (): TrabajadorOption | string | null => {
    if (!value) return null;
    const found = options.find((opt) => opt.nomina === value);
    return found ?? value;
  };

  return (
    <Autocomplete
      freeSolo
      options={options}
      value={getCurrentValue()}
      onChange={handleChange}
      onBlur={handleBlur}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      loading={loading}
      disabled={disabled}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      filterOptions={(options, params) => {
        return options.filter((option) => {
          if (typeof option === "string") {
            return option
              .toLowerCase()
              .includes(params.inputValue.toLowerCase());
          }
          return option.nomina
            .toLowerCase()
            .includes(params.inputValue.toLowerCase());
        });
      }}
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

export default AutocompleteTrabajador;
