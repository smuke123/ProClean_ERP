import pool from '../config/database.js';
import crypto from 'crypto';

/**
 * Modelo ApiKey
 * Gestiona las claves API para integraciones externas
 */
export class ApiKey {
  /**
   * Generar una nueva API Key única
   * @returns {string} API Key en formato hexadecimal
   */
  static generateKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Crear una nueva API Key
   * @param {Object} keyData - Datos de la API Key
   * @returns {Promise<Object>} API Key creada con su clave
   */
  static async create(keyData) {
    const {
      nombre,
      descripcion,
      creado_por,
      organizacion,
      contacto,
      permisos = ['read'],
      recursos_permitidos = ['ventas', 'compras', 'productos', 'inventario'],
      rate_limit = 1000,
      fecha_expiracion = null,
      ip_whitelist = null
    } = keyData;

    const api_key = this.generateKey();

    try {
      const [result] = await pool.query(
        `INSERT INTO API_Keys (
          nombre, api_key, descripcion, creado_por, organizacion, contacto,
          permisos, recursos_permitidos, rate_limit, fecha_expiracion, ip_whitelist
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nombre,
          api_key,
          descripcion,
          creado_por,
          organizacion,
          contacto,
          JSON.stringify(permisos),
          JSON.stringify(recursos_permitidos),
          rate_limit,
          fecha_expiracion,
          ip_whitelist ? JSON.stringify(ip_whitelist) : null
        ]
      );

      return {
        id_api_key: result.insertId,
        api_key, // IMPORTANTE: Solo se devuelve al crear
        nombre,
        organizacion,
        permisos,
        recursos_permitidos
      };
    } catch (error) {
      console.error('Error creando API Key:', error);
      throw error;
    }
  }

  /**
   * Validar una API Key
   * @param {string} api_key - La API Key a validar
   * @param {string} ip - IP del origen (opcional)
   * @returns {Promise<Object|null>} Datos de la key si es válida
   */
  static async validate(api_key, ip = null) {
    try {
      const [[key]] = await pool.query(
        `SELECT 
          id_api_key,
          nombre,
          descripcion,
          permisos,
          recursos_permitidos,
          rate_limit,
          organizacion,
          activa,
          fecha_expiracion,
          ip_whitelist,
          total_requests
        FROM API_Keys
        WHERE api_key = ? AND activa = TRUE`,
        [api_key]
      );

      if (!key) {
        return null;
      }

      // Verificar expiración
      if (key.fecha_expiracion && new Date(key.fecha_expiracion) < new Date()) {
        return null;
      }

      // Verificar IP whitelist
      if (key.ip_whitelist) {
        const whitelist = JSON.parse(key.ip_whitelist);
        if (!whitelist.includes(ip)) {
          return null;
        }
      }

      // Actualizar último uso y contador
      await pool.query(
        `UPDATE API_Keys 
         SET ultimo_uso = CURRENT_TIMESTAMP, total_requests = total_requests + 1
         WHERE id_api_key = ?`,
        [key.id_api_key]
      );

      // Parsear JSON
      key.permisos = JSON.parse(key.permisos);
      key.recursos_permitidos = JSON.parse(key.recursos_permitidos);

      return key;
    } catch (error) {
      console.error('Error validando API Key:', error);
      return null;
    }
  }

  /**
   * Verificar rate limit
   * @param {number} id_api_key - ID de la API Key
   * @returns {Promise<boolean>} True si está dentro del límite
   */
  static async checkRateLimit(id_api_key) {
    try {
      const [[key]] = await pool.query(
        'SELECT rate_limit FROM API_Keys WHERE id_api_key = ?',
        [id_api_key]
      );

      if (!key) return false;

      // Contar requests en la última hora
      const [[count]] = await pool.query(
        `SELECT COUNT(*) as requests
         FROM API_Logs
         WHERE id_api_key = ? AND timestamp > DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
        [id_api_key]
      );

      return count.requests < key.rate_limit;
    } catch (error) {
      console.error('Error verificando rate limit:', error);
      return false;
    }
  }

