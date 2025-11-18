#!/bin/bash

# Script para crear un servicio systemd que inicie el túnel automáticamente

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔧 Configuración de Servicio Automático para Túnel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Detectar qué tipo de túnel está configurado
TUNNEL_TYPE=""

if command -v cloudflared &> /dev/null && [ -f ~/.cloudflared/config.yml ]; then
    TUNNEL_TYPE="cloudflare"
    TUNNEL_NAME=$(grep "tunnel:" ~/.cloudflared/config.yml | awk '{print $2}')
    echo -e "${BLUE}Detectado: Cloudflare Tunnel${NC}"
elif command -v ngrok &> /dev/null; then
    TUNNEL_TYPE="ngrok"
    echo -e "${BLUE}Detectado: ngrok${NC}"
elif command -v lt &> /dev/null; then
    TUNNEL_TYPE="localtunnel"
    echo -e "${BLUE}Detectado: localtunnel${NC}"
else
    echo -e "${RED}❌ No se detectó ningún túnel configurado${NC}"
    echo "Ejecuta primero: ./setup-tunnel.sh"
    exit 1
fi

read -p "¿Deseas crear un servicio systemd para iniciar automáticamente? (s/N): " CREATE_SERVICE

if [[ ! $CREATE_SERVICE =~ ^[Ss]$ ]]; then
    echo "Cancelado."
    exit 0
fi

case $TUNNEL_TYPE in
    cloudflare)
        if [ -z "$TUNNEL_NAME" ]; then
            echo -e "${YELLOW}⚠️  No se detectó un túnel permanente de Cloudflare${NC}"
            echo "Para usar servicio automático, necesitas configurar un túnel permanente"
            echo "Ejecuta: ./setup-tunnel.sh y selecciona opción B"
            exit 1
        fi
        
        SERVICE_NAME="cloudflared-tunnel"
        SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
        
        sudo tee "$SERVICE_FILE" > /dev/null << EOF
[Unit]
Description=Cloudflare Tunnel
After=network.target

[Service]
Type=simple
User=$USER
ExecStart=/usr/local/bin/cloudflared tunnel run $TUNNEL_NAME
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
        
        echo -e "${GREEN}✅ Servicio creado${NC}"
        ;;
        
    ngrok)
        SERVICE_NAME="ngrok-tunnel"
        SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
        
        read -p "¿Deseas usar un dominio personalizado de ngrok? (s/N): " USE_DOMAIN
        if [[ $USE_DOMAIN =~ ^[Ss]$ ]]; then
            read -p "Ingresa tu dominio de ngrok (ej: procleanerp.ngrok-free.app): " NGROK_DOMAIN
            NGROK_CMD="ngrok http 80 --domain=$NGROK_DOMAIN"
        else
            NGROK_CMD="ngrok http 80"
        fi
        
        sudo tee "$SERVICE_FILE" > /dev/null << EOF
[Unit]
Description=ngrok Tunnel
After=network.target

[Service]
Type=simple
User=$USER
ExecStart=/usr/local/bin/ngrok $NGROK_CMD
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
        
        echo -e "${GREEN}✅ Servicio creado${NC}"
        ;;
        
    localtunnel)
        SERVICE_NAME="localtunnel"
        SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
        
        read -p "¿Deseas usar un subdominio personalizado? (s/N): " USE_SUBDOMAIN
        if [[ $USE_SUBDOMAIN =~ ^[Ss]$ ]]; then
            read -p "Ingresa el subdominio (ej: procleanerp): " SUBDOMAIN
            LT_CMD="lt --port 80 --subdomain $SUBDOMAIN"
        else
            LT_CMD="lt --port 80"
        fi
        
        sudo tee "$SERVICE_FILE" > /dev/null << EOF
[Unit]
Description=localtunnel
After=network.target

[Service]
Type=simple
User=$USER
ExecStart=/usr/bin/lt $LT_CMD
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
        
        echo -e "${GREEN}✅ Servicio creado${NC}"
        ;;
esac

# Habilitar y iniciar el servicio
echo ""
echo -e "${BLUE}🔄 Habilitando servicio...${NC}"
sudo systemctl daemon-reload
sudo systemctl enable $SERVICE_NAME
sudo systemctl start $SERVICE_NAME

sleep 2

if sudo systemctl is-active --quiet $SERVICE_NAME; then
    echo -e "${GREEN}✅ Servicio iniciado correctamente${NC}"
    echo ""
    echo "El túnel se iniciará automáticamente al reiniciar el sistema"
    echo ""
    echo "Comandos útiles:"
    echo "  sudo systemctl status $SERVICE_NAME  # Ver estado"
    echo "  sudo systemctl restart $SERVICE_NAME  # Reiniciar"
    echo "  sudo systemctl stop $SERVICE_NAME    # Detener"
    echo "  sudo journalctl -u $SERVICE_NAME -f  # Ver logs"
else
    echo -e "${RED}❌ Error al iniciar el servicio${NC}"
    echo "Revisa los logs: sudo journalctl -u $SERVICE_NAME -n 50"
fi

