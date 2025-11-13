import { useAuth } from '../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';

const Perfil = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirigir si no está autenticado
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Perfil</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna izquierda - Información principal */}
        <div className="md:col-span-2 space-y-6">
          {/* Información personal */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-200">
              Información Personal
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Nombre Completo
                </label>
                <p className="text-base text-gray-900">{user?.nombre}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Correo Electrónico
                </label>
                <p className="text-base text-gray-900">{user?.email}</p>
              </div>
              {user?.telefono && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Teléfono
                  </label>
                  <p className="text-base text-gray-900">{user.telefono}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Información de sucursal */}
          {user?.sucursal && (
            <Card>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-200">
                Sucursal Asignada
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Nombre
                  </label>
                  <p className="text-base text-gray-900">{user.sucursal.nombre}</p>
                </div>
                {user.sucursal.direccion && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Dirección
                    </label>
                    <p className="text-base text-gray-900">{user.sucursal.direccion}</p>
                  </div>
                )}
                {user.sucursal.telefono && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Teléfono
                    </label>
                    <p className="text-base text-gray-900">{user.sucursal.telefono}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Columna derecha - Avatar y acciones */}
        <div className="md:col-span-1 space-y-6">
          {/* Avatar y rol */}
          <Card>
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mb-4">
                <img src="/icons/user.svg" alt="Usuario" className="w-12 h-12" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {user?.nombre}
              </h3>
              {user?.rol === 'admin' && (
                <Badge variant="success" size="md" className="mb-3">
                  Administrador
                </Badge>
              )}
              {user?.rol === 'empleado' && (
                <Badge variant="primary" size="md" className="mb-3">
                  Empleado
                </Badge>
              )}
              {user?.rol === 'cliente' && (
                <Badge variant="secondary" size="md" className="mb-3">
                  Cliente
                </Badge>
              )}
            </div>
          </Card>

          {/* Acciones */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Acciones
            </h3>
            <div className="space-y-3">
              <Button 
                variant="secondary" 
                size="md" 
                className="w-full justify-center gap-2"
                onClick={() => {
                  // TODO: Implementar editar perfil
                  alert('Funcionalidad en desarrollo');
                }}
              >
                <span>✏️</span>
                Editar Perfil
              </Button>
              
              <Button 
                variant="secondary" 
                size="md" 
                className="w-full justify-center gap-2"
                onClick={() => {
                  // TODO: Implementar cambiar contraseña
                  alert('Funcionalidad en desarrollo');
                }}
              >
                <span>🔒</span>
                Cambiar Contraseña
              </Button>

              <div className="pt-3 border-t border-gray-200">
                <Button
                  variant="danger"
                  size="md"
                  className="w-full justify-center gap-2"
                  onClick={handleLogout}
                >
                  <span>🚪</span>
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Perfil;

