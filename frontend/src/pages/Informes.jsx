import { useEffect, useState } from "react";
import SelectSucursal from "../components/SelectSucursal.jsx";
import { getPedidos, getCompras } from "../api";

export default function Informes() {
  const [tab, setTab] = useState("ventas"); // ventas | compras
  const [sucursal, setSucursal] = useState("");
  const [estado, setEstado] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [agrupar, setAgrupar] = useState(""); // dia | producto | estado
  const [rows, setRows] = useState([]);

  const load = async () => {
    const params = {};
    if (sucursal) params.id_sucursal = sucursal;
    if (estado) params.estado = estado;
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    if (agrupar) params.agrupar = agrupar;
    const data = tab === "ventas" ? await getPedidos(params) : await getCompras(params);
    setRows(data);
  };

  useEffect(() => { load().catch(console.error); }, [tab]); // carga inicial por tab

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h2>Informes</h2>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setTab("ventas")} disabled={tab === "ventas"}>Ventas (Pedidos)</button>
        <button onClick={() => setTab("compras")} disabled={tab === "compras"}>Compras</button>
      </div>

      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(5, 1fr)" }}>
        <div style={{ gridColumn: "span 2" }}>
          <label>Sucursal</label>
          <SelectSucursal value={sucursal} onChange={setSucursal} />
        </div>
        <div>
          <label>Estado</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">(todos)</option>
            <option value="pendiente">pendiente</option>
            <option value="procesado">procesado</option>
            <option value="completado">completado</option>
            <option value="cancelado">cancelado</option>
          </select>
        </div>
        <div>
          <label>Desde</label>
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div>
          <label>Hasta</label>
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
        <div>
          <label>Agrupar</label>
          <select value={agrupar} onChange={(e) => setAgrupar(e.target.value)}>
            <option value="">(ninguno)</option>
            <option value="dia">día</option>
            <option value="producto">producto</option>
            <option value="estado">estado</option>
          </select>
        </div>
        <div style={{ gridColumn: "span 5" }}>
          <button onClick={load}>Aplicar filtros</button>
        </div>
      </div>

      <div>
        <h4>Resultados ({rows.length})</h4>
        <pre style={{ whiteSpace: "pre-wrap", background: "#f6f6f6", padding: 12 }}>
{JSON.stringify(rows, null, 2)}
        </pre>
      </div>
    </div>
  );
}
