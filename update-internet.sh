#!/bin/bash

# Script para actualizar ProClean ERP en producción
# Reconstruye y despliega sin perder configuración

set -e

echo "🔄 Actualizando ProClean ERP..."

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

# 1. Hacer backup de la configuración actual
echo -e "${BLUE}💾 Creando backup...${NC}"
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r frontend/dist "$BACKUP_DIR/" 2>/dev/null || true
cp backend/.env "$BACKUP_DIR/" 2>/dev/null || true
echo -e "${GREEN}✅ Backup creado en $BACKUP_DIR${NC}"

# 2. Actualizar código desde git (opcional)
read -p "¿Deseas actualizar el código desde git? (s/N): " UPDATE_GIT
if [[ $UPDATE_GIT =~ ^[Ss]$ ]]; then
    echo -e "${BLUE}📥 Actualizando desde git...${NC}"
    git pull || echo -e "${YELLOW}⚠️  No se pudo actualizar desde git${NC}"
fi

# 3. Construir frontend
echo -e "${BLUE}📦 Construyendo frontend...${NC}"
cd frontend
npm install
npm run build
cd ..
echo -e "${GREEN}✅ Frontend actualizado${NC}"

# 4. Actualizar dependencias del backend
echo -e "${BLUE}📦 Actualizando dependencias del backend...${NC}"
cd backend
npm install
cd ..
echo -e "${GREEN}✅ Dependencias actualizadas${NC}"

# 5. Reiniciar backend
echo -e "${BLUE}🔄 Reiniciando backend...${NC}"
cd backend
if pm2 describe proclean-backend > /dev/null 2>&1; then
    pm2 restart proclean-backend
    echo -e "${GREEN}✅ Backend reiniciado${NC}"
else
    echo -e "${RED}❌ Backend no está corriendo. Ejecuta ./deploy-internet.sh primero${NC}"
    exit 1
fi
cd ..

# 6. Recargar Nginx
echo -e "${BLUE}🔄 Recargando Nginx...${NC}"
sudo systemctl reload nginx
echo -e "${GREEN}✅ Nginx recargado${NC}"

# 7. Verificar que todo funciona
echo -e "${BLUE}🔍 Verificando servicios...${NC}"
sleep 2

if pm2 describe proclean-backend > /dev/null 2>&1 && pm2 jlist | grep -q '"status":"online"'; then
    echo -e "${GREEN}✅ Backend funcionando correctamente${NC}"
else
    echo -e "${RED}❌ Error: Backend no está funcionando${NC}"
    echo "Revisa los logs: pm2 logs proclean-backend"
fi

if sudo systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx funcionando correctamente${NC}"
else
    echo -e "${RED}❌ Error: Nginx no está funcionando${NC}"
fi

echo ""
echo -e "${GREEN}🎉 ¡Actualización completada!${NC}"
echo ""
echo "📊 Estado:"
pm2 list
echo ""
echo "💾 Backup guardado en: $BACKUP_DIR"

