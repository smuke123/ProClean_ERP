-- Sucursales 
CREATE TABLE Sucursales (
    id_sucursal INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    codigo_sucursal VARCHAR(20) UNIQUE NOT NULL
);

-- Clientes
CREATE TABLE Clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo ENUM('final','corporativo') NOT NULL,
    documento VARCHAR(50),
    telefono VARCHAR(20),
    direccion VARCHAR(255)
);

-- Usuarios 
CREATE TABLE Usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin','comprador') NOT NULL,
    cliente_id INT NULL,
    id_sucursal INT NULL,
    FOREIGN KEY (cliente_id) REFERENCES Clientes(id_cliente) ON DELETE SET NULL,
    FOREIGN KEY (id_sucursal) REFERENCES Sucursales(id_sucursal)
);

-- Proveedores (igual)
CREATE TABLE Proveedores (
    id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    contacto VARCHAR(100),
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    estado ENUM('activo','inactivo') DEFAULT 'activo'
);

-- Productos (alineado con tus INSERTs)
CREATE TABLE Productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    marca VARCHAR(50),
    categoria ENUM('detergentes','limpieza','desinfectantes','personal') NOT NULL,
    tamano ENUM('pequeno','grande') NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    UNIQUE (nombre, tamano)
);

-- Inventario (referencia a Sucursales y Productos)
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
-- Ventas
CREATE TABLE Ventas (
    id_venta INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_sucursal INT NOT NULL,
    fecha DATE NOT NULL,
    total DECIMAL(12, 2),
    estado ENUM('pendiente', 'pagada', 'cancelada') DEFAULT 'pendiente',
    FOREIGN KEY (id_cliente) REFERENCES Clientes(id_cliente),
    FOREIGN KEY (id_sucursal) REFERENCES Sucursales(id_sucursal)
);
-- Detalle Ventas
CREATE TABLE Detalle_Ventas (
    id_detalle_venta INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    FOREIGN KEY (id_venta) REFERENCES Ventas(id_venta),
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);
-- Pedidos
CREATE TABLE Pedidos (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_sucursal INT NOT NULL,
    fecha DATE NOT NULL,
    total DECIMAL(12, 2),
    estado ENUM('pendiente', 'procesado', 'cancelado') DEFAULT 'pendiente',
    FOREIGN KEY (id_cliente) REFERENCES Clientes(id_cliente),
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
INSERT INTO Sucursales (nombre, direccion, telefono, codigo_sucursal) VALUES
('ProClean Norte', 'Calle 123 #45-67', '+57 300 123 4567', 'PC-NORTE'),
('ProClean Sur', 'Carrera 45 #123-89', '+57 300 765 4321', 'PC-SUR');
 
-- Usuarios admin por sucursal (password: admin123 - debe hashearse)
INSERT INTO Usuarios (nombre, email, password, rol, id_sucursal) VALUES
('Admin Norte', 'admin@norte.proclean.com', '$2b$10$hashedpassword', 'admin', 1),
('Admin Sur', 'admin@sur.proclean.com', '$2b$10$hashedpassword', 'admin', 2);

-- Productos básicos
INSERT INTO Productos (nombre, marca, categoria, tamano, precio) VALUES
('Detergente Ariel', 'Ariel', 'detergentes', 'pequeno', 8500),
('Detergente Ariel', 'Ariel', 'detergentes', 'grande', 15000),
('Desinfectante Lysol', 'Lysol', 'desinfectantes', 'pequeno', 6500),
('Desinfectante Lysol', 'Lysol', 'desinfectantes', 'grande', 12000),
('Jabon Protex', 'Protex', 'personal', 'pequeno', 3500);