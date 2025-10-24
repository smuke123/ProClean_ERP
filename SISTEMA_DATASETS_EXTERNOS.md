# 🌐 Sistema de Importación y Visualización de Datasets Externos

## 📝 Descripción General

Este sistema permite a ProClean ERP **importar y visualizar datasets JSON de empresas externas** sin conocer previamente su estructura. El sistema detecta automáticamente la estructura de los datos y permite visualizarlos en la misma interfaz de informes junto con los datos propios de la empresa.

---

## 🎯 Características Principales

### 1. **Importación Flexible de JSON**
- ✅ Soporta JSON con **estructura desconocida**
- ✅ Detección automática de tipos de datos (number, string, date, boolean)
- ✅ Validación de datos
- ✅ Almacenamiento eficiente en base de datos

### 2. **Visualización Unificada**
- ✅ Selector de fuente de datos (propios vs externos)
- ✅ DataView con columnas dinámicas generadas automáticamente
- ✅ Charts y gráficos adaptativos
- ✅ Filtrado y búsqueda en datos externos

### 3. **Gestión de Datasets**
- ✅ Listar datasets importados
- ✅ Actualizar información de datasets
- ✅ Reemplazar datos
- ✅ Eliminar datasets

---

## 🗄️ Estructura de Base de Datos

### Tabla: `Datasets_Externos`
Almacena información meta de cada dataset importado.

```sql
CREATE TABLE Datasets_Externos (
  id_dataset INT PRIMARY KEY AUTO_INCREMENT,
  nombre_empresa VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha_importacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  estructura_detectada JSON,
  total_registros INT DEFAULT 0,
  metadata JSON,
  activo BOOLEAN DEFAULT TRUE,
  creado_por INT,
  FOREIGN KEY (creado_por) REFERENCES Usuarios(id_usuario)
);
```

### Tabla: `Datos_Externos`
Almacena los registros individuales de cada dataset en formato JSON.

```sql
CREATE TABLE Datos_Externos (
  id_dato INT PRIMARY KEY AUTO_INCREMENT,
  id_dataset INT NOT NULL,
  datos JSON NOT NULL,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_dataset) REFERENCES Datasets_Externos(id_dataset) ON DELETE CASCADE
);
```

---

## 🚀 Cómo Usar

### 1. Aplicar la Migración SQL

```bash
# Opción A: MySQL directamente
mysql -u tu_usuario -p proclean_erp < backend/src/database/migrations/003_add_external_datasets_table.sql

# Opción B: Con Docker
docker exec -i contenedor_mysql mysql -u root -p proclean_erp < backend/src/database/migrations/003_add_external_datasets_table.sql
```

### 2. Reiniciar el Backend

```bash
cd backend
npm start
```

---

## 📡 Endpoints de API

### Autenticación
Todos los endpoints requieren autenticación con JWT token.

```http
Authorization: Bearer {tu_token_jwt}
```

### 1. Listar Datasets Externos

```http
GET /api/datasets-externos
Query params: ?activo=true&empresa=nombre
```

**Respuesta:**
```json
{
  "success": true,
  "total": 2,
  "datasets": [
    {
      "id_dataset": 1,
      "nombre_empresa": "Empresa Externa SA",
      "descripcion": "Ventas mensuales 2025",
      "total_registros": 150,
      "fecha_importacion": "2025-10-24T10:00:00.000Z",
      "estructura_detectada": {
        "campos": ["id", "fecha", "monto", "categoria"],
        "tipos": {
          "id": "number",
          "fecha": "date",
          "monto": "number",
          "categoria": "string"
        }
      }
    }
  ]
}
```

### 2. Obtener Dataset Específico

```http
GET /api/datasets-externos/:id
```

### 3. Obtener Datos de un Dataset

```http
GET /api/datasets-externos/:id/datos
Query params: ?limit=1000&offset=0
```

**Respuesta:**
```json
{
  "success": true,
  "dataset": {
    "id": 1,
    "nombre_empresa": "Empresa Externa SA",
    "estructura": { ... }
  },
  "total_registros": 150,
  "registros_devueltos": 150,
  "datos": [
    {
      "id": 1,
      "fecha": "2025-01-15",
      "monto": 1250.00,
      "categoria": "Electrónica"
    },
    ...
  ]
}
```

### 4. Importar Dataset (Solo Admin)

