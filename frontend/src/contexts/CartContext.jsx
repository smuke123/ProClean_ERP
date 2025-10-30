import { createContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import * as api from '../utils/api.js';

// Crear el contexto (no exportado aquí para evitar errores de Fast Refresh)
const CartContext = createContext();

// Exportar solo para el hook useCart
export { CartContext };

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [synced, setSynced] = useState(false);
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Log de debugging del estado de autenticación
  useEffect(() => {
    console.log('[CART-AUTH] Estado de autenticación:', {
      isAuthenticated,
      user: user ? { id: user.id, nombre: user.nombre } : null,
      authLoading
    });
  }, [isAuthenticated, user, authLoading]);

  // Función para obtener la key de localStorage
  const getLocalStorageKey = useCallback(() => {
    return user?.id ? `proclean_cart_${user.id}` : 'proclean_cart_guest';
  }, [user?.id]);

  // Función para cargar el carrito desde el backend
  const loadCarritoFromBackend = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      console.log('[LOAD] No se puede cargar: usuario no autenticado');
      return;
    }
    
    console.log(`[LOAD] Cargando carrito desde backend para usuario ${user.id}...`);
    
    try {
      setLoading(true);
      const response = await api.getCarrito();
      
      console.log(`[LOAD] Respuesta del backend:`, {
        itemCount: response.itemCount,
        items: response.items?.length || 0,
        total: response.total
      });
      
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
      
      console.log(`[LOAD] Carrito cargado: ${transformedItems.length} items`);
      setCartItems(transformedItems);
      
      // Guardar en localStorage como cache
      const cartKey = getLocalStorageKey();
      localStorage.setItem(cartKey, JSON.stringify(transformedItems));
      console.log(`[LOAD] Carrito guardado en localStorage`);
      
      setSynced(true);
    } catch (error) {
      console.error('[LOAD] Error cargando carrito del backend:', error);
      
      // Si falla, intentar cargar desde localStorage como fallback
      const cartKey = getLocalStorageKey();
      const savedCart = localStorage.getItem(cartKey);
      if (savedCart) {
        try {
          const items = JSON.parse(savedCart);
          console.log(`[LOAD] Usando fallback de localStorage: ${items.length} items`);
          setCartItems(items);
        } catch (e) {
          console.error('[LOAD] Error parseando localStorage:', e);
          setCartItems([]);
        }
      } else {
        console.log('[LOAD] No hay fallback en localStorage');
        setCartItems([]);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, getLocalStorageKey]);

  // Sincronizar localStorage con backend al iniciar sesión
  const syncLocalStorageToBackend = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      console.log('No se puede sincronizar: usuario no autenticado');
      return;
    }
    
    console.log(`[SYNC] Iniciando sincronización para usuario ${user.id}`);
    
    // Buscar carrito en múltiples keys (usuario actual y guest)
    const userCartKey = `proclean_cart_${user.id}`;
    const guestCartKey = 'proclean_cart_guest';
    
    const userCart = localStorage.getItem(userCartKey);
    const guestCart = localStorage.getItem(guestCartKey);
    
    console.log(`[SYNC] Carrito de usuario en localStorage: ${userCart ? JSON.parse(userCart).length : 0} items`);
    console.log(`[SYNC] Carrito de invitado en localStorage: ${guestCart ? JSON.parse(guestCart).length : 0} items`);
    
    // Primero, verificar si hay carrito de invitado para migrar
    if (guestCart) {
      try {
        const guestItems = JSON.parse(guestCart);
        if (guestItems.length > 0) {
          console.log(`[SYNC] Migrando ${guestItems.length} items del carrito de invitado...`);
          const itemsToSync = guestItems.map(item => ({
            id_producto: item.id_producto || item.id,
            cantidad: item.quantity || item.cantidad || 1
          }));
          
          // Sincronizar al backend
          await api.syncCarrito(itemsToSync);
          console.log('[SYNC] Carrito de invitado migrado al backend');
          
          // Limpiar el carrito de invitado
          localStorage.removeItem(guestCartKey);
          console.log('[SYNC] Carrito de invitado limpiado');
        }
      } catch (error) {
        console.error('[SYNC] Error migrando carrito de invitado:', error);
      }
    }
    
    // Cargar el carrito desde el backend (fuente de verdad)
    console.log('[SYNC] Cargando carrito desde backend...');
    await loadCarritoFromBackend();
    
    console.log('[SYNC] Sincronización completada');
  }, [isAuthenticated, user?.id, loadCarritoFromBackend]);

  // Cargar carrito cuando el usuario cambie o inicie sesión
  useEffect(() => {
    // No hacer nada mientras AuthContext esté cargando
    if (authLoading) {
      console.log('Esperando a que AuthContext termine de cargar...');
      return;
    }
    
    let isMounted = true;
    
    const loadUserCart = async () => {
      if (isAuthenticated && user?.id) {
        console.log(`Cargando carrito para usuario ${user.id}`);
        await syncLocalStorageToBackend();
        if (isMounted) {
          setSynced(true);
        }
      } else if (!isAuthenticated && user === null) {
        // Solo limpiar el estado de React (NO el localStorage del usuario)
        // El localStorage se mantiene para cuando el usuario vuelva a iniciar sesión
        console.log('Usuario no autenticado confirmado, limpiando estado del carrito');
        if (isMounted) {
          setCartItems([]);
          setSynced(false);
        }
        // NO limpiar el localStorage aquí - se mantiene por usuario específico
      }
    };
    
    loadUserCart();
    
    return () => {
      isMounted = false;
    };
  }, [user?.id, isAuthenticated, user, authLoading, syncLocalStorageToBackend]);

  // Guardar en localStorage cuando cambie (como cache)
  useEffect(() => {
    // Solo guardar si el usuario está autenticado Y el carrito está sincronizado
    // Esto evita guardar un carrito vacío durante el proceso de logout
    if (isAuthenticated && user?.id && synced) {
      const cartKey = getLocalStorageKey();
      localStorage.setItem(cartKey, JSON.stringify(cartItems));
      console.log(`Carrito guardado en localStorage para usuario ${user.id}`);
    }
  }, [cartItems, user?.id, isAuthenticated, synced, getLocalStorageKey]);

  const addToCart = async (product, quantity = 1) => {
    const productId = product.id_producto || product.id;
    console.log(`[ADD] Agregando producto ${productId}, cantidad: ${quantity}`);
    
    if (isAuthenticated && user?.id) {
      console.log(`[ADD] Usuario autenticado (${user.id}), guardando en backend...`);
      try {
        // Agregar al backend
        const response = await api.addToCarrito(productId, quantity);
        console.log(`[ADD] Respuesta del backend:`, response);
        
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
          console.log(`[ADD] Carrito actualizado: ${transformedItems.length} items`);
          setCartItems(transformedItems);
        }
        
        return response;
      } catch (error) {
        console.error('[ADD] Error agregando al carrito:', error);
        
        // Fallback: actualizar solo localmente
        console.log('[ADD] Usando fallback local');
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
      console.log('[ADD] Usuario no autenticado, guardando solo localmente');
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
    if (isAuthenticated && user?.id) {
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
    
    if (isAuthenticated && user?.id) {
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
    if (isAuthenticated && user?.id) {
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

  // Función para asegurar que el carrito esté guardado en el backend
  const ensureCartSaved = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;
    
    try {
      // Verificar si hay items en el carrito del backend
      const response = await api.getCarrito();
      console.log('Carrito verificado en backend:', response.itemCount, 'items');
      return response;
    } catch (error) {
      console.error('Error verificando carrito en backend:', error);
      throw error;
    }
  }, [isAuthenticated, user?.id]);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    loading,
    synced,
    ensureCartSaved
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
