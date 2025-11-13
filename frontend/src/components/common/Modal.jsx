import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import { PiMinus, PiPlus } from 'react-icons/pi';
import { useCart } from '../../hooks/useCart.js';
import { useAuth } from '../../hooks/useAuth.js';

const Modal = ({ isModalOpen, handleClose, data }) => {
  const [qty, setQty] = useState(1);
  const [addedItemToCart, setAddedItemToCart] = useState(false);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const addItemToCart = (product) => {
    // Verificar si el usuario está autenticado
    if (!isAuthenticated) {
      alert('Por favor, inicia sesión para agregar productos al carrito');
      handleClose();
      navigate('/login');
      return;
    }

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

  if (!isModalOpen || !data) {
    console.log('Modal NO se muestra. isModalOpen:', isModalOpen, 'data:', data);
    return null;
  }

  console.log('Modal SÍ se va a mostrar. data:', data);

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ 
        zIndex: 99999, 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)'
      }}
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-lg w-full sm:w-11/12 md:w-2/3 max-w-4xl relative shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: '#ffffff', opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 bg-white rounded-full p-2 hover:bg-gray-100 shadow-md"
          onClick={handleClose}
        >
          <FaTimes className="text-lg sm:text-xl" />
        </button>

        <div className="flex flex-col sm:flex-row p-4 sm:p-6">
          {/* Imagen del producto */}
          <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4 mb-4 sm:mb-0 sm:mr-6 w-full sm:min-w-[200px] sm:max-w-[200px]">
            <img
              src={data.imagen || '/images/Detergente.webp'}
              alt={data.nombre}
              className="w-full h-auto object-contain"
              style={{ maxHeight: '200px' }}
            />
          </div>

          {/* Información del producto */}
          <div className="flex-1 min-w-0">
            <div className="mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {data.marca}
              </span>
            </div>
            
            <h2 className="text-lg sm:text-xl font-bold mb-2 break-words">{data.nombre}</h2>
            
            <p className="text-xl sm:text-2xl font-bold text-red-600 mb-3">
              ${parseFloat(data.precio).toLocaleString()}
            </p>

            {data.descripcion_corta && (
              <p className="text-gray-600 text-sm mb-3">{data.descripcion_corta}</p>
            )}

            <div className="mb-3">
              <p className="text-sm text-gray-500">Categoría: {data.categoria}</p>
              <p className="text-green-600 text-sm font-medium">En Stock</p>
            </div>

            {/* Selector de cantidad y botón */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4">
              {/* Selector de cantidad */}
              <div className="flex items-center justify-center border border-gray-300 rounded">
                <button
                  className="px-4 py-3 sm:px-3 sm:py-2 hover:bg-gray-100 transition-colors flex-1 sm:flex-none"
                  onClick={decreaseQuantity}
                >
                  <PiMinus className="mx-auto" />
                </button>
                <span className="px-6 py-3 sm:px-4 sm:py-2 border-x border-gray-300 min-w-[60px] sm:min-w-[50px] text-center font-medium">
                  {qty}
                </span>
                <button
                  className="px-4 py-3 sm:px-3 sm:py-2 hover:bg-gray-100 transition-colors flex-1 sm:flex-none"
                  onClick={increaseQuantity}
                >
                  <PiPlus className="mx-auto" />
                </button>
              </div>

              {/* Botón agregar al carrito */}
              <div className="flex-1">
                {addedItemToCart ? (
                  <button
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 sm:py-2 rounded font-medium transition-colors text-sm"
                    onClick={handleClose}
                  >
                    ✓ Agregado al Carrito
                  </button>
                ) : (
                  <button
                    onClick={() => addItemToCart(data)}
                    className="w-full bg-black hover:bg-gray-800 text-white px-4 py-3 sm:py-2 rounded font-medium transition-colors text-sm"
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