import { ApiKey } from '../models/ApiKey.js';

/**
 * Middleware de autenticación por API Key
 * Valida que el request incluya una API Key válida
 */
export const authenticateApiKey = async (req, res, next) => {
  const startTime = Date.now();

  try {
    // Obtener API Key del header
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');

    if (!apiKey) {
      return res.status(401).json({
        error: 'API Key requerida',
        message: 'Debe proporcionar una API Key válida en el header X-API-Key o Authorization'
      });
    }

    // Obtener IP del cliente
    const ip = req.ip || req.connection.remoteAddress;

    // Validar API Key
    const keyData = await ApiKey.validate(apiKey, ip);

    if (!keyData) {
      // Log del intento fallido
      await ApiKey.logUsage({
        id_api_key: null,
        endpoint: req.originalUrl,
        metodo: req.method,
        ip_origen: ip,
        user_agent: req.headers['user-agent'],
        status_code: 401,
        tiempo_respuesta: Date.now() - startTime,
        registros_devueltos: 0
      });

      return res.status(401).json({
        error: 'API Key inválida',
        message: 'La API Key proporcionada no es válida, está inactiva o ha expirado'
      });
    }

    // Verificar rate limit
    const withinLimit = await ApiKey.checkRateLimit(keyData.id_api_key);

    if (!withinLimit) {
      await ApiKey.logUsage({
        id_api_key: keyData.id_api_key,
        endpoint: req.originalUrl,
        metodo: req.method,
        ip_origen: ip,
        user_agent: req.headers['user-agent'],
        status_code: 429,
        tiempo_respuesta: Date.now() - startTime,
        registros_devueltos: 0
      });

      return res.status(429).json({
        error: 'Rate limit excedido',
        message: `Ha excedido el límite de ${keyData.rate_limit} requests por hora`,
        retry_after: 3600 // segundos
      });
    }

    // Agregar datos de la key al request
    req.apiKey = keyData;
    req.apiKeyStartTime = startTime;

    next();
  } catch (error) {
    console.error('Error en autenticación API Key:', error);
    return res.status(500).json({
      error: 'Error interno',
      message: 'Error al validar la API Key'
    });
  }
};

/**
 * Middleware para verificar permisos específicos
 * @param {string} permiso - Permiso requerido (ej: 'read', 'write')
 */
export const requirePermission = (permiso) => {
  return (req, res, next) => {
    if (!req.apiKey) {
      return res.status(401).json({
        error: 'No autenticado',
        message: 'Debe autenticarse primero'
      });
    }

    if (!req.apiKey.permisos.includes(permiso) && !req.apiKey.permisos.includes('admin')) {
      return res.status(403).json({
        error: 'Permiso denegado',
        message: `Esta API Key no tiene permiso de '${permiso}'`,
        permisos_disponibles: req.apiKey.permisos
      });
    }

    next();
  };
};

/**
 * Middleware para verificar acceso a recursos específicos
 * @param {string} recurso - Recurso requerido (ej: 'ventas', 'productos')
 */
export const requireResource = (recurso) => {
  return (req, res, next) => {
    if (!req.apiKey) {
      return res.status(401).json({
        error: 'No autenticado',
        message: 'Debe autenticarse primero'
      });
    }

    if (!req.apiKey.recursos_permitidos.includes(recurso) && !req.apiKey.permisos.includes('admin')) {
      return res.status(403).json({
        error: 'Recurso no permitido',
        message: `Esta API Key no tiene acceso al recurso '${recurso}'`,
        recursos_disponibles: req.apiKey.recursos_permitidos
      });
    }

    next();
  };
};

/**
 * Middleware para registrar el uso de la API al finalizar la respuesta
 */
export const logApiUsage = async (req, res, next) => {
  // Guardar el método send original
  const originalSend = res.send;

  res.send = function (data) {
    // Restaurar el método original
    res.send = originalSend;

    // Registrar uso
    if (req.apiKey) {
      const endTime = Date.now();
      const responseTime = endTime - req.apiKeyStartTime;

      let registrosDevueltos = 0;
      try {
        const parsedData = JSON.parse(data);
        if (parsedData.data && Array.isArray(parsedData.data)) {
          registrosDevueltos = parsedData.data.length;
        } else if (parsedData.total_records) {
          registrosDevueltos = parsedData.total_records;
        }
      } catch (e) {
        // No es JSON o no tiene estructura esperada
      }

      ApiKey.logUsage({
        id_api_key: req.apiKey.id_api_key,
        endpoint: req.originalUrl,
        metodo: req.method,
        ip_origen: req.ip || req.connection.remoteAddress,
        user_agent: req.headers['user-agent'],
        status_code: res.statusCode,
        tiempo_respuesta: responseTime,
        registros_devueltos: registrosDevueltos
      }).catch(err => console.error('Error logging API usage:', err));
    }

    // Llamar al send original
    return originalSend.call(this, data);
  };

  next();
};

