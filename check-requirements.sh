#!/bin/bash

# Script para verificar requisitos antes del despliegue en internet

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Verificando requisitos para despliegue en internet..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ERRORS=0
WARNINGS=0

# 1. Verificar Node.js
echo -e "${BLUE}📦 Node.js:${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "   ${GREEN}✅ Instalado: $NODE_VERSION${NC}"
else
    echo -e "   ${RED}❌ No instalado${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 2. Verificar npm
echo -e "${BLUE}📦 npm:${NC}"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "   ${GREEN}✅ Instalado: $NPM_VERSION${NC}"
else
    echo -e "   ${RED}❌ No instalado${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 3. Verificar PM2
echo -e "${BLUE}📦 PM2:${NC}"
if command -v pm2 &> /dev/null; then
    PM2_VERSION=$(pm2 -v)
    echo -e "   ${GREEN}✅ Instalado: v$PM2_VERSION${NC}"
else
    echo -e "   ${YELLOW}⚠️  No instalado (se instalará automáticamente)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 4. Verificar Nginx
echo -e "${BLUE}🌐 Nginx:${NC}"
if command -v nginx &> /dev/null; then
    NGINX_VERSION=$(nginx -v 2>&1 | cut -d'/' -f2)
    echo -e "   ${GREEN}✅ Instalado: $NGINX_VERSION${NC}"
else
    echo -e "   ${YELLOW}⚠️  No instalado (se instalará automáticamente)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 5. Verificar MariaDB/MySQL
echo -e "${BLUE}🗄️  MariaDB/MySQL:${NC}"
if command -v mysql &> /dev/null || sudo systemctl is-active --quiet mariadb 2>/dev/null || sudo systemctl is-active --quiet mysql 2>/dev/null; then
    echo -e "   ${GREEN}✅ Instalado${NC}"
    if sudo systemctl is-active --quiet mariadb 2>/dev/null || sudo systemctl is-active --quiet mysql 2>/dev/null; then
        echo -e "   ${GREEN}✅ Servicio activo${NC}"
    else
        echo -e "   ${YELLOW}⚠️  Servicio inactivo${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "   ${RED}❌ No instalado${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 6. Verificar UFW (Firewall)
echo -e "${BLUE}🔥 Firewall (UFW):${NC}"
if command -v ufw &> /dev/null; then
    echo -e "   ${GREEN}✅ Instalado${NC}"
else
    echo -e "   ${YELLOW}⚠️  No instalado (se instalará automáticamente)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 7. Verificar Certbot (para SSL)
echo -e "${BLUE}🔒 Certbot (SSL):${NC}"
if command -v certbot &> /dev/null; then
    CERTBOT_VERSION=$(certbot --version 2>&1 | head -1)
    echo -e "   ${GREEN}✅ Instalado: $CERTBOT_VERSION${NC}"
else
    echo -e "   ${YELLOW}⚠️  No instalado (se instalará si solicitas SSL)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 8. Verificar archivo .env
echo -e "${BLUE}⚙️  Archivo .env:${NC}"
if [ -f "backend/.env" ]; then
    echo -e "   ${GREEN}✅ Existe${NC}"
else
    echo -e "   ${RED}❌ No existe${NC}"
    echo -e "   ${YELLOW}   Ejecuta: ./setup.sh${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 9. Verificar estructura del proyecto
echo -e "${BLUE}📁 Estructura del proyecto:${NC}"
if [ -d "frontend" ] && [ -d "backend" ]; then
    echo -e "   ${GREEN}✅ Estructura correcta${NC}"
    
    # Verificar package.json en frontend
    if [ -f "frontend/package.json" ]; then
        echo -e "   ${GREEN}✅ frontend/package.json existe${NC}"
    else
        echo -e "   ${RED}❌ frontend/package.json no existe${NC}"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Verificar package.json en backend
    if [ -f "backend/package.json" ]; then
        echo -e "   ${GREEN}✅ backend/package.json existe${NC}"
    else
        echo -e "   ${RED}❌ backend/package.json no existe${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "   ${RED}❌ Estructura incorrecta${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 10. Verificar permisos de sudo
echo -e "${BLUE}🔐 Permisos sudo:${NC}"
if sudo -n true 2>/dev/null; then
    echo -e "   ${GREEN}✅ Tienes permisos sudo${NC}"
else
    echo -e "   ${YELLOW}⚠️  Se requerirán permisos sudo durante el despliegue${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 11. Verificar conectividad a internet
echo -e "${BLUE}🌍 Conectividad a internet:${NC}"
if ping -c 1 -W 2 8.8.8.8 &> /dev/null; then
    echo -e "   ${GREEN}✅ Conectado${NC}"
else
    echo -e "   ${RED}❌ Sin conexión${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 12. Verificar IP pública (opcional)
echo -e "${BLUE}🌐 IP Pública:${NC}"
PUBLIC_IP=$(curl -s --max-time 3 https://api.ipify.org 2>/dev/null || echo "")
if [ ! -z "$PUBLIC_IP" ]; then
    echo -e "   ${GREEN}✅ Detectada: $PUBLIC_IP${NC}"
else
    echo -e "   ${YELLOW}⚠️  No se pudo detectar (puede ser normal)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 13. Verificar puertos disponibles
echo -e "${BLUE}🔌 Puertos disponibles:${NC}"
if command -v netstat &> /dev/null || command -v ss &> /dev/null; then
    PORT_80=$(sudo netstat -tuln 2>/dev/null | grep ':80 ' || sudo ss -tuln 2>/dev/null | grep ':80 ' || echo "")
    PORT_443=$(sudo netstat -tuln 2>/dev/null | grep ':443 ' || sudo ss -tuln 2>/dev/null | grep ':443 ' || echo "")
    PORT_3000=$(sudo netstat -tuln 2>/dev/null | grep ':3000 ' || sudo ss -tuln 2>/dev/null | grep ':3000 ' || echo "")
    
    if [ -z "$PORT_80" ]; then
        echo -e "   ${GREEN}✅ Puerto 80 disponible${NC}"
    else
        echo -e "   ${YELLOW}⚠️  Puerto 80 en uso${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    if [ -z "$PORT_443" ]; then
        echo -e "   ${GREEN}✅ Puerto 443 disponible${NC}"
    else
        echo -e "   ${YELLOW}⚠️  Puerto 443 en uso${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    if [ ! -z "$PORT_3000" ]; then
        echo -e "   ${GREEN}✅ Puerto 3000 en uso (backend)${NC}"
    else
        echo -e "   ${YELLOW}⚠️  Puerto 3000 no en uso (backend no corriendo)${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "   ${YELLOW}⚠️  No se pudo verificar (netstat/ss no disponibles)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Resumen
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Resumen:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Todo está listo para el despliegue${NC}"
    echo ""
    echo "🚀 Puedes ejecutar: ./deploy-internet.sh"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Hay $WARNINGS advertencias (no críticas)${NC}"
    echo ""
    echo "🚀 Puedes ejecutar: ./deploy-internet.sh"
    echo "   (Los componentes faltantes se instalarán automáticamente)"
    exit 0
else
    echo -e "${RED}❌ Hay $ERRORS errores críticos${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Y $WARNINGS advertencias${NC}"
    fi
    echo ""
    echo "🔧 Soluciona los errores antes de continuar"
    exit 1
fi

