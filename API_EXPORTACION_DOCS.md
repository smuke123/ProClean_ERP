# 📡 API de Exportación de Datos - ProClean ERP

## 🎯 Descripción General

API RESTful para exportar datos en tiempo real del sistema ProClean ERP. Permite a organizaciones externas consultar datos de ventas, compras, productos, inventario y sucursales mediante autenticación con API Keys.

---

## 🔐 Autenticación

### API Keys

Todas las peticiones requieren una API Key válida.

**Método de autenticación:**

```http
GET /api/export/ventas
Headers:
  X-API-Key: your_api_key_here
```

O alternativamente:

```http
Headers:
  Authorization: Bearer your_api_key_here
```

### Obtener una API Key

Las API Keys son generadas por administradores del sistema mediante:

```http
POST /api/api-keys
Authorization: Bearer {admin_jwt_token}
Content-Type: application/json

{
  "nombre": "Integración External Inc",
  "descripcion": "Acceso para reportes mensuales",
  "organizacion": "External Inc",
  "contacto": "api@external.com",
  "permisos": ["read"],
  "recursos_permitidos": ["ventas", "productos"],
  "rate_limit": 1000,
  "fecha_expiracion": "2026-12-31"
}
```

**Respuesta:**

```json
{
  "message": "API Key creada exitosamente",
  "api_key": "a1b2c3d4e5f6...32_caracteres_hex",
  "data": {
    "id_api_key": 1,
    "nombre": "Integración External Inc",
    "organizacion": "External Inc",
    "permisos": ["read"],
    "recursos_permitidos": ["ventas", "productos"]
  },
  "warning": "⚠️ Guarde esta API Key de forma segura. No podrá verla nuevamente."
}
```

---

## 📊 Endpoints de Exportación

### Base URL

```
https://tu-dominio.com/api/export
```

---

### 1. Información General

**Endpoint:** `GET /api/export`

Obtiene información sobre la API y los recursos disponibles para tu API Key.

**Request:**
```http
GET /api/export
X-API-Key: your_api_key_here
```

**Response:**
```json
{
  "api_name": "ProClean ERP Data Export API",
  "version": "1.0.0",
  "authenticated_as": "Integración External Inc",
  "organization": "External Inc",
  "permissions": ["read"],
  "available_resources": ["ventas", "productos"],
  "rate_limit": 1000,
  "requests_used": 45,
  "endpoints": {
    "ventas": "/api/export/ventas",
    "compras": "/api/export/compras",
    "productos": "/api/export/productos",
    "inventario": "/api/export/inventario",
    "sucursales": "/api/export/sucursales",
    "all": "/api/export/all"
  }
}
```

---

### 2. Exportar Ventas

**Endpoint:** `GET /api/export/ventas`

Exporta datos de ventas/pedidos.

**Parámetros Query (opcionales):**

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `sucursal` | integer | ID de sucursal | `?sucursal=1` |
| `estado` | string | Estado del pedido | `?estado=completado` |
| `desde` | date | Fecha inicio (YYYY-MM-DD) | `?desde=2025-01-01` |
| `hasta` | date | Fecha fin (YYYY-MM-DD) | `?hasta=2025-12-31` |

**Request:**
```http
GET /api/export/ventas?estado=completado&desde=2025-10-01&hasta=2025-10-31
X-API-Key: your_api_key_here
```

**Response:**
```json
{
  "source": "ProClean ERP",
  "resource": "ventas",
  "timestamp": "2025-10-24T14:30:00.000Z",
  "total_records": 150,
  "filters_applied": {
    "estado": "completado",
    "desde": "2025-10-01",
    "hasta": "2025-10-31"
  },
  "data": [
    {
      "id_pedido": 1,
      "id_usuario": 5,
      "cliente": "Juan Pérez",
      "id_sucursal": 1,
      "sucursal": "Sucursal Centro",
      "fecha": "2025-10-15",
      "total": "350.00",
      "estado": "completado",
      "productos": "Detergente, Jabón Líquido",
      "cantidad_items": 5
    }
    // ... más registros
  ],
  "summary": {
    "total_amount": 52500.00,
    "by_status": {
      "completado": 150
    },
    "period": {
      "from": "2025-10-01",
      "to": "2025-10-31"
    }
  },
  "metadata": {
    "currency": "USD",
    "timezone": "UTC",
    "exported_by": "External Inc"
  }
}
```

---

### 3. Exportar Compras

**Endpoint:** `GET /api/export/compras`

Exporta datos de compras a proveedores.

**Parámetros Query (opcionales):**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `sucursal` | integer | ID de sucursal |
| `estado` | string | Estado de la compra |
| `desde` | date | Fecha inicio |
| `hasta` | date | Fecha fin |

**Request:**
```http
GET /api/export/compras?estado=pagada
X-API-Key: your_api_key_here
```

**Response:** Estructura similar a ventas con datos de compras.

---

### 4. Exportar Productos

**Endpoint:** `GET /api/export/productos`

Exporta el catálogo completo de productos.

**Parámetros Query (opcionales):**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `categoria` | string | Filtrar por categoría |
| `marca` | string | Filtrar por marca |
| `activo` | boolean | Solo productos activos |

