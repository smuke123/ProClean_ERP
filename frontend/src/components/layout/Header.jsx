import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import UserDropdown from '../features/auth/UserDropdown.jsx';
import CartDropdown from '../features/cart/CartDropdown.jsx';

const Header = () => {
  const { isAdmin } = useAuth();

  return (
    <header className="header py-4 sticky top-0 z-50 bg-white shadow-md">
      <div className="flex flex-wrap justify-between items-center w-10/12 m-auto">
        {/* Izquierda: Logo */}
        <div>
          <img src="/IconoProClean.svg" alt="ProClean" className="h-10 w-auto" />
        </div>

        {/* Centro: Links de navegación */}
        <nav className="md:flex flex-wrap text-base py-3">
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

          {/* Links Admin - Solo visible si es admin */}
          {isAdmin && (
            <>
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
            </>
          )}
        </nav>

        {/* Derecha: Iconos */}
        <div className="flex items-center">
          <div className="mr-5">
            <CartDropdown />
          </div>
          <div className="mr-5">
            <UserDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
