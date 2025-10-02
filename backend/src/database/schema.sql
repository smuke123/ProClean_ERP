-- Sucursales 
CREATE TABLE Sucursales (
    id_sucursal INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    codigo_sucursal VARCHAR(20) UNIQUE NOT NULL
);
-- Usuarios 
CREATE TABLE Usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'cliente') NOT NULL,
    documento VARCHAR(50),
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    id_sucursal INT NULL,
    FOREIGN KEY (id_sucursal) REFERENCES Sucursales(id_sucursal)
);
-- Proveedores
CREATE TABLE Proveedores (
    id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    contacto VARCHAR(100),
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    estado ENUM('activo', 'inactivo') DEFAULT 'activo'
);
-- Productos 
CREATE TABLE Productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    UNIQUE (nombre)
);
-- Inventario 
CREATE TABLE Inventario (
    id_inventario INT AUTO_INCREMENT PRIMARY KEY,
    id_sucursal INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    stock_minimo INT DEFAULT 5,
    FOREIGN KEY (id_sucursal) REFERENCES Sucursales(id_sucursal),
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto),
    UNIQUE (id_sucursal, id_producto)
);
-- Compras
CREATE TABLE Compras (
    id_compra INT AUTO_INCREMENT PRIMARY KEY,
    id_proveedor INT NOT NULL,
    id_sucursal INT NOT NULL,
    fecha DATE NOT NULL,
    total DECIMAL(12, 2),
    estado ENUM('pendiente', 'pagada', 'cancelada') DEFAULT 'pendiente',
    FOREIGN KEY (id_proveedor) REFERENCES Proveedores(id_proveedor),
    FOREIGN KEY (id_sucursal) REFERENCES Sucursales(id_sucursal)
);
-- Detalle Compras
CREATE TABLE Detalle_Compras (
    id_detalle_compra INT AUTO_INCREMENT PRIMARY KEY,
    id_compra INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    FOREIGN KEY (id_compra) REFERENCES Compras(id_compra),
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);
-- Pedidos 
CREATE TABLE Pedidos (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_sucursal INT NOT NULL,
    fecha DATE NOT NULL,
    total DECIMAL(12, 2),
    estado ENUM(
        'pendiente',
        'procesado',
        'completado',
        'cancelado'
    ) DEFAULT 'pendiente',
    fecha_pago DATE NULL,
    fecha_entrega DATE NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario),
    FOREIGN KEY (id_sucursal) REFERENCES Sucursales(id_sucursal)
);
-- Detalle Pedidos
CREATE TABLE Detalle_Pedidos (
    id_detalle_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES Pedidos(id_pedido),
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);
-- =============================================
-- DATOS INICIALES
-- =============================================
-- Sucursales
INSERT INTO Sucursales (nombre, direccion, telefono, codigo_sucursal)
VALUES (
        'ProClean Norte',
        'Calle 123 #45-67',
        '+57 300 123 4567',
        'PC-NORTE'
    ),
    (
        'ProClean Sur',
        'Carrera 45 #12-89',
        '+57 300 765 4321',
        'PC-SUR'
    );
-- Usuarios admin por sucursal (password: admin123 - debe hashearse)
INSERT INTO Usuarios (nombre, email, password, rol, id_sucursal)
VALUES (
        'Admin Norte',
        'admin@norte.proclean.com',
        '$2b$10$hashedpassword',
        'admin',
        1
    ),
    (
        'Admin Sur',
        'admin@sur.proclean.com',
        '$2b$10$hashedpassword',
        'admin',
        2
    );
-- Productos básicos (10 fijos)
INSERT INTO Productos (nombre, precio)
VALUES ('Detergente Multiusos 5L', 5000),
    ('Lavaloza Líquido 2L', 10000),
    ('Limpiador de Pisos Aromatizado 5L', 35000),
    ('Jabón Líquido para Ropa 5L', 15000),
    ('Suavizante de Telas 5L', 25000),
    ('Detergente en Polvo 2Kg', 10000),
    ('Cloro 5L', 15000),
    ('Alcohol Antiséptico 70% 1L', 10000),
    ('Desinfectante Multiusos 4L', 15000),
    ('Gel Antibacterial 1L', 5000);
