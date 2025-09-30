import { useEffect, useState } from "react";
import { getProductos, postCompra } from "../api";

export default function ComprasForm({ idSucursal, onDone }) {
  const [prods, setProds] = useState([]);
  const [id_proveedor, setProveedor] = useState(1); // demo
  const [items, setItems] = useState([{ id_producto: "", cantidad: 1, precio_unitario: 0 }]);

  useEffect(() => { getProductos().then(setProds).catch(console.error); }, []);

  const addRow = () => setItems([...items, { id_producto: "", cantidad: 1, precio_unitario: 0 }]);
  const setRow = (i, patch) => {
    const copy = items.slice();
    copy[i] = { ...copy[i], ...patch };
    setItems(copy);
  };
  const delRow = (i) => setItems(items.filter((_, idx) => idx !== i));

  const submit = async (e) => {
    e.preventDefault();
    const valid = items.filter((r) => r.id_producto && r.cantidad > 0);
    await postCompra({ id_proveedor, id_sucursal: idSucursal, items: valid });
    setItems([{ id_producto: "", cantidad: 1, precio_unitario: 0 }]);
    onDone?.();
  };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <h3>Registrar compra (entrada de stock)</h3>
      <form onSubmit={submit} style={{ display: "grid", gap: 8 }}>
        <label>
          Proveedor ID (demo):
          <input type="number" value={id_proveedor} onChange={(e) => setProveedor(Number(e.target.value))} />
        </label>
        {items.map((r, i) => (
          <div key={i} style={{ display: "flex", gap: 8 }}>
            <select value={r.id_producto} onChange={(e) => setRow(i, { id_producto: Number(e.target.value) })}>
              <option value="">-- producto --</option>
              {prods.map((p) => <option key={p.id_producto} value={p.id_producto}>{p.nombre} ({p.tamano})</option>)}
            </select>
            <input type="number" min="1" value={r.cantidad} onChange={(e) => setRow(i, { cantidad: Number(e.target.value) })} />
            <input type="number" min="0" value={r.precio_unitario} onChange={(e) => setRow(i, { precio_unitario: Number(e.target.value) })} />
            <button type="button" onClick={() => delRow(i)}>Eliminar</button>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={addRow}>Agregar ítem</button>
          <button type="submit" disabled={!idSucursal}>Guardar compra</button>
        </div>
      </form>
    </div>
  );
}
