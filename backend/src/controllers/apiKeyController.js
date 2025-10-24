import { ApiKey } from '../models/ApiKey.js';

/**
 * Controlador para gestionar API Keys
 * Solo accesible por administradores
 */
export const apiKeyController = {
  /**
   * Crear una nueva API Key
   */
  async createApiKey(req, res) {
    try {
      const {
        nombre,
        descripcion,
        organizacion,
        contacto,
        permisos = ['read'],
        recursos_permitidos = ['ventas', 'compras', 'productos', 'inventario'],
        rate_limit = 1000,
        fecha_expiracion = null,
        ip_whitelist = null
      } = req.body;

      if (!nombre || !organizacion) {
        return res.status(400).json({
          error: 'Datos incompletos',
          message: 'nombre y organizacion son requeridos'
        });
      }

      const keyData = {
        nombre,
        descripcion,
        creado_por: req.user.id_usuario,
        organizacion,
        contacto,
        permisos,
        recursos_permitidos,
        rate_limit,
        fecha_expiracion,
        ip_whitelist
      };

      const result = await ApiKey.create(keyData);

      res.status(201).json({
        message: 'API Key creada exitosamente',
        api_key: result.api_key, // IMPORTANTE: Solo se muestra una vez
        data: {
          id_api_key: result.id_api_key,
          nombre: result.nombre,
          organizacion: result.organizacion,
          permisos: result.permisos,
          recursos_permitidos: result.recursos_permitidos
        },
        warning: '⚠️ Guarde esta API Key de forma segura. No podrá verla nuevamente.'
      });
    } catch (error) {
      console.error('Error creando API Key:', error);
      res.status(500).json({
        error: 'Error al crear API Key',
        detail: error.message
      });
    }
  },

  /**
   * Listar todas las API Keys
   */
  async getAllApiKeys(req, res) {
    try {
      const filters = {
        activa: req.query.activa !== undefined ? req.query.activa === 'true' : undefined,
        organizacion: req.query.organizacion
      };

      const keys = await ApiKey.findAll(filters);

      res.json({
        total: keys.length,
        data: keys
      });
    } catch (error) {
      console.error('Error obteniendo API Keys:', error);
      res.status(500).json({
        error: 'Error al obtener API Keys',
        detail: error.message
      });
    }
  },

  /**
   * Obtener una API Key por ID
   */
  async getApiKeyById(req, res) {
    try {
      const id_api_key = parseInt(req.params.id);
      const key = await ApiKey.findById(id_api_key);

      if (!key) {
        return res.status(404).json({
          error: 'API Key no encontrada'
        });
      }

      res.json(key);
    } catch (error) {
      console.error('Error obteniendo API Key:', error);
      res.status(500).json({
        error: 'Error al obtener API Key',
        detail: error.message
      });
    }
  },

  /**
   * Activar/Desactivar una API Key
   */
  async toggleApiKey(req, res) {
    try {
      const id_api_key = parseInt(req.params.id);
      const { activa } = req.body;

      if (activa === undefined) {
        return res.status(400).json({
          error: 'Parámetro requerido',
          message: 'El campo "activa" es requerido'
        });
      }

      const success = await ApiKey.toggleActive(id_api_key, activa);

      if (!success) {
        return res.status(404).json({
          error: 'API Key no encontrada'
        });
      }

      res.json({
        message: `API Key ${activa ? 'activada' : 'desactivada'} exitosamente`
      });
    } catch (error) {
      console.error('Error actualizando API Key:', error);
      res.status(500).json({
        error: 'Error al actualizar API Key',
        detail: error.message
      });
    }
  },

  /**
   * Eliminar una API Key
   */
  async deleteApiKey(req, res) {
    try {
      const id_api_key = parseInt(req.params.id);

      const success = await ApiKey.delete(id_api_key);

      if (!success) {
        return res.status(404).json({
          error: 'API Key no encontrada'
        });
      }

      res.json({
        message: 'API Key eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando API Key:', error);
      res.status(500).json({
        error: 'Error al eliminar API Key',
        detail: error.message
      });
    }
  },

  /**
   * Obtener estadísticas de uso de una API Key
   */
  async getApiKeyStats(req, res) {
    try {
      const id_api_key = parseInt(req.params.id);
      const { desde, hasta } = req.query;

      const stats = await ApiKey.getStats(id_api_key, { desde, hasta });

      res.json({
        id_api_key,
        period: {
          from: desde || 'inicio',
          to: hasta || 'ahora'
        },
        statistics: stats
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        error: 'Error al obtener estadísticas',
        detail: error.message
      });
    }
  }
};

