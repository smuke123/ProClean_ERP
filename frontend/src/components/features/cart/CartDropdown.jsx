import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth.js';
import { useCart } from '../../../contexts/CartContext.jsx';

const CartDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState('right-0');
  const [badgeAnimation, setBadgeAnimation] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const prevItemCountRef = useRef(0);
  const { isAuthenticated } = useAuth();
  const { cartItems, getTotalItems, getTotalPrice, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  // Animación del badge cuando cambia la cantidad
  useEffect(() => {
    const currentCount = getTotalItems();
    if (currentCount > prevItemCountRef.current) {
      // Se agregó un item, activar animación
      setBadgeAnimation(true);
      setTimeout(() => setBadgeAnimation(false), 600);
    }
    prevItemCountRef.current = currentCount;
  }, [cartItems, getTotalItems]);

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
          className="bg-black text-white px-5 py-2.5 rounded-l-full hover:bg-gray-800 transition-all duration-200 font-bold text-xs tracking-widest uppercase"
          title="Ver carrito"
        >
          CART
        </button>
        
        {/* Parte derecha: Icono de shopping con badge */}
        <button 
          onClick={handleButtonClick}
          className="w-11 h-11 relative bg-white border-[3px] border-black rounded-full flex items-center justify-center hover:bg-gray-50 transition-all duration-200 -ml-1 hover:scale-105"
          title={`Carrito (${getTotalItems()} productos)`}
        >
          <img src="/icons/cartRight.svg" alt="Carrito" className="w-5 h-5" />
          {getTotalItems() > 0 && (
            <span 
              className={`absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full min-w-[20px] h-[20px] flex items-center justify-center font-bold px-1.5 leading-none shadow-lg transition-transform duration-300 ${
                badgeAnimation ? 'animate-bounce' : ''
              }`}
            >
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
                {cartItems.map((item) => {
                  const itemId = item.id_producto || item.id;
                  return (
                    <div key={itemId} className="px-4 py-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-medium text-gray-800 flex-1">
                          {item.nombre}
                        </h4>
                        <button
                          onClick={() => removeFromCart(itemId)}
                          className="text-red-500 hover:text-red-700 text-xs ml-2"
                          title="Eliminar"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(itemId, item.quantity - 1)}
                            className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm"
                          >
                            −
                          </button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(itemId, item.quantity + 1)}
                            className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-gray-800">
                          ${(parseFloat(item.precio) * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
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
                  navigate('/cart');
                }}
                className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
              >
                Ver Carrito Completo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CartDropdown;

