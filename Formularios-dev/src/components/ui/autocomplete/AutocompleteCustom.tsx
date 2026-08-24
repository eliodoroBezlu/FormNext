import React, { useEffect, useState } from "react";
import { TextField, Autocomplete, CircularProgress } from "@mui/material";
import {
  DataSourceType,
  fetchDataBySource,
} from "@/lib/actions/dataSourceService";

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
  const options = !dataSource ? [] : lodaedData;

  useEffect(() => {
    if (!dataSource) {
      return;
    }

    const loadData = async () => {
      setLoading(true);
      console.log("Cargando datasource:", dataSource);
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
    onChange?.(newValue);
  };

  const handleInputChange = (
    _event: React.SyntheticEvent,
    newInputValue: string,
  ) => {
    onChange?.(newInputValue || null);
  };

  return (
    <Autocomplete
      freeSolo
      options={options}
      value={value}
      onChange={handleChange}
      onInputChange={handleInputChange}
      onBlur={onBlur}
      loading={loading}
      disabled={disabled}
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