```http
POST /api/datasets-externos/importar
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Body:**
```json
{
  "nombre_empresa": "Empresa Externa SA",
  "descripcion": "Ventas mensuales 2025",
  "metadata": {
    "moneda": "USD",
    "periodo": "2025-01"
  },
  "datos": [
    {
      "id": 1,
      "fecha": "2025-01-15",
      "monto": 1250.00,
      "categoria": "Electrónica",
      "vendedor": "Juan Pérez"
    },
    {
      "id": 2,
      "fecha": "2025-01-16",
      "monto": 850.50,
      "categoria": "Ropa",
      "vendedor": "María González"
    }
  ]
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Dataset importado exitosamente: 2 registros",
  "dataset": {
    "id_dataset": 1,
    "nombre_empresa": "Empresa Externa SA",
    "total_registros": 2,
    "estructura_detectada": {
      "campos": ["id", "fecha", "monto", "categoria", "vendedor"],
      "tipos": {
        "id": "number",
        "fecha": "date",
        "monto": "number",
        "categoria": "string",
        "vendedor": "string"
      },
      "ejemplos": {
        "id": 1,
        "fecha": "2025-01-15",
        "monto": 1250.00,
        "categoria": "Electrónica",
        "vendedor": "Juan Pérez"
      }
    }
  }
}
```

### 5. Actualizar Dataset (Solo Admin)

```http
PUT /api/datasets-externos/:id
Authorization: Bearer {admin_token}
```

**Body:**
```json
{
  "nombre_empresa": "Empresa Externa SA - Actualizado",
  "descripcion": "Nueva descripción",
  "activo": true
}
```

### 6. Reemplazar Datos de un Dataset (Solo Admin)

```http
PUT /api/datasets-externos/:id/datos
Authorization: Bearer {admin_token}
```

**Body:**
```json
{
  "datos": [
    { ...nuevos_datos... }
  ]
}
```

### 7. Eliminar Dataset (Solo Admin)

```http
DELETE /api/datasets-externos/:id
Authorization: Bearer {admin_token}
```

---

## 💻 Uso desde el Frontend

### 1. Acceder a Informes

Navega a la página de **Informes** en el dashboard.

### 2. Seleccionar Fuente de Datos

En la parte superior, verás dos botones:
- **Datos Propios**: Muestra ventas y compras de tu empresa
- **Datos Externos (N)**: Muestra datasets importados de empresas externas

### 3. Seleccionar Dataset Externo

Al hacer clic en "Datos Externos", aparecerá un dropdown con la lista de empresas disponibles. Selecciona una para visualizar sus datos.

### 4. Visualización

El sistema automáticamente:
- ✅ Detecta los campos disponibles en el dataset
- ✅ Genera columnas dinámicas en el DataTable
- ✅ Crea gráficos adaptativos basados en los datos
- ✅ Calcula KPIs relevantes

### 5. Filtrado y Búsqueda

Puedes filtrar y buscar en los datos externos igual que con tus datos propios:
- Búsqueda global
- Filtros por columna
- Ordenamiento
- Exportación a CSV

---

## 🔧 Ejemplos de Uso

### Ejemplo 1: Importar Dataset Desde Código

```javascript
import { importarDatasetExterno } from '../utils/api';

const datosExternos = {
  nombre_empresa: "Tienda ABC",
  descripcion: "Ventas del primer trimestre 2025",
  metadata: {
    moneda: "USD",
    periodo: "Q1 2025"
  },
  datos: [
    {
      id_venta: 101,
      fecha: "2025-01-10",
      total: 450.00,
      producto: "Laptop HP",
      cantidad: 1,
      cliente: "Empresa XYZ"
    },
    {
      id_venta: 102,
      fecha: "2025-01-11",
      total: 1200.00,
      producto: "Monitor Dell",
      cantidad: 3,
      cliente: "Corporación ABC"
    }
  ]
};

const resultado = await importarDatasetExterno(datosExternos);
console.log(resultado);
```

### Ejemplo 2: Importar Desde un Archivo JSON

```javascript
// Leer archivo JSON
const archivo = document.getElementById('fileInput').files[0];
const lector = new FileReader();

lector.onload = async (e) => {
  const contenido = JSON.parse(e.target.result);
  
  const payload = {
    nombre_empresa: "Empresa del Archivo",
    descripcion: "Datos importados desde archivo JSON",
    datos: contenido // Asumiendo que el archivo contiene un array de objetos
  };
  
  try {
    const resultado = await importarDatasetExterno(payload);
    console.log("Importación exitosa:", resultado);
  } catch (error) {
    console.error("Error al importar:", error);
  }
};

