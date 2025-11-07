import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import UserDropdown from '../features/auth/UserDropdown.jsx';
import CartDropdown from '../features/cart/CartDropdown.jsx';

const Header = () => {
  const { isAdmin } = useAuth();
  const [sticky, setSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      {/* Spacer para evitar que el contenido salte cuando el header se vuelve fixed */}
      {sticky && <div style={{ height: '80px' }} />}
      
      <header 
        className={`py-4 transition-all ${sticky ? 'header z-50 shadow-xl' : ''}`}
        style={sticky ? { 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          width: '100%',
          margin: 0
        } : {}}
      >
        <div className="flex items-center w-10/12 m-auto relative flex-nowrap" style={{ height: '64px' }}>
          {/* Izquierda: Home, Categories, Contact */}
        <nav className="flex items-center text-base" style={{ gap: '1.25rem' }}>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `link-hover transition-all ${isActive ? 'active font-bold' : ''}`
            }
            style={{ color: sticky ? '#d1d5db' : '#000' }}
          >
            Home
          </NavLink>
          <NavLink
            to="/categories"
            className={({ isActive }) =>
              `link-hover transition-all ${isActive ? 'active font-bold' : ''}`
            }
            style={{ color: sticky ? '#d1d5db' : '#000' }}
          >
            Categories
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `link-hover transition-all ${isActive ? 'active font-bold' : ''}`
            }
            style={{ color: sticky ? '#d1d5db' : '#000' }}
          >
            Contact
          </NavLink>
        </nav>

        {/* Centro: Logo - Posición absoluta centrada */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <img src="/IconoProClean.svg" alt="ProClean" className="object-contain h-24 w-auto"/>
        </div>

        {/* Derecha: Links Admin (si es admin) + Iconos */}
        <div className="flex items-center ml-auto flex-nowrap">
          {/* Links Admin - Solo visible si es admin */}
          {isAdmin && (
            <nav className="flex items-center text-base" style={{ gap: '1.25rem', marginRight: '1.25rem' }}>
              <NavLink
                to="/informes"
                className={({ isActive }) =>
                  `link-hover transition-all ${isActive ? 'active font-bold' : ''}`
                }
                style={{ color: sticky ? '#d1d5db' : '#000' }}
              >
                Informes
              </NavLink>
              <NavLink
                to="/gestion"
                className={({ isActive }) =>
                  `link-hover transition-all ${isActive ? 'active font-bold' : ''}`
                }
                style={{ color: sticky ? '#d1d5db' : '#000' }}
              >
                Gestión
              </NavLink>
            </nav>
          )}

          {/* Iconos */}
          <div className="flex items-center" style={{ gap: '1.25rem' }}>
            <CartDropdown isHeaderSticky={sticky} />
            <UserDropdown isHeaderSticky={sticky} />
          </div>
        </div>
      </div>
    </header>
    </>
  );
};

export default Header;
