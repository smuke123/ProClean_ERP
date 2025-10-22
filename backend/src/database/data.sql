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
    '/images/Detergente.webp',
    TRUE
),
(
    'Lavaloza Líquido 2L',
    18000,
    'Cocina',
    'ProClean',
    'Elimina grasa y residuos de alimentos fácilmente',
    'Lavaloza líquido concentrado con poder desengrasante superior. Suave con las manos, elimina bacterias y deja tus platos impecables. Aroma fresco y duradero. Rinde hasta 200 lavadas.',
    '/images/LavalozaLiquido.png',
    TRUE
),
(
    'Limpiador de Pisos Aromatizado 5L',
    35000,
    'Pisos',
    'ProClean Premium',
    'Deja tus pisos brillantes y con aroma fresco',
    'Limpiador especializado para todo tipo de pisos: cerámica, porcelanato, madera, mármol. No necesita enjuague. Fórmula antideslizante y con protección UV. Disponible en varios aromas.',
    '/images/LimpiadorDePisos.avif',
    TRUE
),
(
    'Jabón Líquido para Ropa 5L',
    52000,
    'Lavandería',
    'ProClean',
    'Cuida tus prendas y elimina manchas difíciles',
    'Jabón líquido para ropa de alta eficiencia. Funciona en agua fría y caliente. Protege los colores y las fibras. Ideal para lavadoras automáticas y lavado a mano. Hipoalergénico.',
    '/images/JabonLiquidoParaRopa.png',
    TRUE
),
(
    'Suavizante de Telas 5L',
    48000,
    'Lavandería',
    'ProClean Soft',
    'Suavidad y frescura prolongada para tu ropa',
    'Suavizante concentrado que deja tus prendas suaves al tacto y con aroma duradero hasta por 30 días. Reduce la estática y facilita el planchado. Tecnología de micro-encapsulado.',
    '/images/SuavizanteTelas.png',
    TRUE
),
(
    'Detergente en Polvo 2Kg',
    28000,
    'Lavandería',
    'ProClean',
    'Poder de limpieza tradicional para toda tu ropa',
    'Detergente en polvo de máxima eficiencia. Blanqueador incorporado que mantiene tus prendas blancas impecables. Elimina manchas difíciles y olores. Alto rendimiento: hasta 40 lavadas.',
    '/images/DetergenteEnPolvo.webp',
    TRUE
),
(
    'Cloro 5L',
    22000,
    'Desinfección',
    'ProClean Sanitize',
    'Desinfección profunda y blanqueamiento efectivo',
    'Hipoclorito de sodio al 5.25%. Elimina 99.9% de gérmenes, virus y bacterias. Ideal para desinfección de baños, cocinas, superficies de alto tráfico. Efecto blanqueador para telas blancas.',
    '/images/Cloro.avif',
    TRUE
),
(
    'Alcohol Antiséptico 70% 1L',
    15000,
    'Desinfección',
    'ProClean Medical',
    'Antiséptico de grado médico para higiene personal',
    'Alcohol etílico al 70% de grado farmacéutico. Elimina bacterias y virus al contacto. Ideal para desinfección de manos, superficies y equipos médicos. Secado rápido sin residuos.',
    '/images/AlcoholAntiseptico.webp',
    TRUE
),
(
    'Desinfectante Multiusos 4L',
    38000,
    'Desinfección',
    'ProClean Protect',
    'Protección total contra gérmenes y bacterias',
    'Desinfectante de amplio espectro. Efectivo contra virus, hongos y bacterias. Aroma agradable y duradero. No mancha ni daña superficies. Certificado por entidades de salud. Uso profesional e industrial.',
    '/images/DesinfectanteMultitusos.webp',
    TRUE
),
(
    'Gel Antibacterial 1L',
    25000,
    'Higiene Personal',
    'ProClean Care',
    'Protección antibacterial para tus manos en todo momento',
    'Gel antibacterial con 70% de alcohol. Fórmula enriquecida con aloe vera y vitamina E para proteger tu piel. Elimina 99.9% de gérmenes sin necesidad de agua. Absorción rápida sin dejar residuos pegajosos.',
    '/images/GelAntibacterial.webp',
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

-- Compras de ejemplo (Datos variados para testing de informes)
INSERT INTO Compras (id_proveedor, id_sucursal, fecha, total, estado)
VALUES 
    -- Enero 2024
    (1, 1, '2024-01-08', 285000, 'pagada'),
    (2, 2, '2024-01-15', 342000, 'pagada'),
    (3, 1, '2024-01-22', 198000, 'pagada'),
    (1, 2, '2024-01-28', 156000, 'pagada'),
    
    -- Febrero 2024
    (2, 1, '2024-02-05', 423000, 'pagada'),
    (3, 2, '2024-02-12', 267000, 'pagada'),
    (1, 1, '2024-02-19', 189000, 'pagada'),
    (2, 2, '2024-02-26', 234000, 'pagada'),
    
    -- Marzo 2024
    (3, 2, '2024-03-04', 378000, 'pagada'),
    (1, 1, '2024-03-11', 298000, 'pagada'),
    (2, 2, '2024-03-18', 445000, 'pagada'),
    (3, 1, '2024-03-25', 212000, 'pagada'),
    
    -- Abril 2024
    (1, 2, '2024-04-03', 356000, 'pagada'),
    (2, 1, '2024-04-10', 289000, 'pagada'),
    (3, 2, '2024-04-17', 398000, 'pagada'),
    (1, 1, '2024-04-24', 234000, 'pendiente'),
    
    -- Mayo 2024
    (2, 1, '2024-05-06', 467000, 'pagada'),
    (3, 2, '2024-05-13', 323000, 'pagada'),
    (1, 1, '2024-05-20', 278000, 'pagada'),
    (2, 2, '2024-05-27', 345000, 'pagada'),
    
    -- Junio 2024
    (3, 2, '2024-06-05', 412000, 'pagada'),
    (1, 1, '2024-06-12', 298000, 'pagada'),
    (2, 2, '2024-06-19', 489000, 'pagada'),
    (3, 1, '2024-06-26', 256000, 'pagada'),
    
    -- Julio 2024
    (1, 1, '2024-07-03', 378000, 'pagada'),
    (2, 2, '2024-07-10', 423000, 'pagada'),
    (3, 1, '2024-07-17', 312000, 'pagada'),
    (1, 2, '2024-07-24', 267000, 'pendiente'),
    (2, 1, '2024-07-31', 189000, 'pagada'),
    
    -- Agosto 2024
    (3, 2, '2024-08-07', 456000, 'pagada'),
    (1, 1, '2024-08-14', 334000, 'pagada'),
    (2, 2, '2024-08-21', 398000, 'pagada'),
    (3, 1, '2024-08-28', 278000, 'pagada'),
    
    -- Septiembre 2024
    (1, 2, '2024-09-04', 423000, 'pagada'),
    (2, 1, '2024-09-11', 367000, 'pagada'),
    (3, 2, '2024-09-18', 445000, 'pagada'),
    (1, 1, '2024-09-25', 298000, 'pendiente'),
    
    -- Octubre 2024
    (2, 1, '2024-10-02', 489000, 'pagada'),
    (3, 2, '2024-10-09', 378000, 'pagada'),
    (1, 1, '2024-10-16', 312000, 'pagada'),
    (2, 2, '2024-10-23', 267000, 'pendiente'),
    (3, 1, '2024-10-29', 198000, 'pagada');

-- Detalle de compras con variedad de productos
INSERT INTO Detalle_Compras (
        id_compra,
        id_producto,
        cantidad,
        precio_unitario,
        subtotal
    )
VALUES 
    -- Compra 1
    (1, 1, 30, 35000, 105000),
    (1, 2, 20, 14000, 28000),
    (1, 7, 15, 17000, 51000),
    -- Compra 2
    (2, 3, 25, 28000, 70000),
    (2, 4, 18, 42000, 76000),
    (2, 5, 12, 38000, 46000),
    -- Compra 3
    (3, 6, 40, 22000, 88000),
    (3, 8, 25, 12000, 30000),
    (3, 10, 30, 20000, 60000),
    -- Compra 4
    (4, 1, 22, 35000, 77000),
    (4, 9, 10, 30000, 30000),
    -- Compra 5
    (5, 2, 35, 14000, 49000),
    (5, 3, 28, 28000, 78000),
    (5, 7, 20, 17000, 34000),
    -- Compra 6
    (6, 4, 24, 42000, 101000),
    (6, 5, 16, 38000, 61000),
    (6, 6, 18, 22000, 40000),
    -- Compra 7
    (7, 1, 28, 35000, 98000),
    (7, 8, 20, 12000, 24000),
    (7, 10, 25, 20000, 50000),
    -- Compra 8
    (8, 2, 30, 14000, 42000),
    (8, 3, 22, 28000, 62000),
    (8, 9, 12, 30000, 36000),
    -- Compra 9
    (9, 4, 32, 42000, 134000),
    (9, 5, 20, 38000, 76000),
    (9, 7, 18, 17000, 31000),
    -- Compra 10
    (10, 1, 35, 35000, 123000),
    (10, 6, 28, 22000, 62000),
    (10, 8, 22, 12000, 26000),
    -- Compra 11
    (11, 2, 45, 14000, 63000),
    (11, 3, 30, 28000, 84000),
    (11, 10, 35, 20000, 70000),
    -- Compra 12
    (12, 4, 20, 42000, 84000),
    (12, 9, 14, 30000, 42000),
    (12, 5, 18, 38000, 68000),
    -- Compra 13
    (13, 1, 40, 35000, 140000),
    (13, 7, 25, 17000, 43000),
    (13, 6, 30, 22000, 66000),
    -- Compra 14
    (14, 2, 32, 14000, 45000),
    (14, 8, 28, 12000, 34000),
    (14, 3, 24, 28000, 67000),
    -- Compra 15
    (15, 4, 28, 42000, 118000),
    (15, 5, 22, 38000, 84000),
    (15, 10, 30, 20000, 60000),
    -- Compra 16
    (16, 1, 26, 35000, 91000),
    (16, 9, 16, 30000, 48000),
    (16, 2, 24, 14000, 34000),
    -- Compra 17
    (17, 3, 38, 28000, 106000),
    (17, 6, 32, 22000, 70000),
    (17, 7, 28, 17000, 48000),
    -- Compra 18
    (18, 4, 30, 42000, 126000),
    (18, 8, 25, 12000, 30000),
    (18, 5, 24, 38000, 91000),
    -- Compra 19
    (19, 1, 42, 35000, 147000),
    (19, 10, 38, 20000, 76000),
    (19, 2, 28, 14000, 39000),
    -- Compra 20
    (20, 3, 35, 28000, 98000),
    (20, 9, 18, 30000, 54000),
    (20, 6, 26, 22000, 57000),
    -- Compra 21
    (21, 4, 36, 42000, 151000),
    (21, 7, 30, 17000, 51000),
    (21, 5, 28, 38000, 106000),
    -- Compra 22
    (22, 1, 34, 35000, 119000),
    (22, 8, 32, 12000, 38000),
    (22, 2, 26, 14000, 36000),
    -- Compra 23
    (23, 3, 42, 28000, 118000),
    (23, 10, 40, 20000, 80000),
    (23, 6, 34, 22000, 75000),
    -- Compra 24
    (24, 4, 24, 42000, 101000),
    (24, 9, 20, 30000, 60000),
    (24, 7, 22, 17000, 37000),
    -- Compra 25
    (25, 1, 38, 35000, 133000),
    (25, 5, 30, 38000, 114000),
    (25, 8, 26, 12000, 31000),
    -- Compra 26
    (26, 2, 36, 14000, 50000),
    (26, 3, 32, 28000, 90000),
    (26, 10, 34, 20000, 68000),
    -- Compra 27
    (27, 4, 34, 42000, 143000),
    (27, 6, 28, 22000, 62000),
    (27, 7, 24, 17000, 41000),
    -- Compra 28
    (28, 1, 30, 35000, 105000),
    (28, 9, 22, 30000, 66000),
    (28, 2, 20, 14000, 28000),
    -- Compra 29
    (29, 3, 28, 28000, 78000),
    (29, 5, 24, 38000, 91000),
    (29, 8, 18, 12000, 22000),
    -- Compra 30
    (30, 4, 38, 42000, 160000),
    (30, 10, 36, 20000, 72000),
    (30, 6, 30, 22000, 66000),
    -- Compra 31
    (31, 1, 32, 35000, 112000),
    (31, 7, 26, 17000, 44000),
    (31, 2, 22, 14000, 31000),
    -- Compra 32
    (32, 3, 40, 28000, 112000),
    (32, 9, 24, 30000, 72000),
    (32, 5, 28, 38000, 106000),
    -- Compra 33
    (33, 4, 26, 42000, 109000),
    (33, 8, 30, 12000, 36000),
    (33, 6, 24, 22000, 53000),
    -- Compra 34
    (34, 1, 36, 35000, 126000),
    (34, 10, 32, 20000, 64000),
    (34, 7, 20, 17000, 34000),
    -- Compra 35
    (35, 2, 38, 14000, 53000),
    (35, 3, 34, 28000, 95000),
    (35, 4, 22, 42000, 92000),
    -- Compra 36
    (36, 5, 32, 38000, 122000),
    (36, 9, 20, 30000, 60000),
    (36, 8, 24, 12000, 29000),
    -- Compra 37
    (37, 1, 44, 35000, 154000),
    (37, 6, 36, 22000, 79000),
    (37, 10, 38, 20000, 76000),
    -- Compra 38
    (38, 2, 40, 14000, 56000),
    (38, 7, 32, 17000, 54000),
    (38, 3, 28, 28000, 78000),
    -- Compra 39
    (39, 4, 40, 42000, 168000),
    (39, 5, 26, 38000, 99000),
    (39, 9, 18, 30000, 54000),
    -- Compra 40
    (40, 1, 34, 35000, 119000),
    (40, 8, 28, 12000, 34000),
    (40, 6, 26, 22000, 57000),
    -- Compra 41
    (41, 2, 42, 14000, 59000),
    (41, 3, 36, 28000, 101000),
    (41, 10, 40, 20000, 80000),
    -- Compra 42
    (42, 4, 32, 42000, 134000),
    (42, 7, 28, 17000, 48000),
    (42, 5, 24, 38000, 91000);

-- Ventas de ejemplo (Datos variados para testing de informes)
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
    -- Enero 2024
    (3, 1, '2024-01-05', 125000, 'completado', '2024-01-05', '2024-01-06'),
    (3, 1, '2024-01-12', 89000, 'completado', '2024-01-12', '2024-01-13'),
    (3, 2, '2024-01-15', 156000, 'completado', '2024-01-15', '2024-01-16'),
    (3, 1, '2024-01-20', 78000, 'completado', '2024-01-20', '2024-01-21'),
    (3, 2, '2024-01-25', 234000, 'completado', '2024-01-25', '2024-01-26'),
    (3, 1, '2024-01-28', 45000, 'completado', '2024-01-28', '2024-01-29'),
    
    -- Febrero 2024
    (3, 2, '2024-02-03', 198000, 'completado', '2024-02-03', '2024-02-04'),
    (3, 1, '2024-02-08', 123000, 'completado', '2024-02-08', '2024-02-09'),
    (3, 2, '2024-02-14', 267000, 'completado', '2024-02-14', '2024-02-15'),
    (3, 1, '2024-02-18', 95000, 'completado', '2024-02-18', '2024-02-19'),
    (3, 2, '2024-02-22', 178000, 'completado', '2024-02-22', '2024-02-23'),
    (3, 1, '2024-02-27', 134000, 'completado', '2024-02-27', '2024-02-28'),
    
    -- Marzo 2024
    (3, 1, '2024-03-04', 289000, 'completado', '2024-03-04', '2024-03-05'),
    (3, 2, '2024-03-10', 156000, 'completado', '2024-03-10', '2024-03-11'),
    (3, 1, '2024-03-15', 223000, 'completado', '2024-03-15', '2024-03-16'),
    (3, 2, '2024-03-20', 187000, 'completado', '2024-03-20', '2024-03-21'),
    (3, 1, '2024-03-25', 145000, 'completado', '2024-03-25', '2024-03-26'),
    (3, 2, '2024-03-28', 98000, 'pendiente', NULL, NULL),
    
    -- Abril 2024
    (3, 2, '2024-04-02', 312000, 'completado', '2024-04-02', '2024-04-03'),
    (3, 1, '2024-04-08', 198000, 'completado', '2024-04-08', '2024-04-09'),
    (3, 2, '2024-04-12', 245000, 'completado', '2024-04-12', '2024-04-13'),
    (3, 1, '2024-04-18', 167000, 'completado', '2024-04-18', '2024-04-19'),
    (3, 2, '2024-04-23', 89000, 'pendiente', NULL, NULL),
    (3, 1, '2024-04-28', 134000, 'completado', '2024-04-28', '2024-04-29'),
    
    -- Mayo 2024
    (3, 1, '2024-05-05', 276000, 'completado', '2024-05-05', '2024-05-06'),
    (3, 2, '2024-05-10', 189000, 'completado', '2024-05-10', '2024-05-11'),
    (3, 1, '2024-05-15', 234000, 'completado', '2024-05-15', '2024-05-16'),
    (3, 2, '2024-05-20', 156000, 'completado', '2024-05-20', '2024-05-21'),
    (3, 1, '2024-05-25', 198000, 'pendiente', NULL, NULL),
    (3, 2, '2024-05-28', 123000, 'completado', '2024-05-28', '2024-05-29'),
    
    -- Junio 2024
    (3, 2, '2024-06-03', 345000, 'completado', '2024-06-03', '2024-06-04'),
    (3, 1, '2024-06-08', 267000, 'completado', '2024-06-08', '2024-06-09'),
    (3, 2, '2024-06-14', 189000, 'completado', '2024-06-14', '2024-06-15'),
    (3, 1, '2024-06-19', 234000, 'completado', '2024-06-19', '2024-06-20'),
    (3, 2, '2024-06-24', 167000, 'pendiente', NULL, NULL),
    (3, 1, '2024-06-28', 145000, 'completado', '2024-06-28', '2024-06-29'),
    
    -- Julio 2024
    (3, 1, '2024-07-05', 298000, 'completado', '2024-07-05', '2024-07-06'),
    (3, 2, '2024-07-10', 223000, 'completado', '2024-07-10', '2024-07-11'),
    (3, 1, '2024-07-15', 178000, 'completado', '2024-07-15', '2024-07-16'),
    (3, 2, '2024-07-20', 256000, 'completado', '2024-07-20', '2024-07-21'),
    (3, 1, '2024-07-25', 189000, 'completado', '2024-07-25', '2024-07-26'),
    (3, 2, '2024-07-28', 134000, 'pendiente', NULL, NULL),
    
    -- Agosto 2024
    (3, 2, '2024-08-02', 312000, 'completado', '2024-08-02', '2024-08-03'),
    (3, 1, '2024-08-08', 245000, 'completado', '2024-08-08', '2024-08-09'),
    (3, 2, '2024-08-14', 198000, 'completado', '2024-08-14', '2024-08-15'),
    (3, 1, '2024-08-20', 167000, 'completado', '2024-08-20', '2024-08-21'),
    (3, 2, '2024-08-25', 234000, 'pendiente', NULL, NULL),
    (3, 1, '2024-08-28', 156000, 'completado', '2024-08-28', '2024-08-29'),
    
    -- Septiembre 2024
    (3, 1, '2024-09-05', 289000, 'completado', '2024-09-05', '2024-09-06'),
    (3, 2, '2024-09-10', 267000, 'completado', '2024-09-10', '2024-09-11'),
    (3, 1, '2024-09-15', 198000, 'completado', '2024-09-15', '2024-09-16'),
    (3, 2, '2024-09-20', 223000, 'completado', '2024-09-20', '2024-09-21'),
    (3, 1, '2024-09-25', 178000, 'pendiente', NULL, NULL),
    (3, 2, '2024-09-28', 145000, 'completado', '2024-09-28', '2024-09-29'),
    
    -- Octubre 2024
    (3, 2, '2024-10-03', 334000, 'completado', '2024-10-03', '2024-10-04'),
    (3, 1, '2024-10-08', 256000, 'completado', '2024-10-08', '2024-10-09'),
    (3, 2, '2024-10-14', 189000, 'completado', '2024-10-14', '2024-10-15'),
    (3, 1, '2024-10-18', 234000, 'completado', '2024-10-18', '2024-10-19'),
    (3, 2, '2024-10-21', 167000, 'cancelado', NULL, NULL),
    (3, 1, '2024-10-25', 198000, 'pendiente', NULL, NULL),
    (3, 2, '2024-10-28', 145000, 'completado', '2024-10-28', '2024-10-29');

-- Detalle de ventas con variedad de productos
INSERT INTO Detalle_Pedidos (
        id_pedido,
        id_producto,
        cantidad,
        precio_unitario,
        subtotal
    )
VALUES 
    -- Pedido 1
    (1, 1, 3, 45000, 135000),
    (1, 7, 2, 22000, 44000),
    -- Pedido 2
    (2, 2, 4, 18000, 72000),
    (2, 9, 1, 38000, 38000),
    -- Pedido 3
    (3, 3, 2, 35000, 70000),
    (3, 4, 3, 52000, 156000),
    -- Pedido 4
    (4, 6, 5, 28000, 140000),
    -- Pedido 5
    (5, 1, 5, 45000, 225000),
    (5, 10, 3, 25000, 75000),
    -- Pedido 6
    (6, 2, 6, 18000, 108000),
    -- Pedido 7
    (7, 3, 4, 35000, 140000),
    (7, 8, 2, 15000, 30000),
    (7, 9, 1, 38000, 38000),
    -- Pedido 8
    (8, 1, 2, 45000, 90000),
    (8, 5, 1, 48000, 48000),
    -- Pedido 9
    (9, 4, 3, 52000, 156000),
    (9, 6, 4, 28000, 112000),
    -- Pedido 10
    (10, 7, 5, 22000, 110000),
    -- Pedido 11
    (11, 2, 8, 18000, 144000),
    (11, 10, 2, 25000, 50000),
    -- Pedido 12
    (12, 1, 3, 45000, 135000),
    (12, 3, 1, 35000, 35000),
    -- Pedido 13
    (13, 4, 5, 52000, 260000),
    (13, 8, 2, 15000, 30000),
    -- Pedido 14
    (14, 6, 6, 28000, 168000),
    -- Pedido 15
    (15, 1, 4, 45000, 180000),
    (15, 7, 2, 22000, 44000),
    -- Pedido 16
    (16, 9, 3, 38000, 114000),
    (16, 2, 4, 18000, 72000),
    -- Pedido 17
    (17, 3, 3, 35000, 105000),
    (17, 5, 2, 48000, 96000),
    -- Pedido 18
    (18, 10, 4, 25000, 100000),
    -- Pedido 19
    (19, 1, 6, 45000, 270000),
    (19, 4, 2, 52000, 104000),
    -- Pedido 20
    (20, 6, 7, 28000, 196000),
    (20, 8, 1, 15000, 15000),
    -- Pedido 21
    (21, 2, 10, 18000, 180000),
    (21, 7, 3, 22000, 66000),
    -- Pedido 22
    (22, 3, 4, 35000, 140000),
    (22, 9, 1, 38000, 38000),
    -- Pedido 23
    (23, 1, 2, 45000, 90000),
    (23, 5, 1, 48000, 48000),
    -- Pedido 24
    (24, 4, 3, 52000, 156000),
    -- Pedido 25
    (25, 6, 8, 28000, 224000),
    (25, 10, 3, 25000, 75000),
    -- Pedido 26
    (26, 2, 5, 18000, 90000),
    (26, 7, 4, 22000, 88000),
    -- Pedido 27
    (27, 1, 5, 45000, 225000),
    (27, 8, 3, 15000, 45000),
    -- Pedido 28
    (28, 3, 6, 35000, 210000),
    (28, 9, 2, 38000, 76000),
    -- Pedido 29
    (29, 4, 4, 52000, 208000),
    (29, 5, 2, 48000, 96000),
    -- Pedido 30
    (30, 6, 5, 28000, 140000),
    (30, 10, 2, 25000, 50000),
    -- Pedido 31
    (31, 1, 7, 45000, 315000),
    (31, 2, 3, 18000, 54000),
    -- Pedido 32
    (32, 3, 5, 35000, 175000),
    (32, 7, 4, 22000, 88000),
    -- Pedido 33
    (33, 4, 3, 52000, 156000),
    (33, 8, 2, 15000, 30000),
    -- Pedido 34
    (34, 6, 6, 28000, 168000),
    (34, 9, 1, 38000, 38000),
    -- Pedido 35
    (35, 1, 4, 45000, 180000),
    (35, 10, 2, 25000, 50000),
    -- Pedido 36
    (36, 2, 8, 18000, 144000),
    (36, 5, 1, 48000, 48000),
    -- Pedido 37
    (37, 3, 6, 35000, 210000),
    (37, 7, 4, 22000, 88000),
    -- Pedido 38
    (38, 4, 4, 52000, 208000),
    (38, 8, 2, 15000, 30000),
    -- Pedido 39
    (39, 1, 5, 45000, 225000),
    (39, 6, 3, 28000, 84000),
    -- Pedido 40
    (40, 9, 3, 38000, 114000),
    (40, 2, 4, 18000, 72000),
    -- Pedido 41
    (41, 3, 4, 35000, 140000),
    (41, 10, 2, 25000, 50000),
    -- Pedido 42
    (42, 1, 3, 45000, 135000),
    (42, 5, 1, 48000, 48000),
    -- Pedido 43
    (43, 4, 5, 52000, 260000),
    (43, 7, 3, 22000, 66000),
    -- Pedido 44
    (44, 6, 7, 28000, 196000),
    (44, 8, 2, 15000, 30000),
    -- Pedido 45
    (45, 2, 9, 18000, 162000),
    (45, 9, 1, 38000, 38000),
    -- Pedido 46
    (46, 1, 4, 45000, 180000),
    (46, 3, 2, 35000, 70000),
    -- Pedido 47
    (47, 4, 6, 52000, 312000),
    (47, 10, 3, 25000, 75000),
    -- Pedido 48
    (48, 6, 8, 28000, 224000),
    (48, 5, 2, 48000, 96000),
    -- Pedido 49
    (49, 2, 7, 18000, 126000),
    (49, 7, 5, 22000, 110000),
    -- Pedido 50
    (50, 1, 5, 45000, 225000),
    (50, 8, 3, 15000, 45000),
    -- Pedido 51
    (51, 3, 6, 35000, 210000),
    (51, 9, 2, 38000, 76000),
    -- Pedido 52
    (52, 4, 4, 52000, 208000),
    (52, 6, 3, 28000, 84000),
    -- Pedido 53
    (53, 1, 6, 45000, 270000),
    (53, 2, 4, 18000, 72000),
    -- Pedido 54
    (54, 5, 3, 48000, 144000),
    (54, 7, 4, 22000, 88000),
    -- Pedido 55
    (55, 3, 5, 35000, 175000),
    (55, 10, 2, 25000, 50000),
    -- Pedido 56
    (56, 8, 4, 15000, 60000),
    (56, 9, 2, 38000, 76000),
    -- Pedido 57
    (57, 1, 4, 45000, 180000),
    (57, 6, 4, 28000, 112000),
    -- Pedido 58
    (58, 2, 10, 18000, 180000),
    (58, 4, 2, 52000, 104000),
    -- Pedido 59
    (59, 3, 4, 35000, 140000),
    (59, 7, 3, 22000, 66000),
    -- Pedido 60
    (60, 1, 3, 45000, 135000),
    (60, 5, 1, 48000, 48000),
    -- Pedido 61
    (61, 6, 9, 28000, 252000),
    (61, 10, 4, 25000, 100000);
