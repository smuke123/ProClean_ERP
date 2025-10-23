import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth.js';
import { useCart } from '../../../contexts/CartContext.jsx';
import { MdOutlineShoppingBag } from 'react-icons/md';
import { DataView } from 'primereact/dataview';
import { Button } from 'primereact/button';

const CartDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
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

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
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

  // Template para cada item del carrito usando DataView
  const itemTemplate = (item) => {
    const itemId = item.id_producto || item.id;
    const itemPrice = parseFloat(item.precio);
    const itemTotal = itemPrice * item.quantity;

    return (
      <div className="flex gap-1 p-1.5 border-b border-gray-100">
        {/* Imagen del producto */}
        <div className="flex-shrink-0 w-4 h-4 bg-gray-100 rounded overflow-hidden">
          <img
            src={item.imagen || '/images/Detergente.webp'}
            alt={item.nombre}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Información del producto */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h4 className="text-[0.65rem] font-medium text-gray-800 truncate pr-1 leading-tight">
              {item.nombre}
            </h4>
            <Button
              icon="pi pi-times"
              onClick={() => removeFromCart(itemId)}
              className="p-button-text p-button-danger p-button-sm"
              style={{ minWidth: '1.2rem', height: '1.2rem', fontSize: '0.6rem' }}
              tooltip="Eliminar"
              tooltipOptions={{ position: 'top' }}
            />
          </div>

          {/* Controles de cantidad y precio */}
          <div className="flex items-center justify-between mt-0.5">
            <div className="flex items-center gap-0.5">
              <Button
                icon="pi pi-minus"
                onClick={() => updateQuantity(itemId, item.quantity - 1)}
                className="p-button-outlined p-button-sm"
                style={{ width: '1.2rem', height: '1.2rem', padding: 0, fontSize: '0.6rem' }}
              />
              <span className="text-[0.65rem] font-medium px-1 min-w-[1.2rem] text-center">
                {item.quantity}
              </span>
              <Button
                icon="pi pi-plus"
                onClick={() => updateQuantity(itemId, item.quantity + 1)}
                className="p-button-outlined p-button-sm"
                style={{ width: '1.2rem', height: '1.2rem', padding: 0, fontSize: '0.6rem' }}
              />
            </div>
            <span className="text-[0.65rem] font-semibold text-gray-800">
              ${itemTotal.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de Carrito */}
      <button 
        ref={buttonRef}
        onClick={handleButtonClick}
        className="text-2xl relative hover:scale-110 transition-all duration-200"
        title={`Carrito (${getTotalItems()} productos)`}
      >
        <MdOutlineShoppingBag className="text-gray-700" />
        {getTotalItems() > 0 && (
          <span 
            className={`absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 border-2 border-white shadow-md ${badgeAnimation ? 'animate-bounce' : ''}`}
          >
            {getTotalItems()}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && isAuthenticated && (
        <div 
          className="absolute right-1/2 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[400px] flex flex-col"
          style={{ 
            backgroundColor: '#ffffff', 
            opacity: 1, 
            transform: 'translateX(50%)' 
          }}
        >
          {/* Header */}
          <div className="px-2 py-1.5 border-b border-gray-100 bg-white">
            <h3 className="text-[0.7rem] font-semibold text-gray-800">
              Carrito ({getTotalItems()})
            </h3>
          </div>

          {/* Items del carrito con DataView */}
          <div className="flex-1 overflow-y-auto bg-white">
            {cartItems.length === 0 ? (
              <div className="px-3 py-4 text-center text-gray-500">
                <i className="pi pi-shopping-cart text-2xl mb-1 block text-gray-300"></i>
                <p className="text-[0.65rem]">Tu carrito está vacío</p>
              </div>
            ) : (
              <DataView
                value={cartItems}
                itemTemplate={itemTemplate}
                layout="list"
                className="cart-dataview"
              />
            )}
          </div>

          {/* Footer con total */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-100 px-2 py-1.5 bg-gray-50">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[0.65rem] font-medium text-gray-600">Total:</span>
                <span className="text-xs font-bold text-gray-800">
                  ${getTotalPrice().toLocaleString()}
                </span>
              </div>
              <Button
                label="Ver Carrito"
                icon="pi pi-shopping-cart"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/cart');
                }}
                className="w-full p-button-dark p-button-sm"
                style={{ backgroundColor: '#000', borderColor: '#000', fontSize: '0.65rem', padding: '0.25rem 0.5rem' }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CartDropdown;

