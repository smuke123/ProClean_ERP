import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import UserDropdown from '../features/auth/UserDropdown.jsx';
import CartDropdown from '../features/cart/CartDropdown.jsx';

const Header = () => {
  const { isAdmin } = useAuth();
  const [sticky, setSticky] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
        {/* VERSIÓN MÓVIL - visible solo en pantallas pequeñas */}
        <div className="sm:hidden w-full px-4 flex items-center justify-between">
          {/* Botón hamburguesa */}
          <button
            aria-label="Abrir menú"
            className="inline-flex flex-col items-center justify-center rounded-md p-2 border border-gray-300 text-gray-700"
            onClick={() => setMobileOpen(true)}
          >
            <span className="block w-5 h-[2px] bg-current"></span>
            <span className="block w-5 h-[2px] bg-current my-1"></span>
            <span className="block w-5 h-[2px] bg-current"></span>
          </button>

          {/* Logo centrado */}
          <div className="flex-1 flex justify-center">
            <img src="/IconoProClean.svg" alt="ProClean" className="object-contain h-12 w-auto"/>
          </div>

          {/* Espaciador para mantener el logo centrado */}
          <div className="w-[52px]" />
        </div>

        {/* VERSIÓN DESKTOP - visible solo en pantallas medianas/grandes */}
        <div className="hidden sm:flex items-center w-10/12 m-auto relative flex-nowrap" style={{ height: '64px' }}>
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

        {/* Menú móvil a pantalla completa */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 bg-white">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <img src="/IconoProClean.svg" alt="ProClean" className="h-10 w-auto"/>
              <button
                aria-label="Cerrar menú"
                className="inline-flex flex-col items-center justify-center rounded-md p-2 border border-gray-300 text-gray-700"
                onClick={() => setMobileOpen(false)}
              >
                <span className="block w-5 h-[2px] bg-current rotate-45 translate-y-[3px]"></span>
                <span className="block w-5 h-[2px] bg-current -rotate-45 -translate-y-[1px]"></span>
              </button>
            </div>
            <nav className="px-6 py-6">
              <ul className="flex flex-col items-center text-center text-lg" style={{ gap: '1rem' }}>
                <li className="w-full">
                  <NavLink 
                    to="/" 
                    end
                    onClick={() => setMobileOpen(false)} 
                    className="block w-full py-3 hover:bg-gray-100 rounded"
                  >
                    Home
                  </NavLink>
                </li>
                <li className="w-full">
                  <NavLink 
                    to="/categories" 
                    onClick={() => setMobileOpen(false)} 
                    className="block w-full py-3 hover:bg-gray-100 rounded"
                  >
                    Categories
                  </NavLink>
                </li>
                <li className="w-full">
                  <NavLink 
                    to="/contact" 
                    onClick={() => setMobileOpen(false)} 
                    className="block w-full py-3 hover:bg-gray-100 rounded"
                  >
                    Contact
                  </NavLink>
                </li>
                {isAdmin && (
                  <>
                    <li className="w-full">
                      <NavLink 
                        to="/informes" 
                        onClick={() => setMobileOpen(false)} 
                        className="block w-full py-3 hover:bg-gray-100 rounded"
                      >
                        Informes
                      </NavLink>
                    </li>
                    <li className="w-full">
                      <NavLink 
                        to="/gestion" 
                        onClick={() => setMobileOpen(false)} 
                        className="block w-full py-3 hover:bg-gray-100 rounded"
                      >
                        Gestión
                      </NavLink>
                    </li>
                  </>
                )}
              </ul>
            </nav>
            <div className="px-6 border-t pt-4">
              <div className="flex items-center justify-center" style={{ gap: '1.5rem' }}>
                  <CartDropdown isHeaderSticky={false} />
                  <UserDropdown isHeaderSticky={false} />
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;