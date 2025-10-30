#!/bin/bash

# Script para recargar datos de prueba en ProClean ERP
# Ejecuta este script cuando quieras limpiar y recargar todos los datos

set -e  # Salir si hay algún error

echo "🔄 Recargando datos de prueba de ProClean ERP..."

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ Error: No se encuentra el archivo backend/.env${NC}"
    echo "Asegúrate de ejecutar este script desde la raíz del proyecto"
    echo "y de haber ejecutado setup.sh primero"
    exit 1
fi

# Leer credenciales del archivo .env
if [ -f "backend/.env" ]; then
    export $(grep -v '^#' backend/.env | grep 'MYSQLDB_' | xargs)
    DB_USER=$MYSQLDB_USER
    DB_PASSWORD=$MYSQLDB_PASSWORD
    DB_NAME=$MYSQLDB_DATABASE
else
    echo -e "${RED}❌ No se encuentra el archivo .env${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Configuración:${NC}"
echo "   Base de datos: $DB_NAME"
echo "   Usuario: $DB_USER"
echo ""

# Confirmar acción
echo -e "${YELLOW}⚠️  ADVERTENCIA: Esto eliminará TODOS los datos actuales${NC}"
echo -e "${YELLOW}   incluyendo usuarios, productos, compras, ventas, carritos, etc.${NC}"
echo ""
read -p "¿Estás seguro de que deseas continuar? (s/N): " CONFIRM

if [[ ! $CONFIRM =~ ^[Ss]$ ]]; then
    echo "Operación cancelada"
    exit 0
fi

# Limpiar tablas
echo ""
echo -e "${BLUE}🧹 Limpiando tablas existentes...${NC}"

CLEAN_SQL="
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE Detalle_Pedidos;
TRUNCATE TABLE Detalle_Compras;
TRUNCATE TABLE Pedidos;
TRUNCATE TABLE Compras;
TRUNCATE TABLE Carritos;
TRUNCATE TABLE Inventario;
TRUNCATE TABLE Productos;
TRUNCATE TABLE Proveedores;
TRUNCATE TABLE Usuarios;
TRUNCATE TABLE Sucursales;
SET FOREIGN_KEY_CHECKS = 1;
"

echo "$CLEAN_SQL" | mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Tablas limpiadas correctamente${NC}"
else
    echo -e "${RED}❌ Error limpiando las tablas${NC}"
    exit 1
fi

# Importar datos
echo ""
echo -e "${BLUE}📝 Importando datos de prueba completos...${NC}"

if [ -f "backend/src/database/data.sql" ]; then
    mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < "backend/src/database/data.sql" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Datos importados correctamente${NC}"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo -e "${GREEN}🎉 Datos recargados exitosamente${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo -e "${GREEN}📊 Datos Importados:${NC}"
        echo "   • 2 Sucursales (Norte y Sur)"
        echo "   • 3 Usuarios (2 admins + 1 cliente)"
        echo "   • 10 Productos"
        echo "   • 3 Proveedores"
        echo "   • 20 Registros de inventario"
        echo "   • 42 Compras históricas"
        echo "   • 61 Pedidos/Ventas históricas"
        echo ""
        echo -e "${GREEN}👤 Usuarios disponibles:${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "   ${YELLOW}Admin Norte:${NC}"
        echo "   📧 Email: admin@norte.proclean.com"
        echo "   🔑 Password: admin123"
        echo ""
        echo "   ${YELLOW}Admin Sur:${NC}"
        echo "   📧 Email: admin@sur.proclean.com"
        echo "   🔑 Password: admin123"
        echo ""
        echo "   ${YELLOW}Cliente:${NC}"
        echo "   📧 Email: cliente@proclean.com"
        echo "   🔑 Password: cliente123"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "💡 Si el backend está corriendo, es recomendable reiniciarlo"
        echo ""
    else
        echo -e "${RED}❌ Error importando datos${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ No se encuentra el archivo backend/src/database/data.sql${NC}"
    exit 1
fi

