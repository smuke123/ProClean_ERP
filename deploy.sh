#!/bin/bash

# Script de despliegue para ProClean ERP
# Este script automatiza el proceso de construcción y despliegue

set -e  # Salir si hay algún error

echo "🚀 Iniciando despliegue de ProClean ERP..."

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

# Verificar que MariaDB está corriendo
if ! sudo systemctl is-active --quiet mariadb && ! sudo systemctl is-active --quiet mysql; then
    echo -e "${RED}❌ Error: MariaDB/MySQL no está corriendo${NC}"
    echo -e "${YELLOW}⚠️  Inicia el servicio: sudo systemctl start mariadb${NC}"
    exit 1
fi

# 1. Construir frontend
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

# 5. Arreglar permisos para Nginx
echo -e "${BLUE}🔐 Configurando permisos para Nginx...${NC}"
chmod o+x "$HOME" 2>/dev/null || true
chmod o+x "$HOME/Documents" 2>/dev/null || true
chmod o+x "$HOME/Documents/NovenoSemestre" 2>/dev/null || true
chmod o+x "$HOME/Documents/NovenoSemestre/Software_2" 2>/dev/null || true
chmod o+x "$PWD" 2>/dev/null || true
chmod o+rx frontend 2>/dev/null || true
chmod -R o+rX frontend/dist 2>/dev/null || true
echo -e "${GREEN}✅ Permisos configurados${NC}"

# 6. Verificar y detener Apache2 si está corriendo
if sudo systemctl is-active --quiet apache2; then
    echo -e "${YELLOW}⚠️  Apache2 está corriendo en puerto 80. Deteniéndolo...${NC}"
    sudo systemctl stop apache2
    sudo systemctl disable apache2 2>/dev/null || true
    echo -e "${GREEN}✅ Apache2 detenido${NC}"
fi

# 7. Copiar configuración de Nginx (si existe)
echo -e "${BLUE}🔄 Configurando Nginx...${NC}"
if [ -f "/etc/nginx/sites-available/proclean" ]; then
    echo "Actualizando configuración existente..."
    sudo cp nginx.conf /etc/nginx/sites-available/proclean
    sudo nginx -t && sudo systemctl reload nginx
    echo -e "${GREEN}✅ Nginx actualizado${NC}"
else
    echo "Creando nueva configuración..."
    sudo cp nginx.conf /etc/nginx/sites-available/proclean
    sudo ln -sf /etc/nginx/sites-available/proclean /etc/nginx/sites-enabled/
    # Deshabilitar configuración por defecto si existe
    if [ -f "/etc/nginx/sites-enabled/default" ]; then
        sudo rm /etc/nginx/sites-enabled/default
    fi
    sudo nginx -t && sudo systemctl reload nginx
    echo -e "${GREEN}✅ Nginx configurado${NC}"
fi

# 8. Mostrar estado
echo ""
echo -e "${GREEN}🎉 ¡Despliegue completado exitosamente!${NC}"
echo ""
echo "📊 Estado de los servicios:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 list
echo ""
echo "🌐 Accede a tu aplicación en:"
echo "   - Local: http://localhost"
IP=$(ip addr show | grep "inet " | grep -v 127.0.0.1 | head -n1 | awk '{print $2}' | cut -d'/' -f1)
if [ ! -z "$IP" ]; then
    echo "   - Red local: http://$IP"
fi
echo ""
echo "📝 Ver logs del backend: pm2 logs proclean-backend"
echo "🔧 Gestionar backend: pm2 monit"

