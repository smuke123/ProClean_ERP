# 🗄️ Base de Datos ProClean ERP

Este directorio contiene los archivos SQL para configurar la base de datos del sistema ProClean ERP.

## 📁 Estructura

```
database/
├── schema.sql          # Esquema completo (estructura de tablas)
├── data.sql           # Datos de prueba completos
├── migrations/        # Migraciones incrementales
│   ├── 001_add_carritos_table.sql
│   └── 002_add_api_keys_table.sql
└── README.md          # Este archivo
```

## 📋 Archivos

### `schema.sql`
Contiene únicamente la estructura de las tablas de la base de datos:
- Definición de todas las tablas
- Claves primarias y foráneas
- Restricciones y índices
- Tipos de datos y valores por defecto

### `data.sql`
Contiene los datos de prueba completos para el sistema:
- **2 Sucursales**: ProClean Norte y Sur
- **3 Usuarios**: 2 administradores + 1 cliente
- **10 Productos**: Detergentes, limpiadores, desinfectantes, etc.
- **3 Proveedores**: Distribuidores de productos
- **20 Registros de inventario**: Stock inicial por sucursal
- **42 Compras**: Datos históricos de enero a octubre 2024
- **61 Pedidos/Ventas**: Datos históricos de ventas

### `migrations/`
Directorio con migraciones incrementales para actualizaciones:
- `001_add_carritos_table.sql` - Tabla para carritos persistentes
- `002_add_api_keys_table.sql` - Tabla para API keys

## 🚀 Uso Rápido

### Opción 1: Configuración Inicial Completa (Recomendado)
Ejecuta el script de setup desde la raíz del proyecto:
```bash
./setup.sh
```
Este script te guiará por todo el proceso de configuración.

### Opción 2: Recargar Solo los Datos
Si ya tienes el sistema configurado y solo quieres recargar los datos:
```bash
./reload_data.sh
```
Este script limpia las tablas e importa datos frescos automáticamente.

### Opción 3: Manual
Si prefieres hacerlo manualmente:

#### 1. Crear la base de datos
```sql
CREATE DATABASE proclean_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE proclean_erp;
```

#### 2. Ejecutar el esquema
```bash
mysql -u usuario -p proclean_erp < schema.sql
```

#### 3. Limpiar datos existentes (si es necesario)
```bash
mysql -u usuario -p proclean_erp << 'EOF'
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE Detalle_Pedidos;
TRUNCATE TABLE Detalle_Compras;
TRUNCATE TABLE Pedidos;
TRUNCATE TABLE Compras;
TRUNCATE TABLE Carritos;
TRUNCATE TABLE Inventario;
TRUNCATE TABLE Productos;
TRUNCATE TABLE Proveedores;
TRUNCATE TABLE Usuarios;
TRUNCATE TABLE Sucursales;
SET FOREIGN_KEY_CHECKS = 1;
EOF
```

#### 4. Cargar datos de prueba
```bash
mysql -u usuario -p proclean_erp < data.sql
```

## 👤 Credenciales de Prueba

### Administradores
- **Admin Norte**: `admin@norte.proclean.com` / `admin123`
- **Admin Sur**: `admin@sur.proclean.com` / `admin123`

### Cliente
- **Cliente**: `cliente@proclean.com` / `cliente123`

## 🔍 Verificación

Para verificar que los datos se importaron correctamente:

```bash
mysql -u usuario -p proclean_erp << 'EOF'
SELECT COUNT(*) as Total, 'Sucursales' as Tabla FROM Sucursales
UNION ALL SELECT COUNT(*), 'Usuarios' FROM Usuarios
UNION ALL SELECT COUNT(*), 'Productos' FROM Productos
UNION ALL SELECT COUNT(*), 'Proveedores' FROM Proveedores
UNION ALL SELECT COUNT(*), 'Inventario' FROM Inventario
UNION ALL SELECT COUNT(*), 'Compras' FROM Compras
UNION ALL SELECT COUNT(*), 'Pedidos' FROM Pedidos;
EOF
```

Resultado esperado:
```
Total   Tabla
2       Sucursales
3       Usuarios
10      Productos
3       Proveedores
20      Inventario
42      Compras
61      Pedidos
```

## 📝 Notas

- Todos los scripts de limpieza usan `TRUNCATE` para mayor velocidad
- Se desactiva temporalmente `FOREIGN_KEY_CHECKS` para evitar errores de dependencias
- Las contraseñas están hasheadas con bcrypt (10 rounds)
- Los datos de prueba cubren 10 meses de operaciones (enero-octubre 2024)
- Los carritos se guardan persistentemente en la tabla `Carritos`

