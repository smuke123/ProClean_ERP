-- ============================================
-- Migración: Sistema de Importación de Datasets Externos
-- Descripción: Tablas para almacenar datasets JSON de empresas externas
-- Fecha: 2025-10-24
-- ============================================

-- Tabla para almacenar información de datasets importados
CREATE TABLE IF NOT EXISTS Datasets_Externos (
  id_dataset INT PRIMARY KEY AUTO_INCREMENT,
  nombre_empresa VARCHAR(255) NOT NULL COMMENT 'Nombre de la empresa externa',
  descripcion TEXT COMMENT 'Descripción del dataset',
  fecha_importacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  estructura_detectada JSON COMMENT 'Estructura del JSON detectada automáticamente',
  total_registros INT DEFAULT 0 COMMENT 'Cantidad de registros en el dataset',
  metadata JSON COMMENT 'Metadata adicional del dataset',
  activo BOOLEAN DEFAULT TRUE,
  creado_por INT NULL COMMENT 'ID del usuario que importó el dataset',
  FOREIGN KEY (creado_por) REFERENCES Usuarios(id_usuario) ON DELETE SET NULL,
  INDEX idx_empresa (nombre_empresa),
  INDEX idx_activo (activo),
  INDEX idx_fecha (fecha_importacion)
) COMMENT='Almacena información de datasets importados de empresas externas';

-- Tabla para almacenar los datos JSON de forma flexible
CREATE TABLE IF NOT EXISTS Datos_Externos (
  id_dato INT PRIMARY KEY AUTO_INCREMENT,
  id_dataset INT NOT NULL,
  datos JSON NOT NULL COMMENT 'Datos del registro en formato JSON',
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_dataset) REFERENCES Datasets_Externos(id_dataset) ON DELETE CASCADE,
  INDEX idx_dataset (id_dataset)
) COMMENT='Almacena los registros individuales de cada dataset en formato JSON flexible';

-- Tabla de configuración de mapeo de campos
CREATE TABLE IF NOT EXISTS Mapeo_Campos_Externos (
  id_mapeo INT PRIMARY KEY AUTO_INCREMENT,
  id_dataset INT NOT NULL,
  campo_origen VARCHAR(255) NOT NULL COMMENT 'Nombre del campo en el JSON original',
  campo_destino VARCHAR(255) NOT NULL COMMENT 'Nombre del campo estandarizado',
  tipo_dato VARCHAR(50) COMMENT 'Tipo de dato (string, number, date, etc)',
  es_clave BOOLEAN DEFAULT FALSE COMMENT 'Si es un campo clave para agrupaciones',
  es_metrica BOOLEAN DEFAULT FALSE COMMENT 'Si es un campo numérico para métricas',
  es_fecha BOOLEAN DEFAULT FALSE COMMENT 'Si es un campo de fecha',
  formato_fecha VARCHAR(50) COMMENT 'Formato de la fecha si aplica',
  FOREIGN KEY (id_dataset) REFERENCES Datasets_Externos(id_dataset) ON DELETE CASCADE,
  UNIQUE KEY unique_mapeo (id_dataset, campo_origen),
  INDEX idx_dataset_mapeo (id_dataset)
) COMMENT='Mapeo de campos del dataset externo a campos estandarizados';

-- Insertar datos de ejemplo (opcional)
-- Se puede descomentar para pruebas
/*
INSERT INTO Datasets_Externos (nombre_empresa, descripcion, estructura_detectada, total_registros, metadata, creado_por) 
VALUES (
  'Empresa Demo',
  'Dataset de ejemplo para pruebas',
  '{"campos": ["id", "fecha", "monto", "categoria"], "tipos": {"id": "number", "fecha": "date", "monto": "number", "categoria": "string"}}',
  100,
  '{"version": "1.0", "moneda": "USD"}',
  1
);
*/

