import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import { Card } from 'primereact/card';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import SelectSucursal from "../components/SelectSucursal.jsx";
import { getPedidos, getCompras, getCompra, getPedido, getDatasetsExternos, getDatosDatasetExterno } from "../utils/api.js";

export default function Informes() {
  const [tipoTransaccion, setTipoTransaccion] = useState("ventas"); 
  const [sucursal, setSucursal] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState(null);
  const [detallesCache, setDetallesCache] = useState({});
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const dt = useRef(null);
  
  // Nuevos estados para datasets externos
  const [fuenteDatos, setFuenteDatos] = useState("propios"); // "propios" o "externos"
  const [datasetsExternos, setDatasetsExternos] = useState([]);
  const [datasetSeleccionado, setDatasetSeleccionado] = useState(null);
  const [estructuraExterna, setEstructuraExterna] = useState(null);

  // Configuración de filtros
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    id: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    fechaDate: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
    cliente: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    proveedor: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    sucursal: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    totalNumeric: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    estado: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
  });

  // Cargar datasets externos disponibles
  useEffect(() => {
    const cargarDatasetsExternos = async () => {
      try {
        const response = await getDatasetsExternos({ activo: true });
        setDatasetsExternos(response.datasets || []);
      } catch (error) {
        console.error("Error al cargar datasets externos:", error);
      }
    };
    cargarDatasetsExternos();
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let data = [];
      
      if (fuenteDatos === "propios") {
        // Cargar datos propios (ventas o compras)
        const params = {};
        if (sucursal) params.id_sucursal = sucursal;
        data = tipoTransaccion === "ventas" ? await getPedidos(params) : await getCompras(params);
        
        // Procesar datos para agregar campos calculados
        const processedData = (data || []).map(row => {
          // Procesar fecha - manejar diferentes formatos
          let fechaDate = null;
          if (row.fecha) {
            try {
              // Intenta parsear la fecha
              const parsedDate = new Date(row.fecha);
              // Verifica si es una fecha válida
              fechaDate = isNaN(parsedDate.getTime()) ? null : parsedDate;
            } catch {
              console.warn("Fecha inválida:", row.fecha);
            }
          }

          return {
            ...row,
            id: tipoTransaccion === "ventas" ? row.id_pedido : row.id_compra,
            fechaDate,
            totalNumeric: parseFloat(row.total) || 0,
          };
        });
        
        setRows(processedData);
        setEstructuraExterna(null);
      } else if (fuenteDatos === "externos" && datasetSeleccionado) {
        // Cargar datos externos
        const response = await getDatosDatasetExterno(datasetSeleccionado);
        const datosExternos = response.datos || [];
        
        // Guardar estructura
        setEstructuraExterna(response.dataset.estructura);
        
        // Procesar datos externos dinámicamente
        const processedData = datosExternos.map((row, index) => {
          const processed = { ...row, id: row.id || index };
          
          // Detectar y procesar campos de fecha
          Object.keys(row).forEach(key => {
            const valor = row[key];
            if (typeof valor === 'string' && valor.match(/\d{4}-\d{2}-\d{2}/)) {
              const fecha = new Date(valor);
              if (!isNaN(fecha.getTime())) {
                processed[`${key}Date`] = fecha;
              }
            }
            // Detectar y procesar campos numéricos
            if (typeof valor === 'number' || !isNaN(parseFloat(valor))) {
              processed[`${key}Numeric`] = parseFloat(valor) || 0;
            }
          });
          
          return processed;
        });
        
        setRows(processedData);
      } else {
        setRows([]);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [tipoTransaccion, sucursal, fuenteDatos, datasetSeleccionado]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calcular KPIs y datos para gráficos
  const analytics = useMemo(() => {
    const totalTransacciones = rows.length;
    
    // Detectar campo numérico principal (total, monto, amount, etc.)
    const campoNumerico = estructuraExterna 
      ? Object.keys(estructuraExterna.tipos || {}).find(k => 
          (k.toLowerCase().includes('total') || k.toLowerCase().includes('monto') || k.toLowerCase().includes('amount')) &&
          estructuraExterna.tipos[k] === 'number'
        ) || Object.keys(estructuraExterna.tipos || {}).find(k => estructuraExterna.tipos[k] === 'number')
      : 'totalNumeric';
    
    const totalMonto = rows.reduce((sum, row) => {
      const valor = row[campoNumerico] || row[`${campoNumerico}Numeric`] || row.totalNumeric || 0;
      return sum + (typeof valor === 'number' ? valor : parseFloat(valor) || 0);
    }, 0);
    
    // Detectar campo de estado (estado, status, state, etc.)
    const campoEstado = estructuraExterna
      ? Object.keys(estructuraExterna.tipos || {}).find(k => 
          k.toLowerCase().includes('estado') || k.toLowerCase().includes('status') || k.toLowerCase().includes('state')
        ) || 'estado'
      : 'estado';
    
    const completadas = rows.filter(r => {
      const estado = r[campoEstado];
      return estado === 'completado' || estado === 'pagada' || estado === 'complete' || estado === 'paid';
    }).length;
    
    const pendientes = rows.filter(r => {
      const estado = r[campoEstado];
      return estado === 'pendiente' || estado === 'pending';
    }).length;
    
    const promedio = totalTransacciones > 0 ? totalMonto / totalTransacciones : 0;

    // Detectar campo de fecha
    const campoFecha = estructuraExterna
      ? Object.keys(estructuraExterna.tipos || {}).find(k => estructuraExterna.tipos[k] === 'date')
      : null;
    
    // Agrupar por mes
    const porMes = {};
    rows.forEach(row => {
      let fecha = row.fechaDate;
      if (!fecha && campoFecha) {
        fecha = row[`${campoFecha}Date`] || (row[campoFecha] ? new Date(row[campoFecha]) : null);
      }
      
      if (fecha && !isNaN(fecha.getTime())) {
        const mes = fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });
        if (!porMes[mes]) porMes[mes] = { ventas: 0, compras: 0, count: 0 };
        const valor = row[campoNumerico] || row[`${campoNumerico}Numeric`] || row.totalNumeric || 0;
        porMes[mes][tipoTransaccion] += typeof valor === 'number' ? valor : parseFloat(valor) || 0;
        porMes[mes].count += 1;
      }
    });

    // Agrupar por sucursal o categoría principal
    const campoAgrupacion = estructuraExterna
      ? Object.keys(estructuraExterna.tipos || {}).find(k => 
          k.toLowerCase().includes('sucursal') || k.toLowerCase().includes('branch') ||
          k.toLowerCase().includes('categoria') || k.toLowerCase().includes('category') ||
          k.toLowerCase().includes('tipo') || k.toLowerCase().includes('type')
        ) || Object.keys(estructuraExterna.tipos || {}).find(k => estructuraExterna.tipos[k] === 'string')
      : 'sucursal';
    
    const porSucursal = {};
    rows.forEach(row => {
      const nombre = row[campoAgrupacion] || row.sucursal || row.id_sucursal || 'Sin especificar';
      if (!porSucursal[nombre]) porSucursal[nombre] = 0;
      const valor = row[campoNumerico] || row[`${campoNumerico}Numeric`] || row.totalNumeric || 0;
      porSucursal[nombre] += typeof valor === 'number' ? valor : parseFloat(valor) || 0;
    });

    // Agrupar por estado
    const porEstado = {};
    rows.forEach(row => {
      const estado = row[campoEstado] || row.estado || 'sin estado';
      if (!porEstado[estado]) porEstado[estado] = 0;
      porEstado[estado] += 1;
    });

    // Top productos (si hay información)
    const productosMap = {};
    rows.forEach(row => {
      if (row.productos) {
        const prods = row.productos.split(',').map(p => p.trim());
        prods.forEach(prod => {
          if (!productosMap[prod]) productosMap[prod] = { count: 0, total: 0 };
          productosMap[prod].count += 1;
          productosMap[prod].total += row.totalNumeric;
        });
      }
    });

    const topProductos = Object.entries(productosMap)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10);

    return {
      totalTransacciones,
      totalMonto,
      completadas,
      pendientes,
      promedio,
      porMes,
      porSucursal,
      porEstado,
      topProductos,
      campoNumerico,
      campoEstado,
      campoAgrupacion
    };
  }, [rows, tipoTransaccion, estructuraExterna]);

  // Datos para gráfico de tendencia mensual
  const chartTendenciaMensual = useMemo(() => {
    const meses = Object.keys(analytics.porMes).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA - dateB;
    });

    return {
      labels: meses,
      datasets: [
        {
          label: tipoTransaccion === 'ventas' ? 'Ventas' : 'Compras',
          data: meses.map(mes => analytics.porMes[mes][tipoTransaccion]),
          backgroundColor: tipoTransaccion === 'ventas' ? 'rgba(59, 130, 246, 0.6)' : 'rgba(16, 185, 129, 0.6)',
          borderColor: tipoTransaccion === 'ventas' ? 'rgb(59, 130, 246)' : 'rgb(16, 185, 129)',
          borderWidth: 2,
          tension: 0.4
        }
      ]
    };
  }, [analytics, tipoTransaccion]);

  // Datos para gráfico de distribución por sucursal
  const chartSucursales = useMemo(() => {
    const sucursales = Object.keys(analytics.porSucursal);
    const colores = [
      'rgba(59, 130, 246, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(239, 68, 68, 0.8)',
      'rgba(139, 92, 246, 0.8)',
      'rgba(236, 72, 153, 0.8)',
      'rgba(14, 165, 233, 0.8)',
    ];

    return {
      labels: sucursales,
      datasets: [
        {
          data: sucursales.map(s => analytics.porSucursal[s]),
          backgroundColor: colores.slice(0, sucursales.length),
          borderWidth: 2,
          borderColor: '#fff'
        }
      ]
    };
  }, [analytics]);

  // Datos para gráfico de estados
  const chartEstados = useMemo(() => {
    const estados = Object.keys(analytics.porEstado);
    const coloresEstados = {
      'completado': 'rgba(16, 185, 129, 0.8)',
      'pagada': 'rgba(34, 197, 94, 0.8)',
      'pendiente': 'rgba(245, 158, 11, 0.8)',
      'cancelado': 'rgba(239, 68, 68, 0.8)',
    };

    return {
      labels: estados.map(e => e.charAt(0).toUpperCase() + e.slice(1)),
      datasets: [
        {
          data: estados.map(e => analytics.porEstado[e]),
          backgroundColor: estados.map(e => coloresEstados[e] || 'rgba(107, 114, 128, 0.8)'),
          borderWidth: 2,
          borderColor: '#fff'
        }
      ]
    };
  }, [analytics]);

  // Datos para gráfico de top productos
  const chartTopProductos = useMemo(() => {
    return {
      labels: analytics.topProductos.map(([nombre]) => nombre.length > 20 ? nombre.substring(0, 20) + '...' : nombre),
      datasets: [
        {
          label: 'Cantidad vendida',
          data: analytics.topProductos.map(([, data]) => data.count),
          backgroundColor: 'rgba(139, 92, 246, 0.6)',
          borderColor: 'rgb(139, 92, 246)',
          borderWidth: 1
        }
      ]
    };
  }, [analytics]);

  // Opciones de gráficos
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      }
    }
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters['global'].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const onRowExpand = async (event) => {
    const row = event.data;
    const cacheKey = `${tipoTransaccion}-${row.id}`;
    
    if (detallesCache[cacheKey]) return;

    try {
      if (tipoTransaccion === "ventas") {
        const data = await getPedido(row.id_pedido);
        setDetallesCache(prev => ({
          ...prev,
          [cacheKey]: { tipo: "pedido", cabecera: data.pedido, items: data.items }
        }));
      } else {
        const data = await getCompra(row.id_compra);
        setDetallesCache(prev => ({
          ...prev,
          [cacheKey]: { tipo: "compra", cabecera: data.compra, items: data.items }
        }));
      }
    } catch (e) {
      console.error("Error al cargar detalles:", e);
    }
  };

  const onRowCollapse = () => {
    // Opcional: limpiar caché cuando se colapsa
  };

  // Plantilla para el encabezado con búsqueda global
  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center">
        <h4 className="m-0 text-lg font-semibold">
          {tipoTransaccion === 'ventas' ? 'Ventas' : 'Compras'} - {rows.length} registros
        </h4>
        <div className="flex gap-3">
          <Button 
            type="button" 
            icon="pi pi-filter-slash" 
            label="Limpiar Filtros" 
            outlined 
            onClick={() => {
              setFilters({
                global: { value: null, matchMode: FilterMatchMode.CONTAINS },
                id: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
                fechaDate: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
                cliente: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
                proveedor: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
                sucursal: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
                totalNumeric: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
                estado: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
              });
              setGlobalFilterValue('');
            }}
          />
          <Button 
            type="button" 
            icon="pi pi-file-excel" 
            severity="success" 
            rounded 
            onClick={() => dt.current.exportCSV()} 
            data-pr-tooltip="Exportar CSV" 
          />
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText 
              value={globalFilterValue} 
              onChange={onGlobalFilterChange} 
              placeholder="Búsqueda global..." 
            />
          </span>
        </div>
      </div>
    );
  };

  // Plantillas de columnas
  const idBodyTemplate = (rowData) => {
    return <span className="font-semibold">{rowData.id}</span>;
  };

  const fechaBodyTemplate = (rowData) => {
    return <span className="whitespace-nowrap">{rowData.fecha}</span>;
  };

  const fechaFilterTemplate = (options) => {
    return (
      <Calendar 
        value={options.value} 
        onChange={(e) => options.filterCallback(e.value, options.index)} 
        dateFormat="yy-mm-dd" 
        placeholder="Seleccionar fecha" 
        mask="9999-99-99"
        showButtonBar
        showIcon
      />
    );
  };

  const totalBodyTemplate = (rowData) => {
    return <span className="font-semibold">${rowData.totalNumeric.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
  };

  const totalFilterTemplate = (options) => {
    return (
      <InputNumber 
        value={options.value} 
        onChange={(e) => options.filterCallback(e.value, options.index)} 
        mode="currency" 
        currency="USD" 
        locale="es-ES"
        placeholder="Filtrar por total"
      />
    );
  };

  const estadoBodyTemplate = (rowData) => {
    const severity = 
      rowData.estado === 'completado' || rowData.estado === 'pagada' ? 'success' : 
      rowData.estado === 'pendiente' ? 'warning' : 
      'secondary';
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        severity === 'success' ? 'bg-green-100 text-green-700' :
        severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
        'bg-gray-100 text-gray-700'
      }`}>
        {rowData.estado}
      </span>
    );
  };

  const estadoFilterTemplate = (options) => {
    const estados = [
      { label: 'Completado', value: 'completado' },
      { label: 'Pagada', value: 'pagada' },
      { label: 'Pendiente', value: 'pendiente' },
      { label: 'Cancelado', value: 'cancelado' },
    ];

    return (
      <Dropdown 
        value={options.value} 
        options={estados} 
        onChange={(e) => options.filterCallback(e.value, options.index)} 
        placeholder="Seleccionar Estado" 
        className="p-column-filter" 
        showClear 
      />
    );
  };

  const productosBodyTemplate = (rowData) => {
    return (
      <span className="text-sm text-gray-600">
        {rowData.productos || 'Ver detalles'}
      </span>
    );
  };

  const clienteProveedorBodyTemplate = (rowData) => {
    if (tipoTransaccion === 'ventas') {
      return rowData.cliente || rowData.id_usuario || 'N/A';
    } else {
      return rowData.proveedor || rowData.id_proveedor || 'N/A';
    }
  };

  const sucursalBodyTemplate = (rowData) => {
    return rowData.sucursal || rowData.id_sucursal || 'N/A';
  };

  // Generar columnas dinámicas para datos externos
  const columnasExternas = useMemo(() => {
    if (fuenteDatos === 'propios' || !estructuraExterna || rows.length === 0) return [];
    
    const campos = Object.keys(estructuraExterna.tipos || {});
    return campos.slice(0, 10).map(campo => ({ // Limitar a 10 columnas para no sobrecargar
      field: campo,
      header: campo.charAt(0).toUpperCase() + campo.slice(1).replace(/_/g, ' '),
      tipo: estructuraExterna.tipos[campo],
      sortable: true,
      filter: true
    }));
  }, [fuenteDatos, estructuraExterna, rows]);

  // Plantilla de expansión de fila
  const rowExpansionTemplate = (rowData) => {
    const cacheKey = `${tipoTransaccion}-${rowData.id}`;
    const detalle = detallesCache[cacheKey];

    if (!detalle) {
      return (
        <div className="p-4">
          <div className="flex items-center gap-2">
            <i className="pi pi-spin pi-spinner" style={{ fontSize: '1.5rem' }}></i>
            <span>Cargando detalles...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4">
        <div className="bg-gray-50 rounded-lg p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-600 font-semibold">Fecha</label>
            <p className="text-sm">{detalle.cabecera.fecha}</p>
          </div>
          <div>
            <label className="text-xs text-gray-600 font-semibold">Sucursal</label>
            <p className="text-sm">{detalle.cabecera.sucursal || detalle.cabecera.id_sucursal}</p>
          </div>
          <div>
            <label className="text-xs text-gray-600 font-semibold">
              {detalle.tipo === "pedido" ? 'Cliente' : 'Proveedor'}
            </label>
            <p className="text-sm">
              {detalle.tipo === "pedido" 
                ? (detalle.cabecera.cliente || detalle.cabecera.id_usuario)
                : (detalle.cabecera.proveedor || detalle.cabecera.id_proveedor)
              }
            </p>
          </div>
        </div>

        <h5 className="mb-3 font-semibold">Productos</h5>
        <DataTable value={detalle.items} size="small" className="text-sm">
          <Column field="nombre" header="Producto" />
          <Column field="cantidad" header="Cantidad" className="text-center" />
          <Column 
            field="precio_unitario" 
            header="Precio Unitario" 
            body={(item) => `$${Number(item.precio_unitario).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
            className="text-right"
          />
          <Column 
            field="subtotal" 
            header="Subtotal" 
            body={(item) => `$${Number(item.subtotal).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
            className="text-right font-semibold"
          />
        </DataTable>

        <div className="mt-4 flex justify-end">
          <div className="bg-blue-50 px-4 py-2 rounded">
            <span className="text-sm font-semibold">Total: </span>
            <span className="text-lg font-bold text-blue-700">
              ${detalle.cabecera.total?.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="px-4 md:px-6 lg:px-8 py-6 max-w-[1600px] mx-auto">
      <div className="grid gap-8">
        <h2 className="text-2xl font-semibold">Informes y Analytics</h2>

      {/* Filtros Globales */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col gap-4">
          {/* Selector de Fuente de Datos */}
          <div>
            <label className="block text-sm text-gray-600 mb-2 font-semibold">Fuente de Datos</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={`px-4 py-2 rounded-lg border font-semibold transition-all ${
                  fuenteDatos === 'propios' 
                    ? 'bg-purple-600 text-white border-purple-600 shadow-md' 
                    : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => {
                  setFuenteDatos('propios');
                  setDatasetSeleccionado(null);
                  setExpandedRows(null);
                  setDetallesCache({});
                }}
              >
                <i className="pi pi-database mr-2"></i>
                Datos Propios
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-lg border font-semibold transition-all ${
                  fuenteDatos === 'externos' 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                    : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => {
                  setFuenteDatos('externos');
                  setExpandedRows(null);
                  setDetallesCache({});
                }}
              >
                <i className="pi pi-cloud-download mr-2"></i>
                Datos Externos ({datasetsExternos.length})
              </button>
            </div>
          </div>

          {/* Filtros específicos según fuente */}
          <div className="flex flex-col md:flex-row md:items-end gap-3">
            {fuenteDatos === 'propios' ? (
              <>
                <div>
                  <label className="block text-sm text-gray-600 mb-2 font-semibold">Tipo de Transacción</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className={`px-4 py-2 rounded-lg border font-semibold transition-all ${
                        tipoTransaccion === 'ventas' 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                          : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setTipoTransaccion('ventas');
                        setExpandedRows(null);
                        setDetallesCache({});
                      }}
                    >
                      <i className="pi pi-shopping-cart mr-2"></i>
                      Ventas
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 rounded-lg border font-semibold transition-all ${
                        tipoTransaccion === 'compras' 
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                          : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setTipoTransaccion('compras');
                        setExpandedRows(null);
                        setDetallesCache({});
                      }}
                    >
                      <i className="pi pi-inbox mr-2"></i>
                      Compras
                    </button>
                  </div>
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-2 font-semibold">Filtrar por Sucursal</label>
                  <SelectSucursal value={sucursal} onChange={setSucursal} />
                </div>
              </>
            ) : (
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-2 font-semibold">Seleccionar Empresa Externa</label>
                <Dropdown 
                  value={datasetSeleccionado} 
                  options={datasetsExternos.map(d => ({ label: d.nombre_empresa, value: d.id_dataset }))} 
                  onChange={(e) => {
                    setDatasetSeleccionado(e.value);
                    setExpandedRows(null);
                    setDetallesCache({});
                  }} 
                  placeholder="Seleccione una empresa..." 
                  className="w-full"
                  showClear
                  emptyMessage="No hay datasets externos disponibles"
                />
                {datasetSeleccionado && (
                  <div className="mt-2 text-xs text-gray-500">
                    {datasetsExternos.find(d => d.id_dataset === datasetSeleccionado)?.descripcion}
                  </div>
                )}
              </div>
            )}

            <div>
              <Button 
                label="Recargar Datos" 
                icon="pi pi-refresh" 
                onClick={loadData}
                loading={loading}
                className="w-full md:w-auto"
                disabled={fuenteDatos === 'externos' && !datasetSeleccionado}
              />
            </div>
          </div>
        </div>
      </div>

      {/* DataTable - Datos Detallados */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <DataTable 
            ref={dt}
            value={rows} 
            paginator 
            rows={20} 
            rowsPerPageOptions={[10, 20, 50, 100]}
            dataKey="id"
            filters={filters}
            onFilter={(e) => setFilters(e.filters)}
            filterDisplay="menu"
            loading={loading}
            globalFilterFields={['id', 'fecha', 'productos', 'estado']}
            header={renderHeader()}
            emptyMessage="No se encontraron registros."
            expandedRows={expandedRows}
            onRowToggle={(e) => setExpandedRows(e.data)}
            onRowExpand={onRowExpand}
            onRowCollapse={onRowCollapse}
            rowExpansionTemplate={rowExpansionTemplate}
            className="text-sm"
            stripedRows
            removableSort
            scrollable
            scrollHeight="600px"
          >
          {fuenteDatos === 'propios' && <Column expander={true} style={{ width: '5rem' }} frozen />}
          
          {/* Columnas para datos propios */}
          {fuenteDatos === 'propios' && (
            <>
              <Column 
                field="id" 
                header="ID" 
                sortable 
                filter 
                filterPlaceholder="Buscar por ID"
                style={{ minWidth: '120px', width: '120px' }}
                body={idBodyTemplate}
                frozen
              />
              
              <Column 
                field="fechaDate" 
                header="Fecha" 
                sortable 
                filter 
                filterElement={fechaFilterTemplate}
                dataType="date"
                style={{ minWidth: '160px', width: '160px' }}
                body={fechaBodyTemplate}
              />

              <Column 
                field={tipoTransaccion === 'ventas' ? 'cliente' : 'proveedor'}
                header={tipoTransaccion === 'ventas' ? 'Cliente' : 'Proveedor'}
                sortable 
                filter 
                filterPlaceholder="Buscar..."
                style={{ minWidth: '200px', width: '200px' }}
                body={clienteProveedorBodyTemplate}
              />

              <Column 
                field="sucursal" 
                header="Sucursal" 
                sortable 
                filter 
                filterPlaceholder="Buscar sucursal"
                style={{ minWidth: '170px', width: '170px' }}
                body={sucursalBodyTemplate}
              />

              <Column 
                field="productos" 
                header="Productos" 
                style={{ minWidth: '250px', width: '250px' }}
                body={productosBodyTemplate}
              />

              <Column 
                field="totalNumeric" 
                header="Total" 
                sortable 
                filter 
                filterElement={totalFilterTemplate}
                dataType="numeric"
                style={{ minWidth: '150px', width: '150px' }}
                body={totalBodyTemplate}
              />

              <Column 
                field="estado" 
                header="Estado" 
                sortable 
                filter 
                filterElement={estadoFilterTemplate}
                style={{ minWidth: '150px', width: '150px' }}
                body={estadoBodyTemplate}
              />
            </>
          )}

          {/* Columnas dinámicas para datos externos */}
          {fuenteDatos === 'externos' && columnasExternas.map((col, idx) => (
            <Column 
              key={idx}
              field={col.field} 
              header={col.header} 
              sortable={col.sortable}
              filter={col.filter}
              filterPlaceholder={`Buscar ${col.header.toLowerCase()}...`}
              style={{ minWidth: '150px' }}
              body={(rowData) => {
                const valor = rowData[col.field];
                if (valor === null || valor === undefined) return 'N/A';
                if (col.tipo === 'number') {
                  return typeof valor === 'number' 
                    ? valor.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : valor;
                }
                if (col.tipo === 'date') {
                  try {
                    const fecha = new Date(valor);
                    return !isNaN(fecha.getTime()) 
                      ? fecha.toLocaleDateString('es-ES') 
                      : valor;
                  } catch {
                    return valor;
                  }
                }
                return String(valor).length > 50 
                  ? String(valor).substring(0, 50) + '...' 
                  : String(valor);
              }}
            />
          ))}
          </DataTable>
        </div>
      </div>

      {/* KPIs Cards */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-6">Información general</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Total {tipoTransaccion === 'ventas' ? 'Ventas' : 'Compras'}</p>
              <h3 className="text-3xl font-bold mb-0">
                ${analytics.totalMonto.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <i className={`pi ${tipoTransaccion === 'ventas' ? 'pi-shopping-cart' : 'pi-inbox'} text-5xl opacity-30`}></i>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm mb-1">Transacciones</p>
              <h3 className="text-3xl font-bold mb-0">{analytics.totalTransacciones}</h3>
              <p className="text-emerald-100 text-xs mt-1">{analytics.completadas} completadas</p>
            </div>
            <i className="pi pi-list text-5xl opacity-30"></i>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm mb-1">Promedio</p>
              <h3 className="text-3xl font-bold mb-0">
                ${analytics.promedio.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-amber-100 text-xs mt-1">por transacción</p>
            </div>
            <i className="pi pi-chart-line text-5xl opacity-30"></i>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">Pendientes</p>
              <h3 className="text-3xl font-bold mb-0">{analytics.pendientes}</h3>
              <p className="text-purple-100 text-xs mt-1">requieren atención</p>
            </div>
            <i className="pi pi-clock text-5xl opacity-30"></i>
          </div>
        </Card>
        </div>
      </div>

      {/* Gráficos y Análisis Visual */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-6">Análisis Visual</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tendencia Mensual */}
          <Card title="Tendencia Mensual" className="shadow-lg">
            <div style={{ height: '300px' }}>
              <Chart type="line" data={chartTendenciaMensual} options={chartOptions} />
            </div>
          </Card>

          {/* Distribución por Sucursal */}
          <Card title="Distribución por Sucursal" className="shadow-lg">
            <div style={{ height: '300px' }}>
              <Chart type="doughnut" data={chartSucursales} options={pieOptions} />
            </div>
          </Card>

          {/* Estados de Transacciones */}
          <Card title="Estados de Transacciones" className="shadow-lg">
            <div style={{ height: '300px' }}>
              <Chart type="pie" data={chartEstados} options={pieOptions} />
            </div>
          </Card>

          {/* Top Productos */}
          {analytics.topProductos.length > 0 && (
            <Card title="Top 10 Productos" className="shadow-lg">
              <div style={{ height: '300px' }}>
                <Chart type="bar" data={chartTopProductos} options={{
                  ...chartOptions,
                  indexAxis: 'y',
                  plugins: {
                    legend: {
                      display: false
                    }
                  }
                }} />
              </div>
            </Card>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
