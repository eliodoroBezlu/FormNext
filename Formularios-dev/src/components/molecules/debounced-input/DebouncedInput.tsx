// components/molecules/debounced-input/DebouncedInput.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { TextField, TextFieldProps } from '@mui/material';

interface DebouncedInputProps extends Omit<TextFieldProps, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  delay?: number;
}

export const DebouncedInput: React.FC<DebouncedInputProps> = ({
  value,
  onChange,
  delay = 300,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value);

  // Sincronizar el valor interno cuando el valor externo cambia
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Debounce del onChange
  useEffect(() => {
    const timer = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [internalValue, delay, onChange, value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
  }, []);

  return (
    <TextField
      {...props}
      value={internalValue}
      onChange={handleChange}
    />
  );
};

// Hook personalizado para debounce genérico
export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};