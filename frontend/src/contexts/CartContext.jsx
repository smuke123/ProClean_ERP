import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import * as api from '../utils/api.js';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [synced, setSynced] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Función para obtener la key de localStorage
  const getLocalStorageKey = useCallback(() => {
    return user?.id_usuario ? `proclean_cart_${user.id_usuario}` : 'proclean_cart_guest';
  }, [user?.id_usuario]);

  // Función para cargar el carrito desde el backend
  const loadCarritoFromBackend = useCallback(async () => {
    if (!isAuthenticated || !user?.id_usuario) return;
    
    try {
      setLoading(true);
      const response = await api.getCarrito();
      
      // Transformar los datos del backend al formato del frontend
      const transformedItems = response.items.map(item => ({
        id_producto: item.id_producto,
        id: item.id_producto,
        nombre: item.nombre,
        precio: parseFloat(item.precio),
        categoria: item.categoria,
        marca: item.marca,
        descripcion_corta: item.descripcion_corta,
        imagen: item.imagen,
        quantity: item.cantidad,
        cantidad: item.cantidad,
        activo: item.activo
      }));
      
      setCartItems(transformedItems);
      
      // Guardar en localStorage como cache
      const cartKey = getLocalStorageKey();
      localStorage.setItem(cartKey, JSON.stringify(transformedItems));
      
      setSynced(true);
    } catch (error) {
      console.error('Error cargando carrito del backend:', error);
      
      // Si falla, intentar cargar desde localStorage
      const cartKey = getLocalStorageKey();
      const savedCart = localStorage.getItem(cartKey);
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (e) {
          console.error('Error parseando localStorage:', e);
          setCartItems([]);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id_usuario, getLocalStorageKey]);

  // Sincronizar localStorage con backend al iniciar sesión
  const syncLocalStorageToBackend = useCallback(async () => {
    if (!isAuthenticated || !user?.id_usuario || synced) return;
    
    const cartKey = getLocalStorageKey();
    const savedCart = localStorage.getItem(cartKey);
    
    if (savedCart) {
      try {
        const items = JSON.parse(savedCart);
        if (items.length > 0) {
          // Preparar items para sincronización
          const itemsToSync = items.map(item => ({
            id_producto: item.id_producto || item.id,
            cantidad: item.quantity || item.cantidad || 1
          }));
          
          // Sincronizar con el backend
          await api.syncCarrito(itemsToSync);
          console.log('Carrito sincronizado con el backend');
        }
      } catch (error) {
        console.error('Error sincronizando carrito:', error);
      }
    }
    
    // Cargar el carrito actualizado del backend
    await loadCarritoFromBackend();
  }, [isAuthenticated, user?.id_usuario, synced, getLocalStorageKey, loadCarritoFromBackend]);

  // Cargar carrito cuando el usuario cambie
  useEffect(() => {
    if (isAuthenticated && user?.id_usuario) {
      // Primero sincronizar localStorage si existe
      syncLocalStorageToBackend();
    } else {
      // Si no está autenticado, limpiar el carrito
      setCartItems([]);
      setSynced(false);
    }
  }, [user?.id_usuario, isAuthenticated, syncLocalStorageToBackend]);

  // Guardar en localStorage cuando cambie (como cache)
  useEffect(() => {
    if (isAuthenticated && user?.id_usuario && cartItems.length >= 0) {
      const cartKey = getLocalStorageKey();
      localStorage.setItem(cartKey, JSON.stringify(cartItems));
    }
  }, [cartItems, user?.id_usuario, isAuthenticated, getLocalStorageKey]);

  const addToCart = async (product, quantity = 1) => {
    const productId = product.id_producto || product.id;
    
    if (isAuthenticated && user?.id_usuario) {
      try {
        // Agregar al backend
        const response = await api.addToCarrito(productId, quantity);
        
        // Actualizar estado local con la respuesta del backend
        if (response.carrito && response.carrito.items) {
          const transformedItems = response.carrito.items.map(item => ({
            id_producto: item.id_producto,
            id: item.id_producto,
            nombre: item.nombre,
            precio: parseFloat(item.precio),
            categoria: item.categoria,
            marca: item.marca,
            descripcion_corta: item.descripcion_corta,
            imagen: item.imagen,
            quantity: item.cantidad,
            cantidad: item.cantidad,
            activo: item.activo
          }));
          setCartItems(transformedItems);
        }
        
        return response;
      } catch (error) {
        console.error('Error agregando al carrito:', error);
        
        // Fallback: actualizar solo localmente
        setCartItems(prevItems => {
          const existingItem = prevItems.find(item => 
            (item.id_producto || item.id) === productId
          );
          
          if (existingItem) {
            return prevItems.map(item =>
              (item.id_producto || item.id) === productId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            return [...prevItems, { ...product, quantity }];
          }
        });
        throw error;
      }
    } else {
      // Si no está autenticado, solo actualizar localmente
      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => 
          (item.id_producto || item.id) === productId
        );
        
        if (existingItem) {
          return prevItems.map(item =>
            (item.id_producto || item.id) === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          return [...prevItems, { ...product, quantity }];
        }
      });
    }
  };

  const removeFromCart = async (productId) => {
    if (isAuthenticated && user?.id_usuario) {
      try {
        // Eliminar del backend
        const response = await api.removeFromCarrito(productId);
        
        // Actualizar estado local
        if (response.carrito && response.carrito.items) {
          const transformedItems = response.carrito.items.map(item => ({
            id_producto: item.id_producto,
            id: item.id_producto,
            nombre: item.nombre,
            precio: parseFloat(item.precio),
            categoria: item.categoria,
            marca: item.marca,
            descripcion_corta: item.descripcion_corta,
            imagen: item.imagen,
            quantity: item.cantidad,
            cantidad: item.cantidad,
            activo: item.activo
          }));
          setCartItems(transformedItems);
        }
      } catch (error) {
        console.error('Error eliminando del carrito:', error);
        
        // Fallback: eliminar solo localmente
        setCartItems(prevItems => prevItems.filter(item => 
          (item.id_producto || item.id) !== productId
        ));
        throw error;
      }
    } else {
      // Si no está autenticado, solo actualizar localmente
      setCartItems(prevItems => prevItems.filter(item => 
        (item.id_producto || item.id) !== productId
      ));
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      return await removeFromCart(productId);
    }
    
    if (isAuthenticated && user?.id_usuario) {
      try {
        // Actualizar en el backend
        const response = await api.updateCarritoItem(productId, quantity);
        
        // Actualizar estado local
        if (response.carrito && response.carrito.items) {
          const transformedItems = response.carrito.items.map(item => ({
            id_producto: item.id_producto,
            id: item.id_producto,
            nombre: item.nombre,
            precio: parseFloat(item.precio),
            categoria: item.categoria,
            marca: item.marca,
            descripcion_corta: item.descripcion_corta,
            imagen: item.imagen,
            quantity: item.cantidad,
            cantidad: item.cantidad,
            activo: item.activo
          }));
          setCartItems(transformedItems);
        }
      } catch (error) {
        console.error('Error actualizando cantidad:', error);
        
        // Fallback: actualizar solo localmente
        setCartItems(prevItems =>
          prevItems.map(item =>
            (item.id_producto || item.id) === productId ? { ...item, quantity } : item
          )
        );
        throw error;
      }
    } else {
      // Si no está autenticado, solo actualizar localmente
      setCartItems(prevItems =>
        prevItems.map(item =>
          (item.id_producto || item.id) === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = async () => {
    if (isAuthenticated && user?.id_usuario) {
      try {
        // Limpiar en el backend
        await api.clearCarrito();
        setCartItems([]);
      } catch (error) {
        console.error('Error limpiando carrito:', error);
        
        // Fallback: limpiar solo localmente
        setCartItems([]);
        throw error;
      }
    } else {
      // Si no está autenticado, solo limpiar localmente
      setCartItems([]);
    }
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.precio * item.quantity), 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    loading,
    synced
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
