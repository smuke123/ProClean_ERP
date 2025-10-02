import { useState, useEffect } from "react";
import SelectSucursal from "../components/SelectSucursal.jsx";
import { getProductos } from "../api";

export default function Gestion() {
  const [sucursal, setSucursal] = useState("");
  const [productos, setProductos] = useState([]);
  const [tipoFormulario, setTipoFormulario] = useState("compras"); // compras | ventas
  
  // Estados para formulario de compras
  const [itemsCompra, setItemsCompra] = useState([]);
  
  // Estados para formulario de ventas
  const [itemsVenta, setItemsVenta] = useState([]);

  useEffect(() => {
    getProductos().then(setProductos).catch(console.error);
  }, []);

  // Funciones para manejar items de compra
  const addItemCompra = () => {
    setItemsCompra([...itemsCompra, { id_producto: "", cantidad: 1, precio_unitario: 0 }]);
  };

  const removeItemCompra = (index) => {
    setItemsCompra(itemsCompra.filter((_, i) => i !== index));
  };

  const updateItemCompra = (index, field, value) => {
    const newItems = [...itemsCompra];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Si cambia el producto, actualizar el precio
    if (field === "id_producto") {
      const producto = productos.find(p => p.id_producto == value);
      newItems[index].precio_unitario = producto ? producto.precio : 0;
    }
    
    setItemsCompra(newItems);
  };

  // Funciones para manejar items de venta
  const addItemVenta = () => {
    setItemsVenta([...itemsVenta, { id_producto: "", cantidad: 1, precio_unitario: 0 }]);
  };

  const removeItemVenta = (index) => {
    setItemsVenta(itemsVenta.filter((_, i) => i !== index));
  };

  const updateItemVenta = (index, field, value) => {
    const newItems = [...itemsVenta];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Si cambia el producto, actualizar el precio
    if (field === "id_producto") {
      const producto = productos.find(p => p.id_producto == value);
      newItems[index].precio_unitario = producto ? producto.precio : 0;
    }
    
    setItemsVenta(newItems);
  };

  const handleComprar = async (e) => {
    e.preventDefault();
    if (!sucursal || itemsCompra.length === 0) {
      alert("Por favor selecciona una sucursal y añade al menos un producto");
      return;
    }

    // Validar que todos los items tengan producto y cantidad
    const itemsInvalidos = itemsCompra.some(item => !item.id_producto || !item.cantidad);
    if (itemsInvalidos) {
      alert("Por favor completa todos los productos y cantidades");
      return;
    }

    try {
      const data = {
        id_proveedor: 1, // Por defecto el primer proveedor
        id_sucursal: sucursal,
        fecha: new Date().toISOString().slice(0, 10),
        items: itemsCompra
      };
      
      const response = await fetch("http://localhost:3000/api/compras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        alert("Compra registrada exitosamente");
        setItemsCompra([]);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      alert(`Error al registrar compra: ${error.message}`);
    }
  };

  const handleVender = async (e) => {
    e.preventDefault();
    if (!sucursal || itemsVenta.length === 0) {
      alert("Por favor selecciona una sucursal y añade al menos un producto");
      return;
    }

    // Validar que todos los items tengan producto y cantidad
    const itemsInvalidos = itemsVenta.some(item => !item.id_producto || !item.cantidad);
    if (itemsInvalidos) {
      alert("Por favor completa todos los productos y cantidades");
      return;
    }

    try {
      const data = {
        id_usuario: 1, // Por defecto el primer usuario admin
        id_sucursal: sucursal,
        fecha: new Date().toISOString().slice(0, 10),
        items: itemsVenta
      };
      
      const response = await fetch("http://localhost:3000/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        const result = await response.json();
        alert("Venta registrada exitosamente");
        setItemsVenta([]);
        
        // Cambiar estado a completado para que se descuente el inventario
        await fetch(`http://localhost:3000/api/pedidos/${result.id_pedido}/estado`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: "completado" })
        });
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      alert(`Error al registrar venta: ${error.message}`);
    }
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
        <form onSubmit={handleComprar} style={{ display: "grid", gap: 12, maxWidth: "600px", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
          <h3>Formulario de Compras</h3>
          
          <div>
            <label>Sucursal:</label>
            <SelectSucursal value={sucursal} onChange={setSucursal} />
          </div>
          
          <div>
            <h4>Productos a Comprar</h4>
            {itemsCompra.map((item, index) => (
              <div key={index} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                <select 
                  value={item.id_producto} 
                  onChange={(e) => updateItemCompra(index, "id_producto", e.target.value)}
                >
                  <option value="">Seleccionar producto</option>
                  {productos.map((p) => (
                    <option key={p.id_producto} value={p.id_producto}>
                      {p.nombre} - ${p.precio}
                    </option>
                  ))}
                </select>
                
                <input 
                  type="number" 
                  value={item.cantidad} 
                  onChange={(e) => updateItemCompra(index, "cantidad", parseInt(e.target.value) || 0)}
                  min="1"
                  placeholder="Cantidad"
                />
                
                <span>${item.precio_unitario}</span>
                
                <button 
                  type="button" 
                  onClick={() => removeItemCompra(index)}
                  style={{ padding: "4px 8px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px" }}
                >
                  Eliminar
                </button>
              </div>
            ))}
            
            <button 
              type="button" 
              onClick={addItemCompra}
              style={{ padding: "8px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px", width: "fit-content" }}
            >
              + Añadir Producto
            </button>
          </div>
          
          <div style={{ fontWeight: "bold", fontSize: "16px" }}>
            Total: ${itemsCompra.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0).toLocaleString()}
          </div>
          
          <button type="submit" style={{ padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px" }}>
            Registrar Compra
          </button>
        </form>
      ) : (
        <form onSubmit={handleVender} style={{ display: "grid", gap: 12, maxWidth: "600px", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
          <h3>Formulario de Ventas</h3>
          
          <div>
            <label>Sucursal:</label>
            <SelectSucursal value={sucursal} onChange={setSucursal} />
          </div>
          
          <div>
            <h4>Productos a Vender</h4>
            {itemsVenta.map((item, index) => (
              <div key={index} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                <select 
                  value={item.id_producto} 
                  onChange={(e) => updateItemVenta(index, "id_producto", e.target.value)}
                >
                  <option value="">Seleccionar producto</option>
                  {productos.map((p) => (
                    <option key={p.id_producto} value={p.id_producto}>
                      {p.nombre} - ${p.precio}
                    </option>
                  ))}
                </select>
                
                <input 
                  type="number" 
                  value={item.cantidad} 
                  onChange={(e) => updateItemVenta(index, "cantidad", parseInt(e.target.value) || 0)}
                  min="1"
                  placeholder="Cantidad"
                />
                
                <span>${item.precio_unitario}</span>
                
                <button 
                  type="button" 
                  onClick={() => removeItemVenta(index)}
                  style={{ padding: "4px 8px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px" }}
                >
                  Eliminar
                </button>
              </div>
            ))}
            
            <button 
              type="button" 
              onClick={addItemVenta}
              style={{ padding: "8px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px", width: "fit-content" }}
            >
              + Añadir Producto
            </button>
          </div>
          
          <div style={{ fontWeight: "bold", fontSize: "16px" }}>
            Total: ${itemsVenta.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0).toLocaleString()}
          </div>
          
          <button type="submit" style={{ padding: "10px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px" }}>
            Registrar Venta
          </button>
        </form>
      )}
    </div>
  );
}