lector.readAsText(archivo);
```

### Ejemplo 3: Consumir API Externa y Guardar

```javascript
// Consumir API externa y luego guardar en ProClean ERP
async function importarDesdeAPIExterna() {
  // 1. Obtener datos de API externa
  const respuesta = await fetch('https://api-externa.com/ventas');
  const datosExternos = await respuesta.json();
  
  // 2. Transformar si es necesario
  const datosTransformados = datosExternos.map(item => ({
    id: item.sale_id,
    fecha: item.date,
    monto: item.amount,
    cliente: item.customer_name
  }));
  
  // 3. Importar a ProClean ERP
  const resultado = await importarDatasetExterno({
    nombre_empresa: "API Externa Inc",
    descripcion: "Datos sincronizados automáticamente",
    datos: datosTransformados
  });
  
  return resultado;
}
```

---

## 🎨 Detección Automática de Estructura

El sistema detecta automáticamente:

### Tipos de Datos
- **number**: Valores numéricos (1, 2.5, 100.00)
- **string**: Texto ("cliente", "producto")
- **date**: Fechas ("2025-01-15", "2025/01/15")
- **boolean**: true/false
- **object**: Objetos anidados
- **array**: Arrays

### Campos Especiales

El sistema intenta detectar campos comunes:

| Campo Detectado | Palabras Clave | Uso |
|----------------|----------------|-----|
| **Numérico Principal** | total, monto, amount, price, valor | Para KPIs y gráficos de montos |
| **Fecha** | fecha, date, time, timestamp | Para tendencias temporales |
| **Estado** | estado, status, state | Para gráficos de distribución |
| **Categoría** | categoria, category, tipo, type, branch, sucursal | Para agrupaciones |

---

## 📊 Visualización Adaptativa

### KPIs Calculados

El sistema calcula automáticamente:
- **Total de registros**
- **Suma de valores numéricos principales**
- **Promedio**
- **Registros completados/pendientes** (si hay campo de estado)

### Gráficos Generados

1. **Tendencia Mensual**: Si hay campo de fecha
2. **Distribución por Categoría**: Si hay campo categórico
3. **Estados**: Si hay campo de estado
4. **Top Items**: Si hay campo de productos

---

## 🔒 Seguridad

### Permisos

- **Lectura de Datasets**: Cualquier usuario autenticado
- **Importación**: Solo administradores
- **Actualización**: Solo administradores
- **Eliminación**: Solo administradores

### Validaciones

- ✅ Validación de estructura JSON
- ✅ Límite de tamaño de datasets
- ✅ Sanitización de datos
- ✅ Autenticación JWT obligatoria

---

## 🐛 Solución de Problemas

### Error: "Se requiere un array de datos no vacío"

**Causa**: El campo `datos` no es un array o está vacío.

**Solución**:
```javascript
// ❌ Incorrecto
{ datos: {} }
{ datos: null }
{ datos: [] }

// ✅ Correcto
{ datos: [{ id: 1, valor: 100 }] }
```

### Error: "Dataset no encontrado"

**Causa**: El ID del dataset no existe o fue eliminado.

**Solución**: Verifica que el dataset exista con `GET /api/datasets-externos`.

### Los gráficos no se muestran correctamente

**Causa**: El sistema no puede detectar campos numéricos o de fecha.

**Solución**: Asegúrate de que tu JSON incluya:
- Al menos un campo numérico para valores
- Un campo de fecha en formato ISO (YYYY-MM-DD)

---

## 📈 Mejores Prácticas

### 1. Formato de Datos

```javascript
// ✅ Recomendado
{
  "datos": [
    {
      "id": 1,
      "fecha": "2025-01-15",      // Formato ISO
      "monto": 1250.00,            // Number, no string
      "categoria": "Ventas",
      "estado": "completado"
    }
  ]
}

// ❌ Evitar
{
  "datos": [
    {
      "id": "1",                   // String en vez de number
      "fecha": "15/01/2025",       // Formato no estándar
      "monto": "$1,250.00",        // String con formato
      "cat": "Ventas",             // Nombre abreviado
      "st": "OK"                   // Abreviado y no descriptivo
    }
  ]
}
```

### 2. Nombres de Campos

- Usa nombres descriptivos en minúsculas
- Usa guiones bajos para separar palabras
- Evita abreviaciones
- Usa español o inglés consistentemente

### 3. Metadata

Incluye metadata relevante:

```javascript
{
  "nombre_empresa": "Tienda ABC",
  "metadata": {
    "moneda": "USD",
    "periodo": "2025-Q1",
    "fuente": "Sistema POS",
    "version_formato": "2.0"
  }
}
```

---

## 🔄 Flujo Completo

```
1. Empresa Externa → Genera JSON con sus datos
                ↓
2. Admin ProClean → Importa JSON via API POST
                ↓
3. Sistema → Detecta estructura automáticamente
                ↓
4. Sistema → Almacena datos en BD
                ↓
5. Usuario → Selecciona dataset en Informes
                ↓
6. Sistema → Genera columnas dinámicas
                ↓
7. Usuario → Visualiza datos, gráficos y KPIs
```

---

## 📚 Recursos Adicionales

- **API de Exportación**: Ver `API_EXPORTACION_DOCS.md`
- **Schema SQL**: `backend/src/database/migrations/003_add_external_datasets_table.sql`
- **Modelo Backend**: `backend/src/models/DatasetExterno.js`
- **Controlador**: `backend/src/controllers/datasetExternoController.js`
- **Rutas API**: `backend/src/routes/datasetExterno.routes.js`
- **Página Frontend**: `frontend/src/pages/Informes.jsx`

---

## 🎉 Conclusión

Este sistema permite a ProClean ERP funcionar como un **hub centralizado de datos**, capaz de:
- ✅ Exportar sus propios datos a empresas externas (ya implementado)
- ✅ Importar datos de empresas externas (nuevo)
- ✅ Visualizar todo en una interfaz unificada

**Flujo bidireccional completo de intercambio de datos entre empresas.**

---

**© 2025 ProClean ERP - Sistema de Datasets Externos v1.0.0**

