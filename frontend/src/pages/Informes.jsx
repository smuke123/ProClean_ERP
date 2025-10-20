import { useEffect, useState } from "react";
import SelectSucursal from "../components/SelectSucursal.jsx";
import { getPedidos, getCompras, getCompra, getPedido } from "../utils/api.js";

export default function Informes() {
  const [tipoTransaccion, setTipoTransaccion] = useState("ventas"); 
  const [sucursal, setSucursal] = useState("");
  const [rows, setRows] = useState([]);
  const [detalle, setDetalle] = useState(null); // { tipo, cabecera, items }

  useEffect(() => {
    const load = async () => {
      const params = {};
      if (sucursal) params.id_sucursal = sucursal;
      const data = tipoTransaccion === "ventas" ? await getPedidos(params) : await getCompras(params);
      setRows(data);
    };
    load().catch(console.error);
  }, [tipoTransaccion, sucursal]);

  const abrirDetalle = async (row) => {
    try {
      if (tipoTransaccion === "ventas") {
        const data = await getPedido(row.id_pedido);
        setDetalle({ tipo: "pedido", cabecera: data.pedido, items: data.items });
      } else {
        const data = await getCompra(row.id_compra);
        setDetalle({ tipo: "compra", cabecera: data.compra, items: data.items });
      }
    } catch (e) {
      alert("Error al cargar detalles");
      console.error(e);
    }
  };
  const cerrarDetalle = () => { setDetalle(null); };

  return (
    <div className="grid gap-4">
      <h2 className="text-2xl font-semibold">Informes</h2>

      <div className="flex flex-col md:flex-row md:items-end gap-3 max-w-2xl">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`px-3 py-2 rounded border ${tipoTransaccion === 'ventas' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'}`}
            onClick={() => setTipoTransaccion('ventas')}
          >
            Ventas
          </button>
          <button
            type="button"
            className={`px-3 py-2 rounded border ${tipoTransaccion === 'compras' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'}`}
            onClick={() => setTipoTransaccion('compras')}
          >
            Compras
          </button>
        </div>
        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-1">Sucursal</label>
          <SelectSucursal value={sucursal} onChange={setSucursal} />
        </div>
      </div>

      <div>
        <h4 className="text-lg font-medium">Resultados ({rows.length})</h4>
        {rows.length > 0 ? (
          <table className="w-full border text-sm rounded-md overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="border-b p-2 text-left">ID</th>
                <th className="border-b p-2 text-left">Fecha</th>
                <th className="border-b p-2 text-left">Pedido/Compra</th>
                <th className="border-b p-2 text-left">Productos</th>
                <th className="border-b p-2 text-left">Total</th>
                <th className="border-b p-2 text-left">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row, idx) => (
                <tr key={tipoTransaccion === "ventas" ? row.id_pedido : row.id_compra} className={idx % 2 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-2">{tipoTransaccion === "ventas" ? row.id_pedido : row.id_compra}</td>
                  <td className="p-2">{row.fecha}</td>
                  <td className="p-2">{tipoTransaccion === "ventas" ? `Pedido #${row.id_pedido}` : `Compra #${row.id_compra}`}</td>
                  <td className="p-2">
                    {row.productos ? (
                      <span>{row.productos}</span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => abrirDetalle(row)}
                      className="ml-2 px-2 py-1 rounded border border-blue-600 text-blue-700 hover:bg-blue-50"
                    >
                      Ver detalles
                    </button>
                  </td>
                  <td className="p-2">${row.total?.toLocaleString()}</td>
                  <td className="p-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${row.estado === 'completado' || row.estado === 'pagada' ? 'bg-green-100 text-green-700' : row.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'}`}>
                      {row.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-600">No hay registros para los filtros seleccionados</p>
        )}
      </div>

      {detalle && (
        <div className="mt-4">
          <div className="bg-white border rounded-lg shadow">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="m-0 text-lg font-semibold">
                {detalle.tipo === "pedido" ? `Detalle Pedido #${detalle.cabecera.id_pedido}` : `Detalle Compra #${detalle.cabecera.id_compra}`}
              </h3>
              <button className="px-2 py-1 border rounded hover:bg-gray-50" onClick={cerrarDetalle}>Cerrar</button>
            </div>
            <div className="px-4 py-3 grid gap-1 text-sm">
              <div><b>Fecha:</b> {detalle.cabecera.fecha}</div>
              <div><b>Sucursal:</b> {detalle.cabecera.sucursal || detalle.cabecera.id_sucursal}</div>
              {detalle.tipo === "pedido" ? (
                <div><b>Cliente:</b> {detalle.cabecera.cliente || detalle.cabecera.id_usuario}</div>
              ) : (
                <div><b>Proveedor:</b> {detalle.cabecera.proveedor || detalle.cabecera.id_proveedor}</div>
              )}
              <div><b>Total:</b> ${detalle.cabecera.total?.toLocaleString()}</div>
            </div>
            <div className="px-4 pb-4">
              <table className="w-full border text-sm rounded overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border-b p-2 text-left">Producto</th>
                    <th className="border-b p-2 text-left">Cantidad</th>
                    <th className="border-b p-2 text-left">Precio Unitario</th>
                    <th className="border-b p-2 text-left">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {detalle.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2">{it.nombre}</td>
                      <td className="p-2">{it.cantidad}</td>
                      <td className="p-2">${Number(it.precio_unitario).toLocaleString()}</td>
                      <td className="p-2">${Number(it.subtotal).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
