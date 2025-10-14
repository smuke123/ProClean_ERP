// Componente Card reutilizable con Tailwind
const Card = ({ 
  children, 
  className = '', 
  padding = 'p-6',
  hover = false 
}) => {
  const baseClasses = 'bg-white rounded-xl border border-gray-200';
  const hoverClasses = hover ? 'hover:shadow-lg transition-shadow' : '';
  
  return (
    <div className={`${baseClasses} ${padding} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
