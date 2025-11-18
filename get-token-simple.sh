#!/bin/bash

# Script para obtener token JWT mediante login

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔑 Obtener Token JWT mediante Login"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Obtener URL del túnel si existe
TUNNEL_URL=$(cat /tmp/cloudflare-tunnel-url.txt 2>/dev/null || echo "")

if [ -z "$TUNNEL_URL" ]; then
    read -p "Ingresa la URL de tu aplicación (ej: https://xxxxx.trycloudflare.com): " TUNNEL_URL
else
    echo -e "${BLUE}📋 URL detectada: $TUNNEL_URL${NC}"
    read -p "¿Usar esta URL? (S/n): " USE_URL
    if [[ ! $USE_URL =~ ^[Nn]$ ]]; then
        # Usar la URL detectada
        :
    else
        read -p "Ingresa la URL de tu aplicación: " TUNNEL_URL
    fi
fi

if [ -z "$TUNNEL_URL" ]; then
    echo -e "${RED}❌ La URL es requerida${NC}"
    exit 1
fi

# Remover https:// si está presente
TUNNEL_URL=${TUNNEL_URL#https://}
TUNNEL_URL=${TUNNEL_URL#http://}
FULL_URL="https://${TUNNEL_URL}"

read -p "Email de administrador [admin@norte.proclean.com]: " EMAIL
EMAIL=${EMAIL:-admin@norte.proclean.com}

read -sp "Password [admin123]: " PASSWORD
PASSWORD=${PASSWORD:-admin123}
echo ""

echo ""
echo -e "${BLUE}📡 Iniciando sesión...${NC}"

RESPONSE=$(curl -s -X POST "${FULL_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

# Verificar si hay error
if echo "$RESPONSE" | grep -q '"error"'; then
    echo -e "${RED}❌ Error al iniciar sesión${NC}"
    ERROR_MSG=$(echo "$RESPONSE" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
    if [ ! -z "$ERROR_MSG" ]; then
        echo "   $ERROR_MSG"
    else
        echo "$RESPONSE" | head -5
    fi
    exit 1
fi

# Extraer el token
TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ No se pudo obtener el token${NC}"
    echo "Respuesta del servidor:"
    echo "$RESPONSE" | head -10
    exit 1
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Login exitoso${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}🔑 Tu Token JWT:${NC}"
echo -e "${GREEN}$TOKEN${NC}"
echo ""
echo -e "${YELLOW}💾 Guardando token en archivo temporal...${NC}"
echo "$TOKEN" > /tmp/proclean-jwt-token.txt
echo -e "${GREEN}✅ Token guardado en: /tmp/proclean-jwt-token.txt${NC}"
echo ""
echo "Ahora puedes usar este token para crear API Keys:"
echo "  ./create-api-key.sh"
echo ""
echo "O usar directamente:"
echo "  export JWT_TOKEN='$TOKEN'"
echo "  ./create-api-key.sh"
echo ""

