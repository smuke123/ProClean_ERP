/**
 * Sidebar - Componente reutilizable para paneles laterales
 * 
 * @param {boolean} isOpen - Controla si el sidebar está visible
 * @param {function} onClose - Función para cerrar el sidebar
 * @param {string} title - Título del sidebar
 * @param {node} children - Contenido del sidebar
 * @param {string} width - Ancho del sidebar (clases Tailwind, default: 'w-96')
 */
const Sidebar = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  width = 'w-96' 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop/Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`absolute top-0 right-0 w-full sm:${width} max-w-full h-full bg-white shadow-2xl flex flex-col animate-slide-in`}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-200 bg-white">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors text-2xl font-light"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
