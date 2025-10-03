import { Link, Route, Routes, NavLink } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Categories from "./pages/Categories.jsx";
import Contact from "./pages/Contact.jsx";
import Gestion from "./pages/Gestion.jsx";
import Informes from "./pages/Informes.jsx";

export default function App() {
  return (
    <div style={{ fontFamily: "sans-serif", padding: 16 }}>
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
              <img src="/icons/user.svg" alt="Usuario" style={{ width: "40px", height: "40px" }} />
            </button>
          </div>
        </div>
      </header>
      <hr />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/gestion" element={<Gestion />} />
        <Route path="/informes" element={<Informes />} />
      </Routes>
      <footer style={{ marginTop: 24 }}>
        <small>@Copyright Smuke</small>
      </footer>
    </div>
  );
}
