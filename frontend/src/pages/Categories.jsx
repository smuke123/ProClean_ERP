import { useState, useEffect } from 'react';
import { getProductos } from '../utils/api.js';
import { useCart } from '../contexts/CartContext.jsx';
import { IoMdSearch } from 'react-icons/io';
import { BiCart } from 'react-icons/bi';
import Card from '../components/ui/Card.jsx';

export default function Categories() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    categories: [],
    brands: [],
    priceRange: [0, 100000],
  });
  const { addToCart } = useCart();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProductos();
      setProducts(data);
      
      // Calcular el rango máximo de precios
      if (data.length > 0) {
        const maxPrice = Math.max(...data.map(p => parseFloat(p.precio)));
        setFilters(prev => ({ ...prev, priceRange: [0, Math.ceil(maxPrice)] }));
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Obtener listas únicas de categorías y marcas
  const categoryList = Array.from(
    new Set(products.map((product) => product.categoria).filter(Boolean))
  );

  const brandList = Array.from(
    new Set(products.map((product) => product.marca).filter(Boolean))
  );

  // Filtrar productos
  const filteredProducts = products.filter((product) => {
    if (!product.activo) return false;
    
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(product.categoria)
    )
      return false;
    
    if (filters.brands.length > 0 && !filters.brands.includes(product.marca))
      return false;

    const price = parseFloat(product.precio);
    if (price < filters.priceRange[0] || price > filters.priceRange[1])
      return false;

    return true;
  });

  const handleCheckboxChange = (filterType, value) => {
    const updatedFilters = [...filters[filterType]];
    const index = updatedFilters.indexOf(value);
    if (index === -1) {
      updatedFilters.push(value);
    } else {
      updatedFilters.splice(index, 1);
    }
    setFilters({ ...filters, [filterType]: updatedFilters });
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    alert(`${product.nombre} agregado al carrito`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Catálogo de Productos
          </h1>
          <p className="text-lg text-gray-600">
            Encuentra los mejores productos de limpieza profesional
          </p>
        </div>

        {/* Layout: Filtros + Productos */}
        <div className="flex gap-8 items-start">
          {/* Panel de Filtros */}
          <div className="w-1/4 min-w-[250px]">
            <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-24 shadow-sm">
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Filter</h2>
              </div>

              {/* Filtro por Precio */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="mb-4 text-base font-semibold text-gray-900">Por precio</h3>
                <div>
                  <input
                    type="range"
                    min="0"
                    max={filters.priceRange[1]}
                    value={filters.priceRange[0]}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        priceRange: [parseInt(e.target.value), filters.priceRange[1]],
                      })
                    }
                    className="w-full mb-3 accent-gray-800"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Min: ${filters.priceRange[0].toLocaleString()}</span>
                    <span>Max: ${filters.priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Filtro por Categoría */}
              {categoryList.length > 0 && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="mb-4 text-base font-semibold text-gray-900">Por categoría</h3>
                  <div className="space-y-3">
                    {categoryList.map((category, key) => (
                      <label key={key} className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.categories.includes(category)}
                          onChange={() => handleCheckboxChange('categories', category)}
                          className="mr-3 w-4 h-4 rounded border-gray-300 text-gray-800 focus:ring-gray-800"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Filtro por Marca */}
              {brandList.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-4 text-base font-semibold text-gray-900">Por marca</h3>
                  <div className="space-y-3">
                    {brandList.map((brand, key) => (
                      <label key={key} className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.brands.includes(brand)}
                          onChange={() => handleCheckboxChange('brands', brand)}
                          className="mr-3 w-4 h-4 rounded border-gray-300 text-gray-800 focus:ring-gray-800"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Botón limpiar filtros */}
              <button
                onClick={() => setFilters({ categories: [], brands: [], priceRange: [0, filters.priceRange[1]] })}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>

          {/* Grid de Productos */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Mostrando <span className="font-semibold">{filteredProducts.length}</span> de <span className="font-semibold">{products.length}</span> productos
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                <p className="text-lg text-gray-500">
                  No se encontraron productos con los filtros seleccionados
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id_producto} 
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
                  >
                    {/* Contenedor de imagen */}
                    <div className="relative bg-gray-50 overflow-hidden" style={{ height: '280px' }}>
                      <img
                        src={product.imagen || '/images/Detergente.webp'}
                        alt={product.nombre}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      
                      {/* Iconos de acción en hover */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button 
                          className="bg-white p-2.5 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                          title="Vista rápida"
                        >
                          <IoMdSearch className="text-lg text-gray-700" />
                        </button>
                      </div>

                      {/* Botón de carrito en hover */}
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="bg-gray-900 text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-colors"
                          title="Añadir al carrito"
                        >
                          <BiCart className="text-xl" />
                        </button>
                      </div>
                    </div>

                    {/* Información del producto */}
                    <div className="p-5">
                      <div className="mb-2">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          {product.marca}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 text-base line-clamp-2 min-h-[3rem]">
                        {product.nombre}
                      </h3>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xl font-bold text-gray-900">
                          ${parseFloat(product.precio).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
