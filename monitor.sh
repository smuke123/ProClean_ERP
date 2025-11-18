#!/bin/bash

# Script de monitoreo para ProClean ERP

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "📊 Estado de ProClean ERP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Backend (PM2)
echo -e "${BLUE}🔧 Backend (PM2):${NC}"
if pm2 describe proclean-backend > /dev/null 2>&1; then
    STATUS=$(pm2 jlist | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ "$STATUS" = "online" ]; then
        echo -e "   ${GREEN}✅ Online${NC}"
    else
        echo -e "   ${RED}❌ $STATUS${NC}"
    fi
    CPU=$(pm2 jlist | grep -o '"cpu":[^,]*' | head -1 | cut -d':' -f2 | tr -d ' ')
    MEMORY=$(pm2 jlist | grep -o '"memory":[^,]*' | head -1 | cut -d':' -f2 | tr -d ' ')
    if [ ! -z "$CPU" ]; then
        echo "   CPU: ${CPU}%"
    fi
    if [ ! -z "$MEMORY" ]; then
        MEMORY_MB=$((MEMORY / 1024 / 1024))
        echo "   Memoria: ${MEMORY_MB}MB"
    fi
else
    echo -e "   ${RED}❌ No está corriendo${NC}"
fi
echo ""

# Nginx
echo -e "${BLUE}🌐 Nginx:${NC}"
if sudo systemctl is-active --quiet nginx; then
    echo -e "   ${GREEN}✅ Activo${NC}"
    # Mostrar configuración activa
    ACTIVE_SITE=$(sudo nginx -T 2>/dev/null | grep "server_name" | head -1 | awk '{print $2}' | tr -d ';')
    if [ ! -z "$ACTIVE_SITE" ]; then
        echo "   Dominio: $ACTIVE_SITE"
    fi
else
    echo -e "   ${RED}❌ Inactivo${NC}"
fi
echo ""

# MariaDB
echo -e "${BLUE}🗄️  MariaDB:${NC}"
if sudo systemctl is-active --quiet mariadb; then
    echo -e "   ${GREEN}✅ Activo${NC}"
else
    echo -e "   ${RED}❌ Inactivo${NC}"
fi
echo ""

# Firewall
echo -e "${BLUE}🔥 Firewall (UFW):${NC}"
if command -v ufw &> /dev/null; then
    UFW_STATUS=$(sudo ufw status | head -1)
    echo "   $UFW_STATUS"
    # Mostrar reglas activas
    ACTIVE_RULES=$(sudo ufw status numbered 2>/dev/null | grep -E "^\s*\[" | wc -l)
    if [ "$ACTIVE_RULES" -gt 0 ]; then
        echo "   Reglas activas: $ACTIVE_RULES"
    fi
else
    echo -e "   ${YELLOW}⚠️  UFW no instalado${NC}"
fi
echo ""

# SSL
echo -e "${BLUE}🔒 Certificados SSL:${NC}"
if [ -d "/etc/letsencrypt/live" ]; then
    CERT_COUNT=0
    for cert in /etc/letsencrypt/live/*/; do
        if [ -d "$cert" ]; then
            CERT_COUNT=$((CERT_COUNT + 1))
            DOMAIN=$(basename "$cert")
            if [ -f "$cert/fullchain.pem" ]; then
                EXPIRY=$(sudo openssl x509 -enddate -noout -in "$cert/fullchain.pem" 2>/dev/null | cut -d= -f2)
                if [ ! -z "$EXPIRY" ]; then
                    echo "   ✅ $DOMAIN - Expira: $EXPIRY"
                else
                    echo "   ✅ $DOMAIN"
                fi
            else
                echo "   ⚠️  $DOMAIN (certificado incompleto)"
            fi
        fi
    done
    if [ "$CERT_COUNT" -eq 0 ]; then
        echo -e "   ${YELLOW}⚠️  No hay certificados SSL configurados${NC}"
    fi
else
    echo -e "   ${YELLOW}⚠️  No hay certificados SSL configurados${NC}"
fi
echo ""

# Espacio en disco
echo -e "${BLUE}💾 Espacio en disco:${NC}"
df -h / | tail -1 | awk '{print "   Usado: " $3 " / " $2 " (" $5 ")"}'
echo ""

# Puertos abiertos
echo -e "${BLUE}🔌 Puertos abiertos:${NC}"
if command -v netstat &> /dev/null; then
    OPEN_PORTS=$(sudo netstat -tuln 2>/dev/null | grep -E ':(80|443|3000|3306)' | awk '{print "   " $4}' || echo "")
    if [ ! -z "$OPEN_PORTS" ]; then
        echo "$OPEN_PORTS"
    else
        echo "   No se encontraron puertos relevantes"
    fi
elif command -v ss &> /dev/null; then
    OPEN_PORTS=$(sudo ss -tuln 2>/dev/null | grep -E ':(80|443|3000|3306)' | awk '{print "   " $5}' || echo "")
    if [ ! -z "$OPEN_PORTS" ]; then
        echo "$OPEN_PORTS"
    else
        echo "   No se encontraron puertos relevantes"
    fi
else
    echo "   No se pudo verificar (netstat/ss no disponibles)"
fi
echo ""

# IP pública (si está disponible)
echo -e "${BLUE}🌍 Información de red:${NC}"
LOCAL_IP=$(ip addr show | grep "inet " | grep -v 127.0.0.1 | head -n1 | awk '{print $2}' | cut -d'/' -f1)
if [ ! -z "$LOCAL_IP" ]; then
    echo "   IP Local: $LOCAL_IP"
fi

# Intentar obtener IP pública (sin bloquear)
PUBLIC_IP=$(curl -s --max-time 2 https://api.ipify.org 2>/dev/null || echo "")
if [ ! -z "$PUBLIC_IP" ]; then
    echo "   IP Pública: $PUBLIC_IP"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Comandos útiles:"
echo "   • Ver logs backend: pm2 logs proclean-backend"
echo "   • Ver logs nginx: sudo tail -f /var/log/nginx/proclean-error.log"
echo "   • Reiniciar todo: ./start.sh"
echo "   • Actualizar: ./update-internet.sh"
echo "   • Detener: ./stop.sh"
echo ""

