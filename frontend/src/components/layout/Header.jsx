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
      <div className="max-w-7xl mx-auto px-8 py-2.5">
        <div className="flex items-center justify-between relative">
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
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
            <img src="/IconoProClean.svg" alt="ProClean" className="h-8 w-auto" />
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
                  className="bg-black text-white px-3 py-1.5 rounded-l-full hover:bg-gray-800 transition-colors font-merriweather font-bold text-sm"
                  title="Ver carrito"
                >
                  Cart
                </button>
                
                {/* Parte derecha: Icono de shopping con badge */}
                <button 
                  onClick={handleCartClick}
                  className="w-9 h-9 relative bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                  title={`Carrito (${getTotalItems()} productos)`}
                >
                  <img src="/icons/cartRight.svg" alt="Carrito" className="w-4 h-4" />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-[16px] flex items-center justify-center font-bold px-0.5 leading-none">
                      {getTotalItems()}
                    </span>
                  )}
                </button>
              </div>

              {/* Usuario */}
              <button 
                onClick={handleUserClick}
                className="w-9 h-9 relative bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                title={isAuthenticated ? `Hola, ${user?.nombre}` : "Iniciar sesión"}
              >
                <img src="/icons/user.svg" alt="Usuario" className="w-4 h-4" />
                {isAuthenticated && (
                  <span className="absolute -top-0.5 -right-0.5 bg-green-500 w-2.5 h-2.5 rounded-full border-2 border-white"></span>
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
