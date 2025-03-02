import { useState } from "react";
import { RadioGroup, FormControlLabel, Radio } from "@mui/material";


export default function BooleanRadioGroup() {
  const [seleccion, setSeleccion] = useState({
    SI: false,
    NO: false,
    NA: false,
  });

  const handleChange = (valor: "SI" | "NO" | "NA") => {
    setSeleccion({
      SI: valor === "SI",
      NO: valor === "NO",
      NA: valor === "NA",
    });
  };
  return (
    <div>
      <RadioGroup row>
        <FormControlLabel
          value="SI"
          control={
            <Radio checked={seleccion.SI} onChange={() => handleChange("SI")} />
          }
          label="Sí"
        />
        <FormControlLabel
          value="NO"
          control={
            <Radio checked={seleccion.NO} onChange={() => handleChange("NO")} />
          }
          label="No"
        />
        <FormControlLabel
          value="NA"
          control={
            <Radio checked={seleccion.NA} onChange={() => handleChange("NA")} />
          }
          label="No aplica"
        />
      </RadioGroup>
    </div>
  );
}
