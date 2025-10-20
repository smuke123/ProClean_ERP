import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import UserDropdown from '../features/auth/UserDropdown.jsx';
import CartDropdown from '../features/cart/CartDropdown.jsx';

const Header = () => {
  const { isAdmin } = useAuth();

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
              {/* Carrito Dropdown */}
              <CartDropdown />

              {/* Usuario Dropdown */}
              <UserDropdown />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
