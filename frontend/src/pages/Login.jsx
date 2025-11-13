import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLogin, setIsLogin] = useState(true);
  const [registerData, setRegisterData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    documento: '',
    telefono: '',
    direccion: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, register, error, clearError, loading } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (isLogin) {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setRegisterData(prev => ({ ...prev, [name]: value }));
    }
    clearError();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (error) {
      console.error('Error en login:', error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      const { confirmPassword, ...userData } = registerData;
      await register(userData);
      alert('Usuario registrado exitosamente. Ahora puedes iniciar sesión.');
      setIsLogin(true);
      setRegisterData({
        nombre: '',
        email: '',
        password: '',
        confirmPassword: '',
        documento: '',
        telefono: '',
        direccion: ''
      });
    } catch (error) {
      console.error('Error en registro:', error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: 'sans-serif'
    }} className="flex flex-col md:flex-row">
      {/* Sección Izquierda - Formulario */}
      <div style={{
        flex: 1,
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative'
      }} className="w-full">
        {/* Cuadro blanco del formulario */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '400px',
          position: 'relative'
        }}>
          {/* Punto rojo en esquina superior derecha */}
          {error && (
            <div style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              width: '8px',
              height: '8px',
              backgroundColor: '#ff4444',
              borderRadius: '50%'
            }}></div>
          )}

          {/* Título */}
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#333',
            textAlign: 'center',
            marginBottom: '30px',
            marginTop: '0'
          }}>
            {isLogin ? 'Login' : 'Sign Up'}
          </h1>

          {/* Error message */}
          {error && (
            <div style={{
              backgroundColor: '#fee',
              color: '#c33',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLogin}>
              {/* Email */}
              <div style={{ marginBottom: '20px' }}>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '15px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    backgroundColor: '#fafafa'
                  }}
                  placeholder="Email Address"
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: '20px', position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '15px',
                    paddingRight: '50px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    backgroundColor: '#fafafa'
                  }}
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                    color: '#666'
                  }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>

              {/* Remember Me y Forgot Password */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px'
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#666'
                }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  Remember Me
                </label>
                <Link
                  to="/forgot-password"
                  style={{
                    color: '#666',
                    textDecoration: 'none',
                    fontSize: '14px'
                  }}
                >
                  Forgot Password
                </Link>
              </div>

              {/* Botón Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '15px',
                  backgroundColor: '#000',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  marginBottom: '20px'
                }}
              >
                {loading ? 'Entering...' : 'Enter'}
              </button>
              </form>
          ) : (
            <form onSubmit={handleRegister}>
              {/* Nombre */}
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="text"
                  name="nombre"
                  value={registerData.nombre}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '15px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    backgroundColor: '#fafafa'
                  }}
                  placeholder="Full Name"
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="email"
                  name="email"
                  value={registerData.email}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '15px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    backgroundColor: '#fafafa'
                  }}
                  placeholder="Email Address"
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="password"
                  name="password"
                  value={registerData.password}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '15px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    backgroundColor: '#fafafa'
                  }}
                  placeholder="Password"
                />
              </div>

              {/* Confirm Password */}
              <div style={{ marginBottom: '30px' }}>
                <input
                  type="password"
                  name="confirmPassword"
                  value={registerData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '15px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    backgroundColor: '#fafafa'
                  }}
                  placeholder="Confirm Password"
                />
              </div>

              {/* Botón Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '15px',
                  backgroundColor: '#000',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  marginBottom: '20px'
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Don't Have Account / Sign Up */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#666', fontSize: '14px', margin: '0' }}>
              {isLogin ? "Don't Have An Account?" : 'Already Have An Account?'}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  clearError();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#D4AF37',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  marginLeft: '5px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Sección Derecha - Branding */}
      <div style={{
        flex: 1,
        backgroundColor: '#2c2c2c',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }} className="w-full">
        {/* Logo centrado */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '240px',
          height: '240px'
        }}>
          <img 
            src="/IconoProClean.svg" 
            alt="ProClean" 
            style={{ 
              width: '100%', 
              height: '100%',
              objectFit: 'contain'
            }} 
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
