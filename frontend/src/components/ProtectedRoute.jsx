import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Cargando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#c33', marginBottom: '20px' }}>
          Acceso Denegado
        </h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          No tienes permisos para acceder a esta sección.
        </p>
        <button
          onClick={() => window.history.back()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#000',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Volver
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
