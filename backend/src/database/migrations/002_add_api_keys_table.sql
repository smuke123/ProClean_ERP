-- =============================================
-- MIGRACIÓN: Agregar tabla de API Keys
-- Fecha: 2025-10-24
-- Descripción: Sistema de autenticación para integraciones externas
-- =============================================

-- Tabla de API Keys para integraciones
CREATE TABLE IF NOT EXISTS API_Keys (
    id_api_key INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL COMMENT 'Nombre descriptivo de la integración',
    api_key VARCHAR(64) UNIQUE NOT NULL COMMENT 'Clave API única (hash)',
    descripcion TEXT COMMENT 'Descripción del propósito de esta key',
    
    -- Permisos
    permisos JSON NOT NULL DEFAULT ('["read"]') COMMENT 'Array de permisos: read, write, admin',
    
    -- Recursos permitidos
    recursos_permitidos JSON NOT NULL DEFAULT ('["ventas", "compras", "productos", "inventario"]') COMMENT 'Recursos a los que tiene acceso',
    
    -- Límites
    rate_limit INT DEFAULT 1000 COMMENT 'Requests por hora permitidos',
    
    -- Metadata
    creado_por INT NOT NULL COMMENT 'ID del usuario que creó la key',
    organizacion VARCHAR(150) COMMENT 'Nombre de la organización externa',
    contacto VARCHAR(100) COMMENT 'Email o contacto de la organización',
    
    -- Estado
    activa BOOLEAN DEFAULT TRUE COMMENT 'Si la key está activa',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion DATETIME NULL COMMENT 'Fecha de expiración (NULL = sin expiración)',
    ultimo_uso TIMESTAMP NULL COMMENT 'Última vez que se usó',
    total_requests INT DEFAULT 0 COMMENT 'Contador de requests totales',
    
    -- Seguridad
    ip_whitelist JSON NULL COMMENT 'IPs permitidas (NULL = cualquier IP)',
    
    FOREIGN KEY (creado_por) REFERENCES Usuarios(id_usuario),
    INDEX idx_api_key (api_key),
    INDEX idx_activa (activa),
    INDEX idx_organizacion (organizacion)
) COMMENT = 'Gestión de API Keys para integraciones externas';

-- Tabla de logs de uso de API
CREATE TABLE IF NOT EXISTS API_Logs (
    id_log BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_api_key INT NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    metodo ENUM('GET', 'POST', 'PUT', 'DELETE') NOT NULL,
    ip_origen VARCHAR(45) NOT NULL,
    user_agent TEXT,
    
    -- Respuesta
    status_code INT NOT NULL,
    tiempo_respuesta INT COMMENT 'Tiempo en milisegundos',
    registros_devueltos INT DEFAULT 0,
    
    -- Metadata
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha DATE AS (DATE(timestamp)) STORED,
    
    FOREIGN KEY (id_api_key) REFERENCES API_Keys(id_api_key) ON DELETE CASCADE,
    INDEX idx_api_key (id_api_key),
    INDEX idx_fecha (fecha),
    INDEX idx_endpoint (endpoint),
    INDEX idx_timestamp (timestamp)
) COMMENT = 'Logs de uso de la API de exportación';

