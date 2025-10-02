import { useEffect, useState } from "react";
import { getProductos, postPedido, setEstadoPedido, getPedidos } from "../api";

export default function PedidosManager({ idSucursal, onStockChanged }) {
  const [prods, setProds] = useState([]);
  const [id_usuario, setUser] = useState(1); // demo
  const [items, setItems] = useState([{ id_producto: "", cantidad: 1, precio_unitario: 0 }]);
  const [lista, setLista] = useState([]);

  const load = async () => {
    const [peds, ps] = await Promise.all([
      getPedidos({ id_sucursal: idSucursal }),
      getProductos(),
    ]);
    setLista(peds);
    setProds(ps);
  };

  useEffect(() => { if (idSucursal) load().catch(console.error); }, [idSucursal]);

  const setRow = (i, patch) => {
    const copy = items.slice();
    copy[i] = { ...copy[i], ...patch };
    setItems(copy);
  };

  const addRow = () => setItems([...items, { id_producto: "", cantidad: 1, precio_unitario: 0 }]);
  const delRow = (i) => setItems(items.filter((_, idx) => idx !== i));

  const crear = async (e) => {
    e.preventDefault();
    const valid = items.filter((r) => r.id_producto && r.cantidad > 0);
    await postPedido({ id_usuario, id_sucursal: idSucursal, items: valid });
    setItems([{ id_producto: "", cantidad: 1, precio_unitario: 0 }]);
    await load();
  };

  const cambiarEstado = async (id, estado) => {
    await setEstadoPedido(id, estado);
    await load();
    if (estado === "procesado") onStockChanged?.();
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h3>Pedidos (salida de stock)</h3>
      <form onSubmit={crear} style={{ display: "grid", gap: 8 }}>
        <label>
          Usuario ID (demo):
          <input type="number" value={id_usuario} onChange={(e) => setUser(Number(e.target.value))} />
        </label>
        {items.map((r, i) => (
          <div key={i} style={{ display: "flex", gap: 8 }}>
            <select value={r.id_producto} onChange={(e) => setRow(i, { id_producto: Number(e.target.value) })}>
              <option value="">-- producto --</option>
              {prods.map((p) => <option key={p.id_producto} value={p.id_producto}>{p.nombre}</option>)}
            </select>
            <input type="number" min="1" value={r.cantidad} onChange={(e) => setRow(i, { cantidad: Number(e.target.value) })} />
            <input type="number" min="0" value={r.precio_unitario} onChange={(e) => setRow(i, { precio_unitario: Number(e.target.value) })} />
            <button type="button" onClick={() => delRow(i)}>Eliminar</button>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={addRow}>Agregar ítem</button>
          <button type="submit" disabled={!idSucursal}>Crear pedido</button>
        </div>
      </form>

      <table border="1" cellPadding="6">
        <thead>
          <tr><th>ID</th><th>Fecha</th><th>Cliente</th><th>Total</th><th>Estado</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {lista.map((p) => (
            <tr key={p.id_pedido}>
              <td>{p.id_pedido}</td>
              <td>{p.fecha}</td>
              <td>{p.cliente}</td>
              <td>{p.total}</td>
              <td>{p.estado}</td>
              <td style={{ display: "flex", gap: 6 }}>
                <button onClick={() => cambiarEstado(p.id_pedido, "procesado")}>Procesar</button>
                <button onClick={() => cambiarEstado(p.id_pedido, "completado")}>Completar</button>
                <button onClick={() => cambiarEstado(p.id_pedido, "cancelado")}>Cancelar</button>
              </td>
            </tr>
          ))}
          {!lista.length && <tr><td colSpan="6">Sin pedidos</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
