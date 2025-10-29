#!/bin/bash

# Script de configuración inicial para ProClean ERP
# Este script configura MariaDB y prepara el entorno

set -e  # Salir si hay algún error

echo "🔧 Iniciando configuración inicial de ProClean ERP..."

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

# 1. Verificar MariaDB
echo -e "${BLUE}📦 Verificando MariaDB...${NC}"
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}❌ MariaDB no está instalado. Instalando...${NC}"
    sudo apt update
    sudo apt install mariadb-server -y
    sudo systemctl start mariadb
    sudo systemctl enable mariadb
    echo -e "${GREEN}✅ MariaDB instalado${NC}"
else
    echo -e "${GREEN}✅ MariaDB ya está instalado${NC}"
    # Asegurar que está corriendo
    if ! sudo systemctl is-active --quiet mariadb; then
        echo "Iniciando MariaDB..."
        sudo systemctl start mariadb
    fi
fi

# 2. Solicitar credenciales
echo ""
echo -e "${YELLOW}📝 Configuración de la Base de Datos${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

read -p "Nombre de la base de datos [proclean_erp]: " DB_NAME
DB_NAME=${DB_NAME:-proclean_erp}

read -p "Usuario de la base de datos [proclean_user]: " DB_USER
DB_USER=${DB_USER:-proclean_user}

read -sp "Contraseña para el usuario de la base de datos: " DB_PASSWORD
echo ""

if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}❌ La contraseña no puede estar vacía${NC}"
    exit 1
fi

read -sp "Contraseña de root de MariaDB (dejar vacío si no tiene): " ROOT_PASSWORD
echo ""

# 3. Crear base de datos y usuario
echo ""
echo -e "${BLUE}🗄️  Configurando base de datos...${NC}"

MYSQL_CMD="sudo mysql"
if [ ! -z "$ROOT_PASSWORD" ]; then
    MYSQL_CMD="mysql -u root -p$ROOT_PASSWORD"
fi

# Script SQL para crear todo
SQL_SCRIPT="
-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario si no existe
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';

-- Dar todos los privilegios
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';

-- Aplicar cambios
FLUSH PRIVILEGES;
"

echo "$SQL_SCRIPT" | $MYSQL_CMD 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Base de datos y usuario creados${NC}"
else
    echo -e "${RED}❌ Error al crear la base de datos. Verifica las credenciales de root.${NC}"
    exit 1
fi

# 4. Importar schema
echo -e "${BLUE}📊 Importando esquema de base de datos...${NC}"

if [ -f "backend/src/database/schema.sql" ]; then
    mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < "backend/src/database/schema.sql" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Esquema importado correctamente${NC}"
    else
        echo -e "${YELLOW}⚠️  Advertencia: Puede haber errores en el esquema (probablemente ya existe)${NC}"
    fi
else
    echo -e "${RED}❌ No se encuentra el archivo schema.sql${NC}"
    exit 1
fi

# 5. Crear archivo .env
echo -e "${BLUE}⚙️  Creando archivo de configuración (.env)...${NC}"