-- Proveedores
INSERT INTO Proveedores (nombre, contacto, telefono, direccion)
VALUES (
        'Distribuidora Limpia S.A.S',
        'Carlos Mendoza',
        '+57 300 111 2222',
        'Calle 80 #10-15'
    ),
    (
        'Productos Químicos del Norte',
        'María González',
        '+57 300 333 4444',
        'Carrera 50 #25-30'
    ),
    (
        'Suministros Industriales Ltda',
        'Roberto Silva',
        '+57 300 555 6666',
        'Avenida 68 #40-20'
    );
-- Inventario inicial para ambas sucursales
INSERT INTO Inventario (id_sucursal, id_producto, cantidad, stock_minimo)
VALUES -- Sucursal Norte
    (1, 1, 50, 10),
    (1, 2, 30, 5),
    (1, 3, 25, 5),
    (1, 4, 40, 8),
    (1, 5, 35, 7),
    (1, 6, 60, 12),
    (1, 7, 45, 9),
    (1, 8, 20, 4),
    (1, 9, 30, 6),
    (1, 10, 25, 5),
    -- Sucursal Sur
    (2, 1, 40, 10),
    (2, 2, 25, 5),
    (2, 3, 20, 5),
    (2, 4, 35, 8),
    (2, 5, 30, 7),
    (2, 6, 50, 12),
    (2, 7, 40, 9),
    (2, 8, 15, 4),
    (2, 9, 25, 6),
    (2, 10, 20, 5);
-- Compras de ejemplo
INSERT INTO Compras (id_proveedor, id_sucursal, fecha, total, estado)
VALUES (1, 1, '2024-01-15', 150000, 'pagada'),
    (2, 1, '2024-01-20', 200000, 'pagada'),
    (3, 2, '2024-01-18', 175000, 'pagada'),
    (1, 2, '2024-01-25', 120000, 'pagada');
-- Detalle de compras
INSERT INTO Detalle_Compras (
        id_compra,
        id_producto,
        cantidad,
        precio_unitario,
        subtotal
    )
VALUES -- Compra 1 - Sucursal Norte
    (1, 1, 20, 4500, 90000),
    (1, 2, 10, 9000, 90000),
    (1, 3, 5, 32000, 160000),
    -- Compra 2 - Sucursal Norte
    (2, 4, 15, 14000, 210000),
    (2, 5, 8, 23000, 184000),
    (2, 6, 25, 9500, 237500),
    -- Compra 3 - Sucursal Sur
    (3, 7, 12, 14000, 168000),
    (3, 8, 8, 9500, 76000),
    (3, 9, 10, 14000, 140000),
    -- Compra 4 - Sucursal Sur
    (4, 10, 15, 4500, 67500),
    (4, 1, 10, 4500, 45000);
-- Ventas de ejemplo 
INSERT INTO Pedidos (
        id_usuario,
        id_sucursal,
        fecha,
        total,
        estado,
        fecha_pago,
        fecha_entrega
    )
VALUES (
        1,
        1,
        '2024-01-16',
        75000,
        'completado',
        '2024-01-16',
        '2024-01-16'
    ),
    (
        1,
        1,
        '2024-01-22',
        120000,
        'completado',
        '2024-01-22',
        '2024-01-22'
    ),
    (
        2,
        2,
        '2024-01-19',
        95000,
        'completado',
        '2024-01-19',
        '2024-01-19'
    ),
    (
        2,
        2,
        '2024-01-26',
        60000,
        'completado',
        '2024-01-26',
        '2024-01-26'
    );
-- Detalle de ventas
INSERT INTO Detalle_Pedidos (
        id_pedido,
        id_producto,
        cantidad,
        precio_unitario,
        subtotal
    )
VALUES -- Venta 1 - Sucursal Norte
    (1, 1, 5, 5000, 25000),
    (1, 2, 3, 10000, 30000),
    (1, 3, 1, 35000, 35000),
    -- Venta 2 - Sucursal Norte
    (2, 4, 4, 15000, 60000),
    (2, 5, 2, 25000, 50000),
    (2, 6, 1, 10000, 10000),
    -- Venta 3 - Sucursal Sur
    (3, 7, 3, 15000, 45000),
    (3, 8, 2, 10000, 20000),
    (3, 9, 2, 15000, 30000),
    -- Venta 4 - Sucursal Sur
    (4, 10, 4, 5000, 20000),
    (4, 1, 8, 5000, 40000);