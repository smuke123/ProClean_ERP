import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

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
        textAlign: 'center',
        padding: '40px'
      }}>
        <div style={{
          fontSize: '60px',
          marginBottom: '20px'
        }}>
          🔒
        </div>
        <h2 style={{ color: '#c33', marginBottom: '20px', fontSize: '24px' }}>
          Acceso Denegado
        </h2>
        <p style={{ color: '#666', marginBottom: '30px', fontSize: '16px', maxWidth: '500px' }}>
          Esta sección está reservada solo para administradores. 
          Por favor, contacta a un administrador si necesitas acceso.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#000',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Ir al Inicio
          </button>
          <button
            onClick={() => window.history.back()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#fff',
              color: '#000',
              border: '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
