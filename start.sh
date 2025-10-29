#!/bin/bash

# Script para iniciar ProClean ERP
# Inicia todos los servicios necesarios

echo "🚀 Iniciando ProClean ERP..."

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] && [ ! -d "frontend" ] && [ ! -d "backend" ]; then
    echo -e "${RED}❌ Error: Ejecuta este script desde la raíz del proyecto${NC}"
    exit 1
fi

# 1. Iniciar MariaDB
echo -e "${BLUE}🔄 Iniciando MariaDB...${NC}"
if ! sudo systemctl is-active --quiet mariadb; then
    sudo systemctl start mariadb
    echo -e "${GREEN}✅ MariaDB iniciado${NC}"
else
    echo -e "${GREEN}✅ MariaDB ya está corriendo${NC}"
fi

# 2. Detener Apache2 si está corriendo
if sudo systemctl is-active --quiet apache2; then
    echo -e "${YELLOW}⚠️  Apache2 está corriendo. Deteniéndolo...${NC}"
    sudo systemctl stop apache2
fi

# 3. Iniciar Nginx
echo -e "${BLUE}🔄 Iniciando Nginx...${NC}"
if ! sudo systemctl is-active --quiet nginx; then
    sudo systemctl start nginx
    echo -e "${GREEN}✅ Nginx iniciado${NC}"
else
    sudo systemctl restart nginx
    echo -e "${GREEN}✅ Nginx reiniciado${NC}"
fi

# 4. Iniciar backend con PM2
echo -e "${BLUE}🔄 Iniciando backend...${NC}"
cd backend
if pm2 describe proclean-backend > /dev/null 2>&1; then
    pm2 restart proclean-backend
    echo -e "${GREEN}✅ Backend reiniciado${NC}"
else
    pm2 start src/server.js --name proclean-backend
    pm2 save
    echo -e "${GREEN}✅ Backend iniciado${NC}"
fi
cd ..

# 5. Mostrar estado
echo ""
echo -e "${GREEN}🎉 ¡ProClean ERP iniciado correctamente!${NC}"
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
echo "📝 Ver logs: pm2 logs proclean-backend"
echo "🛑 Detener: ./stop.sh"

