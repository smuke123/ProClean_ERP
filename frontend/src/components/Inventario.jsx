import { useEffect, useState } from "react";
import { getInventarioBySucursal, setInventario, getProductos } from "../utils/api.js";

export default function Inventario({ idSucursal }) {
  const [items, setItems] = useState([]);
  const [productos, setProductos] = useState([]);
  const [nuevo, setNuevo] = useState({ id_producto: "", cantidad: 0, stock_minimo: 5 });

  const load = async () => {
    if (!idSucursal) return;
    const [inv, prods] = await Promise.all([
      getInventarioBySucursal(idSucursal),
      getProductos(),
    ]);
    setItems(inv);
    setProductos(prods);
  };

  useEffect(() => { load().catch(console.error); }, [idSucursal]);

  const setQty = async (id_producto, cantidad, stock_minimo) => {
    await setInventario({ id_sucursal: idSucursal, id_producto, cantidad, stock_minimo });
    await load();
  };

  const addNew = async (e) => {
    e.preventDefault();
    if (!nuevo.id_producto) return;
    await setQty(Number(nuevo.id_producto), Number(nuevo.cantidad), Number(nuevo.stock_minimo));
    setNuevo({ id_producto: "", cantidad: 0, stock_minimo: 5 });
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h3>Inventario sucursal {idSucursal || "-"}</h3>

      <form onSubmit={addNew} style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <select value={nuevo.id_producto} onChange={(e) => setNuevo({ ...nuevo, id_producto: e.target.value })}>
          <option value="">-- producto --</option>
          {productos.map((p) => (
            <option key={p.id_producto} value={p.id_producto}>{p.nombre}</option>
          ))}
        </select>
        <input type="number" min="0" placeholder="Cantidad" value={nuevo.cantidad} onChange={(e) => setNuevo({ ...nuevo, cantidad: e.target.value })} />
        <input type="number" min="0" placeholder="Stock mínimo" value={nuevo.stock_minimo} onChange={(e) => setNuevo({ ...nuevo, stock_minimo: e.target.value })} />
        <button type="submit">Guardar</button>
      </form>

      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Producto</th><th>Cantidad</th><th>Stock mín.</th><th>Actualizar</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id_inventario}>
              <td>{it.nombre}</td>
              <td>
                <input type="number" defaultValue={it.cantidad}
                  onBlur={(e) => setQty(it.id_producto, Number(e.target.value), it.stock_minimo)} />
              </td>
              <td>
                <input type="number" defaultValue={it.stock_minimo}
                  onBlur={(e) => setQty(it.id_producto, it.cantidad, Number(e.target.value))} />
              </td>
              <td><button onClick={() => setQty(it.id_producto, it.cantidad, it.stock_minimo)}>Refrescar</button></td>
            </tr>
          ))}
          {!items.length && <tr><td colSpan="4">Sin inventario</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
