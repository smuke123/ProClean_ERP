import { Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { CartProvider } from "./contexts/CartContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Layout Components
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";

// Pages
import Home from "./pages/Home.jsx";
import Categories from "./pages/Categories.jsx";
import Cart from "./pages/Cart.jsx";
import Contact from "./pages/Contact.jsx";
import Gestion from "./pages/Gestion.jsx";
import Informes from "./pages/Informes.jsx";
import Login from "./pages/Login.jsx";
import Perfil from "./pages/Perfil.jsx";

// Componente principal de la aplicación
const AppContent = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-gray-50">
      {!isLoginPage && (
        <>
          <Header />
          <hr className="border-gray-100" />
        </>
      )}
      
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/perfil" 
            element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            } 
          />
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
      </main>

      {!isLoginPage && <Footer />}
    </div>
  );
};

// Componente raíz con todos los providers
export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}