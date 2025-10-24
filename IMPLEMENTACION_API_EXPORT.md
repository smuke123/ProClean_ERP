# 🚀 Implementación API de Exportación - Guía Rápida

## ✅ ¿Qué se Implementó?

Un sistema completo de **exportación de datos en tiempo real** que permite a otras organizaciones consultar tu información mediante API Keys seguras.

---

## 📦 Archivos Creados

### Backend:

#### Base de Datos:
- ✅ `backend/src/database/migrations/002_add_api_keys_table.sql` - Tablas para API Keys y Logs

#### Modelos:
- ✅ `backend/src/models/ApiKey.js` - Gestión de API Keys

#### Middleware:
- ✅ `backend/src/middleware/apiKeyAuth.js` - Autenticación por API Key

#### Controladores:
- ✅ `backend/src/controllers/exportController.js` - Exportación de datos
- ✅ `backend/src/controllers/apiKeyController.js` - Gestión de API Keys

#### Rutas:
- ✅ `backend/src/routes/export.routes.js` - Endpoints de exportación
- ✅ `backend/src/routes/apiKeys.routes.js` - Gestión de keys (admin)

#### Configuración:
- ✅ `backend/src/app.js` - MODIFICADO (rutas registradas)

### Documentación:
- ✅ `API_EXPORTACION_DOCS.md` - Documentación completa de la API
- ✅ `IMPLEMENTACION_API_EXPORT.md` - Este archivo

---

## 🔧 Pasos para Activar la API

### 1. Aplicar Migración SQL

```bash
# Opción A: MySQL directamente
mysql -u tu_usuario -p proclean_erp < backend/src/database/migrations/002_add_api_keys_table.sql

# Opción B: Con Docker
docker exec -i contenedor_mysql mysql -u root -p proclean_erp < backend/src/database/migrations/002_add_api_keys_table.sql
```

### 2. Reiniciar el Backend

```bash
cd backend
npm start
```

### 3. Crear una API Key (Como Administrador)

```bash
# 1. Iniciar sesión y obtener token JWT
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@proclean.com",
    "password": "tu_password"
  }'

# Guardar el token que recibes

# 2. Crear API Key
curl -X POST http://localhost:3000/api/api-keys \
  -H "Authorization: Bearer TU_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Prueba Integración",
    "descripcion": "API Key de prueba",
    "organizacion": "Mi Organización",
    "contacto": "contacto@org.com",
    "permisos": ["read"],
    "recursos_permitidos": ["ventas", "productos", "inventario"],
    "rate_limit": 1000
  }'
```

**Respuesta:**
```json
{
  "message": "API Key creada exitosamente",
  "api_key": "a1b2c3d4e5f6...32_caracteres",
  "warning": "⚠️ Guarde esta API Key de forma segura. No podrá verla nuevamente."
}
```

**⚠️ IMPORTANTE:** Guarda el `api_key` porque no podrás verlo después!

### 4. Probar la API

```bash
# Reemplaza YOUR_API_KEY con la key que recibiste

# Ver información de la API
curl -X GET http://localhost:3000/api/export \
  -H "X-API-Key: YOUR_API_KEY"

# Obtener ventas
curl -X GET "http://localhost:3000/api/export/ventas?desde=2025-01-01" \
  -H "X-API-Key: YOUR_API_KEY"

# Obtener productos
curl -X GET http://localhost:3000/api/export/productos \
  -H "X-API-Key: YOUR_API_KEY"

# Obtener todo
curl -X GET http://localhost:3000/api/export/all \
  -H "X-API-Key: YOUR_API_KEY"
```

---

## 📊 Endpoints Disponibles

### Para Organizaciones Externas (con API Key):

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/export` | Info de la API |
| `GET` | `/api/export/ventas` | Exportar ventas |
| `GET` | `/api/export/compras` | Exportar compras |
| `GET` | `/api/export/productos` | Exportar productos |
| `GET` | `/api/export/inventario` | Exportar inventario |
| `GET` | `/api/export/sucursales` | Exportar sucursales |
| `GET` | `/api/export/all` | Exportar todo |

### Para Administradores (con JWT Token):

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/api-keys` | Crear API Key |
| `GET` | `/api/api-keys` | Listar API Keys |
| `GET` | `/api/api-keys/:id` | Ver detalles |
| `PATCH` | `/api/api-keys/:id` | Activar/Desactivar |
| `DELETE` | `/api/api-keys/:id` | Eliminar |
| `GET` | `/api/api-keys/:id/stats` | Estadísticas |

---

## 🎯 Características Implementadas

### Seguridad:
- ✅ Autenticación con API Keys únicas
- ✅ Permisos granulares por recurso
- ✅ Rate limiting (límite de requests por hora)
- ✅ IP whitelist (opcional)
- ✅ Fechas de expiración
- ✅ Activación/Desactivación de keys

### Funcionalidad:
- ✅ Exportación en tiempo real
- ✅ Filtros por fecha, sucursal, estado
- ✅ Estadísticas y resúmenes incluidos
- ✅ Formato JSON estandarizado
- ✅ Metadata completa

