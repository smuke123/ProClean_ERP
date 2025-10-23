import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import UserDropdown from '../features/auth/UserDropdown.jsx';
import CartDropdown from '../features/cart/CartDropdown.jsx';

const Header = () => {
  const { isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`header fixed top-0 left-0 right-0 z-50 shadow-md overflow-visible transition-all duration-300 ${
        scrolled ? 'bg-gray-800' : 'bg-white'
      }`} 
      style={{ height: '64px' }}
    >
      <div className="flex items-center justify-between px-[10%] relative" style={{ height: '64px', maxWidth: '100%' }}>
        {/* Izquierda: Home, Categories, Contact */}
        <nav className="flex items-center text-base">
          <div className="mr-5">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `link-hover transition-all ${
                  isActive 
                    ? `active font-bold ${scrolled ? 'text-white' : 'text-black'}` 
                    : scrolled ? 'text-gray-300 hover:text-white' : 'text-gray-700'
                }`
              }
            >
              Home
            </NavLink>
          </div>
          <div className="mr-5">
            <NavLink
              to="/categories"
              className={({ isActive }) =>
                `link-hover transition-all ${
                  isActive 
                    ? `active font-bold ${scrolled ? 'text-white' : 'text-black'}` 
                    : scrolled ? 'text-gray-300 hover:text-white' : 'text-gray-700'
                }`
              }
            >
              Categories
            </NavLink>
          </div>
          <div className="mr-5">
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `link-hover transition-all ${
                  isActive 
                    ? `active font-bold ${scrolled ? 'text-white' : 'text-black'}` 
                    : scrolled ? 'text-gray-300 hover:text-white' : 'text-gray-700'
                }`
              }
            >
              Contact
            </NavLink>
          </div>
        </nav>

        {/* Centro: Logo - Posición absoluta centrada */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <img 
            src="/IconoProClean.svg" 
            alt="ProClean" 
            className={`w-auto transition-all duration-300 ${scrolled ? 'brightness-0 invert' : ''}`}
            style={{ maxHeight: '40px', objectFit: 'contain' }} 
          />
        </div>

        {/* Derecha: Links Admin (si es admin) + Iconos */}
        <div className="flex items-center flex-nowrap gap-6">
          {/* Links Admin - Solo visible si es admin */}
          {isAdmin && (
            <nav className="flex items-center text-base">
              <div className="mr-5">
                <NavLink
                  to="/informes"
                  className={({ isActive }) =>
                    `link-hover transition-all ${
                      isActive 
                        ? `active font-bold ${scrolled ? 'text-white' : 'text-black'}` 
                        : scrolled ? 'text-gray-300 hover:text-white' : 'text-gray-700'
                    }`
                  }
                >
                  Informes
                </NavLink>
              </div>
              <div className="mr-5">
                <NavLink
                  to="/gestion"
                  className={({ isActive }) =>
                    `link-hover transition-all ${
                      isActive 
                        ? `active font-bold ${scrolled ? 'text-white' : 'text-black'}` 
                        : scrolled ? 'text-gray-300 hover:text-white' : 'text-gray-700'
                    }`
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