**Request:**
```http
GET /api/export/productos?categoria=Limpieza&activo=true
X-API-Key: your_api_key_here
```

**Response:**
```json
{
  "source": "ProClean ERP",
  "resource": "productos",
  "timestamp": "2025-10-24T14:30:00.000Z",
  "total_records": 50,
  "data": [
    {
      "id_producto": 1,
      "nombre": "Detergente Multiusos ProClean",
      "precio": "12.99",
      "categoria": "Limpieza",
      "marca": "ProClean",
      "descripcion_corta": "Detergente líquido concentrado",
      "descripcion": "Detergente profesional para limpieza profunda...",
      "imagen": "productos/detergente.jpg",
      "activo": true
    }
    // ... más productos
  ],
  "summary": {
    "total_products": 50,
    "active_products": 48,
    "by_category": {
      "Limpieza": 30,
      "Desinfección": 15,
      "Cuidado Personal": 5
    },
    "by_brand": {
      "ProClean": 35,
      "GenericBrand": 15
    },
    "price_range": {
      "min": 5.99,
      "max": 49.99,
      "avg": 18.75
    }
  }
}
```

---

### 5. Exportar Inventario

**Endpoint:** `GET /api/export/inventario`

Exporta datos de inventario por sucursal.

**Parámetros Query (opcionales):**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `sucursal` | integer | ID de sucursal (si no se especifica, todas) |

**Request:**
```http
GET /api/export/inventario?sucursal=1
X-API-Key: your_api_key_here
```

**Response:**
```json
{
  "source": "ProClean ERP",
  "resource": "inventario",
  "timestamp": "2025-10-24T14:30:00.000Z",
  "total_records": 120,
  "data": [
    {
      "id_inventario": 1,
      "id_sucursal": 1,
      "sucursal": "Sucursal Centro",
      "codigo_sucursal": "SUC-001",
      "id_producto": 5,
      "producto": "Detergente Multiusos",
      "categoria": "Limpieza",
      "marca": "ProClean",
      "precio": "12.99",
      "cantidad_disponible": 150,
      "cantidad_minima": 50,
      "nivel_stock": "normal",
      "valor_inventario": "1948.50",
      "fecha_actualizacion": "2025-10-24T10:00:00.000Z"
    }
    // ... más items
  ],
  "summary": {
    "total_items": 120,
    "total_value": 45600.00,
    "by_branch": {
      "Sucursal Centro": {
        "items": 120,
        "valor": 45600.00
      }
    },
    "alerts": {
      "stock_bajo": 8,
      "sin_stock": 2
    }
  }
}
```

---

### 6. Exportar Sucursales

**Endpoint:** `GET /api/export/sucursales`

Exporta información de todas las sucursales.

**Request:**
```http
GET /api/export/sucursales
X-API-Key: your_api_key_here
```

**Response:**
```json
{
  "source": "ProClean ERP",
  "resource": "sucursales",
  "timestamp": "2025-10-24T14:30:00.000Z",
  "total_records": 3,
  "data": [
    {
      "id_sucursal": 1,
      "nombre": "Sucursal Centro",
      "direccion": "Av. Principal 123",
      "telefono": "+1234567890",
      "codigo_sucursal": "SUC-001"
    }
    // ... más sucursales
  ]
}
```

---

### 7. Exportar Dataset Completo

**Endpoint:** `GET /api/export/all`

Exporta todos los datos disponibles según los permisos de tu API Key.

**Parámetros Query (opcionales):**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `desde` | date | Fecha inicio para datos transaccionales |
| `hasta` | date | Fecha fin para datos transaccionales |

**Request:**
```http
GET /api/export/all?desde=2025-10-01&hasta=2025-10-31
X-API-Key: your_api_key_here
```

**Response:**
```json
{
  "source": "ProClean ERP",
  "resource": "complete_dataset",
  "timestamp": "2025-10-24T14:30:00.000Z",
  "data": {
    "ventas": {
      "records": 150,
      "data": [ /* array de ventas */ ]
    },
    "compras": {
      "records": 45,
      "data": [ /* array de compras */ ]
    },
    "productos": {
      "records": 50,
      "data": [ /* array de productos */ ]
    },
    "inventario": {
      "records": 120,
      "data": [ /* array de inventario */ ]
    },
    "sucursales": {
      "records": 3,
      "data": [ /* array de sucursales */ ]
    }
  },
  "summary": {
    "total_resources": 5,
    "total_records": 368,
    "permissions": ["read"],
    "available_resources": ["ventas", "compras", "productos", "inventario", "sucursales"]
  }
}
```

---

## ⚠️ Códigos de Error

| Código | Descripción | Solución |
|--------|-------------|----------|
| `401` | API Key faltante o inválida | Verificar que el header X-API-Key esté presente y sea válido |
| `403` | Permiso denegado | Tu API Key no tiene acceso a este recurso |
| `429` | Rate limit excedido | Has excedido el límite de requests por hora |
| `500` | Error interno del servidor | Contactar al administrador |

**Ejemplo de Error:**

