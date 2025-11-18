#!/bin/bash

# Script de despliegue para ProClean ERP en Internet
# Configura SSL, Nginx y seguridad para acceso público

set -e  # Salir si hay algún error

echo "🌐 Iniciando despliegue de ProClean ERP para Internet..."

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] && [ ! -d "frontend" ] && [ ! -d "backend" ]; then
    echo -e "${RED}❌ Error: Ejecuta este script desde la raíz del proyecto${NC}"
    exit 1
fi

# Verificar que existe la configuración inicial
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ Error: No se encuentra el archivo .env${NC}"
    echo -e "${YELLOW}⚠️  Ejecuta primero: ./setup.sh${NC}"
    exit 1
fi

# Solicitar dominio
echo ""
echo -e "${YELLOW}📝 Configuración de Dominio${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
read -p "Ingresa tu dominio (ej: proclean.duckdns.org o tu-dominio.com): " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo -e "${RED}❌ El dominio no puede estar vacío${NC}"
    exit 1
fi

# Verificar si quiere usar SSL
echo ""
read -p "¿Deseas configurar HTTPS con Let's Encrypt? (S/n): " USE_SSL
USE_SSL=${USE_SSL:-S}

# 1. Construir frontend
echo ""
echo -e "${BLUE}📦 Construyendo frontend...${NC}"
cd frontend
npm install
npm run build
cd ..
echo -e "${GREEN}✅ Frontend construido${NC}"

# 2. Instalar dependencias del backend
echo -e "${BLUE}📦 Instalando dependencias del backend...${NC}"
cd backend
npm install
cd ..
echo -e "${GREEN}✅ Dependencias del backend instaladas${NC}"

# 3. Verificar si PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo -e "${BLUE}📦 PM2 no está instalado. Instalando...${NC}"
    sudo npm install -g pm2
    echo -e "${GREEN}✅ PM2 instalado${NC}"
fi

# 4. Reiniciar o iniciar backend con PM2
echo -e "${BLUE}🔄 Gestionando proceso del backend...${NC}"
cd backend
if pm2 describe proclean-backend > /dev/null 2>&1; then
    echo "Reiniciando backend..."
    pm2 restart proclean-backend
else
    echo "Iniciando backend por primera vez..."
    pm2 start src/server.js --name proclean-backend
    pm2 save
fi
cd ..
echo -e "${GREEN}✅ Backend actualizado${NC}"

# 5. Configurar firewall
echo -e "${BLUE}🔥 Configurando firewall...${NC}"
if command -v ufw &> /dev/null; then
    sudo ufw allow 22/tcp comment 'SSH' 2>/dev/null || true
    sudo ufw allow 80/tcp comment 'HTTP' 2>/dev/null || true
    sudo ufw allow 443/tcp comment 'HTTPS' 2>/dev/null || true
    sudo ufw --force enable 2>/dev/null || true
    echo -e "${GREEN}✅ Firewall configurado${NC}"
else
    echo -e "${YELLOW}⚠️  UFW no está instalado. Instalando...${NC}"
    sudo apt update
    sudo apt install ufw -y
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw --force enable
    echo -e "${GREEN}✅ Firewall instalado y configurado${NC}"
fi

# 6. Arreglar permisos para Nginx
echo -e "${BLUE}🔐 Configurando permisos para Nginx...${NC}"
chmod o+x "$HOME" 2>/dev/null || true
chmod o+x "$HOME/Documents" 2>/dev/null || true
chmod o+x "$HOME/Documents/NovenoSemestre" 2>/dev/null || true
chmod o+x "$HOME/Documents/NovenoSemestre/Software_2" 2>/dev/null || true
chmod o+x "$PWD" 2>/dev/null || true
chmod o+rx frontend 2>/dev/null || true
chmod -R o+rX frontend/dist 2>/dev/null || true
echo -e "${GREEN}✅ Permisos configurados${NC}"

# 7. Verificar y detener Apache2 si está corriendo
if sudo systemctl is-active --quiet apache2; then
    echo -e "${YELLOW}⚠️  Apache2 está corriendo en puerto 80. Deteniéndolo...${NC}"
    sudo systemctl stop apache2
    sudo systemctl disable apache2 2>/dev/null || true
    echo -e "${GREEN}✅ Apache2 detenido${NC}"
fi

# 8. Crear configuración de Nginx para producción
echo -e "${BLUE}🔄 Configurando Nginx para producción...${NC}"

# Obtener ruta absoluta del proyecto
PROJECT_ROOT=$(pwd)

# SIEMPRE empezar con configuración HTTP (sin SSL)
# Certbot agregará SSL automáticamente después
cat > /tmp/proclean-nginx-http.conf << EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};
    
    # Logs
    access_log /var/log/nginx/proclean-access.log;
    error_log /var/log/nginx/proclean-error.log;

    # Directorio del frontend compilado
    root "${PROJECT_ROOT}/frontend/dist";
    index index.html;

    # Configuración de gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # API Backend (Proxy a Express)
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Servir archivos estáticos del frontend
    location / {
        try_files \$uri \$uri/ /index.html;
        
        # Headers de seguridad
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }

    # Cache para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|avif|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Copiar configuración HTTP inicial
NGINX_CONFIG="/tmp/proclean-nginx-http.conf"
sudo cp "$NGINX_CONFIG" /etc/nginx/sites-available/proclean
sudo ln -sf /etc/nginx/sites-available/proclean /etc/nginx/sites-enabled/

# Deshabilitar configuración por defecto si existe
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    sudo rm /etc/nginx/sites-enabled/default
fi

