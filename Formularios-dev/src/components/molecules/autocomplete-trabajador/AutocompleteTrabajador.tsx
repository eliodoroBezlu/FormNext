import React, { useEffect, useState } from 'react';
import { TextField, Autocomplete, CircularProgress } from '@mui/material';

export interface TrabajadorOption {
  nomina: string;
  ci: string;
  puesto?: string;
}

interface AutocompleteTrabajadorProps {
  label?: string;
  placeholder?: string;
  value?: string | null;
  onChange?: (nomina: string | null, trabajadorCompleto?: TrabajadorOption) => void;
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
  const [inputValue, setInputValue] = useState('');

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

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
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
      onChange?.(newValue.nomina, newValue);
    } else {
      onChange?.(newValue, undefined);
    }
  };

  // Mostrar SOLO la nomina
  const getOptionLabel = (option: TrabajadorOption | string): string => {
    if (typeof option === 'string') return option;
    return option.nomina;
  };

  // Comparación simplificada
  const isOptionEqualToValue = (option: TrabajadorOption | string, value: TrabajadorOption | string): boolean => {
    
    // Si ambos son strings, comparar directamente
    if (typeof option === 'string' && typeof value === 'string') {
      const result = option === value;
      return result;
    }
    // Si option es objeto y value es string, comparar por nomina
    if (typeof option === 'object' && typeof value === 'string') {
      const result = option.nomina === value;
      return result;
    }
    // Si value es objeto y option es string, comparar por nomina
    if (typeof option === 'string' && typeof value === 'object') {
      const result = option === value.nomina;
      return result;
    }
    // Si ambos son objetos, comparar por CI
    if (typeof option === 'object' && typeof value === 'object') {
      const result = option.ci === value.ci;
      return result;
    }
    return false;
  };

  // Mejorar getCurrentValue
  const getCurrentValue = (): TrabajadorOption | string | null => {
    
    if (!value) {
      return null;
    }
    
    // Buscar en las opciones si coincide la nomina
    const found = options.find(opt => opt.nomina === value);
    
    if (found) {
      return found;
    }
    
    return value;
  };

  const handleBlur = () => {
    
    // Si hay un inputValue diferente al value, disparar onChange
    if (inputValue && inputValue !== value) {
      onChange?.(inputValue, undefined);
    }
    
    onBlur?.();
  };

  return (
    <Autocomplete
      freeSolo
      options={options}
      value={getCurrentValue()}
      onChange={handleChange}
      onBlur={handleBlur}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      loading={loading}
      disabled={disabled}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      filterOptions={(options, params) => {
        const filtered = options.filter(option => {
          if (typeof option === 'string') {
            return option.toLowerCase().includes(params.inputValue.toLowerCase());
          }
          return option.nomina.toLowerCase().includes(params.inputValue.toLowerCase());
        });
        return filtered;
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