import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useCart } from '../../contexts/CartContext.jsx';
import { useFavorites } from '../../contexts/FavoritesContext.jsx';
import Button from '../ui/Button.jsx';
import Badge from '../ui/Badge.jsx';

const Header = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { getTotalItems, openCart } = useCart();
  const { favorites, openFavorites } = useFavorites();
  const [userSidebarOpen, setUserSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleUserClick = () => {
    setUserSidebarOpen(true);
  };

  const handleCartClick = () => {
    if (!isAuthenticated) {
      alert('Necesitas iniciar sesión para acceder a tu carrito');
      navigate('/login');
      return;
    }
    openCart();
  };

  const handleFavoritesClick = () => {
    if (!isAuthenticated) {
      alert('Necesitas iniciar sesión para acceder a tus favoritos');
      navigate('/login');
      return;
    }
    openFavorites();
  };

  return (
    <header className="flex items-center justify-between py-4 border-b border-gray-200 relative">
      {/* Izquierda: Home, Categories, Contact */}
      <nav className="flex gap-8">
        <NavLink 
          to="/" 
          end
          className={({ isActive }) => 
            `text-2xl font-${isActive ? 'semibold' : 'normal'} text-gray-900 hover:text-gray-700 transition-colors`
          }
        >
          Home
        </NavLink>
        <NavLink 
          to="/categories"
          className={({ isActive }) => 
            `text-2xl font-${isActive ? 'semibold' : 'normal'} text-gray-900 hover:text-gray-700 transition-colors`
          }
        >
          Categories
        </NavLink>
        <NavLink 
          to="/contact"
          className={({ isActive }) => 
            `text-2xl font-${isActive ? 'semibold' : 'normal'} text-gray-900 hover:text-gray-700 transition-colors`
          }
        >
          Contact
        </NavLink>
      </nav>

      {/* Centro: Logo */}
      <img src="/IconoProClean.svg" alt="ProClean" className="h-36 w-auto" />

      {/* Derecha: Informes, Gestión + Iconos */}
      <div className="flex items-center gap-5">
        {isAdmin && (
          <nav className="flex gap-5">
            <NavLink 
              to="/informes"
              className={({ isActive }) => 
                `text-2xl font-${isActive ? 'semibold' : 'normal'} text-gray-900 hover:text-gray-700 transition-colors`
              }
            >
              Informes
            </NavLink>
            <NavLink 
              to="/gestion"
              className={({ isActive }) => 
                `text-2xl font-${isActive ? 'semibold' : 'normal'} text-gray-900 hover:text-gray-700 transition-colors`
              }
            >
              Gestión
            </NavLink>
          </nav>
        )}
        
        {/* Iconos */}
        <div className="flex items-center gap-8">
          {/* Favoritos */}
          <button 
            onClick={handleFavoritesClick}
            className="relative w-16 h-16 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors group"
            title={isAuthenticated ? `Favoritos (${favorites.length})` : "Inicia sesión para ver favoritos"}
          >
            <img src="/icons/favorites.svg" alt="Favoritos" className="w-10 h-10 group-hover:scale-110 transition-transform" />
            {isAuthenticated && favorites.length > 0 && (
              <Badge 
                variant="danger" 
                size="sm" 
                className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center"
              >
                {favorites.length}
              </Badge>
            )}
          </button>

          {/* Carrito */}
          <div className="flex items-center">
            <div 
              onClick={handleCartClick}
              className="relative bg-black px-3 py-2 rounded-l flex items-center cursor-pointer hover:bg-gray-800 transition-colors group"
              title={isAuthenticated ? `Carrito (${getTotalItems()})` : "Inicia sesión para acceder al carrito"}
            >
              <span className="text-white text-2xl font-medium">Cart</span>
              {isAuthenticated && getTotalItems() > 0 && (
                <Badge 
                  variant="danger" 
                  size="sm" 
                  className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center"
                >
                  {getTotalItems()}
                </Badge>
              )}
            </div>
            
            <button 
              onClick={handleCartClick}
              className="bg-black p-2 rounded-r flex items-center justify-center hover:bg-gray-800 transition-colors group"
            >
              <img src="/icons/cartRight.svg" alt="Carrito" className="w-10 h-10 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Usuario */}
          <button 
            onClick={handleUserClick}
            className="relative w-16 h-16 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors group"
            title={isAuthenticated ? `Hola, ${user?.nombre}` : "Iniciar sesión"}
          >
            <img src="/icons/user.svg" alt="Usuario" className="w-10 h-10 group-hover:scale-110 transition-transform" />
            {isAuthenticated && (
              <Badge 
                variant="success" 
                size="sm" 
                className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center"
              >
                ✓
              </Badge>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
