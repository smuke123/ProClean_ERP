import { useCart } from '../../../contexts/CartContext.jsx';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import Sidebar from '../../ui/Sidebar.jsx';
import Button from '../../ui/Button.jsx';
import Card from '../../ui/Card.jsx';

const CartSidebar = ({ isOpen, onClose }) => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    getTotalItems, 
    getTotalPrice,
    clearCart 
  } = useCart();
  const { isAuthenticated } = useAuth();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  // Si no está autenticado, mostrar mensaje de login
  if (!isAuthenticated) {
    return (
      <Sidebar isOpen={isOpen} onClose={onClose} title="Carrito">
        <div className="flex flex-col justify-center items-center text-center h-full">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl">
            🔒
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Inicia sesión requerida
          </h3>
          <p className="text-gray-600 leading-relaxed mb-8">
            Necesitas iniciar sesión para acceder a tu carrito de compras
          </p>
          <Button
            variant="primary"
            size="lg"
            className="w-full justify-center gap-3"
            onClick={() => {
              window.location.href = '/login';
              onClose();
            }}
          >
            <span>🔑</span>
            Iniciar Sesión
          </Button>
        </div>
      </Sidebar>
    );
  }

  // Contenido normal del carrito para usuarios autenticados
  return (
    <Sidebar isOpen={isOpen} onClose={onClose} title={`Carrito (${getTotalItems()})`}>
      <div className="flex flex-col h-full">
        {/* Lista de productos */}
        <div className="flex-1 mb-5 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500 text-center">
              <div className="text-5xl mb-5">🛒</div>
              <h3 className="text-lg font-semibold mb-2">Tu carrito está vacío</h3>
              <p className="text-sm">Agrega productos para comenzar tu compra</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex gap-4">
                    {/* Imagen del producto */}
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-2xl text-gray-500 flex-shrink-0">
                      📦
                    </div>

                    {/* Información del producto */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-gray-800 mb-1 leading-tight truncate">
                        {item.nombre}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        ${item.precio.toLocaleString()} c/u
                      </p>

                      {/* Controles de cantidad */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-8 h-8 border border-gray-300 bg-white rounded flex items-center justify-center text-base hover:bg-gray-50 transition-colors"
                        >
                          -
                        </button>
                        <span className="min-w-8 text-center text-base font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-8 h-8 border border-gray-300 bg-white rounded flex items-center justify-center text-base hover:bg-gray-50 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Precio total y botón eliminar */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="text-base font-semibold text-gray-800">
                        ${(item.precio * item.quantity).toLocaleString()}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-sm text-red-500 hover:text-red-700 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer con total y botones */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 pt-5">
            {/* Total */}
            <div className="flex justify-between items-center mb-5">
              <span className="text-lg font-semibold text-gray-800">Total:</span>
              <span className="text-xl font-bold text-black">
                ${getTotalPrice().toLocaleString()}
              </span>
            </div>

            {/* Botones */}
            <div className="space-y-3">
              <Button 
                variant="primary" 
                size="lg" 
                className="w-full justify-center gap-3"
              >
                <span>🛒</span>
                Proceder al Pago
              </Button>
              
              <Button
                variant="ghost"
                size="md"
                className="w-full"
                onClick={clearCart}
              >
                Vaciar Carrito
              </Button>
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  );
};

export default CartSidebar;
