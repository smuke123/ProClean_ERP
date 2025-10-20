import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
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
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      {/* Sección Izquierda - Formulario */}
      <div className="flex-1 bg-gray-100 flex items-center justify-center p-6 md:p-10 relative">
        {/* Cuadro blanco del formulario */}
        <div className="bg-white p-8 md:p-10 rounded-lg shadow-xl w-full max-w-md relative">
          {/* Punto rojo en esquina superior derecha */}
          {error && (
            <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full"></div>
          )}

          {/* Título */}
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
            {isLogin ? 'Login' : 'Sign Up'}
          </h1>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-5 text-sm text-center">
              {error}
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-4 border border-gray-300 rounded-md text-base bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="Email Address"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-4 pr-12 border border-gray-300 rounded-md text-base bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-lg text-gray-600 hover:text-gray-800"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>

              {/* Remember Me y Forgot Password */}
              <div className="flex justify-between items-center">
                <label className="flex items-center cursor-pointer text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="mr-2"
                  />
                  Remember Me
                </label>
                <Link
                  to="/forgot-password"
                  className="text-gray-600 no-underline text-sm hover:text-gray-800"
                >
                  Forgot Password
                </Link>
              </div>

              {/* Botón Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-4 bg-black text-white border-none rounded-md text-base font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 hover:bg-gray-800 transition-colors"
              >
                {loading ? 'Entering...' : 'Enter'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Nombre */}
              <div>
                <input
                  type="text"
                  name="nombre"
                  value={registerData.nombre}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-4 border border-gray-300 rounded-md text-base bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="Full Name"
                />
              </div>

              {/* Email */}
              <div>
                <input
                  type="email"
                  name="email"
                  value={registerData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-4 border border-gray-300 rounded-md text-base bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="Email Address"
                />
              </div>

              {/* Password */}
              <div>
                <input
                  type="password"
                  name="password"
                  value={registerData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-4 border border-gray-300 rounded-md text-base bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="Password"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={registerData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-4 border border-gray-300 rounded-md text-base bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="Confirm Password"
                />
              </div>

              {/* Botón Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-4 bg-black text-white border-none rounded-md text-base font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 hover:bg-gray-800 transition-colors mt-6"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Don't Have Account / Sign Up */}
          <div className="text-center mt-5">
            <p className="text-gray-600 text-sm m-0">
              {isLogin ? "Don't Have An Account?" : 'Already Have An Account?'}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  clearError();
                }}
                className="bg-transparent border-none text-yellow-600 underline cursor-pointer ml-1 text-sm font-medium hover:text-yellow-700"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Sección Derecha - Branding */}
      <div className="hidden md:flex flex-1 bg-gray-800 items-center justify-center p-10">
        {/* Logo centrado */}
        <div className="flex items-center justify-center w-72 h-72">
          <img 
            src="/IconoProClean.svg" 
            alt="ProClean" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
