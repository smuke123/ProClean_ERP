# Base de Datos ProClean ERP

Este directorio contiene los archivos SQL para configurar la base de datos del sistema ProClean ERP.

## Archivos

### `schema.sql`
Contiene únicamente la estructura de las tablas de la base de datos:
- Definición de todas las tablas
- Claves primarias y foráneas
- Restricciones y índices
- Tipos de datos y valores por defecto

### `data.sql`
Contiene los datos de prueba para el sistema:
- 2 sucursales (Norte y Sur)
- 3 usuarios (2 administradores + 1 cliente)
- 10 productos de limpieza
- 3 proveedores
- Inventario inicial para ambas sucursales
- Compras y ventas de ejemplo

## Cómo usar

### 1. Crear la base de datos
```sql
CREATE DATABASE proclean_erp;
USE proclean_erp;
```

### 2. Ejecutar el esquema
```bash
mysql -u usuario -p proclean_erp < schema.sql
```

### 3. Cargar datos de prueba (opcional)
```bash
mysql -u usuario -p proclean_erp < data.sql
```

## Credenciales de prueba

### Administradores
- **Admin Norte**: `admin@norte.proclean.com` / `admin123`
- **Admin Sur**: `admin@sur.proclean.com` / `admin123`

### Cliente
- **Cliente**: `cliente@proclean.com` / `cliente123`

## Estructura de la base de datos

### Tablas principales
- **Sucursales**: Información de las sucursales
- **Usuarios**: Usuarios del sistema (admin/cliente)
- **Proveedores**: Proveedores de productos
- **Productos**: Catálogo de productos
- **Inventario**: Stock por sucursal
- **Compras**: Registro de compras
- **Detalle_Compras**: Items de cada compra
- **Pedidos**: Órdenes de venta
- **Detalle_Pedidos**: Items de cada pedido

### Relaciones
- Usuarios → Sucursales (opcional)
- Inventario → Sucursales + Productos
- Compras → Proveedores + Sucursales
- Detalle_Compras → Compras + Productos
- Pedidos → Usuarios + Sucursales
- Detalle_Pedidos → Pedidos + Productos