### Monitoreo:
- ✅ Logs automáticos de cada request
- ✅ Tiempo de respuesta
- ✅ Registros devueltos
- ✅ IP de origen
- ✅ Estadísticas de uso por key

---

## 📝 Ejemplo de Uso Real

### Escenario: Una empresa externa quiere tus datos de ventas

**1. Tú (Administrador) creas una API Key para ellos:**

```javascript
POST /api/api-keys
{
  "nombre": "Integración Empresa XYZ",
  "organizacion": "Empresa XYZ",
  "contacto": "api@empresaxyz.com",
  "recursos_permitidos": ["ventas", "productos"],
  "rate_limit": 500
}
```

**2. Les entregas la API Key generada**

**3. Ellos consultan tus datos:**

```python
import requests

API_KEY = "la_key_que_les_diste"

response = requests.get(
    "https://tu-dominio.com/api/export/ventas",
    headers={"X-API-Key": API_KEY},
    params={"desde": "2025-10-01", "hasta": "2025-10-31"}
)

ventas = response.json()
print(f"Total ventas: ${ventas['summary']['total_amount']}")
```

**4. Tú puedes monitorear el uso:**

```bash
GET /api/api-keys/1/stats
```

---

## 🛡️ Seguridad y Mejores Prácticas

### Para ti (ProClean):

1. ✅ **Genera keys únicas** para cada cliente/integración
2. ✅ **Establece rate limits** apropiados
3. ✅ **Usa fechas de expiración** cuando sea temporal
4. ✅ **Monitorea el uso** regularmente
5. ✅ **Revoca keys** si hay comportamiento sospechoso
6. ✅ **Usa IP whitelist** para clientes con IPs fijas

### Para tus clientes:

1. ⚠️ **Nunca expongan la API Key** en código cliente
2. ⚠️ **Guarden la key** en variables de entorno
3. ⚠️ **Usen HTTPS** siempre
4. ⚠️ **Respeten el rate limit**
5. ⚠️ **Implementen caché** para reducir requests

---

## 📊 Ejemplo de Respuesta

```json
{
  "source": "ProClean ERP",
  "resource": "ventas",
  "timestamp": "2025-10-24T14:30:00.000Z",
  "total_records": 150,
  "filters_applied": {
    "desde": "2025-10-01",
    "hasta": "2025-10-31"
  },
  "data": [
    {
      "id_pedido": 1,
      "cliente": "Juan Pérez",
      "sucursal": "Sucursal Centro",
      "fecha": "2025-10-15",
      "total": "350.00",
      "estado": "completado",
      "productos": "Detergente, Jabón"
    }
    // ... más datos
  ],
  "summary": {
    "total_amount": 52500.00,
    "by_status": {
      "completado": 150
    }
  },
  "metadata": {
    "currency": "USD",
    "exported_by": "Empresa XYZ"
  }
}
```

---

## 🔍 Verificar que Todo Funciona

### Checklist:

- [ ] Migración SQL aplicada (tablas `API_Keys` y `API_Logs` existen)
- [ ] Backend reiniciado sin errores
- [ ] Puedes crear una API Key como admin
- [ ] Puedes hacer requests a `/api/export` con la key
- [ ] Los datos se exportan correctamente
- [ ] Los logs se registran en la base de datos

### Comandos de Verificación:

```sql
-- Verificar que las tablas existen
SHOW TABLES LIKE 'API_%';

-- Ver API Keys creadas
SELECT * FROM API_Keys;

-- Ver logs de uso
SELECT * FROM API_Logs ORDER BY timestamp DESC LIMIT 10;
```

---

## 🆘 Troubleshooting

### Error: "Tabla API_Keys no existe"
**Solución:** Aplicar la migración SQL

### Error: "Cannot find module ApiKey"
**Solución:** Verificar que el archivo existe en `backend/src/models/ApiKey.js`

### Error: "API Key inválida"
**Solución:** Verificar que:
1. La key es correcta
2. Está activa (`activa = TRUE`)
3. No ha expirado

### Error: "Rate limit excedido"
**Solución:** Esperar 1 hora o aumentar el rate_limit de la key

---

## 📚 Documentación Completa

Ver archivo: `API_EXPORTACION_DOCS.md`

---

## ✅ Estado de la Implementación

- [✅] Tablas SQL creadas
- [✅] Modelo ApiKey implementado
- [✅] Middleware de autenticación
- [✅] Controladores de exportación
- [✅] Rutas configuradas
- [✅] Sistema de logging
- [✅] Rate limiting
- [✅] Gestión de API Keys
- [✅] Documentación completa
- [✅] 0 errores de linting

**Estado: ✅ LISTO PARA USAR**

---

## 🎉 ¡Éxito!

Tu API de exportación está lista para que otras organizaciones consuman tus datos en tiempo real de forma segura.

**Próximos pasos opcionales:**
- Implementar webhooks para notificaciones
- Agregar más formatos de exportación (XML, CSV)
- Implementar caché de responses
- Dashboard de monitoreo en el frontend

---

**Fecha de implementación:** 24 de Octubre, 2025  
**Versión:** 1.0.0  
**Implementado por:** Cursor AI

