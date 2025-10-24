import DatasetExterno from '../models/DatasetExterno.js';

/**
 * Controlador para gestionar datasets externos importados
 */
export const datasetExternoController = {
  /**
   * Listar todos los datasets importados
   */
  async getAll(req, res) {
    try {
      const filters = {
        activo: req.query.activo !== undefined ? req.query.activo === 'true' : undefined,
        nombre_empresa: req.query.empresa
      };

      const datasets = await DatasetExterno.findAll(filters);

      res.json({
        success: true,
        total: datasets.length,
        datasets
      });
    } catch (error) {
      console.error('Error al obtener datasets:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener datasets',
        detail: error.message
      });
    }
  },

  /**
   * Obtener un dataset específico
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const dataset = await DatasetExterno.findById(id);

      if (!dataset) {
        return res.status(404).json({
          success: false,
          error: 'Dataset no encontrado'
        });
      }

      res.json({
        success: true,
        dataset
      });
    } catch (error) {
      console.error('Error al obtener dataset:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener dataset',
        detail: error.message
      });
    }
  },

  /**
   * Obtener los datos de un dataset
   */
  async getDatos(req, res) {
    try {
      const { id } = req.params;
      const { limit, offset } = req.query;

      // Verificar que el dataset existe
      const dataset = await DatasetExterno.findById(id);
      if (!dataset) {
        return res.status(404).json({
          success: false,
          error: 'Dataset no encontrado'
        });
      }

      // Obtener datos
      const datos = limit || offset 
        ? await DatasetExterno.getDatos(id, { limit: parseInt(limit) || 1000, offset: parseInt(offset) || 0 })
        : await DatasetExterno.getAllDatos(id);

      res.json({
        success: true,
        dataset: {
          id: dataset.id_dataset,
          nombre_empresa: dataset.nombre_empresa,
          descripcion: dataset.descripcion,
          estructura: dataset.estructura_detectada,
          metadata: dataset.metadata
        },
        total_registros: dataset.total_registros,
        registros_devueltos: datos.length,
        datos: datos.map(d => d.datos || d) // Normalizar estructura
      });
    } catch (error) {
      console.error('Error al obtener datos del dataset:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener datos',
        detail: error.message
      });
    }
  },

  /**
   * Importar un nuevo dataset desde JSON
   */
  async importar(req, res) {
    try {
      const { nombre_empresa, descripcion, datos, metadata } = req.body;
      const userId = req.user?.id;

      // Validaciones
      if (!nombre_empresa) {
        return res.status(400).json({
          success: false,
          error: 'El nombre de la empresa es requerido'
        });
      }

      if (!datos || !Array.isArray(datos) || datos.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Se requiere un array de datos no vacío en el campo "datos"'
        });
      }

      // Detectar estructura automáticamente
      const estructura = DatasetExterno.detectarEstructura(datos);

      // Crear el dataset
      const idDataset = await DatasetExterno.create({
        nombre_empresa,
        descripcion: descripcion || `Dataset importado de ${nombre_empresa}`,
        estructura_detectada: estructura,
        metadata: {
          ...metadata,
          importado_en: new Date().toISOString(),
          cantidad_registros_original: datos.length
        }
      }, userId);

      // Insertar los datos
      await DatasetExterno.insertDatos(idDataset, datos);

      // Obtener el dataset completo
      const dataset = await DatasetExterno.findById(idDataset);

      res.status(201).json({
        success: true,
        message: `Dataset importado exitosamente: ${datos.length} registros`,
        dataset: {
          id_dataset: dataset.id_dataset,
          nombre_empresa: dataset.nombre_empresa,
          descripcion: dataset.descripcion,
          total_registros: dataset.total_registros,
          estructura_detectada: dataset.estructura_detectada,
          fecha_importacion: dataset.fecha_importacion
        }
      });
    } catch (error) {
      console.error('Error al importar dataset:', error);
      res.status(500).json({
        success: false,
        error: 'Error al importar dataset',
        detail: error.message
      });
    }
  },

  /**
   * Actualizar información de un dataset
   */
  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const dataset = await DatasetExterno.findById(id);
      if (!dataset) {
        return res.status(404).json({
          success: false,
          error: 'Dataset no encontrado'
        });
      }

      await DatasetExterno.update(id, updates);

      const datasetActualizado = await DatasetExterno.findById(id);

      res.json({
        success: true,
        message: 'Dataset actualizado exitosamente',
        dataset: datasetActualizado
      });
    } catch (error) {
      console.error('Error al actualizar dataset:', error);
      res.status(500).json({
        success: false,
        error: 'Error al actualizar dataset',
        detail: error.message
      });
    }
  },

  /**
   * Reemplazar los datos de un dataset existente
   */
  async reemplazarDatos(req, res) {
    try {
      const { id } = req.params;
      const { datos } = req.body;

      // Validaciones
      if (!datos || !Array.isArray(datos) || datos.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Se requiere un array de datos no vacío'
        });
      }

      const dataset = await DatasetExterno.findById(id);
      if (!dataset) {
        return res.status(404).json({
          success: false,
          error: 'Dataset no encontrado'
        });
      }

      // Limpiar datos antiguos
      await DatasetExterno.clearDatos(id);

      // Detectar nueva estructura
      const estructura = DatasetExterno.detectarEstructura(datos);

      // Actualizar estructura
      await DatasetExterno.update(id, {
        metadata: {
          ...dataset.metadata,
          ultima_actualizacion: new Date().toISOString(),
          estructura_actualizada: estructura
        }
      });

      // Insertar nuevos datos
      await DatasetExterno.insertDatos(id, datos);

      res.json({
        success: true,
        message: `Datos reemplazados exitosamente: ${datos.length} registros`,
        total_registros: datos.length,
        estructura: estructura
      });
    } catch (error) {
      console.error('Error al reemplazar datos:', error);
      res.status(500).json({
        success: false,
        error: 'Error al reemplazar datos',
        detail: error.message
      });
    }
  },

  /**
   * Eliminar un dataset completo
   */
  async eliminar(req, res) {
    try {
      const { id } = req.params;

      const dataset = await DatasetExterno.findById(id);
      if (!dataset) {
        return res.status(404).json({
          success: false,
          error: 'Dataset no encontrado'
        });
      }

      await DatasetExterno.delete(id);

      res.json({
        success: true,
        message: 'Dataset eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar dataset:', error);
      res.status(500).json({
        success: false,
        error: 'Error al eliminar dataset',
        detail: error.message
      });
    }
  }
};

export default datasetExternoController;

