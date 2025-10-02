import { useEffect, useState } from "react";
import { getProductos, postPedido, setEstadoPedido } from "../api";

export default function PedidosForm({ idSucursal, onDone }) {
  const [prods, setProds] = useState([]);
  const [id_usuario, setUser] = useState(1); // demo
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState([{ id_producto: "", cantidad: 1, precio_unitario: 0 }]);

  useEffect(() => { getProductos().then(setProds).catch(console.error); }, []);

  const setRow = (i, patch) => {
    const copy = items.slice();
    copy[i] = { ...copy[i], ...patch };
    setItems(copy);
  };

  const addRow = () => setItems([...items, { id_producto: "", cantidad: 1, precio_unitario: 0 }]);
  const delRow = (i) => setItems(items.filter((_, idx) => idx !== i));

  const submit = async (e) => {
    e.preventDefault();
    const valid = items.filter((r) => r.id_producto && r.cantidad > 0);
    if (!valid.length) return;
    
    try {
      // Crear pedido
      const { id_pedido } = await postPedido({ 
        id_usuario, 
        id_sucursal: idSucursal, 
        fecha, 
        items: valid 
      });
      
      // Procesar automáticamente (descuenta stock)
      await setEstadoPedido(id_pedido, "procesado");
      
      setItems([{ id_producto: "", cantidad: 1, precio_unitario: 0 }]);
      onDone?.();
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <h3>Registrar venta (salida de stock)</h3>
      <form onSubmit={submit} style={{ display: "grid", gap: 8 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <label>
            Usuario ID (demo):
            <input type="number" value={id_usuario} onChange={(e) => setUser(Number(e.target.value))} />
          </label>
          <label>
            Fecha:
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </label>
        </div>
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
          <button type="submit" disabled={!idSucursal}>Registrar venta</button>
        </div>
      </form>
    </div>
  );
}
