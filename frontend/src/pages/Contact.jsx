import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

export default function Contact() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Contacto
        </h1>
        <p className="text-xl text-gray-600">
          Ponte en contacto con nuestro equipo
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Información de contacto */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Información de Contacto
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">📧</div>
                <div>
                  <p className="font-medium text-gray-800">Email</p>
                  <p className="text-gray-600">contacto@proclean.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-2xl">📞</div>
                <div>
                  <p className="font-medium text-gray-800">Teléfono</p>
                  <p className="text-gray-600">+57 300 123 4567</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-2xl">📍</div>
                <div>
                  <p className="font-medium text-gray-800">Dirección</p>
                  <p className="text-gray-600">Calle 123 #45-67, Bogotá</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Horarios de Atención
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Lunes - Viernes</span>
                <span className="font-medium">8:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sábados</span>
                <span className="font-medium">9:00 AM - 2:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Domingos</span>
                <span className="font-medium">Cerrado</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Formulario de contacto */}
        <Card>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Envíanos un Mensaje
          </h3>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre"
                type="text"
                placeholder="Tu nombre"
              />
              <Input
                label="Email"
                type="email"
                placeholder="tu@email.com"
              />
            </div>
            <Input
              label="Asunto"
              type="text"
              placeholder="¿En qué podemos ayudarte?"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                rows="4"
                placeholder="Escribe tu mensaje aquí..."
              />
            </div>
            <Button variant="primary" size="lg" className="w-full">
              Enviar Mensaje
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
