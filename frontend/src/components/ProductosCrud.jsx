import { useEffect, useState } from "react";
import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
} from "../api";

const initialForm = {
  nombre: "",
  marca: "",
  categoria: "detergentes",
  tamano: "pequeno",
  precio: 0,
  activo: true,
};

export default function ProductosCrud() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const load = () => getProductos().then(setList);

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (editId) {
      await updateProducto(editId, form);
      setEditId(null);
    } else {
      await createProducto(form);
    }
    setForm(initialForm);
    await load();
  };

  const onEdit = (p) => {
    setEditId(p.id_producto);
    setForm({
      nombre: p.nombre,
      marca: p.marca,
      categoria: p.categoria,
      tamano: p.tamano,
      precio: Number(p.precio),
      activo: !!p.activo,
    });
  };

  const onDelete = async (id) => {
    if (confirm("¿Eliminar producto?")) {
      await deleteProducto(id).catch((e) => alert(e.message));
      await load();
    }
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h3>Productos</h3>
      <form onSubmit={submit} style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(6, 1fr)" }}>
        <input placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
        <input placeholder="Marca" value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} />
        <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
          <option value="detergentes">detergentes</option>
          <option value="limpieza">limpieza</option>
          <option value="desinfectantes">desinfectantes</option>
          <option value="personal">personal</option>
        </select>
        <select value={form.tamano} onChange={(e) => setForm({ ...form, tamano: e.target.value })}>
          <option value="pequeno">pequeno</option>
          <option value="grande">grande</option>
        </select>
        <input type="number" placeholder="Precio" value={form.precio} onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })} />
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} /> Activo
        </label>
        <button type="submit" style={{ gridColumn: "span 6" }}>
          {editId ? "Actualizar" : "Crear"}
        </button>
      </form>

      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>ID</th><th>Nombre</th><th>Marca</th><th>Categoría</th><th>Tamaño</th><th>Precio</th><th>Activo</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {list.map((p) => (
            <tr key={p.id_producto}>
              <td>{p.id_producto}</td>
              <td>{p.nombre}</td>
              <td>{p.marca}</td>
              <td>{p.categoria}</td>
              <td>{p.tamano}</td>
              <td>{p.precio}</td>
              <td>{p.activo ? "Sí" : "No"}</td>
              <td style={{ display: "flex", gap: 6 }}>
                <button onClick={() => onEdit(p)}>Editar</button>
                <button onClick={() => onDelete(p.id_producto)}>Eliminar</button>
              </td>
            </tr>
          ))}
          {!list.length && (
            <tr><td colSpan="8">Sin productos</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
