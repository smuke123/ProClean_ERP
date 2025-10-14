import Card from '../components/ui/Card.jsx';

export default function Categories() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Categorías de Productos
        </h1>
        <p className="text-xl text-gray-600">
          Explora nuestra amplia gama de productos de limpieza
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card hover className="text-center">
          <div className="text-5xl mb-4">🧽</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Limpieza General
          </h3>
          <p className="text-gray-600">
            Productos para limpieza diaria y mantenimiento
          </p>
        </Card>

        <Card hover className="text-center">
          <div className="text-5xl mb-4">🧴</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Detergentes
          </h3>
          <p className="text-gray-600">
            Detergentes especializados para diferentes superficies
          </p>
        </Card>

        <Card hover className="text-center">
          <div className="text-5xl mb-4">🧼</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Desinfectantes
          </h3>
          <p className="text-gray-600">
            Productos para desinfección y sanitización
          </p>
        </Card>

        <Card hover className="text-center">
          <div className="text-5xl mb-4">🧽</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Limpieza de Pisos
          </h3>
          <p className="text-gray-600">
            Especializados en limpieza y mantenimiento de pisos
          </p>
        </Card>

        <Card hover className="text-center">
          <div className="text-5xl mb-4">🧴</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Productos Químicos
          </h3>
          <p className="text-gray-600">
            Químicos especializados para limpieza industrial
          </p>
        </Card>

        <Card hover className="text-center">
          <div className="text-5xl mb-4">🧼</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Accesorios
          </h3>
          <p className="text-gray-600">
            Herramientas y accesorios para limpieza profesional
          </p>
        </Card>
      </div>
    </div>
  );
}
