import { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { PiMinus, PiPlus } from 'react-icons/pi';
import { useCart } from '../../contexts/CartContext.jsx';

const Modal = ({ isModalOpen, handleClose, data }) => {
  const [qty, setQty] = useState(1);
  const [addedItemToCart, setAddedItemToCart] = useState(false);
  const { addToCart } = useCart();

  const addItemToCart = (product) => {
    addToCart(product, qty);
    setAddedItemToCart(true);
    
    // Cerrar el modal después de mostrar feedback (1 segundo)
    setTimeout(() => {
      handleClose();
      setAddedItemToCart(false);
      setQty(1);
    }, 1000);
  };

  useEffect(() => {
    if (!isModalOpen) {
      setQty(1);
      setAddedItemToCart(false);
    }
  }, [isModalOpen]);

  const increaseQuantity = () => {
    setQty(qty + 1);
  };

  const decreaseQuantity = () => {
    const newQty = Math.max(qty - 1, 1);
    setQty(newQty);
  };

  if (!isModalOpen || !data) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 hover:bg-gray-100"
          onClick={handleClose}
        >
          <FaTimes className="text-xl" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Imagen del producto */}
          <div className="md:w-1/2 bg-gray-50 p-8 flex items-center justify-center">
            <img
              src={data.imagen || '/images/Detergente.webp'}
              alt={data.nombre}
              className="w-full h-auto object-contain max-h-96"
            />
          </div>

          {/* Información del producto */}
          <div className="md:w-1/2 p-8">
            <div className="mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {data.marca}
              </span>
            </div>

            <h2 className="text-2xl font-bold mb-2">{data.nombre}</h2>
            
            {data.descripcion_corta && (
              <p className="text-gray-600 mb-4">{data.descripcion_corta}</p>
            )}

            <p className="text-3xl font-bold text-red-600 mb-4">
              ${parseFloat(data.precio).toLocaleString()}
            </p>

            {data.descripcion && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Descripción:</h3>
                <p className="text-gray-700 text-sm">{data.descripcion}</p>
              </div>
            )}

            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Categoría: {data.categoria}</p>
              <p className="text-green-600 font-medium">En Stock</p>
            </div>

            {/* Selector de cantidad */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-300 rounded">
                <button
                  className="px-4 py-3 hover:bg-gray-100 transition-colors"
                  onClick={decreaseQuantity}
                >
                  <PiMinus />
                </button>
                <span className="px-6 py-3 border-x border-gray-300 min-w-[60px] text-center">
                  {qty}
                </span>
                <button
                  className="px-4 py-3 hover:bg-gray-100 transition-colors"
                  onClick={increaseQuantity}
                >
                  <PiPlus />
                </button>
              </div>

              {/* Botón agregar al carrito */}
              <div className="flex-1">
                {addedItemToCart ? (
                  <button
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    onClick={handleClose}
                  >
                    ✓ Agregado al Carrito
                  </button>
                ) : (
                  <button
                    onClick={() => addItemToCart(data)}
                    className="w-full bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Agregar al Carrito
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;

