import { useContext } from 'react';
import { CartContext } from '../contexts/CartContext.jsx';

/**
 * Hook personalizado para usar el carrito
 * Debe ser usado dentro de un CartProvider
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};

