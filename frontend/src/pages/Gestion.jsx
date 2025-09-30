import { useState } from "react";
import SelectSucursal from "../components/SelectSucursal.jsx";
import ProductosCrud from "../components/ProductosCrud.jsx";
import Inventario from "../components/Inventario.jsx";
import ComprasForm from "../components/ComprasForm.jsx";
import PedidosManager from "../components/PedidosManager.jsx";

export default function Gestion() {
  const [sucursal, setSucursal] = useState("");

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <h2>Gestión</h2>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <b>Sucursal:</b> <SelectSucursal value={sucursal} onChange={setSucursal} />
      </div>

      <ProductosCrud />

      <Inventario idSucursal={sucursal} />

      <ComprasForm idSucursal={sucursal} onDone={() => { /* opcional refrescar */ }} />

      <PedidosManager idSucursal={sucursal} onStockChanged={() => { /* opcional refrescar */ }} />
    </div>
  );
}
