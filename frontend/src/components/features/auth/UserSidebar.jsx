import { useAuth } from '../../../contexts/AuthContext.jsx';
import Sidebar from '../../ui/Sidebar.jsx';
import Button from '../../ui/Button.jsx';
import Card from '../../ui/Card.jsx';
import Badge from '../../ui/Badge.jsx';

const UserSidebar = ({ isOpen, onClose }) => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <Sidebar isOpen={isOpen} onClose={onClose} title={isAuthenticated ? 'Mi Cuenta' : 'Iniciar Sesión'} width="w-80">
      {isAuthenticated ? (
        <div className="flex flex-col h-full">
          {/* Información del usuario */}
          <Card className="mb-8">
            <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mb-4">
              <img src="/icons/user.svg" alt="Usuario" className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-1">
              {user?.nombre}
            </h3>
            <p className="text-gray-600 text-sm mb-2">
              {user?.email}
            </p>
            {user?.rol === 'admin' && (
              <Badge variant="success" size="sm" className="mb-2">
                Administrador
              </Badge>
            )}
            {user?.sucursal && (
              <p className="text-gray-600 text-sm">
                Sucursal: {user.sucursal.nombre}
              </p>
            )}
          </Card>

          {/* Opciones del menú */}
          <div className="mb-8 space-y-3">
            <Button variant="primary" size="lg" className="w-full justify-center gap-3">
              <span>👤</span>
              Ver Perfil
            </Button>
            
            <Button variant="secondary" size="lg" className="w-full justify-center gap-3">
              <span>⚙️</span>
              Configuración
            </Button>
          </div>

          {/* Botón de cerrar sesión */}
          <div className="mt-auto pt-5 border-t border-gray-200">
            <Button
              variant="danger"
              size="lg"
              className="w-full justify-center gap-3"
              onClick={() => {
                logout();
                onClose();
              }}
            >
              <span>🚪</span>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-center h-full">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl">
              👤
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              ¡Bienvenido!
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Inicia sesión para acceder a todas las funciones de tu cuenta
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full justify-center gap-3"
            onClick={() => {
              window.location.href = '/login';
              onClose();
            }}
          >
            <span>🔑</span>
            Iniciar Sesión
          </Button>
        </div>
      )}
    </Sidebar>
  );
};

export default UserSidebar;
