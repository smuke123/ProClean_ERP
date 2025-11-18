# 🌐 Guía de Despliegue en Internet - ProClean ERP

Esta guía te ayudará a desplegar ProClean ERP en internet con SSL/HTTPS y todas las configuraciones de seguridad necesarias.

## 📋 Requisitos Previos

1. **Dominio configurado** (puede ser DuckDNS o un dominio propio)
   - Si usas DuckDNS: ejecuta `./setup-duckdns.sh` primero
   - Si tienes un dominio propio: asegúrate de que apunte a tu IP pública

2. **Acceso a tu router** para configurar Port Forwarding

3. **IP pública estática o dinámica** (DuckDNS maneja las dinámicas)

## 🚀 Pasos para Desplegar

### 1. Primera vez - Despliegue Completo

```bash
./deploy-internet.sh
```

Este script te pedirá:
- Tu dominio (ej: `proclean.duckdns.org`)
- Si deseas configurar HTTPS con Let's Encrypt (recomendado)
- Tu email para notificaciones de Let's Encrypt

**El script automáticamente:**
- ✅ Construye el frontend
- ✅ Instala dependencias del backend
- ✅ Configura PM2 para el backend
- ✅ Configura firewall (UFW)
- ✅ Configura Nginx con tu dominio
- ✅ Obtiene certificado SSL (si lo solicitas)
- ✅ Configura renovación automática de SSL

### 2. Configurar Port Forwarding en tu Router

**IMPORTANTE:** Debes configurar estos puertos en tu router:

- **Puerto 80 (HTTP)** → IP interna de tu servidor:80
- **Puerto 443 (HTTPS)** → IP interna de tu servidor:443

Para encontrar tu IP interna:
```bash
ip addr show | grep "inet " | grep -v 127.0.0.1
```

### 3. Verificar que Funciona

```bash
./monitor.sh
```

Este comando te mostrará el estado de todos los servicios.

### 4. Actualizaciones Futuras

Cuando necesites actualizar la aplicación:

```bash
./update-internet.sh
```

Este script:
- ✅ Crea un backup automático
- ✅ Actualiza el código (opcional desde git)
- ✅ Reconstruye el frontend
- ✅ Actualiza dependencias
- ✅ Reinicia los servicios sin perder configuración

## 📝 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `deploy-internet.sh` | Despliegue inicial completo en internet |
| `update-internet.sh` | Actualizar aplicación sin perder configuración |
| `monitor.sh` | Ver estado de todos los servicios |
| `start.sh` | Iniciar servicios (red local) |
| `stop.sh` | Detener servicios |
| `setup-duckdns.sh` | Configurar DuckDNS para dominio dinámico |

## 🔒 Seguridad

El despliegue incluye:

- ✅ **Firewall (UFW)** configurado con puertos necesarios
- ✅ **SSL/HTTPS** con Let's Encrypt
- ✅ **Renovación automática** de certificados SSL
- ✅ **Headers de seguridad** en Nginx
- ✅ **Redirección HTTP → HTTPS** (si SSL está activo)

## 🐛 Solución de Problemas

### El certificado SSL no se obtiene

1. Verifica que tu dominio apunta a tu IP pública:
   ```bash
   dig +short tu-dominio.com
   ```

2. Verifica que los puertos 80 y 443 están abiertos:
   ```bash
   sudo ufw status
   ```

3. Intenta obtener el certificado manualmente:
   ```bash
   sudo certbot --nginx -d tu-dominio.com
   ```

### Nginx no inicia

Verifica la configuración:
```bash
sudo nginx -t
```

Revisa los logs:
```bash
sudo tail -f /var/log/nginx/error.log
```

### Backend no responde

Verifica el estado:
```bash
pm2 list
pm2 logs proclean-backend
```

### No puedo acceder desde internet

1. Verifica Port Forwarding en tu router
2. Verifica que tu IP pública es accesible:
   ```bash
   curl https://api.ipify.org
   ```
3. Verifica firewall:
   ```bash
   sudo ufw status verbose
   ```

## 📊 Monitoreo

### Ver logs en tiempo real

```bash
# Backend
pm2 logs proclean-backend

# Nginx
sudo tail -f /var/log/nginx/proclean-access.log
sudo tail -f /var/log/nginx/proclean-error.log
```

### Ver estado de servicios

```bash
./monitor.sh
```

### Gestionar backend con PM2

```bash
pm2 monit          # Monitor interactivo
pm2 restart proclean-backend
pm2 stop proclean-backend
pm2 delete proclean-backend
```

## 🔄 Renovación de Certificados SSL

Los certificados se renuevan automáticamente. Para verificar:

```bash
sudo certbot renew --dry-run
```

Para renovar manualmente:
```bash
sudo certbot renew
sudo systemctl reload nginx
```

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs: `./monitor.sh`
2. Verifica la configuración de Nginx: `sudo nginx -t`
3. Verifica el estado de los servicios: `pm2 list` y `sudo systemctl status nginx`

## ⚠️ Notas Importantes

- **Backups**: El script `update-internet.sh` crea backups automáticos en `./backups/`
- **Dominio DuckDNS**: Si usas DuckDNS, el script se actualiza cada 5 minutos automáticamente
- **IP Pública**: Si tu IP cambia (IP dinámica), DuckDNS la actualiza automáticamente
- **Seguridad**: Nunca expongas el puerto 3306 (MySQL) a internet. Solo 80 y 443.

