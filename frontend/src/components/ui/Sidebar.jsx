// Componente Sidebar base reutilizable con Tailwind
const Sidebar = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  width = 'w-96' 
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop/Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`fixed top-0 right-0 w-full sm:${width} max-w-full h-screen bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col overflow-y-auto`}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors text-2xl"
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
    </>
  );
};

export default Sidebar;
