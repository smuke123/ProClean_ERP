-- =============================================
-- MIGRACIÓN: Agregar tabla de Carritos
-- Fecha: 2025-10-24
-- Descripción: Tabla para gestionar carritos de compra persistentes por usuario
-- =============================================

-- Tabla de Carritos
CREATE TABLE IF NOT EXISTS Carritos (
    id_carrito INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizado TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto) ON DELETE CASCADE,
    UNIQUE KEY unique_usuario_producto (id_usuario, id_producto),
    INDEX idx_usuario (id_usuario),
    INDEX idx_producto (id_producto)
);

-- Comentarios de la tabla
ALTER TABLE Carritos COMMENT = 'Almacena los productos en el carrito de cada usuario de forma persistente';

