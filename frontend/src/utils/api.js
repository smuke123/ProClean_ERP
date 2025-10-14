const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// Función para obtener el token del localStorage
const getToken = () => localStorage.getItem('token');

// Función para hacer requests con autenticación
async function req(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    headers,
    ...options,
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Error API" }));
    throw new Error(errorData.error || "Error API");
  }
  
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

// Autenticación
export const login = (email, password) =>
  req("/api/auth/login", { 
    method: "POST", 
    body: JSON.stringify({ email, password }) 
  });

export const register = (userData) =>
  req("/api/auth/register", { 
    method: "POST", 
    body: JSON.stringify(userData) 
  });

export const getProfile = () => req("/api/auth/profile");

export const getUsers = () => req("/api/auth/users");

// Funciones de utilidad para el manejo del token
export const setToken = (token) => localStorage.setItem('token', token);
export const removeToken = () => localStorage.removeItem('token');
export const getStoredToken = () => getToken();
