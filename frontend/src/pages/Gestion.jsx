import { useState, useEffect } from "react";
import SelectSucursal from "../components/SelectSucursal.jsx";
import { getProductos } from "../api";

export default function Gestion() {
  const [sucursal, setSucursal] = useState("");
  const [productos, setProductos] = useState([]);
  const [tipoFormulario, setTipoFormulario] = useState("compras"); // compras | ventas
  
  // Estados para formulario de compras
  const [compraProducto, setCompraProducto] = useState("");
  const [compraCantidad, setCompraCantidad] = useState("");
  
  // Estados para formulario de ventas
  const [ventaProducto, setVentaProducto] = useState("");
  const [ventaCantidad, setVentaCantidad] = useState("");

  useEffect(() => {
    getProductos().then(setProductos).catch(console.error);
  }, []);

  const handleComprar = async (e) => {
    e.preventDefault();
    if (!sucursal || !compraProducto || !compraCantidad) {
      alert("Por favor completa todos los campos");
      return;
    }
    // Aquí iría la lógica para procesar la compra
    console.log("Compra:", { sucursal, producto: compraProducto, cantidad: compraCantidad });
    alert("Compra registrada exitosamente");
    setCompraProducto("");
    setCompraCantidad("");
  };

  const handleVender = async (e) => {
    e.preventDefault();
    if (!sucursal || !ventaProducto || !ventaCantidad) {
      alert("Por favor completa todos los campos");
      return;
    }
    // Aquí iría la lógica para procesar la venta
    console.log("Venta:", { sucursal, producto: ventaProducto, cantidad: ventaCantidad });
    alert("Venta registrada exitosamente");
    setVentaProducto("");
    setVentaCantidad("");
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <h2>Gestión Administrador</h2>
      
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <b>Tipo de Transacción:</b>
        <select value={tipoFormulario} onChange={(e) => setTipoFormulario(e.target.value)}>
          <option value="compras">Compras</option>
          <option value="ventas">Ventas</option>
        </select>
      </div>

      {tipoFormulario === "compras" ? (
        <form onSubmit={handleComprar} style={{ display: "grid", gap: 12, maxWidth: "400px", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
          <h3>Formulario de Compras</h3>
          
          <div>
            <label>Sucursal:</label>
            <SelectSucursal value={sucursal} onChange={setSucursal} />
          </div>
          
          <div>
            <label>Producto:</label>
            <select value={compraProducto} onChange={(e) => setCompraProducto(e.target.value)}>
              <option value="">Seleccionar producto</option>
              {productos.map((p) => (
                <option key={p.id_producto} value={p.id_producto}>
                  {p.nombre} - ${p.precio}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label>Cantidad:</label>
            <input 
              type="number" 
              value={compraCantidad} 
              onChange={(e) => setCompraCantidad(e.target.value)}
              min="1"
              placeholder="Cantidad a comprar"
            />
          </div>
          
          <button type="submit" style={{ padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px" }}>
            Registrar Compra
          </button>
        </form>
      ) : (
        <form onSubmit={handleVender} style={{ display: "grid", gap: 12, maxWidth: "400px", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
          <h3>Formulario de Ventas</h3>
          
          <div>
            <label>Sucursal:</label>
            <SelectSucursal value={sucursal} onChange={setSucursal} />
          </div>
          
          <div>
            <label>Producto:</label>
            <select value={ventaProducto} onChange={(e) => setVentaProducto(e.target.value)}>
              <option value="">Seleccionar producto</option>
              {productos.map((p) => (
                <option key={p.id_producto} value={p.id_producto}>
                  {p.nombre} - ${p.precio}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label>Cantidad:</label>
            <input 
              type="number" 
              value={ventaCantidad} 
              onChange={(e) => setVentaCantidad(e.target.value)}
              min="1"
              placeholder="Cantidad a vender"
            />
          </div>
          
          <button type="submit" style={{ padding: "10px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px" }}>
            Registrar Venta
          </button>
        </form>
      )}
    </div>
  );
}