if [ -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  El archivo .env ya existe. ¿Deseas sobrescribirlo? (s/N)${NC}"
    read -p "" OVERWRITE
    if [[ ! $OVERWRITE =~ ^[Ss]$ ]]; then
        echo "Manteniendo archivo .env existente"
        SKIP_ENV=true
    fi
fi

if [ "$SKIP_ENV" != "true" ]; then
    # Generar JWT secret aleatorio
    JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
    
    cat > backend/.env << EOF
# ========================================
# CONFIGURACIÓN DE PROCLEAN ERP
# ========================================
# Generado automáticamente por setup.sh

# ========================================
# MARIADB/DATABASE CONFIGURATION
# ========================================
MYSQLDB_HOST=localhost
MYSQLDB_USER=$DB_USER
MYSQLDB_PASSWORD=$DB_PASSWORD
MYSQLDB_DATABASE=$DB_NAME
MYSQLDB_ROOT_PASSWORD=$ROOT_PASSWORD
MYSQLDB_LOCAL_PORT=3306
MYSQLDB_DOCKER_PORT=3306

# ========================================
# NODE/BACKEND CONFIGURATION
# ========================================
NODE_LOCAL_PORT=3000
NODE_DOCKER_PORT=3000
HOST=0.0.0.0

# ========================================
# JWT AUTHENTICATION
# ========================================
JWT_SECRET=$JWT_SECRET

# ========================================
# REACT/FRONTEND CONFIGURATION
# ========================================
REACT_LOCAL_PORT=5173
REACT_DOCKER_PORT=5173

# ========================================
# ENVIRONMENT
# ========================================
NODE_ENV=production

EOF
    echo -e "${GREEN}✅ Archivo .env creado${NC}"
fi

# 6. Datos iniciales (opcional)
echo ""
echo -e "${YELLOW}¿Deseas insertar datos de prueba? (s/N)${NC}"
read -p "" INSERT_TEST_DATA

if [[ $INSERT_TEST_DATA =~ ^[Ss]$ ]]; then
    echo -e "${BLUE}📝 Insertando datos de prueba...${NC}"
    
    TEST_DATA="
-- Insertar sucursal de prueba
INSERT INTO Sucursales (nombre, direccion, telefono, codigo_sucursal) 
VALUES ('Sucursal Principal', 'Calle Principal #123', '1234567890', 'SUC001')
ON DUPLICATE KEY UPDATE nombre=nombre;

-- Insertar usuario admin de prueba (password: admin123)
INSERT INTO Usuarios (nombre, email, password, rol, id_sucursal)
VALUES (
    'Administrador',
    'admin@proclean.com',
    '\$2b\$10\$YourHashedPasswordHere',
    'admin',
    1
) ON DUPLICATE KEY UPDATE nombre=nombre;

-- Insertar algunos productos de prueba
INSERT INTO Productos (nombre, precio, categoria, marca, descripcion_corta, activo)
VALUES 
    ('Detergente Líquido 1L', 15.50, 'Limpieza', 'ProClean', 'Detergente líquido para ropa', TRUE),
    ('Jabón en Polvo 500g', 8.75, 'Limpieza', 'ProClean', 'Jabón en polvo multiusos', TRUE),
    ('Desinfectante 1L', 12.00, 'Desinfección', 'ProClean', 'Desinfectante multiusos', TRUE)
ON DUPLICATE KEY UPDATE nombre=nombre;

-- Insertar inventario inicial
INSERT INTO Inventario (id_sucursal, id_producto, cantidad, stock_minimo)
VALUES 
    (1, 1, 50, 10),
    (1, 2, 30, 10),
    (1, 3, 40, 10)
ON DUPLICATE KEY UPDATE cantidad=cantidad;
"
    
    echo "$TEST_DATA" | mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Datos de prueba insertados${NC}"
        echo -e "${YELLOW}📧 Usuario de prueba: admin@proclean.com${NC}"
        echo -e "${YELLOW}🔑 Contraseña: admin123${NC}"
    else
        echo -e "${YELLOW}⚠️  Advertencia: Algunos datos pueden ya existir${NC}"
    fi
fi

# 7. Verificar instalación de Node.js
echo ""
echo -e "${BLUE}📦 Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    echo -e "${YELLOW}Instala Node.js desde: https://nodejs.org/${NC}"
    exit 1
else
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js $NODE_VERSION instalado${NC}"
fi

# 8. Verificar Nginx
echo -e "${BLUE}📦 Verificando Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}⚠️  Nginx no está instalado. ¿Deseas instalarlo? (s/N)${NC}"
    read -p "" INSTALL_NGINX
    if [[ $INSTALL_NGINX =~ ^[Ss]$ ]]; then
        sudo apt install nginx -y
        sudo systemctl start nginx
        sudo systemctl enable nginx
        echo -e "${GREEN}✅ Nginx instalado${NC}"
    fi
else
    echo -e "${GREEN}✅ Nginx ya está instalado${NC}"
fi

# 9. Resumen final
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 ¡Configuración inicial completada!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Resumen de la configuración:"
echo "   • Base de datos: $DB_NAME"
echo "   • Usuario DB: $DB_USER"
echo "   • Host DB: localhost:3306"
echo "   • Archivo .env: backend/.env"
echo ""
echo "🚀 Próximos pasos:"
echo "   1. Ejecuta: ./deploy.sh"
echo "   2. Accede a: http://localhost"
echo ""
echo "📝 Comandos útiles:"
echo "   • Ver logs: pm2 logs proclean-backend"
echo "   • Gestionar backend: pm2 monit"
echo "   • Acceder a MariaDB: mysql -u $DB_USER -p $DB_NAME"
echo ""

