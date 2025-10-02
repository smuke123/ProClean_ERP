const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error((await res.json()).error || "Error API");
  return res.json();
}

// Productos
export const getProductos = () => req("/api/products");
export const getProducto = (id) => req(`/api/products/${id}`);
export const createProducto = (data) =>
  req("/api/products", { method: "POST", body: JSON.stringify(data) });
export const updateProducto = (id, data) =>
  req(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteProducto = (id) =>
  req(`/api/products/${id}`, { method: "DELETE" });

// Sucursales / Inventario
export const getSucursales = () => req("/api/sucursales");
export const getInventarioBySucursal = (id) =>
  req(`/api/sucursales/${id}/inventario`);
export const setInventario = (data) =>
  req("/api/inventario/set", { method: "PUT", body: JSON.stringify(data) });

// Compras (entrada de stock)
export const postCompra = (data) =>
  req("/api/compras", { method: "POST", body: JSON.stringify(data) });
export const getCompras = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return req(`/api/compras${qs ? `?${qs}` : ""}`);
};
export const getCompra = (id) => req(`/api/compras/${id}`);

// Pedidos (ventas)
export const postPedido = (data) =>
  req("/api/pedidos", { method: "POST", body: JSON.stringify(data) });
export const setEstadoPedido = (id, estado) =>
  req(`/api/pedidos/${id}/estado`, {
    method: "PUT",
    body: JSON.stringify({ estado }),
  });
export const getPedidos = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return req(`/api/pedidos${qs ? `?${qs}` : ""}`);
};
export const getPedido = (id) => req(`/api/pedidos/${id}`);
