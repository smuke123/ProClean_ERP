import { useFavorites } from '../../../contexts/FavoritesContext.jsx';
import { useCart } from '../../../contexts/CartContext.jsx';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import Sidebar from '../../ui/Sidebar.jsx';
import Button from '../../ui/Button.jsx';
import Card from '../../ui/Card.jsx';

const FavoritesSidebar = ({ isOpen, onClose }) => {
  const { favorites, removeFromFavorites, clearFavorites } = useFavorites();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    // Opcional: mostrar notificación de éxito
  };

  // Si no está autenticado, mostrar mensaje de login
  if (!isAuthenticated) {
    return (
      <Sidebar isOpen={isOpen} onClose={onClose} title="Favoritos">
        <div className="flex flex-col justify-center items-center text-center h-full">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl">
            🔒
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Inicia sesión requerida
          </h3>
          <p className="text-gray-600 leading-relaxed mb-8">
            Necesitas iniciar sesión para acceder a tus productos favoritos
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

  // Contenido normal de favoritos para usuarios autenticados
  return (
    <Sidebar isOpen={isOpen} onClose={onClose} title={`Favoritos (${favorites.length})`}>
      <div className="flex flex-col h-full">
        {/* Lista de productos favoritos */}
        <div className="flex-1 mb-5 overflow-y-auto">
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500 text-center">
              <div className="text-5xl mb-5">❤️</div>
              <h3 className="text-lg font-semibold mb-2">No tienes favoritos</h3>
              <p className="text-sm">Agrega productos a tus favoritos para verlos aquí</p>
            </div>
          ) : (
            <div className="space-y-4">
              {favorites.map((item) => (
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
                      <p className="text-base font-semibold text-black mb-4">
                        ${item.precio.toLocaleString()}
                      </p>

                      {/* Botones de acción */}
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex-1 justify-center gap-2"
                          onClick={() => handleAddToCart(item)}
                        >
                          <span>🛒</span>
                          Agregar
                        </Button>
                        
                        <Button
                          variant="danger"
                          size="sm"
                          className="justify-center gap-2"
                          onClick={() => removeFromFavorites(item.id)}
                        >
                          <span>❌</span>
                          Quitar
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer con botón limpiar */}
        {favorites.length > 0 && (
          <div className="border-t border-gray-200 pt-5">
            <Button
              variant="ghost"
              size="md"
              className="w-full justify-center gap-2"
              onClick={clearFavorites}
            >
              <span>🗑️</span>
              Limpiar Favoritos
            </Button>
          </div>
        )}
      </div>
    </Sidebar>
  );
};

export default FavoritesSidebar;
