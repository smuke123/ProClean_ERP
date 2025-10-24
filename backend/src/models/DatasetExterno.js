import pool from '../config/database.js';

/**
 * Modelo para gestionar Datasets Externos importados
 */
export const DatasetExterno = {
  /**
   * Crear un nuevo dataset externo
   */
  async create(datasetInfo, userId) {
    const { nombre_empresa, descripcion, estructura_detectada, metadata } = datasetInfo;
    
    const query = `
      INSERT INTO Datasets_Externos 
      (nombre_empresa, descripcion, estructura_detectada, metadata, creado_por)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.query(query, [
      nombre_empresa,
      descripcion,
      JSON.stringify(estructura_detectada),
      JSON.stringify(metadata || {}),
      userId
    ]);
    
    return result.insertId;
  },

  /**
   * Obtener todos los datasets
   */
  async findAll(filters = {}) {
    let query = `
      SELECT 
        de.*,
        u.nombre as creado_por_nombre,
        u.email as creado_por_email,
        COUNT(dat.id_dato) as total_registros_actuales
      FROM Datasets_Externos de
      LEFT JOIN Usuarios u ON de.creado_por = u.id_usuario
      LEFT JOIN Datos_Externos dat ON de.id_dataset = dat.id_dataset
    `;
    
    const conditions = [];
    const params = [];
    
    if (filters.activo !== undefined) {
      conditions.push('de.activo = ?');
      params.push(filters.activo);
    }
    
    if (filters.nombre_empresa) {
      conditions.push('de.nombre_empresa LIKE ?');
      params.push(`%${filters.nombre_empresa}%`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' GROUP BY de.id_dataset ORDER BY de.fecha_importacion DESC';
    
    const [rows] = await pool.query(query, params);
    
    // Parsear JSON fields
    return rows.map(row => ({
      ...row,
      estructura_detectada: typeof row.estructura_detectada === 'string' 
        ? JSON.parse(row.estructura_detectada) 
        : row.estructura_detectada,
      metadata: typeof row.metadata === 'string' 
        ? JSON.parse(row.metadata) 
        : row.metadata
    }));
  },

  /**
   * Obtener un dataset por ID
   */
  async findById(id) {
    const query = `
      SELECT 
        de.*,
        u.nombre as creado_por_nombre,
        u.email as creado_por_email
      FROM Datasets_Externos de
      LEFT JOIN Usuarios u ON de.creado_por = u.id_usuario
      WHERE de.id_dataset = ?
    `;
    
    const [rows] = await pool.query(query, [id]);
    
    if (rows.length === 0) return null;
    
    const dataset = rows[0];
    return {
      ...dataset,
      estructura_detectada: typeof dataset.estructura_detectada === 'string' 
        ? JSON.parse(dataset.estructura_detectada) 
        : dataset.estructura_detectada,
      metadata: typeof dataset.metadata === 'string' 
        ? JSON.parse(dataset.metadata) 
        : dataset.metadata
    };
  },

  /**
   * Actualizar información del dataset
   */
  async update(id, updates) {
    const allowedFields = ['nombre_empresa', 'descripcion', 'activo', 'metadata'];
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(key === 'metadata' ? JSON.stringify(value) : value);
      }
    }
    
    if (fields.length === 0) return false;
    
    values.push(id);
    const query = `UPDATE Datasets_Externos SET ${fields.join(', ')} WHERE id_dataset = ?`;
    
    const [result] = await pool.query(query, values);
    return result.affectedRows > 0;
  },

  /**
   * Eliminar un dataset y todos sus datos
   */
  async delete(id) {
    const query = 'DELETE FROM Datasets_Externos WHERE id_dataset = ?';
    const [result] = await pool.query(query, [id]);
    return result.affectedRows > 0;
  },

  /**
   * Insertar múltiples registros de datos
   */
  async insertDatos(idDataset, datos) {
    if (!Array.isArray(datos) || datos.length === 0) {
      throw new Error('Se requiere un array de datos no vacío');
    }
    
    // Preparar query con múltiples inserts
    const values = datos.map(dato => [idDataset, JSON.stringify(dato)]);
    
    const query = `INSERT INTO Datos_Externos (id_dataset, datos) VALUES ?`;
    const [result] = await pool.query(query, [values]);
    
    // Actualizar contador
    await pool.query(
      'UPDATE Datasets_Externos SET total_registros = ? WHERE id_dataset = ?',
      [datos.length, idDataset]
    );
    
    return result.affectedRows;
  },

  /**
   * Obtener datos de un dataset con paginación
   */
  async getDatos(idDataset, options = {}) {
    const { limit = 1000, offset = 0 } = options;
    
    const query = `
      SELECT id_dato, datos, fecha_creacion
      FROM Datos_Externos
      WHERE id_dataset = ?
      ORDER BY id_dato ASC
      LIMIT ? OFFSET ?
    `;
    
    const [rows] = await pool.query(query, [idDataset, limit, offset]);
    
    return rows.map(row => ({
      id_dato: row.id_dato,
      fecha_creacion: row.fecha_creacion,
      datos: typeof row.datos === 'string' ? JSON.parse(row.datos) : row.datos
    }));
  },

  /**
   * Obtener todos los datos de un dataset (sin paginación)
   */
  async getAllDatos(idDataset) {
    const query = `
      SELECT datos
      FROM Datos_Externos
      WHERE id_dataset = ?
      ORDER BY id_dato ASC
    `;
    
    const [rows] = await pool.query(query, [idDataset]);
    
    return rows.map(row => 
      typeof row.datos === 'string' ? JSON.parse(row.datos) : row.datos
    );
  },

  /**
   * Eliminar todos los datos de un dataset
   */
  async clearDatos(idDataset) {
    const query = 'DELETE FROM Datos_Externos WHERE id_dataset = ?';
    const [result] = await pool.query(query, [idDataset]);
    
    // Actualizar contador
    await pool.query(
      'UPDATE Datasets_Externos SET total_registros = 0 WHERE id_dataset = ?',
      [idDataset]
    );
    
    return result.affectedRows;
  },

  /**
   * Detectar estructura de un array de datos JSON
   */
  detectarEstructura(datos) {
    if (!Array.isArray(datos) || datos.length === 0) {
      return { campos: [], tipos: {}, ejemplos: {} };
    }

    const primerRegistro = datos[0];
    const campos = Object.keys(primerRegistro);
    const tipos = {};
    const ejemplos = {};

    campos.forEach(campo => {
      const valores = datos.slice(0, 10).map(d => d[campo]).filter(v => v != null);
      
      if (valores.length === 0) {
        tipos[campo] = 'unknown';
        ejemplos[campo] = null;
        return;
      }

      const primerValor = valores[0];
      ejemplos[campo] = primerValor;

      // Detectar tipo
      if (typeof primerValor === 'number') {
        tipos[campo] = 'number';
      } else if (typeof primerValor === 'boolean') {
        tipos[campo] = 'boolean';
      } else if (typeof primerValor === 'string') {
        // Intentar detectar si es fecha
        const esFecha = valores.some(v => {
          const d = new Date(v);
          return !isNaN(d.getTime()) && v.match(/\d{4}-\d{2}-\d{2}|\/|-/);
        });
        
        tipos[campo] = esFecha ? 'date' : 'string';
      } else if (typeof primerValor === 'object') {
        tipos[campo] = Array.isArray(primerValor) ? 'array' : 'object';
      } else {
        tipos[campo] = 'unknown';
      }
    });

    return { campos, tipos, ejemplos, total_registros: datos.length };
  }
};

export default DatasetExterno;

