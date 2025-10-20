import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useCart } from '../../contexts/CartContext.jsx';
import { useUserSidebar } from '../../contexts/UserSidebarContext.jsx';

const Header = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { getTotalItems, openCart } = useCart();
  const { openUserSidebar } = useUserSidebar();
  const navigate = useNavigate();

  const handleUserClick = () => {
    openUserSidebar();
  };

  const handleCartClick = () => {
    if (!isAuthenticated) {
      alert('Necesitas iniciar sesión para acceder a tu carrito');
      navigate('/login');
      return;
    }
    openCart();
  };

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Izquierda: Links de navegación */}
          <nav className="flex items-center gap-8">
            <NavLink 
              to="/" 
              end
              className={({ isActive }) => 
                `navbar-link ${isActive ? 'active' : ''}`
              }
            >
              Home
            </NavLink>
            <NavLink 
              to="/categories"
              className={({ isActive }) => 
                `navbar-link ${isActive ? 'active' : ''}`
              }
            >
              Categories
            </NavLink>
            <NavLink 
              to="/contact"
              className={({ isActive }) => 
                `navbar-link ${isActive ? 'active' : ''}`
              }
            >
              Contact
            </NavLink>
          </nav>

          {/* Centro: Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <img src="/IconoProClean.svg" alt="ProClean" className="h-12 w-auto" />
          </div>

          {/* Derecha: Links Admin (solo si es admin) + Iconos */}
          <div className="flex items-center gap-6">
            {/* Links Admin - Solo visible si es admin */}
            {isAdmin && (
              <nav className="flex items-center gap-6">
                <NavLink 
                  to="/informes"
                  className={({ isActive }) => 
                    `navbar-link ${isActive ? 'active' : ''}`
                  }
                >
                  Informes
                </NavLink>
                <NavLink 
                  to="/gestion"
                  className={({ isActive }) => 
                    `navbar-link ${isActive ? 'active' : ''}`
                  }
                >
                  Gestión
                </NavLink>
              </nav>
            )}
            
            {/* Iconos */}
            <div className="flex items-center gap-3">
              {/* Carrito - Botón dual */}
              <div className="flex items-center">
                {/* Parte izquierda: Texto "Cart" */}
                <button 
                  onClick={handleCartClick}
                  className="bg-black text-white px-4 py-2 rounded-l-full hover:bg-gray-800 transition-colors font-merriweather font-bold text-sm"
                  title="Ver carrito"
                >
                  Cart
                </button>
                
                {/* Parte derecha: Icono de shopping con badge */}
                <button 
                  onClick={handleCartClick}
                  className="navbar-icon-button relative bg-white border-2 border-black rounded-full ml-1"
                  title={`Carrito (${getTotalItems()} productos)`}
                >
                  <img src="/icons/cartRight.svg" alt="Carrito" className="w-5 h-5" />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold px-1">
                      {getTotalItems()}
                    </span>
                  )}
                </button>
              </div>

              {/* Usuario */}
              <button 
                onClick={handleUserClick}
                className="navbar-icon-button relative"
                title={isAuthenticated ? `Hola, ${user?.nombre}` : "Iniciar sesión"}
              >
                <img src="/icons/user.svg" alt="Usuario" className="w-5 h-5" />
                {isAuthenticated && (
                  <span className="absolute -top-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
