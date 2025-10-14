import { useEffect, useState } from "react";
import { getProductos, postCompra } from "../../utils/api.js";
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import Card from '../ui/Card.jsx';

export default function ComprasForm({ idSucursal, onDone }) {
  const [prods, setProds] = useState([]);
  const [id_proveedor, setProveedor] = useState(1); // demo
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState([{ id_producto: "", cantidad: 1, precio_unitario: 0 }]);

  useEffect(() => { 
    getProductos().then(setProds).catch(console.error); 
  }, []);

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
    await postCompra({ id_proveedor, id_sucursal: idSucursal, fecha, items: valid });
    setItems([{ id_producto: "", cantidad: 1, precio_unitario: 0 }]);
    onDone?.();
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        Registrar compra (entrada de stock)
      </h3>
      
      <form onSubmit={submit} className="space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Proveedor ID (demo)"
            type="number"
            value={id_proveedor}
            onChange={(e) => setProveedor(Number(e.target.value))}
          />
          <Input
            label="Fecha"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>

        {/* Items de compra */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-700">Productos</h4>
          {items.map((r, i) => (
            <Card key={i} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Producto
                  </label>
                  <select 
                    value={r.id_producto} 
                    onChange={(e) => setRow(i, { id_producto: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                  >
                    <option value="">-- Seleccionar producto --</option>
                    {prods.map((p) => (
                      <option key={p.id_producto} value={p.id_producto}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                
                <Input
                  label="Cantidad"
                  type="number"
                  min="1"
                  value={r.cantidad}
                  onChange={(e) => setRow(i, { cantidad: Number(e.target.value) })}
                />
                
                <Input
                  label="Precio Unitario"
                  type="number"
                  min="0"
                  step="0.01"
                  value={r.precio_unitario}
                  onChange={(e) => setRow(i, { precio_unitario: Number(e.target.value) })}
                />
                
                <Button
                  type="button"
                  variant="danger"
                  size="md"
                  onClick={() => delRow(i)}
                  disabled={items.length === 1}
                >
                  Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={addRow}
          >
            + Agregar Producto
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            className="ml-auto"
          >
            Registrar Compra
          </Button>
        </div>
      </form>
    </Card>
  );
}
