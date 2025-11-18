#!/bin/bash

# Script de diagnóstico de conectividad

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Diagnóstico de Conectividad - ProClean ERP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Verificar servicios locales
echo -e "${BLUE}1. Servicios Locales:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Backend
if pm2 describe proclean-backend > /dev/null 2>&1; then
    STATUS=$(pm2 jlist | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ "$STATUS" = "online" ]; then
        echo -e "   Backend (PM2): ${GREEN}✅ Online${NC}"
    else
        echo -e "   Backend (PM2): ${RED}❌ $STATUS${NC}"
    fi
else
    echo -e "   Backend (PM2): ${RED}❌ No está corriendo${NC}"
fi

# Nginx
if sudo systemctl is-active --quiet nginx; then
    echo -e "   Nginx: ${GREEN}✅ Activo${NC}"
else
    echo -e "   Nginx: ${RED}❌ Inactivo${NC}"
fi

# Test local
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200"; then
    echo -e "   Acceso local (http://localhost): ${GREEN}✅ Funciona${NC}"
else
    echo -e "   Acceso local (http://localhost): ${RED}❌ No responde${NC}"
fi

echo ""

# 2. Verificar IPs
echo -e "${BLUE}2. Información de Red:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

LOCAL_IP=$(ip addr show | grep "inet " | grep -v 127.0.0.1 | head -n1 | awk '{print $2}' | cut -d'/' -f1)
PUBLIC_IP=$(curl -s --max-time 3 https://api.ipify.org 2>/dev/null || echo "No disponible")

echo "   IP Local: $LOCAL_IP"
echo "   IP Pública: $PUBLIC_IP"

# Verificar dominio
DOMAIN="procleanerp.duckdns.org"
DOMAIN_IP=$(dig +short $DOMAIN 2>/dev/null || echo "No resuelve")

if [ "$DOMAIN_IP" = "$PUBLIC_IP" ]; then
    echo -e "   Dominio ($DOMAIN): ${GREEN}✅ Apunta correctamente a $DOMAIN_IP${NC}"
elif [ "$DOMAIN_IP" != "No resuelve" ]; then
    echo -e "   Dominio ($DOMAIN): ${YELLOW}⚠️  Apunta a $DOMAIN_IP (esperado: $PUBLIC_IP)${NC}"
else
    echo -e "   Dominio ($DOMAIN): ${RED}❌ No resuelve${NC}"
fi

echo ""

# 3. Verificar puertos
echo -e "${BLUE}3. Puertos:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v netstat &> /dev/null; then
    PORT_80=$(sudo netstat -tuln 2>/dev/null | grep ':80 ' || echo "")
    PORT_443=$(sudo netstat -tuln 2>/dev/null | grep ':443 ' || echo "")
    PORT_3000=$(sudo netstat -tuln 2>/dev/null | grep ':3000 ' || echo "")
elif command -v ss &> /dev/null; then
    PORT_80=$(sudo ss -tuln 2>/dev/null | grep ':80 ' || echo "")
    PORT_443=$(sudo ss -tuln 2>/dev/null | grep ':443 ' || echo "")
    PORT_3000=$(sudo ss -tuln 2>/dev/null | grep ':3000 ' || echo "")
fi

if [ ! -z "$PORT_80" ]; then
    echo -e "   Puerto 80: ${GREEN}✅ Escuchando${NC}"
else
    echo -e "   Puerto 80: ${RED}❌ No está escuchando${NC}"
fi

if [ ! -z "$PORT_443" ]; then
    echo -e "   Puerto 443: ${GREEN}✅ Escuchando${NC}"
else
    echo -e "   Puerto 443: ${YELLOW}⚠️  No está escuchando (normal si no hay SSL)${NC}"
fi

if [ ! -z "$PORT_3000" ]; then
    echo -e "   Puerto 3000 (Backend): ${GREEN}✅ Escuchando${NC}"
else
    echo -e "   Puerto 3000 (Backend): ${RED}❌ No está escuchando${NC}"
fi

echo ""

# 4. Verificar firewall
echo -e "${BLUE}4. Firewall (UFW):${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v ufw &> /dev/null; then
    UFW_STATUS=$(sudo ufw status | head -1)
    echo "   Estado: $UFW_STATUS"
    
    if echo "$UFW_STATUS" | grep -q "active"; then
        if sudo ufw status | grep -q "80/tcp.*ALLOW"; then
            echo -e "   Puerto 80: ${GREEN}✅ Permitido${NC}"
        else
            echo -e "   Puerto 80: ${RED}❌ Bloqueado${NC}"
        fi
        
        if sudo ufw status | grep -q "443/tcp.*ALLOW"; then
            echo -e "   Puerto 443: ${GREEN}✅ Permitido${NC}"
        else
            echo -e "   Puerto 443: ${YELLOW}⚠️  Bloqueado (normal si no hay SSL)${NC}"
        fi
    fi
else
    echo -e "   ${YELLOW}⚠️  UFW no instalado${NC}"
fi

echo ""

# 5. Test de conectividad desde internet
echo -e "${BLUE}5. Conectividad desde Internet:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "   Probando acceso desde internet..."
RESPONSE=$(timeout 5 curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN 2>/dev/null || echo "timeout")

if [ "$RESPONSE" = "200" ]; then
    echo -e "   http://$DOMAIN: ${GREEN}✅ Accesible (HTTP 200)${NC}"
elif [ "$RESPONSE" = "timeout" ]; then
    echo -e "   http://$DOMAIN: ${RED}❌ Timeout - No responde${NC}"
    echo -e "   ${YELLOW}   ⚠️  Esto indica que el PORT FORWARDING no está configurado${NC}"
else
    echo -e "   http://$DOMAIN: ${YELLOW}⚠️  Responde con código: $RESPONSE${NC}"
fi

echo ""

# 6. Resumen y recomendaciones
echo -e "${BLUE}6. Resumen y Recomendaciones:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$RESPONSE" = "timeout" ] || [ "$RESPONSE" != "200" ]; then
    echo -e "${YELLOW}⚠️  PROBLEMA DETECTADO: No se puede acceder desde internet${NC}"
    echo ""
    echo "📋 Pasos para solucionar:"
    echo ""
    echo "1. ${BLUE}Configurar Port Forwarding en tu Router:${NC}"
    echo "   - Accede a la configuración de tu router (normalmente 192.168.1.1 o 192.168.0.1)"
    echo "   - Busca 'Port Forwarding' o 'Virtual Server'"
    echo "   - Agrega estas reglas:"
    echo "     • Puerto externo: 80 → IP interna: $LOCAL_IP:80 (Protocolo: TCP)"
    echo "     • Puerto externo: 443 → IP interna: $LOCAL_IP:443 (Protocolo: TCP)"
    echo ""
    echo "2. ${BLUE}Verificar que tu IP pública sea accesible:${NC}"
    echo "   - Tu IP pública actual: $PUBLIC_IP"
    echo "   - Algunos ISPs bloquean puertos. Verifica con tu proveedor."
    echo ""
    echo "3. ${BLUE}Probar después de configurar:${NC}"
    echo "   - Espera 1-2 minutos después de configurar el router"
    echo "   - Ejecuta este script nuevamente: ./diagnose-connection.sh"
    echo ""
    echo "4. ${BLUE}Si aún no funciona:${NC}"
    echo "   - Verifica que tu router tenga una IP pública (no CGNAT)"
    echo "   - Algunos routers requieren reiniciarse después de cambios"
    echo "   - Prueba desde otro dispositivo/red para descartar problemas locales"
else
    echo -e "${GREEN}✅ Todo parece estar funcionando correctamente${NC}"
    echo ""
    echo "🌐 Tu aplicación debería estar accesible en:"
    echo "   http://$DOMAIN"
    if [ ! -z "$PORT_443" ]; then
        echo "   https://$DOMAIN"
    fi
fi

echo ""

