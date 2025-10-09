import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';

const router = Router();

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

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario por email
    const [users] = await db.execute(
      'SELECT * FROM Usuarios WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = users[0];

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: user.id_usuario, 
        email: user.email, 
        rol: user.rol,
        nombre: user.nombre,
        id_sucursal: user.id_sucursal
      },
      process.env.JWT_SECRET || 'tu_secreto_super_seguro',
      { expiresIn: '24h' }
    );

    // Obtener información de la sucursal si existe
    let sucursal = null;
    if (user.id_sucursal) {
      const [sucursales] = await db.execute(
        'SELECT * FROM Sucursales WHERE id_sucursal = ?',
        [user.id_sucursal]
      );
      sucursal = sucursales[0];
    }

    res.json({
      token,
      user: {
        id: user.id_usuario,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        documento: user.documento,
        telefono: user.telefono,
        direccion: user.direccion,
        sucursal
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Registro
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password, rol = 'cliente', documento, telefono, direccion, id_sucursal } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
    }

    // Verificar si el email ya existe
    const [existingUsers] = await db.execute(
      'SELECT id_usuario FROM Usuarios WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Hash de la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insertar nuevo usuario
    const [result] = await db.execute(
      'INSERT INTO Usuarios (nombre, email, password, rol, documento, telefono, direccion, id_sucursal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, email, hashedPassword, rol, documento || null, telefono || null, direccion || null, id_sucursal || null]
    );

    // Obtener información de la sucursal si existe
    let sucursal = null;
    if (id_sucursal) {
      const [sucursales] = await db.execute(
        'SELECT * FROM Sucursales WHERE id_sucursal = ?',
        [id_sucursal]
      );
      sucursal = sucursales[0];
    }

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: result.insertId,
        nombre,
        email,
        rol,
        documento,
        telefono,
        direccion,
        sucursal
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener perfil del usuario autenticado
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT * FROM Usuarios WHERE id_usuario = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = users[0];

    // Obtener información de la sucursal si existe
    let sucursal = null;
    if (user.id_sucursal) {
      const [sucursales] = await db.execute(
        'SELECT * FROM Sucursales WHERE id_sucursal = ?',
        [user.id_sucursal]
      );
      sucursal = sucursales[0];
    }

    res.json({
      user: {
        id: user.id_usuario,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        documento: user.documento,
        telefono: user.telefono,
        direccion: user.direccion,
        sucursal
      }
    });

  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener todos los usuarios (solo para admins)
router.get('/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const [users] = await db.execute(
      'SELECT id_usuario, nombre, email, rol, documento, telefono, direccion, id_sucursal FROM Usuarios'
    );

    res.json({ users });

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
