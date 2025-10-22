import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleExploreProducts = () => {
    navigate('/categories');
  };

  const handleViewCatalog = () => {
    if (!isAuthenticated) {
      alert('Por favor, inicia sesión para ver el catálogo completo');
      navigate('/login');
    } else {
      navigate('/categories');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          ProClean ERP
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Sistema integral de gestión empresarial para empresas de limpieza
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="primary" size="lg" onClick={handleExploreProducts}>
            Explorar Productos
          </Button>
          <Button variant="secondary" size="lg" onClick={handleViewCatalog}>
            Ver Catálogo
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hover className="text-center">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Gestión de Inventario
          </h3>
          <p className="text-gray-600">
            Control completo de stock y productos en todas las sucursales
          </p>
        </Card>

        <Card hover className="text-center">
          <div className="text-4xl mb-4">🛒</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Ventas y Pedidos
          </h3>
          <p className="text-gray-600">
            Procesa pedidos y gestiona ventas de manera eficiente
          </p>
        </Card>

        <Card hover className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Reportes y Análisis
          </h3>
          <p className="text-gray-600">
            Informes detallados para tomar mejores decisiones
          </p>
        </Card>
      </div>

      {/* Stats Section */}
      <Card className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-black mb-2">50+</div>
            <div className="text-gray-600">Productos</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-black mb-2">2</div>
            <div className="text-gray-600">Sucursales</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-black mb-2">100+</div>
            <div className="text-gray-600">Clientes</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-black mb-2">24/7</div>
            <div className="text-gray-600">Disponible</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
