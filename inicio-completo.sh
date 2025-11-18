#!/bin/bash

# Script de inicio completo después de reiniciar
# Inicia todos los servicios y el túnel de Cloudflare

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🚀 Inicio Completo de ProClean ERP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] && [ ! -d "frontend" ] && [ ! -d "backend" ]; then
    echo -e "${RED}❌ Error: Ejecuta este script desde la raíz del proyecto${NC}"
    exit 1
fi

# Paso 1: Iniciar servicios locales
echo -e "${BLUE}📦 Paso 1: Iniciando servicios locales...${NC}"
echo ""

if [ -f "./start.sh" ]; then
    ./start.sh
else
    echo -e "${YELLOW}⚠️  Script start.sh no encontrado. Iniciando manualmente...${NC}"
    
    # Iniciar MariaDB
    if ! sudo systemctl is-active --quiet mariadb; then
        echo "Iniciando MariaDB..."
        sudo systemctl start mariadb
    fi
    
    # Iniciar Nginx
    if ! sudo systemctl is-active --quiet nginx; then
        echo "Iniciando Nginx..."
        sudo systemctl start nginx
    fi
    
    # Iniciar Backend
    cd backend
    if ! pm2 describe proclean-backend > /dev/null 2>&1; then
        echo "Iniciando backend..."
        pm2 start src/server.js --name proclean-backend
        pm2 save
    else
        pm2 restart proclean-backend
    fi
    cd ..
fi

echo ""
echo -e "${GREEN}✅ Servicios locales iniciados${NC}"
echo ""

# Paso 2: Verificar que todo funciona
echo -e "${BLUE}🔍 Paso 2: Verificando servicios...${NC}"
echo ""

# Verificar MariaDB
if sudo systemctl is-active --quiet mariadb; then
    echo -e "   MariaDB: ${GREEN}✅ Activo${NC}"
else
    echo -e "   MariaDB: ${RED}❌ Inactivo${NC}"
fi

# Verificar Nginx
if sudo systemctl is-active --quiet nginx; then
    echo -e "   Nginx: ${GREEN}✅ Activo${NC}"
else
    echo -e "   Nginx: ${RED}❌ Inactivo${NC}"
fi

# Verificar Backend
if pm2 describe proclean-backend > /dev/null 2>&1; then
    STATUS=$(pm2 jlist | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ "$STATUS" = "online" ]; then
        echo -e "   Backend: ${GREEN}✅ Online${NC}"
    else
        echo -e "   Backend: ${RED}❌ $STATUS${NC}"
    fi
else
    echo -e "   Backend: ${RED}❌ No está corriendo${NC}"
fi

# Verificar acceso local
echo ""
echo -e "${BLUE}🌐 Probando acceso local...${NC}"
if curl -s http://localhost > /dev/null 2>&1; then
    echo -e "   Acceso local: ${GREEN}✅ Funciona${NC}"
else
    echo -e "   Acceso local: ${YELLOW}⚠️  No responde${NC}"
fi

echo ""

# Paso 3: Iniciar túnel de Cloudflare
echo -e "${BLUE}🌐 Paso 3: Iniciando túnel de Cloudflare...${NC}"
echo ""

# Verificar si cloudflared está instalado
if ! command -v cloudflared &> /dev/null; then
    echo -e "${RED}❌ cloudflared no está instalado${NC}"
    echo "Ejecuta primero: ./setup-tunnel.sh"
    exit 1
fi

# Verificar si ya hay un túnel corriendo
if pgrep -f "cloudflared tunnel" > /dev/null; then
    echo -e "${YELLOW}⚠️  Ya hay un túnel de Cloudflare corriendo${NC}"
    PID=$(pgrep -f "cloudflared tunnel" | head -1)
    echo "   PID: $PID"
    echo ""
    read -p "¿Deseas detenerlo y crear uno nuevo? (s/N): " RESTART_TUNNEL
    if [[ $RESTART_TUNNEL =~ ^[Ss]$ ]]; then
        pkill -f "cloudflared tunnel"
        sleep 2
    else
        echo -e "${YELLOW}⚠️  Usando túnel existente${NC}"
        echo ""
        echo "Para ver la URL del túnel, revisa los logs o reinicia el túnel manualmente:"
        echo "  ./start-cloudflare-tunnel.sh"
        exit 0
    fi
fi

# Verificar si hay un túnel permanente configurado
if [ -f ~/.cloudflared/config.yml ]; then
    TUNNEL_NAME=$(grep "tunnel:" ~/.cloudflared/config.yml | awk '{print $2}')
    if [ ! -z "$TUNNEL_NAME" ]; then
        echo -e "${BLUE}📋 Túnel permanente detectado: $TUNNEL_NAME${NC}"
        echo ""
        read -p "¿Deseas usar el túnel permanente? (S/n): " USE_PERMANENT
        USE_PERMANENT=${USE_PERMANENT:-S}
        
        if [[ $USE_PERMANENT =~ ^[Ss]$ ]]; then
            echo ""
            echo -e "${BLUE}🚀 Iniciando túnel permanente...${NC}"
            echo ""
            echo -e "${YELLOW}⚠️  El túnel se ejecutará en segundo plano${NC}"
            echo ""
            nohup cloudflared tunnel run "$TUNNEL_NAME" > /tmp/cloudflared.log 2>&1 &
            sleep 3
            
            if pgrep -f "cloudflared tunnel" > /dev/null; then
                echo -e "${GREEN}✅ Túnel permanente iniciado${NC}"
                echo ""
                echo "Para ver los logs:"
                echo "  tail -f /tmp/cloudflared.log"
                echo ""
                echo "Para detener el túnel:"
                echo "  pkill -f 'cloudflared tunnel'"
            else
                echo -e "${RED}❌ Error al iniciar el túnel permanente${NC}"
                echo "Revisa los logs: tail -f /tmp/cloudflared.log"
            fi
            exit 0
        fi
    fi
fi

# Iniciar túnel en modo rápido
echo -e "${BLUE}🚀 Iniciando túnel en modo rápido...${NC}"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Tu aplicación estará disponible en la URL que aparezca abajo${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}💡 Presiona Ctrl+C para detener el túnel${NC}"
echo -e "${YELLOW}💡 Deja esta terminal abierta para que el túnel siga funcionando${NC}"
echo ""

# Iniciar cloudflared y capturar la URL
cloudflared tunnel --url http://localhost:80 2>&1 | while IFS= read -r line; do
    echo "$line"
    
    # Detectar y resaltar la URL
    if echo "$line" | grep -q "https://.*\.trycloudflare\.com"; then
        URL=$(echo "$line" | grep -o "https://[^ ]*\.trycloudflare\.com")
        echo ""
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}🎉 ¡TU APLICACIÓN ESTÁ DISPONIBLE EN:${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}   $URL${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo -e "${YELLOW}💾 Guarda esta URL - cambiará si reinicias el túnel${NC}"
        echo ""
        
        # Guardar URL en archivo
        echo "$URL" > /tmp/cloudflare-tunnel-url.txt
        echo "URL guardada en: /tmp/cloudflare-tunnel-url.txt"
        echo ""
    fi
done