```json
{
  "error": "API Key inválida",
  "message": "La API Key proporcionada no es válida, está inactiva o ha expirado"
}
```

---

## 🚦 Rate Limiting

Cada API Key tiene un límite de requests por hora (por defecto: 1000).

**Headers de respuesta:**

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 985
X-RateLimit-Reset: 1729785600
```

Si excedes el límite:

```http
HTTP/1.1 429 Too Many Requests

{
  "error": "Rate limit excedido",
  "message": "Ha excedido el límite de 1000 requests por hora",
  "retry_after": 3600
}
```

---

## 📝 Ejemplos de Integración

### Python

```python
import requests

API_KEY = "your_api_key_here"
BASE_URL = "https://tu-dominio.com/api/export"

headers = {
    "X-API-Key": API_KEY
}

# Obtener ventas del mes actual
response = requests.get(
    f"{BASE_URL}/ventas",
    headers=headers,
    params={
        "desde": "2025-10-01",
        "hasta": "2025-10-31",
        "estado": "completado"
    }
)

if response.status_code == 200:
    data = response.json()
    print(f"Total ventas: {data['total_records']}")
    for venta in data['data']:
        print(f"Pedido #{venta['id_pedido']}: ${venta['total']}")
else:
    print(f"Error: {response.json()['error']}")
```

### JavaScript/Node.js

```javascript
const axios = require('axios');

const API_KEY = 'your_api_key_here';
const BASE_URL = 'https://tu-dominio.com/api/export';

const headers = {
  'X-API-Key': API_KEY
};

// Obtener productos activos
axios.get(`${BASE_URL}/productos`, {
  headers,
  params: {
    activo: true,
    categoria: 'Limpieza'
  }
})
.then(response => {
  const data = response.data;
  console.log(`Total productos: ${data.total_records}`);
  data.data.forEach(producto => {
    console.log(`${producto.nombre}: $${producto.precio}`);
  });
})
.catch(error => {
  console.error('Error:', error.response.data);
});
```

### cURL

```bash
# Obtener dataset completo
curl -X GET "https://tu-dominio.com/api/export/all?desde=2025-10-01" \
  -H "X-API-Key: your_api_key_here" \
  -H "Content-Type: application/json"
```

---

## 🔧 Gestión de API Keys (Solo Administradores)

### Listar API Keys

```http
GET /api/api-keys
Authorization: Bearer {admin_jwt_token}
```

### Ver detalles de una Key

```http
GET /api/api-keys/1
Authorization: Bearer {admin_jwt_token}
```

### Desactivar una Key

```http
PATCH /api/api-keys/1
Authorization: Bearer {admin_jwt_token}
Content-Type: application/json

{
  "activa": false
}
```

### Eliminar una Key

```http
DELETE /api/api-keys/1
Authorization: Bearer {admin_jwt_token}
```

### Ver estadísticas de uso

```http
GET /api/api-keys/1/stats?desde=2025-10-01&hasta=2025-10-31
Authorization: Bearer {admin_jwt_token}
```

---

## 🛡️ Seguridad y Mejores Prácticas

### Para Consumidores de la API:

1. **Nunca expongas tu API Key** en código cliente (frontend)
2. **Guarda tu API Key** de forma segura (variables de entorno)
3. **Usa HTTPS** siempre en producción
4. **Implementa caché** para reducir requests
5. **Maneja los errores** apropiadamente
6. **Respeta el rate limit**

**Ejemplo de variables de entorno:**

```bash
# .env
PROCLEAN_API_KEY=your_api_key_here
PROCLEAN_API_URL=https://tu-dominio.com/api/export
```

### Para Administradores:

1. **Genera API Keys únicas** para cada integración
2. **Configura permisos mínimos** necesarios
3. **Establece fechas de expiración** cuando sea apropiado
4. **Usa IP whitelist** para mayor seguridad
5. **Monitorea el uso** regularmente
6. **Revoca Keys comprometidas** inmediatamente

---

## 📊 Monitoreo y Logs

Todos los requests a la API de exportación son registrados automáticamente:

- Endpoint consultado
- IP de origen
- Timestamp
- Tiempo de respuesta
- Cantidad de registros devueltos
- Status code

Los administradores pueden ver estas estadísticas mediante:

```http
GET /api/api-keys/{id}/stats
```

---

## 🆘 Soporte

Para soporte técnico o preguntas sobre la API:

- **Email:** api-support@proclean.com
- **Documentación:** https://tu-dominio.com/api/export/docs
- **Status Page:** https://status.tu-dominio.com

---

## 📄 Changelog

### v1.0.0 (2025-10-24)
- ✅ Lanzamiento inicial
- ✅ Endpoints de exportación para ventas, compras, productos, inventario y sucursales
- ✅ Sistema de autenticación con API Keys
- ✅ Rate limiting
- ✅ Logging de uso
- ✅ Permisos granulares por recurso

---

## 📜 Licencia y Términos de Uso

El uso de esta API está sujeto a los términos y condiciones establecidos en el acuerdo de integración entre ProClean ERP y tu organización.

---

**© 2025 ProClean ERP - Data Export API v1.0.0**

