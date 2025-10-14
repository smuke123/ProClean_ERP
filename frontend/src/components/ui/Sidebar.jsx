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
    <div className={`fixed top-0 right-0 ${width} h-screen bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col overflow-y-auto`}>
      {/* Header */}
      <div className="flex justify-between items-center p-5 border-b border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800">
          {title}
        </h2>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-5">
        {children}
      </div>
    </div>
  );
};

export default Sidebar;
