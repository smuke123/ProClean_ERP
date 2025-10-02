import { useEffect, useState } from "react";
import SelectSucursal from "../components/SelectSucursal.jsx";
import { getPedidos, getCompras } from "../api";

export default function Informes() {
  const [tipoTransaccion, setTipoTransaccion] = useState("ventas"); // ventas | compras
  const [sucursal, setSucursal] = useState("");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const load = async () => {
      const params = {};
      if (sucursal) params.id_sucursal = sucursal;
      const data = tipoTransaccion === "ventas" ? await getPedidos(params) : await getCompras(params);
      setRows(data);
    };
    load().catch(console.error);
  }, [tipoTransaccion, sucursal]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h2>Informes</h2>

      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr", maxWidth: "400px" }}>
        <div>
          <label>Tipo de Transacción</label>
          <select value={tipoTransaccion} onChange={(e) => setTipoTransaccion(e.target.value)}>
            <option value="ventas">Ventas</option>
            <option value="compras">Compras</option>
          </select>
        </div>
        <div>
          <label>Sucursal</label>
          <SelectSucursal value={sucursal} onChange={setSucursal} />
        </div>
      </div>

      <div>
        <h4>Resultados ({rows.length})</h4>
        {rows.length > 0 ? (
          <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#f5f5f5" }}>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Pedido/Compra</th>
                <th>Productos</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={tipoTransaccion === "ventas" ? row.id_pedido : row.id_compra}>
                  <td>{tipoTransaccion === "ventas" ? row.id_pedido : row.id_compra}</td>
                  <td>{row.fecha}</td>
                  <td>{tipoTransaccion === "ventas" ? `Pedido #${row.id_pedido}` : `Compra #${row.id_compra}`}</td>
                  <td>{row.productos || "Ver detalles"}</td>
                  <td>${row.total?.toLocaleString()}</td>
                  <td>{row.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay registros para los filtros seleccionados</p>
        )}
      </div>
    </div>
  );
}
