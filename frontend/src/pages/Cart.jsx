import { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { PiMinus, PiPlus } from 'react-icons/pi';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart.js';
import { useAuth } from '../hooks/useAuth.js';
import Button from '../components/ui/Button.jsx';

export default function Cart() {
  const navigate = useNavigate();
  const { 
    cartItems, 
    getTotalItems, 
    getTotalPrice, 
    removeFromCart, 
    updateQuantity,
    clearCart 
  } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const increaseQuantity = (itemId, currentQuantity) => {
    updateQuantity(itemId, currentQuantity + 1);
  };

  const decreaseQuantity = (itemId, currentQuantity) => {
    if (currentQuantity > 1) {
      updateQuantity(itemId, currentQuantity - 1);
    }
  };

  const shippingCharge = 10;
  const grandTotal = getTotalPrice() + (cartItems.length > 0 ? shippingCharge : 0);

  const proceedToCheckout = async () => {
    // TODO: Implementar pasarela de pagos
    alert('Función de pago en desarrollo. Total a pagar: $' + grandTotal);
    
    // Aquí irá la integración con Stripe u otra pasarela
    /*
    try {
      const response = await fetch("http://localhost:8000/stripe/crear-pago/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total: grandTotal, items: cartItems }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Error al crear sesión de pago");
      }
    } catch (error) {
      console.error("Error en pago:", error);
      alert("Error al procesar el pago");
    }
    */
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de la página */}
      <div className="bg-white shadow-sm mb-8">
        <div className="w-10/12 m-auto py-6">
          <h1 className="text-4xl font-bold text-gray-900">Carrito de Compras</h1>
          <div className="flex items-center gap-2 mt-2 text-gray-600">
            <Link to="/" className="hover:text-black transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-black font-medium">Carrito</span>
          </div>
        </div>
      </div>

      <div className="w-10/12 m-auto pb-12">
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-7xl mb-6">🛒</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Tu carrito está vacío
            </h2>
            <p className="text-gray-600 mb-8">
              Agrega productos desde nuestro catálogo para comenzar tu compra
            </p>
            <Link to="/categories">
              <Button variant="primary" size="lg">
                Ir al Catálogo
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tabla de productos */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-black text-white">
                    <tr>
                      <th className="px-4 py-4 text-left"></th>
                      <th className="px-4 py-4 text-left">Producto</th>
                      <th className="px-4 py-4 text-center">Precio</th>
                      <th className="px-4 py-4 text-center">Cantidad</th>
                      <th className="px-4 py-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {cartItems.map((item) => {
                      const itemId = item.id_producto || item.id;
                      const itemPrice = parseFloat(item.precio);
                      const itemSubtotal = itemPrice * item.quantity;
                      
                      return (
                        <tr key={itemId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4">
                            <button
                              className="text-red-500 hover:text-red-700 transition-colors p-2"
                              onClick={() => removeFromCart(itemId)}
                              title="Eliminar producto"
                            >
                              <FaTimes size={18} />
                            </button>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-24 h-24 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                <img
                                  src={item.imagen || '/images/Detergente.webp'}
                                  alt={item.nombre}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">{item.nombre}</p>
                                {item.marca && (
                                  <p className="text-sm text-gray-500">{item.marca}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center font-medium">
                            ${itemPrice.toLocaleString()}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                className="border border-gray-300 hover:bg-gray-100 rounded px-3 py-2 transition-colors"
                                onClick={() => decreaseQuantity(itemId, item.quantity)}
                              >
                                <PiMinus />
                              </button>
                              <span className="px-4 py-2 min-w-[50px] text-center font-semibold">
                                {item.quantity}
                              </span>
                              <button
                                className="border border-gray-300 hover:bg-gray-100 rounded px-3 py-2 transition-colors"
                                onClick={() => increaseQuantity(itemId, item.quantity)}
                              >
                                <PiPlus />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right font-bold text-lg">
                            ${itemSubtotal.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Botones de acción debajo de la tabla */}
              <div className="flex justify-between items-center mt-6">
                <Link to="/categories">
                  <Button variant="secondary" size="lg">
                    ← Continuar Comprando
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="lg"
                  onClick={() => {
                    if (window.confirm('¿Estás seguro de vaciar el carrito?')) {
                      clearCart();
                    }
                  }}
                >
                  Vaciar Carrito
                </Button>
              </div>
            </div>

            {/* Panel de totales */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center border-b pb-4">
                  Resumen del Pedido
                </h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({getTotalItems()} productos):</span>
                    <span className="font-semibold">${getTotalPrice().toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Envío:</span>
                    <span className="font-semibold">${shippingCharge}</span>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-xl font-bold text-gray-900">
                      <span>Total:</span>
                      <span className="text-2xl">${grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-center mb-3"
                  onClick={proceedToCheckout}
                >
                  Proceder al Pago
                </Button>

                {/* Info adicional */}
                <div className="mt-6 space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Envío gratuito en compras superiores a $1000</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Pago seguro con encriptación SSL</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Garantía de devolución en 30 días</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

