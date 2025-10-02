import { useEffect, useState } from "react";
import SelectSucursal from "../components/SelectSucursal.jsx";
import { getPedidos, getCompras, getCompra, getPedido } from "../api";

export default function Informes() {
  const [tipoTransaccion, setTipoTransaccion] = useState("ventas"); 
  const [sucursal, setSucursal] = useState("");
  const [rows, setRows] = useState([]);
  const [detalle, setDetalle] = useState(null); 
  const [modalOpen, setModalOpen] = useState(false);

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
      setModalOpen(true);
    } catch (e) {
      alert("Error al cargar detalles");
      console.error(e);
    }
  };

  const cerrarModal = () => { setModalOpen(false); setDetalle(null); };

  return (
    <div className="grid gap-4">
      <h2 className="text-2xl font-semibold">Informes</h2>

      <div className="grid gap-2 grid-cols-2 max-w-md">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">Tipo de Transacción</label>
          <select className="border rounded px-2 py-1" value={tipoTransaccion} onChange={(e) => setTipoTransaccion(e.target.value)}>
            <option value="ventas">Ventas</option>
            <option value="compras">Compras</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">Sucursal</label>
          <SelectSucursal value={sucursal} onChange={setSucursal} />
        </div>
      </div>

      <div>
        <h4 className="text-lg font-medium">Resultados ({rows.length})</h4>
        {rows.length > 0 ? (
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 text-left">ID</th>
                <th className="border p-2 text-left">Fecha</th>
                <th className="border p-2 text-left">Pedido/Compra</th>
                <th className="border p-2 text-left">Productos</th>
                <th className="border p-2 text-left">Total</th>
                <th className="border p-2 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={tipoTransaccion === "ventas" ? row.id_pedido : row.id_compra}>
                  <td className="border p-2">{tipoTransaccion === "ventas" ? row.id_pedido : row.id_compra}</td>
                  <td className="border p-2">{row.fecha}</td>
                  <td className="border p-2">{tipoTransaccion === "ventas" ? `Pedido #${row.id_pedido}` : `Compra #${row.id_compra}`}</td>
                  <td className="border p-2">
                    {row.productos ? (
                      <span>{row.productos}</span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => abrirDetalle(row)}
                      className="ml-2 px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
                    >
                      Ver detalles
                    </button>
                  </td>
                  <td className="border p-2">${row.total?.toLocaleString()}</td>
                  <td className="border p-2">{row.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-600">No hay registros para los filtros seleccionados</p>
        )}
      </div>

      {modalOpen && detalle && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white p-4 rounded-lg min-w-[320px] max-w-[800px] w-[90%]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="m-0 text-xl font-semibold">
                {detalle.tipo === "pedido" ? `Detalle Pedido #${detalle.cabecera.id_pedido}` : `Detalle Compra #${detalle.cabecera.id_compra}`}
              </h3>
              <button className="px-2 py-1 border rounded" onClick={cerrarModal}>Cerrar</button>
            </div>

            <div className="mb-3 space-y-1 text-sm">
              <div><b>Fecha:</b> {detalle.cabecera.fecha}</div>
              <div><b>Sucursal:</b> {detalle.cabecera.id_sucursal}</div>
              {detalle.tipo === "pedido" ? (
                <div><b>Cliente:</b> {detalle.cabecera.id_usuario}</div>
              ) : (
                <div><b>Proveedor:</b> {detalle.cabecera.id_proveedor}</div>
              )}
              <div><b>Total:</b> ${detalle.cabecera.total?.toLocaleString()}</div>
            </div>

            <table className="w-full border-collapse text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2 text-left">Producto</th>
                  <th className="border p-2 text-left">Cantidad</th>
                  <th className="border p-2 text-left">Precio Unitario</th>
                  <th className="border p-2 text-left">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {detalle.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="border p-2">{it.nombre}</td>
                    <td className="border p-2">{it.cantidad}</td>
                    <td className="border p-2">${Number(it.precio_unitario).toLocaleString()}</td>
                    <td className="border p-2">${Number(it.subtotal).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
