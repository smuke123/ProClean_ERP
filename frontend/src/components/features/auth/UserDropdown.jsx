import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext.jsx';

const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const handleLogin = () => {
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de Usuario */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 relative bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
        title={isAuthenticated ? `Hola, ${user?.nombre}` : "Iniciar sesión"}
      >
        <img src="/icons/user.svg" alt="Usuario" className="w-4 h-4" />
        {isAuthenticated && (
          <span className="absolute -top-0.5 -right-0.5 bg-green-500 w-2.5 h-2.5 rounded-full border-2 border-white"></span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
          {isAuthenticated ? (
            <>
              {/* Información del usuario */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800">{user?.nombre}</p>
                <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                {user?.rol === 'admin' && (
                  <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    Administrador
                  </span>
                )}
              </div>

              {/* Opciones del menú */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // Aquí puedes navegar a perfil si lo implementas
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Mi Perfil
                </button>
                
                {user?.sucursal && (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    <span className="font-medium">Sucursal:</span> {user.sucursal.nombre}
                  </div>
                )}
              </div>

              {/* Logout */}
              <div className="border-t border-gray-100 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                  Cerrar Sesión
                </button>
              </div>
            </>
          ) : (
            <>
              {/* No autenticado */}
              <div className="px-4 py-3">
                <p className="text-sm text-gray-600 mb-3">Inicia sesión para acceder a todas las funciones</p>
                <button
                  onClick={handleLogin}
                  className="w-full bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  Iniciar Sesión
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDropdown;

