#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🌐 Iniciando Cloudflare Tunnel..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar que cloudflared está instalado
if ! command -v cloudflared &> /dev/null; then
    echo -e "${RED}❌ cloudflared no está instalado${NC}"
    echo "Ejecuta: ./setup-tunnel.sh"
    exit 1
fi

# Verificar que nginx está corriendo
if ! curl -s http://localhost > /dev/null; then
    echo -e "${YELLOW}⚠️  Advertencia: No se puede acceder a http://localhost${NC}"
    echo "Asegúrate de que nginx esté corriendo"
    echo ""
fi

echo -e "${BLUE}📡 Iniciando túnel...${NC}"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Tu aplicación estará disponible en la URL que aparezca abajo${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}💡 Presiona Ctrl+C para detener el túnel${NC}"
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
    fi
done
