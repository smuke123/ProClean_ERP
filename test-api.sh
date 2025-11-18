#!/bin/bash

# Script para probar la API de exportación

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

API_BASE="https://monitor-dispatched-copy-shall.trycloudflare.com/api/export"

echo "🧪 Prueba de API de Exportación"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Debes proporcionar una API Key${NC}"
    echo ""
    echo "Uso: ./test-api.sh TU_API_KEY"
    echo ""
    echo "Ejemplo:"
    echo "  ./test-api.sh abc123def456..."
    exit 1
fi

API_KEY="$1"

echo -e "${BLUE}📡 Probando conexión con la API...${NC}"
echo ""

# Test 1: Información general
echo -e "${YELLOW}1. Obteniendo información general de la API...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "X-API-Key: $API_KEY" "$API_BASE/")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Conexión exitosa${NC}"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ Error HTTP $HTTP_CODE${NC}"
    echo "$BODY"
    exit 1
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test 2: Productos
echo -e "${YELLOW}2. Probando endpoint de productos...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "X-API-Key: $API_KEY" "$API_BASE/productos")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    TOTAL=$(echo "$BODY" | jq -r '.total_records // 0' 2>/dev/null)
    echo -e "${GREEN}✅ Productos obtenidos: $TOTAL registros${NC}"
else
    echo -e "${RED}❌ Error HTTP $HTTP_CODE${NC}"
    echo "$BODY"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test 3: Ventas
echo -e "${YELLOW}3. Probando endpoint de ventas...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "X-API-Key: $API_KEY" "$API_BASE/ventas")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    TOTAL=$(echo "$BODY" | jq -r '.total_records // 0' 2>/dev/null)
    echo -e "${GREEN}✅ Ventas obtenidas: $TOTAL registros${NC}"
else
    echo -e "${RED}❌ Error HTTP $HTTP_CODE${NC}"
    echo "$BODY"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Pruebas completadas${NC}"
echo ""
echo "Para ver más detalles, ejecuta:"
echo "  curl -H \"X-API-Key: $API_KEY\" $API_BASE/productos | jq"

