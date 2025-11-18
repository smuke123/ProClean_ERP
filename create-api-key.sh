#!/bin/bash

# Script para crear API Keys para integraciones externas

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔑 Crear API Key para Integración Externa"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar que el backend está corriendo
if ! curl -s http://localhost:3000/api/ping > /dev/null 2>&1; then
    echo -e "${RED}❌ El backend no está corriendo${NC}"
    echo "Inicia el backend primero: ./start.sh"
    exit 1
fi

# Solicitar información
read -p "Nombre de la integración (ej: 'Sistema de Reportes XYZ'): " NOMBRE
if [ -z "$NOMBRE" ]; then
    echo -e "${RED}❌ El nombre es requerido${NC}"
    exit 1
fi

read -p "Organización/Cliente: " ORGANIZACION
if [ -z "$ORGANIZACION" ]; then
    echo -e "${RED}❌ La organización es requerida${NC}"
    exit 1
fi

read -p "Email de contacto: " CONTACTO

read -p "Descripción (opcional): " DESCRIPCION

echo ""
echo -e "${BLUE}📋 Selecciona los recursos a los que tendrá acceso:${NC}"
echo "  1. Solo ventas"
echo "  2. Solo compras"
echo "  3. Solo productos"
echo "  4. Solo inventario"
echo "  5. Ventas y compras"
echo "  6. Todos los recursos (ventas, compras, productos, inventario, sucursales)"
read -p "Opción [6]: " RECURSOS_OPT
RECURSOS_OPT=${RECURSOS_OPT:-6}

case $RECURSOS_OPT in
    1) RECURSOS='["ventas"]' ;;
    2) RECURSOS='["compras"]' ;;
    3) RECURSOS='["productos"]' ;;
    4) RECURSOS='["inventario"]' ;;
    5) RECURSOS='["ventas","compras"]' ;;
    6) RECURSOS='["ventas","compras","productos","inventario","sucursales"]' ;;
    *) RECURSOS='["ventas","compras","productos","inventario","sucursales"]' ;;
esac

read -p "Límite de requests por hora [1000]: " RATE_LIMIT
RATE_LIMIT=${RATE_LIMIT:-1000}

echo ""
echo -e "${YELLOW}⚠️  Necesitas estar autenticado como administrador${NC}"
read -p "Ingresa tu token JWT (obténlo iniciando sesión en la app): " JWT_TOKEN

if [ -z "$JWT_TOKEN" ]; then
    echo -e "${RED}❌ El token JWT es requerido${NC}"
    exit 1
fi

# Crear la API Key
echo ""
echo -e "${BLUE}🔐 Creando API Key...${NC}"

RESPONSE=$(curl -s -X POST http://localhost:3000/api/api-keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d "{
    \"nombre\": \"$NOMBRE\",
    \"descripcion\": \"$DESCRIPCION\",
    \"organizacion\": \"$ORGANIZACION\",
    \"contacto\": \"$CONTACTO\",
    \"permisos\": [\"read\"],
    \"recursos_permitidos\": $RECURSOS,
    \"rate_limit\": $RATE_LIMIT
  }")

# Verificar respuesta
if echo "$RESPONSE" | grep -q "api_key"; then
    API_KEY=$(echo "$RESPONSE" | grep -o '"api_key":"[^"]*"' | cut -d'"' -f4)
    
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ API Key creada exitosamente${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANTE: Guarda esta API Key de forma segura${NC}"
    echo -e "${YELLOW}   No podrás verla nuevamente después de cerrar esta ventana${NC}"
    echo ""
    echo -e "${BLUE}🔑 Tu API Key:${NC}"
    echo -e "${GREEN}$API_KEY${NC}"
    echo ""
    echo -e "${BLUE}📝 Información:${NC}"
    echo "   Nombre: $NOMBRE"
    echo "   Organización: $ORGANIZACION"
    echo "   Recursos: $RECURSOS"
    echo "   Rate Limit: $RATE_LIMIT requests/hora"
    echo ""
    echo -e "${BLUE}🌐 URL Base de la API:${NC}"
    echo "   https://monitor-dispatched-copy-shall.trycloudflare.com/api/export"
    echo ""
    echo -e "${BLUE}📚 Ejemplo de uso:${NC}"
    echo "   curl -H \"X-API-Key: $API_KEY\" \\"
    echo "        https://monitor-dispatched-copy-shall.trycloudflare.com/api/export/ventas"
    echo ""
    
    # Guardar en archivo
    cat > api-key-${NOMBRE// /-}.txt << EOF
API Key creada: $(date)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nombre: $NOMBRE
Organización: $ORGANIZACION
Contacto: $CONTACTO
Recursos: $RECURSOS
Rate Limit: $RATE_LIMIT requests/hora

API Key: $API_KEY

URL Base: https://monitor-dispatched-copy-shall.trycloudflare.com/api/export

Ejemplo de uso:
curl -H "X-API-Key: $API_KEY" \\
     https://monitor-dispatched-copy-shall.trycloudflare.com/api/export/ventas
EOF
    
    echo -e "${GREEN}💾 Información guardada en: api-key-${NOMBRE// /-}.txt${NC}"
else
    echo -e "${RED}❌ Error al crear la API Key${NC}"
    echo ""
    echo "Respuesta del servidor:"
    echo "$RESPONSE" | head -20
    echo ""
    echo -e "${YELLOW}Posibles causas:${NC}"
    echo "  - Token JWT inválido o expirado"
    echo "  - No tienes permisos de administrador"
    echo "  - El backend no está respondiendo correctamente"
fi

