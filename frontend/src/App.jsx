import { Link, Route, Routes, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Categories from "./pages/Categories.jsx";
import Contact from "./pages/Contact.jsx";
import Gestion from "./pages/Gestion.jsx";
import Informes from "./pages/Informes.jsx";
import Login from "./pages/Login.jsx";

// Componente del dropdown de usuario
const UserDropdown = ({ isOpen, onClose, onNavigateToLogin }) => {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '80px',
      right: '0',
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      minWidth: '250px',
      zIndex: 1000,
      padding: '20px'
    }}>
      {isAuthenticated ? (
        <div>
          <div style={{ marginBottom: '15px' }}>
            <h3 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '16px' }}>
              Hola, {user?.nombre}
            </h3>
            <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
              {user?.email}
            </p>
            {user?.rol === 'admin' && (
              <span style={{
                display: 'inline-block',
                backgroundColor: '#4CAF50',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                marginTop: '5px'
              }}>
                Admin
              </span>
            )}
          </div>
          <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h3 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '16px' }}>
            Iniciar Sesión
          </h3>
          <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '14px' }}>
            Accede a tu cuenta para usar todas las funciones
          </p>
          <button
            onClick={() => {
              onNavigateToLogin();
              onClose();
            }}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#000',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Ir a Login
          </button>
        </div>
      )}
    </div>
  );
};

// Componente del header que usa el contexto de autenticación
const Header = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleUserClick = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <header style={{ 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "space-between",
      padding: "16px 0",
      borderBottom: "1px solid #e5e5e5",
      position: "relative"
    }}>
      {/* Izquierda: Home, Categories, Contact */}
      <nav style={{ display: "flex", gap: "32px" }}>
        <NavLink 
          to="/" 
          end
          style={({ isActive }) => ({
            color: isActive ? "#111111" : "#111111",
            textDecoration: "none",
            fontWeight: isActive ? "600" : "400",
            fontSize: "24px"
          })}
        >
          Home
        </NavLink>
        <NavLink 
          to="/categories"
          style={({ isActive }) => ({
            color: isActive ? "#111111" : "#111111",
            textDecoration: "none",
            fontWeight: isActive ? "600" : "400",
            fontSize: "24px"
          })}
        >
          Categories
        </NavLink>
        <NavLink 
          to="/contact"
          style={({ isActive }) => ({
            color: isActive ? "#111111" : "#111111",
            textDecoration: "none",
            fontWeight: isActive ? "600" : "400",
            fontSize: "24px"
          })}
        >
          Contact
        </NavLink>
      </nav>

      {/* Centro: Logo */}
      <img src="/IconoProClean.svg" alt="ProClean" style={{ height: "140px", width: "auto" }} />

      {/* Derecha: Informes, Gestión + Iconos */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {isAdmin && (
          <nav style={{ display: "flex", gap: "20px" }}>
            <NavLink 
              to="/informes"
              style={({ isActive }) => ({
                color: isActive ? "#111111" : "#111111",
                textDecoration: "none",
                fontWeight: isActive ? "600" : "400",
                fontSize: "24px"
              })}
            >
              Informes
            </NavLink>
            <NavLink 
              to="/gestion"
              style={({ isActive }) => ({
                color: isActive ? "#111111" : "#111111",
                textDecoration: "none",
                fontWeight: isActive ? "600" : "400",
                fontSize: "24px"
              })}
            >
              Gestión
            </NavLink>
          </nav>
        )}
        
        {/* Iconos */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          {/* Favoritos */}
          <button style={{
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            backgroundColor: "#000",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer"
          }}>
            <img src="/icons/favorites.svg" alt="Favoritos" style={{ width: "40px", height: "40px" }} />
          </button>

          {/* Carrito - Combinación de cartLeft + texto + cartRight */}
          <div style={{ display: "flex", alignItems: "center" }}>
            {/* CartLeft - Rectángulo negro */}
            <div style={{
              backgroundColor: "#000",
              padding: "8px 12px",
              borderRadius: "4px 0 0 4px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer"
            }}>
              <span style={{ color: "white", fontSize: "24px", fontWeight: "500" }}>Cart</span>
            </div>
            
            {/* CartRight - Icono del carrito */}
            <button style={{
              backgroundColor: "#000",
              border: "none",
              padding: "8px",
              borderRadius: "0 4px 4px 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <img src="/icons/cartRight.svg" alt="Carrito" style={{ width: "40px", height: "40px" }} />
            </button>
          </div>

          {/* Usuario con dropdown */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button 
              onClick={handleUserClick}
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                backgroundColor: "#000",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                position: "relative"
              }}
              title={isAuthenticated ? `Hola, ${user?.nombre}` : "Iniciar sesión"}
            >
              <img src="/icons/user.svg" alt="Usuario" style={{ width: "40px", height: "40px" }} />
              {isAuthenticated && (
                <div style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  width: "20px",
                  height: "20px",
                  backgroundColor: "#4CAF50",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  color: "white",
                  fontWeight: "bold"
                }}>
                  ✓
                </div>
              )}
            </button>
            
            {/* Dropdown */}
            <UserDropdown 
              isOpen={dropdownOpen} 
              onClose={() => setDropdownOpen(false)}
              onNavigateToLogin={handleNavigateToLogin}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

// Componente principal de la aplicación
const AppContent = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div style={{ fontFamily: "sans-serif", padding: isLoginPage ? 0 : 16 }}>
      {!isLoginPage && (
        <>
          <Header />
          <hr />
        </>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/informes" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <Informes />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/gestion" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <Gestion />
            </ProtectedRoute>
          } 
        />
      </Routes>
      {!isLoginPage && (
        <footer style={{ marginTop: 24 }}>
          <small>@Copyright Smuke</small>
        </footer>
      )}
    </div>
  );
};

// Componente raíz con el provider de autenticación
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
