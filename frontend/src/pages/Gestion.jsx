import { useState, useEffect } from "react";
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Card } from 'primereact/card';
import SelectSucursal from "../components/SelectSucursal.jsx";
import { getProductos } from "../utils/api.js";

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
    <div className="px-4 md:px-6 lg:px-8 py-6 max-w-[1600px] mx-auto">
      <div className="grid gap-8">
        <h2 className="text-2xl font-semibold">Gestión Administrador</h2>
      
      {/* Selector de Tipo de Transacción */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-end gap-3">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-2 font-semibold">Tipo de Transacción</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={`px-4 py-2 rounded-lg border font-semibold transition-all ${
                  tipoFormulario === 'compras' 
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                    : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setTipoFormulario('compras')}
              >
                <i className="pi pi-inbox mr-2"></i>
                Compras
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-lg border font-semibold transition-all ${
                  tipoFormulario === 'ventas' 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                    : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setTipoFormulario('ventas')}
              >
                <i className="pi pi-shopping-cart mr-2"></i>
                Ventas
              </button>
            </div>
          </div>
        </div>
      </div>

      {tipoFormulario === "compras" ? (
        <Card className="shadow-lg">
          <form onSubmit={handleComprar} className="grid gap-6">
            <div className="flex items-center gap-3">
              <i className="pi pi-inbox text-3xl text-emerald-600"></i>
              <h3 className="text-xl font-semibold">Formulario de Compras</h3>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600 font-semibold">Sucursal:</label>
              <SelectSucursal value={sucursal} onChange={setSucursal} />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-lg">Productos a Comprar</h4>
                <Button 
                  type="button" 
                  label="Añadir Producto" 
                  icon="pi pi-plus" 
                  onClick={addItemCompra}
                  severity="success"
                  outlined
                />
              </div>
              
              {itemsCompra.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  <i className="pi pi-inbox text-4xl mb-2 block"></i>
                  <p>No hay productos agregados. Haz clic en "Añadir Producto" para comenzar.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {itemsCompra.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-[2fr_120px_100px_auto] gap-3 items-end p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-600 font-semibold">Producto</label>
                        <Dropdown 
                          value={item.id_producto} 
                          onChange={(e) => updateItemCompra(index, "id_producto", e.value)}
                          options={productos.map(p => ({ 
                            label: `${p.nombre} - $${p.precio}`, 
                            value: p.id_producto 
                          }))}
                          placeholder="Seleccionar producto"
                          className="w-full"
                          filter
                        />
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-600 font-semibold">Cantidad</label>
                        <InputNumber 
                          value={item.cantidad} 
                          onValueChange={(e) => updateItemCompra(index, "cantidad", e.value || 0)}
                          min={1}
                          showButtons
                          buttonLayout="horizontal"
                          decrementButtonClassName="p-button-danger"
                          incrementButtonClassName="p-button-success"
                          incrementButtonIcon="pi pi-plus"
                          decrementButtonIcon="pi pi-minus"
                          className="w-full"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-600 font-semibold">Precio Unit.</label>
                        <div className="h-[42px] flex items-center px-3 bg-white rounded border border-gray-300">
                          <span className="text-sm font-semibold">${item.precio_unitario}</span>
                        </div>
                      </div>
                      
                      <Button 
                        type="button" 
                        icon="pi pi-trash" 
                        onClick={() => removeItemCompra(index)}
                        severity="danger"
                        outlined
                        tooltip="Eliminar"
                        tooltipOptions={{ position: 'top' }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {itemsCompra.length > 0 && (
              <>
                <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-200">
                  <span className="text-lg font-semibold text-gray-700">Total:</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    ${itemsCompra.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                
                <Button 
                  type="submit" 
                  label="Registrar Compra" 
                  icon="pi pi-check" 
                  severity="success"
                  size="large"
                  className="w-full md:w-auto"
                />
              </>
            )}
          </form>
        </Card>
      ) : (
        <Card className="shadow-lg">
          <form onSubmit={handleVender} className="grid gap-6">
            <div className="flex items-center gap-3">
              <i className="pi pi-shopping-cart text-3xl text-blue-600"></i>
              <h3 className="text-xl font-semibold">Formulario de Ventas</h3>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600 font-semibold">Sucursal:</label>
              <SelectSucursal value={sucursal} onChange={setSucursal} />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-lg">Productos a Vender</h4>
                <Button 
                  type="button" 
                  label="Añadir Producto" 
                  icon="pi pi-plus" 
                  onClick={addItemVenta}
                  severity="info"
                  outlined
                />
              </div>
              
              {itemsVenta.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  <i className="pi pi-shopping-cart text-4xl mb-2 block"></i>
                  <p>No hay productos agregados. Haz clic en "Añadir Producto" para comenzar.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {itemsVenta.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-[2fr_120px_100px_auto] gap-3 items-end p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-600 font-semibold">Producto</label>
                        <Dropdown 
                          value={item.id_producto} 
                          onChange={(e) => updateItemVenta(index, "id_producto", e.value)}
                          options={productos.map(p => ({ 
                            label: `${p.nombre} - $${p.precio}`, 
                            value: p.id_producto 
                          }))}
                          placeholder="Seleccionar producto"
                          className="w-full"
                          filter
                        />
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-600 font-semibold">Cantidad</label>
                        <InputNumber 
                          value={item.cantidad} 
                          onValueChange={(e) => updateItemVenta(index, "cantidad", e.value || 0)}
                          min={1}
                          showButtons
                          buttonLayout="horizontal"
                          decrementButtonClassName="p-button-danger"
                          incrementButtonClassName="p-button-success"
                          incrementButtonIcon="pi pi-plus"
                          decrementButtonIcon="pi pi-minus"
                          className="w-full"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-600 font-semibold">Precio Unit.</label>
                        <div className="h-[42px] flex items-center px-3 bg-white rounded border border-gray-300">
                          <span className="text-sm font-semibold">${item.precio_unitario}</span>
                        </div>
                      </div>
                      
                      <Button 
                        type="button" 
                        icon="pi pi-trash" 
                        onClick={() => removeItemVenta(index)}
                        severity="danger"
                        outlined
                        tooltip="Eliminar"
                        tooltipOptions={{ position: 'top' }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {itemsVenta.length > 0 && (
              <>
                <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-200">
                  <span className="text-lg font-semibold text-gray-700">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${itemsVenta.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                
                <Button 
                  type="submit" 
                  label="Registrar Venta" 
                  icon="pi pi-check" 
                  severity="info"
                  size="large"
                  className="w-full md:w-auto"
                />
              </>
            )}
          </form>
        </Card>
      )}
      </div>
    </div>
  );
}
