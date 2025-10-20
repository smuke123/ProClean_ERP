-- =============================================
-- DATOS DE PRUEBA PARA PROCLEAN ERP
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

-- Usuarios admin por sucursal (password: admin123)
INSERT INTO Usuarios (nombre, email, password, rol, id_sucursal)
VALUES (
        'Admin Norte',
        'admin@norte.proclean.com',
        '$2b$10$1nHImFF8GZsaeP2ba/4.cuMHBvRq3ti8Ngxk8VhJ6pe2U38.icsIq',
        'admin',
        1
    ),
    (
        'Admin Sur',
        'admin@sur.proclean.com',
        '$2b$10$1nHImFF8GZsaeP2ba/4.cuMHBvRq3ti8Ngxk8VhJ6pe2U38.icsIq',
        'admin',
        2
    );

-- Usuario cliente de prueba (password: cliente123)
INSERT INTO Usuarios (nombre, email, password, rol, documento, telefono, direccion)
VALUES (
        'Juan Pérez',
        'cliente@proclean.com',
        '$2b$10$7tXmNEUR3FkmJ9JjIcxp1uJsZCb2LUGvS2ONRlqqBIcIGPFQtohzy',
        'cliente',
        '12345678',
        '+57 300 999 8888',
        'Calle 10 #20-30'
    );

-- Productos completos con toda la información (10 fijos)
INSERT INTO Productos (nombre, precio, categoria, marca, descripcion_corta, descripcion, imagen, activo)
VALUES 
(
    'Detergente Multiusos 5L',
    45000,
    'Limpieza General',
    'ProClean',
    'Potente detergente para todo tipo de superficies',
    'Detergente multiusos de alta concentración, ideal para limpieza profunda de superficies, pisos, paredes y más. Fórmula biodegradable que no daña el medio ambiente. Rendimiento excepcional con solo pequeñas cantidades.',
    '/images/Detergente.svg',
    TRUE
),
(
    'Lavaloza Líquido 2L',
    18000,
    'Cocina',
    'ProClean',
    'Elimina grasa y residuos de alimentos fácilmente',
    'Lavaloza líquido concentrado con poder desengrasante superior. Suave con las manos, elimina bacterias y deja tus platos impecables. Aroma fresco y duradero. Rinde hasta 200 lavadas.',
    '/images/Detergente.svg',
    TRUE
),
(
    'Limpiador de Pisos Aromatizado 5L',
    35000,
    'Pisos',
    'ProClean Premium',
    'Deja tus pisos brillantes y con aroma fresco',
    'Limpiador especializado para todo tipo de pisos: cerámica, porcelanato, madera, mármol. No necesita enjuague. Fórmula antideslizante y con protección UV. Disponible en varios aromas.',
    '/images/Detergente.svg',
    TRUE
),
(
    'Jabón Líquido para Ropa 5L',
    52000,
    'Lavandería',
    'ProClean',
    'Cuida tus prendas y elimina manchas difíciles',
    'Jabón líquido para ropa de alta eficiencia. Funciona en agua fría y caliente. Protege los colores y las fibras. Ideal para lavadoras automáticas y lavado a mano. Hipoalergénico.',
    '/images/Detergente.svg',
    TRUE
),
(
    'Suavizante de Telas 5L',
    48000,
    'Lavandería',
    'ProClean Soft',
    'Suavidad y frescura prolongada para tu ropa',
    'Suavizante concentrado que deja tus prendas suaves al tacto y con aroma duradero hasta por 30 días. Reduce la estática y facilita el planchado. Tecnología de micro-encapsulado.',
    '/images/Detergente.svg',
    TRUE
),
(
    'Detergente en Polvo 2Kg',
    28000,
    'Lavandería',
    'ProClean',
    'Poder de limpieza tradicional para toda tu ropa',
    'Detergente en polvo de máxima eficiencia. Blanqueador incorporado que mantiene tus prendas blancas impecables. Elimina manchas difíciles y olores. Alto rendimiento: hasta 40 lavadas.',
    '/images/Detergente.svg',
    TRUE
),
(
    'Cloro 5L',
    22000,
    'Desinfección',
    'ProClean Sanitize',
    'Desinfección profunda y blanqueamiento efectivo',
    'Hipoclorito de sodio al 5.25%. Elimina 99.9% de gérmenes, virus y bacterias. Ideal para desinfección de baños, cocinas, superficies de alto tráfico. Efecto blanqueador para telas blancas.',
    '/images/Detergente.svg',
    TRUE
),
(
    'Alcohol Antiséptico 70% 1L',
    15000,
    'Desinfección',
    'ProClean Medical',
    'Antiséptico de grado médico para higiene personal',
    'Alcohol etílico al 70% de grado farmacéutico. Elimina bacterias y virus al contacto. Ideal para desinfección de manos, superficies y equipos médicos. Secado rápido sin residuos.',
    '/images/Detergente.svg',
    TRUE
),
(
    'Desinfectante Multiusos 4L',
    38000,
    'Desinfección',
    'ProClean Protect',
    'Protección total contra gérmenes y bacterias',
    'Desinfectante de amplio espectro. Efectivo contra virus, hongos y bacterias. Aroma agradable y duradero. No mancha ni daña superficies. Certificado por entidades de salud. Uso profesional e industrial.',
    '/images/Detergente.svg',
    TRUE
),
(
    'Gel Antibacterial 1L',
    25000,
    'Higiene Personal',
    'ProClean Care',
    'Protección antibacterial para tus manos en todo momento',
    'Gel antibacterial con 70% de alcohol. Fórmula enriquecida con aloe vera y vitamina E para proteger tu piel. Elimina 99.9% de gérmenes sin necesidad de agua. Absorción rápida sin dejar residuos pegajosos.',
    '/images/Detergente.svg',
    TRUE
);

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
VALUES 
    -- Sucursal Norte
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
VALUES 
    (1, 1, '2024-01-15', 150000, 'pagada'),
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
VALUES 
    -- Compra 1 - Sucursal Norte
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
VALUES 
    (1, 1, '2024-01-16', 75000, 'completado', '2024-01-16', '2024-01-16'),
    (1, 1, '2024-01-22', 120000, 'completado', '2024-01-22', '2024-01-22'),
    (2, 2, '2024-01-19', 95000, 'completado', '2024-01-19', '2024-01-19'),
    (2, 2, '2024-01-26', 60000, 'completado', '2024-01-26', '2024-01-26');

-- Detalle de ventas
INSERT INTO Detalle_Pedidos (
        id_pedido,
        id_producto,
        cantidad,
        precio_unitario,
        subtotal
    )
VALUES 
    -- Venta 1 - Sucursal Norte
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
