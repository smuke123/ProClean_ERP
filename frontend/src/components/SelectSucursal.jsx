import { useEffect, useState } from "react";
import { Dropdown } from 'primereact/dropdown';
import { getSucursales } from "../utils/api.js";

export default function SelectSucursal({ value, onChange }) {
  const [sucursales, setSucursales] = useState([]);

  useEffect(() => {
    getSucursales().then(setSucursales).catch(console.error);
  }, []);

  const opciones = sucursales.map((s) => ({
    label: s.nombre,
    value: s.id_sucursal
  }));

  return (
    <Dropdown 
      value={value || null} 
      onChange={(e) => onChange(e.value || "")} 
      options={opciones}
      placeholder="-- Todas las sucursales --"
      showClear
      className="w-full"
    />
  );
}
