import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import UserDropdown from '../features/auth/UserDropdown.jsx';
import CartDropdown from '../features/cart/CartDropdown.jsx';

const Header = () => {
  const { isAdmin } = useAuth();

  return (
    <header className="header sticky top-0 z-50 bg-white shadow-md" style={{ height: '64px' }}>
      <div className="flex items-center w-10/12 m-auto relative flex-nowrap overflow-hidden" style={{ height: '64px' }}>
        {/* Izquierda: Home, Categories, Contact */}
        <nav className="flex items-center text-base">
          <div className="mr-5">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `link-hover transition-all ${isActive ? 'active font-bold text-black' : 'text-gray-700'}`
              }
            >
              Home
            </NavLink>
          </div>
          <div className="mr-5">
            <NavLink
              to="/categories"
              className={({ isActive }) =>
                `link-hover transition-all ${isActive ? 'active font-bold text-black' : 'text-gray-700'}`
              }
            >
              Categories
            </NavLink>
          </div>
          <div className="mr-5">
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `link-hover transition-all ${isActive ? 'active font-bold text-black' : 'text-gray-700'}`
              }
            >
              Contact
            </NavLink>
          </div>
        </nav>

        {/* Centro: Logo - Posición absoluta centrada */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <img src="/IconoProClean.svg" alt="ProClean" className="w-auto" style={{ maxHeight: '40px', objectFit: 'contain' }} />
        </div>

        {/* Derecha: Links Admin (si es admin) + Iconos */}
        <div className="flex items-center ml-auto flex-nowrap">
          {/* Links Admin - Solo visible si es admin */}
          {isAdmin && (
            <nav className="flex items-center text-base">
              <div className="mr-5">
                <NavLink
                  to="/informes"
                  className={({ isActive }) =>
                    `link-hover transition-all ${isActive ? 'active font-bold text-black' : 'text-gray-700'}`
                  }
                >
                  Informes
                </NavLink>
              </div>
              <div className="mr-5">
                <NavLink
                  to="/gestion"
                  className={({ isActive }) =>
                    `link-hover transition-all ${isActive ? 'active font-bold text-black' : 'text-gray-700'}`
                  }
                >
                  Gestión
                </NavLink>
              </div>
            </nav>
          )}

          {/* Iconos */}
          <div className="flex items-center">
            <div className="mr-5">
              <CartDropdown />
            </div>
            <div>
              <UserDropdown />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
