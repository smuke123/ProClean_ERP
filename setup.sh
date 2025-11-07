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
    
    # Preservar variables de contacto si existen en el .env anterior
    PRESERVE_CONTACT_EMAIL=""
    PRESERVE_CONTACT_EMAIL_PASS=""
    
    if [ -f "backend/.env" ]; then
        # Leer CONTACT_EMAIL del .env existente si existe
        if grep -q "^CONTACT_EMAIL=" backend/.env; then
            PRESERVE_CONTACT_EMAIL=$(grep "^CONTACT_EMAIL=" backend/.env | cut -d '=' -f2-)
        fi
        
        # Leer CONTACT_EMAIL_PASS del .env existente si existe
        if grep -q "^CONTACT_EMAIL_PASS=" backend/.env; then
            PRESERVE_CONTACT_EMAIL_PASS=$(grep "^CONTACT_EMAIL_PASS=" backend/.env | cut -d '=' -f2-)
        fi
    fi
    
    # Crear el archivo .env base
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
# CONTACT EMAIL CONFIGURATION
# ========================================
# Configuración para el formulario de contacto
# CONTACT_EMAIL: Correo de Gmail que enviará los mensajes
# CONTACT_EMAIL_PASS: Contraseña de aplicación de Gmail (no la contraseña normal)

# ========================================
# ENVIRONMENT
# ========================================
NODE_ENV=production

EOF
    
    # Agregar las variables de contacto preservadas si existen
    if [ -n "$PRESERVE_CONTACT_EMAIL" ]; then
        echo "CONTACT_EMAIL=$PRESERVE_CONTACT_EMAIL" >> backend/.env
    fi
    
    if [ -n "$PRESERVE_CONTACT_EMAIL_PASS" ]; then
        echo "CONTACT_EMAIL_PASS=$PRESERVE_CONTACT_EMAIL_PASS" >> backend/.env
    fi
    
    if [ -n "$PRESERVE_CONTACT_EMAIL" ] || [ -n "$PRESERVE_CONTACT_EMAIL_PASS" ]; then
        echo -e "${GREEN}✅ Archivo .env creado (variables de contacto preservadas)${NC}"
    else
        echo -e "${GREEN}✅ Archivo .env creado${NC}"
        echo -e "${YELLOW}💡 Tip: Puedes agregar CONTACT_EMAIL y CONTACT_EMAIL_PASS manualmente para habilitar el formulario de contacto${NC}"
    fi
fi

# 6. Datos iniciales (opcional)
echo ""
echo -e "${YELLOW}¿Deseas insertar datos de prueba? (s/N)${NC}"
read -p "" INSERT_TEST_DATA

if [[ $INSERT_TEST_DATA =~ ^[Ss]$ ]]; then
    echo ""
    echo -e "${YELLOW}⚠️  ¿Deseas limpiar las tablas existentes antes de importar? (s/N)${NC}"
    echo -e "${YELLOW}   (Esto eliminará todos los datos actuales)${NC}"
    read -p "" CLEAN_TABLES
    
    if [[ $CLEAN_TABLES =~ ^[Ss]$ ]]; then
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
        fi
    fi
    
    echo -e "${BLUE}📝 Insertando datos de prueba completos...${NC}"
    
    # Verificar si existe el archivo data.sql
    if [ -f "backend/src/database/data.sql" ]; then
        mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < "backend/src/database/data.sql" 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Datos de prueba importados correctamente${NC}"
            echo ""
            echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo -e "${GREEN}📊 Datos Importados:${NC}"
            echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo "   • 2 Sucursales (Norte y Sur)"
            echo "   • 3 Usuarios (2 admins + 1 cliente)"
            echo "   • 10 Productos"
            echo "   • 3 Proveedores"
            echo "   • 20 Registros de inventario"
            echo "   • 42 Compras históricas"
            echo "   • 61 Pedidos/Ventas históricas"
            echo ""
            echo -e "${GREEN}👤 Usuarios disponibles:${NC}"
            echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo "   Admin Norte:"
            echo "   📧 Email: admin@norte.proclean.com"
            echo "   🔑 Password: admin123"
            echo ""
            echo "   Admin Sur:"
            echo "   📧 Email: admin@sur.proclean.com"
            echo "   🔑 Password: admin123"
            echo ""
            echo "   Cliente:"
            echo "   📧 Email: cliente@proclean.com"
            echo "   🔑 Password: cliente123"
            echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        else
            echo -e "${RED}❌ Error importando datos de prueba${NC}"
            echo -e "${YELLOW}⚠️  Puedes importarlos manualmente con:${NC}"
            echo "   mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < backend/src/database/data.sql"
        fi
    else
        echo -e "${RED}❌ No se encuentra el archivo backend/src/database/data.sql${NC}"
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

