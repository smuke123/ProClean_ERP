#!/bin/bash

# Script para obtener la URL del túnel activo

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Buscando URL del túnel activo..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar si cloudflared está corriendo
if pgrep -f "cloudflared tunnel" > /dev/null; then
    echo -e "${GREEN}✅ Cloudflare Tunnel está corriendo${NC}"
    echo ""
    echo -e "${YELLOW}📝 La URL del túnel se muestra cuando inicias cloudflared${NC}"
    echo ""
    echo "Para ver la URL, puedes:"
    echo "  1. Revisar la salida del terminal donde ejecutaste cloudflared"
    echo "  2. O reiniciar el túnel para ver la URL nuevamente:"
    echo ""
    echo "     pkill cloudflared"
    echo "     ./start-cloudflare-tunnel.sh"
    echo ""
    echo -e "${BLUE}💡 La URL normalmente tiene este formato:${NC}"
    echo "   https://xxxxx-xxxxx.trycloudflare.com"
    echo ""
    
    # Intentar obtener información del proceso
    PID=$(pgrep -f "cloudflared tunnel" | head -1)
    if [ ! -z "$PID" ]; then
        echo "Información del proceso:"
        ps aux | grep "$PID" | grep -v grep | awk '{print "   PID:", $2, "| Comando:", substr($0, index($0,$11))}'
    fi
elif pgrep -f "ngrok" > /dev/null; then
    echo -e "${GREEN}✅ ngrok está corriendo${NC}"
    echo ""
    echo "Para ver la URL de ngrok, visita:"
    echo "   http://localhost:4040"
    echo ""
    echo "O ejecuta:"
    echo "   curl http://localhost:4040/api/tunnels"
elif pgrep -f "lt --port" > /dev/null; then
    echo -e "${GREEN}✅ localtunnel está corriendo${NC}"
    echo ""
    echo "Revisa la salida del terminal donde ejecutaste 'lt'"
    echo "La URL normalmente tiene este formato:"
    echo "   https://xxxxx.loca.lt"
else
    echo -e "${YELLOW}⚠️  No se detectó ningún túnel corriendo${NC}"
    echo ""
    echo "Para iniciar un túnel, ejecuta:"
    echo "   ./setup-tunnel.sh"
fi

echo ""

