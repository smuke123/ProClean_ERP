import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';

// Middleware para verificar token JWT
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_super_seguro', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Middleware para verificar rol del usuario
export const requireRole = (rol) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (req.user.rol !== rol) {
      return res.status(403).json({ 
        error: 'Acceso denegado',
        message: `Se requiere rol de ${rol}` 
      });
    }

    next();
  };
};

export const authController = {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
      }

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const isValidPassword = await User.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const token = User.generateToken(user);
      const userWithSucursal = await User.getUserWithSucursal(user.id_usuario);

      res.json({
        token,
        user: userWithSucursal
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async register(req, res) {
    try {
      const { nombre, email, password, rol = 'cliente', documento, telefono, direccion, id_sucursal } = req.body;

      if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
      }

      const newUser = await User.create({
        nombre, email, password, rol, documento, telefono, direccion, id_sucursal
      });

      const userWithSucursal = await User.getUserWithSucursal(newUser.id);

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: userWithSucursal
      });

    } catch (error) {
      console.error('Error en registro:', error);
      if (error.message === 'El email ya está registrado') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async getProfile(req, res) {
    try {
      const userWithSucursal = await User.getUserWithSucursal(req.user.id);
      
      if (!userWithSucursal) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({ user: userWithSucursal });

    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async getAllUsers(req, res) {
    try {
      if (req.user.rol !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado' });
      }

      const users = await User.findAll();
      res.json({ users });

    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};
