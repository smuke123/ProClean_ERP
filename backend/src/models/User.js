import pool from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class User {
  static async findByEmail(email) {
    const [users] = await pool.execute(
      'SELECT * FROM Usuarios WHERE email = ?',
      [email]
    );
    return users[0] || null;
  }

  static async findById(id) {
    const [users] = await pool.execute(
      'SELECT * FROM Usuarios WHERE id_usuario = ?',
      [id]
    );
    return users[0] || null;
  }

  static async findAll() {
    const [users] = await pool.execute(
      'SELECT id_usuario, nombre, email, rol, documento, telefono, direccion, id_sucursal FROM Usuarios'
    );
    return users;
  }

  static async create(userData) {
    const { nombre, email, password, rol = 'cliente', documento, telefono, direccion, id_sucursal } = userData;
    
    // Verificar si el email ya existe
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Hash de la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insertar nuevo usuario
    const [result] = await pool.execute(
      'INSERT INTO Usuarios (nombre, email, password, rol, documento, telefono, direccion, id_sucursal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, email, hashedPassword, rol, documento || null, telefono || null, direccion || null, id_sucursal || null]
    );

    return {
      id: result.insertId,
      nombre,
      email,
      rol,
      documento,
      telefono,
      direccion,
      id_sucursal
    };
  }

  static async update(id, userData) {
    const { nombre, email, rol, documento, telefono, direccion, id_sucursal } = userData;
    
    const [result] = await pool.execute(
      'UPDATE Usuarios SET nombre=?, email=?, rol=?, documento=?, telefono=?, direccion=?, id_sucursal=? WHERE id_usuario=?',
      [nombre, email, rol, documento, telefono, direccion, id_sucursal, id]
    );
    
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM Usuarios WHERE id_usuario = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  static generateToken(user) {
    return jwt.sign(
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
  }

  static async getUserWithSucursal(userId) {
    const user = await this.findById(userId);
    if (!user) return null;

    let sucursal = null;
    if (user.id_sucursal) {
      const [sucursales] = await pool.execute(
        'SELECT * FROM Sucursales WHERE id_sucursal = ?',
        [user.id_sucursal]
      );
      sucursal = sucursales[0];
    }

    return {
      id: user.id_usuario,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      documento: user.documento,
      telefono: user.telefono,
      direccion: user.direccion,
      sucursal
    };
  }
}
