import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import UserDropdown from '../features/auth/UserDropdown.jsx';
import CartDropdown from '../features/cart/CartDropdown.jsx';

const Header = () => {
  const { isAdmin } = useAuth();

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="w-full px-12 py-3">
        <div className="flex items-center justify-between relative max-w-screen-2xl mx-auto">
          {/* Izquierda: Links de navegación */}
          <nav className="flex items-center gap-10">
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
            <img src="/IconoProClean.svg" alt="ProClean" className="h-10 w-auto" />
          </div>

          {/* Derecha: Links Admin (solo si es admin) + Iconos */}
          <div className="flex items-center gap-8">
            {/* Links Admin - Solo visible si es admin */}
            {isAdmin && (
              <nav className="flex items-center gap-8">
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
            <div className="flex items-center gap-4">
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
