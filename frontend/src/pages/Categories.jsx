import { useState, useEffect } from 'react';
import { getProductos } from '../utils/api.js';
import { BiCart } from 'react-icons/bi';
import Modal from '../components/common/Modal.jsx';

export default function Categories() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(null);
  const [filters, setFilters] = useState({
    categories: [],
    brands: [],
    priceRange: [0, 100000],
  });

  const handleOpenModal = (productId) => {
    setIsModalOpen(productId);
  };

  const handleCloseModal = () => {
    setIsModalOpen(null);
  };


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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="text-center my-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Catálogo de Productos
        </h1>
        <p className="text-lg text-gray-600">
          Encuentra los mejores productos de limpieza profesional
        </p>
      </div>

      <div>
        <div className="w-10/12 m-auto flex gap-3 items-start mt-8">
          {/* Panel de Filtros */}
          <div className="filterproduct w-1/4 bg-white shadow-lg p-4">
            <div>
              <div className="my-4">
                <h1 className="text-4xl font-semibold">Filter</h1>
              </div>

              {/* Filtro por Precio */}
              <div className="my-4">
                <h1 className="mb-3 text-3xl font-semibold">Por precio</h1>
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
                    className="w-full"
                  />
                  <div className="flex justify-between">
                    <span>Min: ${filters.priceRange[0].toLocaleString()}</span>
                    <span>Max: ${filters.priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Filtro por Categoría */}
              {categoryList.length > 0 && (
                <div className="my-4">
                  <h1 className="mb-3 text-3xl font-semibold">Por categoría</h1>
                  <div>
                    {categoryList.map((category, key) => (
                      <div className="flex items-center" key={key}>
                        <input
                          type="checkbox"
                          checked={filters.categories.includes(category)}
                          onChange={() => handleCheckboxChange('categories', category)}
                        />
                        <div className="ml-2">{category}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Filtro por Marca */}
              {brandList.length > 0 && (
                <div className="my-4">
                  <h1 className="mb-3 text-3xl font-semibold">Por marca</h1>
                  <div>
                    {brandList.map((brand, key) => (
                      <div className="flex items-center" key={key}>
                        <input
                          type="checkbox"
                          checked={filters.brands.includes(brand)}
                          onChange={() => handleCheckboxChange('brands', brand)}
                        />
                        <div className="ml-2">{brand}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Grid de Productos */}
          <div className="w-3/4">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-500">
                  No se encontraron productos con los filtros seleccionados
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {filteredProducts.map((product, index) => (
                  <div key={index}>
                    <div className="overflow-hidden relative ml-4">
                      <div className="image-container relative group">
                        <div className="rounded-3xl h-72 flex items-center justify-center bg-gray-50 overflow-hidden">
                          <img
                            src={product.imagen || '/images/Detergente.webp'}
                            alt={product.nombre}
                            className="rounded-3xl w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>

                        {/* Botón Agregar al Carrito - Siempre visible */}
                        <div className="absolute -bottom-3 right-0 bg-white p-4 rounded-s-2xl shadow-lg transition-transform duration-300 group-hover:scale-110">
                          <div className="bg-black text-white h-10 w-10 grid place-items-center rounded-3xl hover:bg-gray-800 transition-colors">
                            <button
                              className="text-2xl w-full h-full flex items-center justify-center"
                              onClick={() => handleOpenModal(product.id_producto)}
                              title="Ver detalles y agregar al carrito"
                            >
                              <BiCart />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="product-details mt-2">
                        <p className="mb-2 font-semibold">{product.nombre}</p>
                        <p className="text-lg font-bold">${parseFloat(product.precio).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de detalles del producto */}
      <Modal
        data={products.find((item) => item.id_producto === isModalOpen)}
        isModalOpen={isModalOpen}
        handleClose={handleCloseModal}
      />
    </div>
  );
}
