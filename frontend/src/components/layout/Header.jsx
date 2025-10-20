import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import UserDropdown from '../features/auth/UserDropdown.jsx';
import CartDropdown from '../features/cart/CartDropdown.jsx';

const Header = () => {
  const { isAdmin } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="w-full px-16 py-4">
        <div className="flex items-center justify-between relative max-w-[1600px] mx-auto">
          {/* Izquierda: Links de navegación */}
          <nav className="flex items-center gap-12">
            <NavLink 
              to="/" 
              end
              className={({ isActive }) => 
                `text-sm font-bold tracking-wider uppercase transition-all duration-200 ${
                  isActive 
                    ? 'text-black border-b-2 border-black pb-1' 
                    : 'text-gray-600 hover:text-gray-900'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink 
              to="/categories"
              className={({ isActive }) => 
                `text-sm font-bold tracking-wider uppercase transition-all duration-200 ${
                  isActive 
                    ? 'text-black border-b-2 border-black pb-1' 
                    : 'text-gray-600 hover:text-gray-900'
                }`
              }
            >
              Categories
            </NavLink>
            <NavLink 
              to="/contact"
              className={({ isActive }) => 
                `text-sm font-bold tracking-wider uppercase transition-all duration-200 ${
                  isActive 
                    ? 'text-black border-b-2 border-black pb-1' 
                    : 'text-gray-600 hover:text-gray-900'
                }`
              }
            >
              Contact
            </NavLink>
          </nav>

          {/* Centro: Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
            <img src="/IconoProClean.svg" alt="ProClean" className="h-12 w-auto" />
          </div>

          {/* Derecha: Links Admin (solo si es admin) + Iconos */}
          <div className="flex items-center gap-10">
            {/* Links Admin - Solo visible si es admin */}
            {isAdmin && (
              <nav className="flex items-center gap-10">
                <NavLink 
                  to="/informes"
                  className={({ isActive }) => 
                    `text-sm font-bold tracking-wider uppercase transition-all duration-200 ${
                      isActive 
                        ? 'text-black border-b-2 border-black pb-1' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`
                  }
                >
                  Informes
                </NavLink>
                <NavLink 
                  to="/gestion"
                  className={({ isActive }) => 
                    `text-sm font-bold tracking-wider uppercase transition-all duration-200 ${
                      isActive 
                        ? 'text-black border-b-2 border-black pb-1' 
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
