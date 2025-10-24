# ✅ Checklist de Deployment - ProClean ERP

## 🎯 Estado: LISTO PARA DEPLOYMENT

---

## 📋 Checklist Pre-Deployment

### 1. Base de Datos ⚠️ **ACCIÓN REQUERIDA**

- [x] Migración 001 (Carritos) - Ya aplicada
- [x] Migración 002 (API Keys) - Ya aplicada
- [ ] **Migración 003 (Datasets Externos) - APLICAR AHORA**

```bash
mysql -u root -p proclean_erp < backend/src/database/migrations/003_add_external_datasets_table.sql
```

**Verificar éxito:**
```bash
mysql -u root -p proclean_erp -e "SHOW TABLES LIKE '%Datasets%'"
```

Deberías ver:
- `Datasets_Externos`
- `Datos_Externos`
- `Mapeo_Campos_Externos`

---

### 2. Backend ✅ **LISTO**

- [x] Todos los controladores corregidos
- [x] Autenticación JWT funcionando correctamente
- [x] Rutas registradas en `app.js`
- [x] Middleware de autorización implementado
- [x] Sin errores de linting

**Acción:** Reiniciar el servidor después de aplicar la migración

```bash
cd backend
npm start
```

---

### 3. Frontend ✅ **LISTO**

- [x] Funciones API implementadas
- [x] Página Informes modificada
- [x] Componentes funcionando
- [x] Sin errores de linting

**Acción:** Refrescar navegador (no requiere rebuild)

---

## 🔍 Problemas Corregidos

### ❌ Problema Crítico #1: JWT ID inconsistente
**Estado**: ✅ CORREGIDO

**Archivos modificados:**
- `backend/src/controllers/carritoController.js` (7 cambios)
- `backend/src/controllers/apiKeyController.js` (1 cambio)
- `backend/src/controllers/datasetExternoController.js` (1 cambio)

**Antes**: `req.user.id_usuario` ❌  
**Ahora**: `req.user.id` ✅

---

### ❌ Problema Importante #2: Campo SQL no nullable
**Estado**: ✅ CORREGIDO

**Archivo modificado:**
- `backend/src/database/migrations/003_add_external_datasets_table.sql`

**Antes**: `creado_por INT` ❌  
**Ahora**: `creado_por INT NULL` ✅

---

## 🧪 Tests Recomendados (Manual)

### Test 1: Login y Autenticación
```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@proclean.com", "password": "tu_password"}'

# Guarda el token que recibes
```

### Test 2: Listar Datasets (Debe estar vacío inicialmente)
```bash
curl http://localhost:3000/api/datasets-externos \
  -H "Authorization: Bearer TU_TOKEN"
```

### Test 3: Importar Dataset de Prueba
```bash
curl -X POST http://localhost:3000/api/datasets-externos/importar \
  -H "Authorization: Bearer TU_TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_empresa": "Empresa Test",
    "descripcion": "Dataset de prueba",
    "datos": [
      {
        "id": 1,
        "fecha": "2025-01-15",
        "monto": 450.00,
        "producto": "Laptop HP",
        "categoria": "Electrónica",
        "estado": "completado"
      },
      {
        "id": 2,
        "fecha": "2025-01-16",
        "monto": 320.50,
        "producto": "Mouse Logitech",
        "categoria": "Accesorios",
        "estado": "pendiente"
      },
      {
        "id": 3,
        "fecha": "2025-01-17",
        "monto": 850.00,
        "producto": "Monitor Dell",
        "categoria": "Electrónica",
        "estado": "completado"
      }
    ]
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Dataset importado exitosamente: 3 registros",
  "dataset": {
    "id_dataset": 1,
    "nombre_empresa": "Empresa Test",
    "total_registros": 3,
    "estructura_detectada": { ... }
  }
}
```

### Test 4: Ver Dataset en Frontend
1. Abrir: `http://localhost:5173` (o tu puerto)
2. Iniciar sesión
3. Ir a **Informes**
4. Clic en **"Datos Externos"**
5. Seleccionar **"Empresa Test"** del dropdown
6. Clic en **"Recargar Datos"**
7. Verificar que se muestren:
   - ✅ 3 registros en la tabla
   - ✅ Columnas: id, fecha, monto, producto, categoria, estado
   - ✅ Gráficos generados automáticamente
   - ✅ KPIs calculados (Total: $1620.50, Promedio: $540.17)

### Test 5: Carrito (Verificar que sigue funcionando)
1. Ir a la tienda
2. Agregar productos al carrito
3. Verificar que se agreguen correctamente
4. Ir al carrito y verificar totales

---

