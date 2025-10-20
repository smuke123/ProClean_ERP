import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import { useCart } from '../../../contexts/CartContext.jsx';

const CartDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState('right-0');
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const { isAuthenticated } = useAuth();
  const { cartItems, getTotalItems, getTotalPrice, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  // Cerrar dropdown cuando se hace click fuera y ajustar posición
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      
      // Ajustar posición del dropdown para que no se salga de la pantalla
      if (buttonRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const dropdownWidth = 320; // w-80 = 20rem = 320px
        const screenWidth = window.innerWidth;
        
        // Si el dropdown se sale por la derecha, alinearlo a la derecha del viewport
        if (buttonRect.right + dropdownWidth > screenWidth) {
          setDropdownPosition('right-0');
        } else {
          setDropdownPosition('left-0');
        }
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleButtonClick = () => {
    if (!isAuthenticated) {
      alert('Necesitas iniciar sesión para acceder a tu carrito');
      navigate('/login');
      return;
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de Carrito Dual */}
      <div className="flex items-center" ref={buttonRef}>
        {/* Parte izquierda: Texto "Cart" */}
        <button 
          onClick={handleButtonClick}
          className="bg-black text-white px-4 py-2 rounded-l-full hover:bg-gray-800 transition-colors font-merriweather font-bold text-sm"
          title="Ver carrito"
        >
          Cart
        </button>
        
        {/* Parte derecha: Icono de shopping con badge */}
        <button 
          onClick={handleButtonClick}
          className="w-10 h-10 relative bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors -ml-1"
          title={`Carrito (${getTotalItems()} productos)`}
        >
          <img src="/icons/cartRight.svg" alt="Carrito" className="w-4 h-4" />
          {getTotalItems() > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold px-1 leading-none">
              {getTotalItems()}
            </span>
          )}
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && isAuthenticated && (
        <div className={`absolute ${dropdownPosition} mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 flex flex-col`}>
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">
              Carrito ({getTotalItems()} {getTotalItems() === 1 ? 'producto' : 'productos'})
            </h3>
          </div>

          {/* Items del carrito */}
          <div className="flex-1 overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <p>Tu carrito está vacío</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <div key={item.id} className="px-4 py-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-medium text-gray-800 flex-1">
                        {item.nombre}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 text-xs ml-2"
                        title="Eliminar"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm"
                        >
                          −
                        </button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-gray-800">
                        ${(item.precio * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer con total */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-600">Total:</span>
                <span className="text-lg font-bold text-gray-800">
                  ${getTotalPrice().toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Aquí puedes navegar a checkout cuando lo implementes
                }}
                className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
              >
                Proceder al Pago
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CartDropdown;

