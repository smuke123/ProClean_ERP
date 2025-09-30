import { useEffect, useState } from "react";
import { getSucursales } from "../api";

export default function SelectSucursal({ value, onChange }) {
  const [sucursales, setSucursales] = useState([]);

  useEffect(() => {
    getSucursales().then(setSucursales).catch(console.error);
  }, []);

  return (
    <select value={value ?? ""} onChange={(e) => onChange(Number(e.target.value))}>
      <option value="">-- Selecciona sucursal --</option>
      {sucursales.map((s) => (
        <option key={s.id_sucursal} value={s.id_sucursal}>
          {s.nombre}
        </option>
      ))}
    </select>
  );
}
