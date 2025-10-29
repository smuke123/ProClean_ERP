#!/bin/bash

# Script para detener ProClean ERP
# Detiene todos los servicios para liberar recursos

echo "🛑 Deteniendo ProClean ERP..."

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Detener backend (PM2)
echo -e "${BLUE}🔄 Deteniendo backend...${NC}"
if pm2 describe proclean-backend > /dev/null 2>&1; then
    pm2 stop proclean-backend
    pm2 delete proclean-backend
    echo -e "${GREEN}✅ Backend detenido${NC}"
else
    echo -e "${YELLOW}⚠️  Backend no está corriendo${NC}"
fi

# 2. Detener Nginx
echo -e "${BLUE}🔄 Deteniendo Nginx...${NC}"
if sudo systemctl is-active --quiet nginx; then
    sudo systemctl stop nginx
    echo -e "${GREEN}✅ Nginx detenido${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx no está corriendo${NC}"
fi

# 3. Detener MariaDB (OPCIONAL - descomenta si quieres detener la DB también)
# echo -e "${BLUE}🔄 Deteniendo MariaDB...${NC}"
# if sudo systemctl is-active --quiet mariadb; then
#     sudo systemctl stop mariadb
#     echo -e "${GREEN}✅ MariaDB detenido${NC}"
# else
#     echo -e "${YELLOW}⚠️  MariaDB no está corriendo${NC}"
# fi

echo ""
echo -e "${GREEN}✅ ProClean ERP detenido completamente${NC}"
echo ""
echo "📊 Estado de los servicios:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 list 2>/dev/null || echo "PM2: Sin procesos"
echo ""
echo "🔄 Para volver a iniciar: ./start.sh"