  /**
   * Registrar uso de la API
   * @param {Object} logData - Datos del log
   */
  static async logUsage(logData) {
    const {
      id_api_key,
      endpoint,
      metodo,
      ip_origen,
      user_agent,
      status_code,
      tiempo_respuesta,
      registros_devueltos = 0
    } = logData;

    try {
      await pool.query(
        `INSERT INTO API_Logs (
          id_api_key, endpoint, metodo, ip_origen, user_agent,
          status_code, tiempo_respuesta, registros_devueltos
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id_api_key,
          endpoint,
          metodo,
          ip_origen,
          user_agent,
          status_code,
          tiempo_respuesta,
          registros_devueltos
        ]
      );
    } catch (error) {
      console.error('Error registrando log:', error);
    }
  }

  /**
   * Obtener todas las API Keys
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de API Keys (sin la clave)
   */
  static async findAll(filters = {}) {
    try {
      let query = `
        SELECT 
          ak.id_api_key,
          ak.nombre,
          ak.descripcion,
          ak.organizacion,
          ak.contacto,
          ak.permisos,
          ak.recursos_permitidos,
          ak.rate_limit,
          ak.activa,
          ak.fecha_creacion,
          ak.fecha_expiracion,
          ak.ultimo_uso,
          ak.total_requests,
          u.nombre as creado_por_nombre,
          CONCAT(LEFT(ak.api_key, 8), '...') as api_key_preview
        FROM API_Keys ak
        LEFT JOIN Usuarios u ON ak.creado_por = u.id_usuario
        WHERE 1=1
      `;

      const params = [];

      if (filters.activa !== undefined) {
        query += ' AND ak.activa = ?';
        params.push(filters.activa);
      }

      if (filters.organizacion) {
        query += ' AND ak.organizacion LIKE ?';
        params.push(`%${filters.organizacion}%`);
      }

      query += ' ORDER BY ak.fecha_creacion DESC';

      const [rows] = await pool.query(query, params);

      // Parsear JSON
      rows.forEach(row => {
        row.permisos = JSON.parse(row.permisos);
        row.recursos_permitidos = JSON.parse(row.recursos_permitidos);
      });

      return rows;
    } catch (error) {
      console.error('Error obteniendo API Keys:', error);
      throw error;
    }
  }

  /**
   * Obtener una API Key por ID
   * @param {number} id_api_key - ID de la API Key
   * @returns {Promise<Object|null>} Datos de la key
   */
  static async findById(id_api_key) {
    try {
      const [[key]] = await pool.query(
        `SELECT 
          ak.*,
          u.nombre as creado_por_nombre,
          CONCAT(LEFT(ak.api_key, 8), '...') as api_key_preview
        FROM API_Keys ak
        LEFT JOIN Usuarios u ON ak.creado_por = u.id_usuario
        WHERE ak.id_api_key = ?`,
        [id_api_key]
      );

      if (!key) return null;

      // Parsear JSON
      key.permisos = JSON.parse(key.permisos);
      key.recursos_permitidos = JSON.parse(key.recursos_permitidos);
      if (key.ip_whitelist) {
        key.ip_whitelist = JSON.parse(key.ip_whitelist);
      }

      return key;
    } catch (error) {
      console.error('Error obteniendo API Key:', error);
      throw error;
    }
  }

  /**
   * Activar/Desactivar una API Key
   * @param {number} id_api_key - ID de la API Key
   * @param {boolean} activa - Estado
   * @returns {Promise<boolean>} True si se actualizó
   */
  static async toggleActive(id_api_key, activa) {
    try {
      const [result] = await pool.query(
        'UPDATE API_Keys SET activa = ? WHERE id_api_key = ?',
        [activa, id_api_key]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error actualizando estado:', error);
      throw error;
    }
  }

  /**
   * Eliminar una API Key
   * @param {number} id_api_key - ID de la API Key
   * @returns {Promise<boolean>} True si se eliminó
   */
  static async delete(id_api_key) {
    try {
      const [result] = await pool.query(
        'DELETE FROM API_Keys WHERE id_api_key = ?',
        [id_api_key]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error eliminando API Key:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de uso
   * @param {number} id_api_key - ID de la API Key
   * @param {Object} options - Opciones de rango de fechas
   * @returns {Promise<Object>} Estadísticas
   */
  static async getStats(id_api_key, options = {}) {
    const { desde, hasta } = options;

    try {
      let query = `
        SELECT 
          COUNT(*) as total_requests,
          AVG(tiempo_respuesta) as avg_response_time,
          SUM(registros_devueltos) as total_records,
          COUNT(DISTINCT DATE(timestamp)) as days_active,
          endpoint,
          COUNT(*) as requests_count
        FROM API_Logs
        WHERE id_api_key = ?
      `;

      const params = [id_api_key];

      if (desde) {
        query += ' AND timestamp >= ?';
        params.push(desde);
      }

      if (hasta) {
        query += ' AND timestamp <= ?';
        params.push(hasta);
      }

      query += ' GROUP BY endpoint ORDER BY requests_count DESC';

      const [stats] = await pool.query(query, params);

      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los logs de uso de API
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de logs
   */
  static async getAllLogs(filters = {}) {
    const { desde, hasta, id_api_key, limit = 100 } = filters;

    try {
      let query = `
        SELECT 
          l.id_log,
          l.id_api_key,
          ak.nombre as api_key_nombre,
          ak.organizacion,
          l.endpoint,
          l.metodo,
          l.ip_origen,
          l.user_agent,
          l.status_code,
          l.tiempo_respuesta,
          l.registros_devueltos,
          l.timestamp,
          l.fecha
        FROM API_Logs l
        LEFT JOIN API_Keys ak ON l.id_api_key = ak.id_api_key
        WHERE 1=1
      `;

      const params = [];

      if (id_api_key) {
        query += ' AND l.id_api_key = ?';
        params.push(id_api_key);
      }

      if (desde) {
        query += ' AND l.timestamp >= ?';
        params.push(desde);
      }

      if (hasta) {
        query += ' AND l.timestamp <= ?';
        params.push(hasta);
      }

      query += ' ORDER BY l.timestamp DESC LIMIT ?';
      params.push(limit);

      const [logs] = await pool.query(query, params);

      return logs;
    } catch (error) {
      console.error('Error obteniendo logs:', error);
      throw error;
    }
  }
}

