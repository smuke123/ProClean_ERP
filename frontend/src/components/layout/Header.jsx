import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import UserDropdown from '../features/auth/UserDropdown.jsx';
import CartDropdown from '../features/cart/CartDropdown.jsx';

const Header = () => {
  const { isAdmin } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="w-full px-20 py-3.5">
        <div className="flex items-center relative max-w-[1800px] mx-auto">
          {/* Izquierda: Links de navegación - con flex-1 para empujar hacia los lados */}
          <nav className="flex items-center gap-16 flex-1">
            <NavLink 
              to="/" 
              end
              className={({ isActive }) => 
                `text-sm font-bold tracking-wide transition-colors ${
                  isActive 
                    ? 'text-black' 
                    : 'text-gray-600 hover:text-gray-900'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink 
              to="/categories"
              className={({ isActive }) => 
                `text-sm font-bold tracking-wide transition-colors ${
                  isActive 
                    ? 'text-black' 
                    : 'text-gray-600 hover:text-gray-900'
                }`
              }
            >
              Categories
            </NavLink>
            <NavLink 
              to="/contact"
              className={({ isActive }) => 
                `text-sm font-bold tracking-wide transition-colors ${
                  isActive 
                    ? 'text-black' 
                    : 'text-gray-600 hover:text-gray-900'
                }`
              }
            >
              Contact
            </NavLink>
          </nav>

          {/* Centro: Logo - posición absoluta centrada */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <img src="/IconoProClean.svg" alt="ProClean" className="h-10 w-auto" />
          </div>

          {/* Derecha: Links Admin (solo si es admin) + Iconos - con flex-1 y justify-end */}
          <div className="flex items-center gap-16 flex-1 justify-end">
            {/* Links Admin - Solo visible si es admin */}
            {isAdmin && (
              <nav className="flex items-center gap-16">
                <NavLink 
                  to="/informes"
                  className={({ isActive }) => 
                    `text-sm font-bold tracking-wide transition-colors ${
                      isActive 
                        ? 'text-black' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`
                  }
                >
                  Informes
                </NavLink>
                <NavLink 
                  to="/gestion"
                  className={({ isActive }) => 
                    `text-sm font-bold tracking-wide transition-colors ${
                      isActive 
                        ? 'text-black' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`
                  }
                >
                  Gestión
                </NavLink>
              </nav>
            )}
            
            {/* Iconos */}
            <div className="flex items-center gap-5">
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