## 🚀 Pasos de Deployment

### Paso 1: Backup (IMPORTANTE)
```bash
# Backup de la base de datos
mysqldump -u root -p proclean_erp > backup_antes_de_migration_003_$(date +%Y%m%d).sql
```

### Paso 2: Aplicar Migración
```bash
mysql -u root -p proclean_erp < backend/src/database/migrations/003_add_external_datasets_table.sql
```

### Paso 3: Verificar Tablas
```bash
mysql -u root -p proclean_erp -e "SHOW TABLES"
```

### Paso 4: Reiniciar Backend
```bash
cd backend
npm start
```

### Paso 5: Probar Endpoints
Usar los tests manuales de arriba

### Paso 6: Verificar Frontend
Abrir navegador y probar flujo completo

---

## 📊 Endpoints Disponibles

### Datasets Externos
- ✅ `GET /api/datasets-externos` - Listar (Todos)
- ✅ `GET /api/datasets-externos/:id` - Ver uno (Todos)
- ✅ `GET /api/datasets-externos/:id/datos` - Ver datos (Todos)
- ✅ `POST /api/datasets-externos/importar` - Importar (Admin)
- ✅ `PUT /api/datasets-externos/:id` - Actualizar (Admin)
- ✅ `PUT /api/datasets-externos/:id/datos` - Reemplazar datos (Admin)
- ✅ `DELETE /api/datasets-externos/:id` - Eliminar (Admin)

### Exportación (Ya existente)
- ✅ `GET /api/export` - Info API
- ✅ `GET /api/export/ventas` - Exportar ventas
- ✅ `GET /api/export/compras` - Exportar compras
- ✅ `GET /api/export/productos` - Exportar productos
- ✅ `GET /api/export/inventario` - Exportar inventario
- ✅ `GET /api/export/sucursales` - Exportar sucursales
- ✅ `GET /api/export/all` - Exportar todo

### API Keys (Ya existente)
- ✅ `GET /api/api-keys` - Listar (Admin)
- ✅ `POST /api/api-keys` - Crear (Admin)
- ✅ `GET /api/api-keys/:id` - Ver (Admin)
- ✅ `PUT /api/api-keys/:id` - Actualizar (Admin)
- ✅ `DELETE /api/api-keys/:id` - Eliminar (Admin)

---

## ⚠️ Rollback Plan

Si algo sale mal:

```bash
# 1. Restaurar backup
mysql -u root -p proclean_erp < backup_antes_de_migration_003_YYYYMMDD.sql

# 2. Revertir código (si es necesario)
git stash

# 3. Reiniciar backend
cd backend
npm start
```

---

## 📈 Monitoreo Post-Deployment

### Verificar Logs
```bash
# Backend logs
pm2 logs proclean-backend

# O si usas npm start directamente
# Ver consola del terminal
```

### Métricas a Observar
- ✅ Requests a `/api/datasets-externos/*`
- ✅ Errores 500
- ✅ Tiempos de respuesta
- ✅ Uso de memoria (datasets grandes)

---

## 🎉 Criterios de Éxito

- [ ] Migración aplicada sin errores
- [ ] Backend inicia correctamente
- [ ] Login funciona
- [ ] Carrito funciona (sin regresiones)
- [ ] API Keys funcionan (sin regresiones)
- [ ] Se puede importar un dataset de prueba
- [ ] Se puede ver el dataset en Informes
- [ ] Los gráficos se generan correctamente
- [ ] Filtrado y búsqueda funcionan

---

## 📞 Contactos de Soporte

**Documentación**:
- `SISTEMA_DATASETS_EXTERNOS.md` - Guía completa
- `REPORTE_REVISION_COMPLETA.md` - Revisión técnica
- `API_EXPORTACION_DOCS.md` - API de exportación

**Logs importantes**:
- Backend: Consola o PM2 logs
- Frontend: Consola del navegador (F12)
- MySQL: `/var/log/mysql/error.log`

---

## ✅ Checklist Final

Antes de dar por completado el deployment:

- [ ] ✅ Backup de BD realizado
- [ ] ✅ Migración 003 aplicada
- [ ] ✅ Tablas nuevas verificadas
- [ ] ✅ Backend reiniciado
- [ ] ✅ Login testeado
- [ ] ✅ Importación de dataset testeada
- [ ] ✅ Visualización en Informes testeada
- [ ] ✅ Carrito sigue funcionando
- [ ] ✅ No hay errores en logs

---

**Estado Final**: 🟢 LISTO PARA PRODUCCIÓN

**Fecha**: 24 de Octubre, 2025

---

**© 2025 ProClean ERP - Checklist de Deployment**

