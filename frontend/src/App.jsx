import { Link, Route, Routes, NavLink } from "react-router-dom";
import Gestion from "./pages/Gestion.jsx";
import Informes from "./pages/Informes.jsx";

export default function App() {
  return (
    <div style={{ fontFamily: "sans-serif", padding: 16 }}>
      <header style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <h2>ProClean ERP - Admin</h2>
        <nav style={{ display: "flex", gap: 12 }}>
          <NavLink to="/" end>Gestión</NavLink>
          <NavLink to="/informes">Informes</NavLink>
        </nav>
      </header>
      <hr />
      <Routes>
        <Route path="/" element={<Gestion />} />
        <Route path="/informes" element={<Informes />} />
      </Routes>
      <footer style={{ marginTop: 24 }}>
        <small>Sin login (modo admin) — Demo</small>
      </footer>
    </div>
  );
}
