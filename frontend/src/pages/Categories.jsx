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
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Catálogo de Productos
        </h1>
        <p className="text-xl text-gray-600">
          Encuentra los mejores productos de limpieza profesional
        </p>
      </div>

      {/* Layout: Filtros + Productos */}
      <div className="flex gap-6 items-start">
        {/* Panel de Filtros */}
        <div className="filterproduct w-1/4 bg-white shadow-lg rounded-lg p-6 sticky top-24">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Filtros</h2>
          </div>

          {/* Filtro por Precio */}
          <div className="mb-6">
            <h3 className="mb-3 text-xl font-semibold text-gray-800">Por precio</h3>
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
                className="w-full mb-2"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>Min: ${filters.priceRange[0].toLocaleString()}</span>
                <span>Max: ${filters.priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Filtro por Categoría */}
          {categoryList.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-xl font-semibold text-gray-800">Por categoría</h3>
              <div className="space-y-2">
                {categoryList.map((category, key) => (
                  <label key={key} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(category)}
                      onChange={() => handleCheckboxChange('categories', category)}
                      className="mr-3 w-4 h-4"
                    />
                    <span className="text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Filtro por Marca */}
          {brandList.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-xl font-semibold text-gray-800">Por marca</h3>
              <div className="space-y-2">
                {brandList.map((brand, key) => (
                  <label key={key} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={filters.brands.includes(brand)}
                      onChange={() => handleCheckboxChange('brands', brand)}
                      className="mr-3 w-4 h-4"
                    />
                    <span className="text-gray-700">{brand}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Botón limpiar filtros */}
          <button
            onClick={() => setFilters({ categories: [], brands: [], priceRange: [0, filters.priceRange[1]] })}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded transition-colors"
          >
            Limpiar Filtros
          </button>
        </div>

        {/* Grid de Productos */}
        <div className="w-3/4">
          <div className="mb-4">
            <p className="text-gray-600">
              Mostrando {filteredProducts.length} de {products.length} productos
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-xl text-gray-500">
                No se encontraron productos con los filtros seleccionados
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id_producto} className="group">
                  <div className="overflow-hidden relative">
                    <div className="image-container relative">
                      {/* Imagen del producto */}
                      <div className="rounded-3xl overflow-hidden bg-gray-100">
                        <img
                          src={product.imagen || '/images/Detergente.svg'}
                          alt={product.nombre}
                          className="rounded-3xl w-full h-48 object-cover transition-transform group-hover:scale-105"
                        />
                      </div>

                      {/* Iconos de acción (aparecen al hover) */}
                      <div className="opacity-0 group-hover:opacity-100 absolute top-4 right-4 transition-opacity duration-300">
                        <button className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors">
                          <IoMdSearch className="text-xl" />
                        </button>
                      </div>

                      {/* Botón de agregar al carrito */}
                      <div className="opacity-0 group-hover:opacity-100 absolute -bottom-3 right-0 transition-opacity duration-300">
                        <div className="bg-white p-4 rounded-l-2xl shadow-lg">
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="bg-black text-white h-12 w-12 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors"
                          >
                            <BiCart className="text-2xl" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Información del producto */}
                    <div className="product-details mt-4">
                      <div className="mb-1">
                        <span className="text-xs text-gray-500">{product.marca}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {product.nombre}
                      </h3>
                      {product.descripcion_corta && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {product.descripcion_corta}
                        </p>
                      )}
                      <p className="text-2xl font-bold text-black">
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
  );
}