# Verificar configuración
sudo nginx -t
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Configuración de Nginx válida${NC}"
else
    echo -e "${RED}❌ Error en la configuración de Nginx${NC}"
    exit 1
fi

# 9. Recargar Nginx con configuración HTTP inicial
echo -e "${BLUE}🔄 Recargando Nginx (configuración HTTP inicial)...${NC}"
sudo systemctl reload nginx
echo -e "${GREEN}✅ Nginx recargado${NC}"

# 10. Configurar SSL si se solicitó
if [[ $USE_SSL =~ ^[Ss]$ ]]; then
    echo -e "${BLUE}🔒 Configurando SSL con Let's Encrypt...${NC}"
    
    # Verificar si certbot está instalado
    if ! command -v certbot &> /dev/null; then
        echo -e "${BLUE}📦 Instalando Certbot...${NC}"
        sudo apt update
        sudo apt install certbot python3-certbot-nginx -y
        echo -e "${GREEN}✅ Certbot instalado${NC}"
    fi
    
    # Obtener certificado
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANTE: Antes de continuar, asegúrate de que:${NC}"
    echo "   1. Tu dominio ${DOMAIN} apunta a tu IP pública"
    echo "   2. Los puertos 80 y 443 están abiertos en tu router/firewall"
    echo "   3. El port forwarding está configurado (80→80, 443→443)"
    echo ""
    read -p "Presiona Enter cuando estés listo para continuar..."
    
    echo ""
    read -p "Ingresa tu email para notificaciones de Let's Encrypt: " EMAIL
    
    if [ -z "$EMAIL" ]; then
        EMAIL="admin@${DOMAIN}"
    fi
    
    echo -e "${BLUE}🔐 Obteniendo certificado SSL...${NC}"
    echo -e "${YELLOW}   (Certbot modificará automáticamente la configuración de Nginx)${NC}"
    
    # Certbot modificará automáticamente la configuración de nginx
    sudo certbot --nginx -d ${DOMAIN} --non-interactive --agree-tos --email ${EMAIL} --redirect
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Certificado SSL configurado exitosamente${NC}"
        
        # Verificar que la configuración sigue siendo válida
        sudo nginx -t
        if [ $? -eq 0 ]; then
            sudo systemctl reload nginx
            echo -e "${GREEN}✅ Nginx recargado con SSL${NC}"
        fi
        
        # Configurar renovación automática
        echo -e "${BLUE}🔄 Configurando renovación automática...${NC}"
        sudo systemctl enable certbot.timer
        sudo systemctl start certbot.timer
        echo -e "${GREEN}✅ Renovación automática configurada${NC}"
    else
        echo -e "${RED}❌ Error obteniendo certificado SSL${NC}"
        echo -e "${YELLOW}⚠️  Posibles causas:${NC}"
        echo "   - El dominio no apunta a esta IP pública"
        echo "   - Los puertos 80/443 no están abiertos"
        echo "   - El port forwarding no está configurado"
        echo ""
        echo -e "${YELLOW}⚠️  Puedes intentarlo manualmente con:${NC}"
        echo "   sudo certbot --nginx -d ${DOMAIN}"
        echo ""
        echo -e "${YELLOW}⚠️  Continuando sin SSL por ahora...${NC}"
        echo -e "${YELLOW}   Tu aplicación está disponible en: http://${DOMAIN}${NC}"
    fi
fi

# 11. Obtener IP local
LOCAL_IP=$(ip addr show | grep "inet " | grep -v 127.0.0.1 | head -n1 | awk '{print $2}' | cut -d'/' -f1)

# 12. Reiniciar backend para asegurar que está corriendo
echo -e "${BLUE}🔄 Verificando backend...${NC}"
cd backend
if pm2 describe proclean-backend > /dev/null 2>&1; then
    pm2 restart proclean-backend
    sleep 2
    if pm2 jlist | grep -q '"status":"online"'; then
        echo -e "${GREEN}✅ Backend funcionando correctamente${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend puede tener problemas. Revisa: pm2 logs proclean-backend${NC}"
    fi
fi
cd ..

# 13. Mostrar estado
echo ""
echo -e "${GREEN}🎉 ¡Despliegue completado exitosamente!${NC}"
echo ""
echo "📊 Estado de los servicios:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 list
echo ""
echo "🌐 Accede a tu aplicación en:"
if [[ $USE_SSL =~ ^[Ss]$ ]]; then
    echo "   - HTTPS: https://${DOMAIN}"
    echo "   - HTTP: http://${DOMAIN} (redirige a HTTPS)"
else
    echo "   - HTTP: http://${DOMAIN}"
fi
echo ""
echo "📝 Ver logs del backend: pm2 logs proclean-backend"
echo "🔧 Gestionar backend: pm2 monit"
echo "📋 Ver logs de Nginx: sudo tail -f /var/log/nginx/proclean-error.log"
echo ""
echo "🔒 Seguridad:"
echo "   - Firewall configurado (puertos 22, 80, 443)"
echo "   - SSL/TLS configurado: $([ "$USE_SSL" = "S" ] && echo "Sí" || echo "No")"
echo ""
echo "⚠️  IMPORTANTE - Configuración del Router:"
echo "   Configura Port Forwarding en tu router:"
echo "   - Puerto externo 80 → IP interna ${LOCAL_IP}:80"
if [[ $USE_SSL =~ ^[Ss]$ ]]; then
    echo "   - Puerto externo 443 → IP interna ${LOCAL_IP}:443"
fi
echo ""
echo "   Si usas DuckDNS, ejecuta: ./setup-duckdns.sh"
echo ""

