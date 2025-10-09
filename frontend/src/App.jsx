import { Link, Route, Routes, NavLink } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Categories from "./pages/Categories.jsx";
import Contact from "./pages/Contact.jsx";
import Gestion from "./pages/Gestion.jsx";
import Informes from "./pages/Informes.jsx";
import Login from "./pages/Login.jsx";

// Componente del header que usa el contexto de autenticación
const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();

  const handleUserClick = () => {
    if (isAuthenticated) {
      // Mostrar menú de usuario o logout
      if (window.confirm('¿Deseas cerrar sesión?')) {
        logout();
      }
    } else {
      // Redirigir al login
      window.location.href = '/login';
    }
  };

  return (
    <header style={{ 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "space-between",
      padding: "16px 0",
      borderBottom: "1px solid #e5e5e5"
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

          {/* Usuario */}
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
        </div>
      </div>
    </header>
  );
};

// Componente principal de la aplicación
const AppContent = () => {
  return (
    <div style={{ fontFamily: "sans-serif", padding: 16 }}>
      <Header />
      <hr />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/informes" 
          element={
            <ProtectedRoute>
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
      <footer style={{ marginTop: 24 }}>
        <small>@Copyright Smuke</small>
      </footer>
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
