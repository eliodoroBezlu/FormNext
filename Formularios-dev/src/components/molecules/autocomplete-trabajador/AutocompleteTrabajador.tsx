import React, { useEffect, useState } from 'react';
import { TextField, Autocomplete, CircularProgress } from '@mui/material';

export interface TrabajadorOption {
  nomina: string; // Cambio: nombre → nomina
  ci: string;
  puesto?: string; // Cambio: cargo → puesto
}

interface AutocompleteTrabajadorProps {
  label?: string;
  placeholder?: string;
  value?: string | null;
  onChange?: (nomina: string | null, trabajadorCompleto?: TrabajadorOption) => void; // Cambio: nombre → nomina
  onBlur?: () => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
}

const AutocompleteTrabajador: React.FC<AutocompleteTrabajadorProps> = ({
  label = 'Trabajador',
  placeholder = 'Seleccione o escriba un nombre',
  value = null,
  onChange,
  onBlur,
  error = false,
  helperText,
  disabled = false,
  required = false
}) => {
  const [options, setOptions] = useState<TrabajadorOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTrabajadores = async () => {
      setLoading(true);
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
        const url = `${API_BASE_URL}/trabajadores/completos`;
        
        
        const response = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: 'no-store'
        });

        console.log('📡 Response status:', response.status);

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          console.log('📦 Primer item:', data[0]);
          const filtered = data.filter(t => t.nomina && t.ci);
          setOptions(filtered);
        } else {
          console.warn('⚠️ Data no es un array o está vacía');
          setOptions([]);
        }
      } catch (error) {
        console.error('❌ Error cargando trabajadores:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    loadTrabajadores();
  }, []);

  const handleChange = (_event: React.SyntheticEvent, newValue: TrabajadorOption | string | null) => {
    if (!newValue) {
      onChange?.(null);
      return;
    }

    // Si es un objeto (selección de la lista)
    if (typeof newValue === 'object') {
      // Pasar la nomina y el objeto completo (con puesto y ci)
      onChange?.(newValue.nomina, newValue); // Cambio: nombre → nomina
    } else {
      // Si es texto libre (freeSolo)
      onChange?.(newValue, undefined);
    }
  };

  // Mostrar SOLO la nomina (como antes)
  const getOptionLabel = (option: TrabajadorOption | string): string => {
    if (typeof option === 'string') return option;
    return option.nomina; // Cambio: nombre → nomina
  };

  // Comparar opciones correctamente
  const isOptionEqualToValue = (option: TrabajadorOption | string, value: TrabajadorOption | string): boolean => {
    if (typeof option === 'string' && typeof value === 'string') {
      return option === value;
    }
    if (typeof option === 'object' && typeof value === 'string') {
      return option.nomina === value; // Cambio: nombre → nomina
    }
    if (typeof option === 'object' && typeof value === 'object') {
      return option.ci === value.ci;
    }
    return false;
  };

  // Encontrar la opción actual basada en la nomina
  const getCurrentValue = (): TrabajadorOption | string | null => {
    if (!value) return null;
    
    // Buscar en las opciones si coincide la nomina
    const found = options.find(opt => opt.nomina === value); // Cambio: nombre → nomina
    return found || value;
  };

  return (
    <Autocomplete
      freeSolo
      options={options}
      value={getCurrentValue()}
      onChange={handleChange}
      onBlur={onBlur}
      loading={loading}
      disabled={disabled}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
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
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
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