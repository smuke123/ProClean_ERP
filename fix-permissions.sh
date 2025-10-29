#!/bin/bash

# Script para arreglar permisos de Nginx
# Este script da los permisos mínimos necesarios para que Nginx funcione

set -e

echo "🔧 Arreglando permisos para Nginx..."

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar que estamos en el directorio correcto
if [ ! -d "frontend/dist" ]; then
    echo -e "${YELLOW}⚠️  Error: No se encuentra frontend/dist${NC}"
    echo "Ejecuta primero: ./deploy.sh"
    exit 1
fi

echo -e "${BLUE}📁 Dando permisos de ejecución a directorios padre...${NC}"

# Dar permisos de ejecución (x) a los directorios en la ruta para que nginx pueda atravesarlos
# Esto es seguro porque solo permite listar/atravesar, no leer contenido
chmod o+x /home/smuke
chmod o+x /home/smuke/Documents
chmod o+x /home/smuke/Documents/NovenoSemestre
chmod o+x /home/smuke/Documents/NovenoSemestre/Software_2
chmod o+x "/home/smuke/Documents/NovenoSemestre/Software_2/ProClean ERP"

echo -e "${BLUE}📦 Dando permisos de lectura a frontend/dist...${NC}"

# Dar permisos de lectura y ejecución a frontend y dist
chmod o+rx frontend
chmod -R o+rX frontend/dist

echo -e "${GREEN}✅ Permisos corregidos${NC}"

# Recargar nginx
echo -e "${BLUE}🔄 Recargando Nginx...${NC}"
sudo systemctl reload nginx

echo ""
echo -e "${GREEN}🎉 ¡Listo!${NC}"
echo "Intenta acceder nuevamente a: http://localhost"

