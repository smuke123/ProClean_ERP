# 🚀 Guía de Despliegue con Nginx en Linux

Esta guía te ayudará a desplegar ProClean ERP en tu portátil Linux usando Nginx como servidor web.

## 📋 Requisitos Previos

- Linux (Ubuntu/Debian o similar)
- Node.js y npm instalados
- Nginx instalado
- MySQL/MariaDB instalado

## 🔧 Paso 1: Instalar Nginx (si no lo tienes)

```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 🗄️ Paso 2: Configurar la Base de Datos

1. Inicia MySQL:
```bash
sudo systemctl start mysql
```

2. Crea la base de datos:
```bash
mysql -u root -p < backend/src/database/schema.sql
mysql -u root -p < backend/src/database/data.sql
```

3. Crea un archivo `.env` en la raíz del proyecto:
```env
# MySQL Config
MYSQLDB_HOST=localhost
MYSQLDB_USER=root
MYSQLDB_PASSWORD=tu_password
MYSQLDB_DATABASE=proclean_erp
MYSQLDB_ROOT_PASSWORD=tu_password
MYSQLDB_LOCAL_PORT=3306
MYSQLDB_DOCKER_PORT=3306

# Node Config
NODE_LOCAL_PORT=3000
NODE_DOCKER_PORT=3000

# React Config
REACT_LOCAL_PORT=5173
REACT_DOCKER_PORT=5173

# JWT Secret (genera uno seguro)
JWT_SECRET=tu_jwt_secret_muy_seguro_y_largo
```

## 📦 Paso 3: Construir el Frontend

```bash
cd frontend
npm install
npm run build
cd ..
```

Esto creará una carpeta `frontend/dist` con los archivos optimizados.

## ⚙️ Paso 4: Configurar Nginx

1. Copia el archivo de configuración:
```bash
sudo cp nginx.conf /etc/nginx/sites-available/proclean
```

2. Crea un enlace simbólico:
```bash
sudo ln -s /etc/nginx/sites-available/proclean /etc/nginx/sites-enabled/
```

3. (Opcional) Desactiva el sitio por defecto:
```bash
sudo rm /etc/nginx/sites-enabled/default
```

4. Verifica la configuración:
```bash
sudo nginx -t
```

5. Recarga Nginx:
```bash
sudo systemctl reload nginx
```

## 🚀 Paso 5: Iniciar el Backend

### Opción A: Con PM2 (Recomendado para producción)

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Iniciar el backend
cd backend
npm install
pm2 start src/server.js --name proclean-backend

# Guardar la configuración de PM2
pm2 save

# Configurar PM2 para iniciar al arrancar el sistema
pm2 startup
# Ejecuta el comando que PM2 te muestre
```

### Opción B: Con nodemon (Solo para desarrollo)

```bash
cd backend
npm install
npm run dev
```

### Opción C: Con node directamente

```bash
cd backend
npm install
npm start
```

## 🌐 Paso 6: Acceder a la Aplicación

### Desde tu red local:

1. Obtén tu IP local:
```bash
ip addr show | grep "inet " | grep -v 127.0.0.1
```

2. Accede desde cualquier dispositivo en tu red:
```
http://TU_IP_LOCAL
```

### Desde internet (opcional):

Si quieres acceder desde internet, necesitas:

1. **Configurar port forwarding en tu router** (puerto 80)
2. **Obtener tu IP pública**: `curl ifconfig.me`
3. **(Recomendado) Usar un DNS dinámico** como DuckDNS o No-IP
4. **(Muy recomendado) Configurar HTTPS con Let's Encrypt**

## 🔒 Paso 7: Configurar HTTPS (Opcional pero recomendado)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado SSL (requiere dominio)
sudo certbot --nginx -d tu-dominio.com

# Renovación automática
sudo systemctl enable certbot.timer
```

## 📊 Comandos Útiles

### Nginx
```bash
# Ver estado
sudo systemctl status nginx

# Reiniciar
sudo systemctl restart nginx

# Ver logs
sudo tail -f /var/log/nginx/proclean-error.log
sudo tail -f /var/log/nginx/proclean-access.log
```

### PM2 (Backend)
```bash
# Ver procesos
pm2 list

# Ver logs
pm2 logs proclean-backend

# Reiniciar
pm2 restart proclean-backend

# Detener
pm2 stop proclean-backend

# Ver monitoreo
pm2 monit
```

### Base de Datos
```bash
# Ver estado
sudo systemctl status mysql

# Acceder
mysql -u root -p proclean_erp
```

## 🔥 Firewall (Si está activo)

```bash
# Permitir HTTP
sudo ufw allow 80/tcp

# Permitir HTTPS (si configuraste SSL)
sudo ufw allow 443/tcp

# Ver estado
sudo ufw status
```

## 🐛 Resolución de Problemas

### Error 502 Bad Gateway
- Verifica que el backend esté corriendo: `pm2 list` o `sudo netstat -tlnp | grep 3000`
- Revisa los logs: `pm2 logs proclean-backend`

### No se puede acceder desde otros dispositivos
- Verifica tu firewall: `sudo ufw status`
- Verifica que Nginx esté escuchando en todas las interfaces: `sudo netstat -tlnp | grep nginx`

### Error de base de datos
- Verifica que MySQL esté corriendo: `sudo systemctl status mysql`
- Verifica las credenciales en el archivo `.env`

### Frontend no se actualiza
```bash
cd frontend
npm run build
sudo systemctl reload nginx
```

## 📝 Notas Importantes

1. **Seguridad**: Cambia el `JWT_SECRET` en el archivo `.env` por algo seguro
2. **Backups**: Haz copias de seguridad regulares de tu base de datos
3. **Actualizaciones**: Mantén tu sistema y dependencias actualizadas
4. **Logs**: Revisa los logs regularmente para detectar problemas

## 🔄 Actualizar la Aplicación

```bash
# 1. Actualizar código
git pull origin main

# 2. Actualizar frontend
cd frontend
npm install
npm run build

# 3. Actualizar backend
cd ../backend
npm install
pm2 restart proclean-backend

# 4. Recargar Nginx
sudo systemctl reload nginx
```

## 🎉 ¡Listo!

Tu aplicación ahora está desplegada y accesible desde cualquier dispositivo en tu red local (o desde internet si configuraste port forwarding).

