#!/bin/bash

# Script para configurar túneles reversos cuando no hay port forwarding disponible
# Opciones: Cloudflare Tunnel, ngrok, localtunnel

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🌐 Configuración de Túnel Reverso"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Este script configura un túnel para exponer tu aplicación sin port forwarding"
echo ""
echo "Opciones disponibles:"
echo "  1. Cloudflare Tunnel (cloudflared) - RECOMENDADO - Gratis, sin límites"
echo "  2. ngrok - Fácil, pero con límites en plan gratuito"
echo "  3. localtunnel - Gratis, open source"
echo ""
read -p "Selecciona una opción (1-3) [1]: " OPTION
OPTION=${OPTION:-1}

case $OPTION in
    1)
        echo ""
        echo -e "${BLUE}📦 Configurando Cloudflare Tunnel...${NC}"
        echo ""
        
        # Verificar si cloudflared está instalado
        if ! command -v cloudflared &> /dev/null; then
            echo "Instalando cloudflared..."
            
            # Detectar arquitectura
            ARCH=$(uname -m)
            if [ "$ARCH" = "x86_64" ]; then
                ARCH="amd64"
            elif [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
                ARCH="arm64"
            else
                ARCH="amd64"
            fi
            
            # Descargar cloudflared
            cd /tmp
            wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-${ARCH} -O cloudflared
            chmod +x cloudflared
            sudo mv cloudflared /usr/local/bin/
            
            echo -e "${GREEN}✅ cloudflared instalado${NC}"
        else
            echo -e "${GREEN}✅ cloudflared ya está instalado${NC}"
        fi
        
        echo ""
        echo -e "${YELLOW}📝 Configuración de Cloudflare Tunnel:${NC}"
        echo ""
        echo "Cloudflare Tunnel requiere autenticación. Tienes dos opciones:"
        echo ""
        echo "  A) Modo rápido (sin cuenta Cloudflare) - URL temporal"
        echo "  B) Modo permanente (con cuenta Cloudflare) - URL permanente"
        echo ""
        read -p "Selecciona modo (A/B) [A]: " MODE
        MODE=${MODE:-A}
        
        if [[ $MODE =~ ^[Aa]$ ]]; then
            # Modo rápido - sin autenticación
            echo ""
            echo -e "${BLUE}🚀 Iniciando túnel en modo rápido...${NC}"
            echo -e "${YELLOW}⚠️  Nota: La URL cambiará cada vez que reinicies el túnel${NC}"
            echo ""
            
            # Crear script de inicio
            cat > start-cloudflare-tunnel.sh << 'EOF'
#!/bin/bash
echo "🌐 Iniciando Cloudflare Tunnel..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Tu aplicación estará disponible en la URL que aparezca abajo"
echo "Presiona Ctrl+C para detener el túnel"
echo ""
cloudflared tunnel --url http://localhost:80
EOF
            chmod +x start-cloudflare-tunnel.sh
            
            echo -e "${GREEN}✅ Configuración completada${NC}"
            echo ""
            echo "Para iniciar el túnel, ejecuta:"
            echo "  ./start-cloudflare-tunnel.sh"
            echo ""
            echo "O ejecuta directamente:"
            echo "  cloudflared tunnel --url http://localhost:80"
            
        else
            # Modo permanente - con autenticación
            echo ""
            echo -e "${BLUE}🔐 Configuración permanente de Cloudflare Tunnel${NC}"
            echo ""
            echo "Pasos:"
            echo "1. Ve a https://one.dash.cloudflare.com/"
            echo "2. Inicia sesión o crea una cuenta gratuita"
            echo "3. Ve a Zero Trust > Networks > Tunnels"
            echo "4. Crea un nuevo túnel"
            echo ""
            read -p "Presiona Enter cuando hayas creado el túnel en Cloudflare..."
            
            echo ""
            echo "Ejecuta el comando de autenticación que Cloudflare te proporcionó"
            echo "Normalmente es algo como:"
            echo "  cloudflared tunnel login"
            echo ""
            read -p "¿Ya ejecutaste el login? (s/N): " LOGIN_DONE
            
            if [[ $LOGIN_DONE =~ ^[Ss]$ ]]; then
                read -p "Ingresa el nombre de tu túnel: " TUNNEL_NAME
                
                # Crear configuración
                mkdir -p ~/.cloudflared
                cat > ~/.cloudflared/config.yml << EOF
tunnel: $TUNNEL_NAME
credentials-file: /home/$USER/.cloudflared/$TUNNEL_NAME.json

ingress:
  - hostname: procleanerp.duckdns.org
    service: http://localhost:80
  - service: http_status:404
EOF
                
                echo ""
                echo -e "${GREEN}✅ Configuración creada${NC}"
                echo ""
                echo "Para iniciar el túnel permanente, ejecuta:"
                echo "  cloudflared tunnel run $TUNNEL_NAME"
                echo ""
                echo "O crea un servicio systemd para que inicie automáticamente:"
                echo "  sudo cloudflared service install"
            fi
        fi
        ;;
        
    2)
        echo ""
        echo -e "${BLUE}📦 Configurando ngrok...${NC}"
        echo ""
        
        # Verificar si ngrok está instalado
        if ! command -v ngrok &> /dev/null; then
            echo "Instalando ngrok..."
            
            # Descargar ngrok
            cd /tmp
            wget -q https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz -O ngrok.tgz
            tar -xzf ngrok.tgz
            chmod +x ngrok
            sudo mv ngrok /usr/local/bin/
            
            echo -e "${GREEN}✅ ngrok instalado${NC}"
        else
            echo -e "${GREEN}✅ ngrok ya está instalado${NC}"
        fi
        
        echo ""
        echo -e "${YELLOW}📝 Configuración de ngrok:${NC}"
        echo ""
        echo "ngrok requiere una cuenta gratuita para URLs personalizadas"
        echo "1. Ve a https://dashboard.ngrok.com/signup"
        echo "2. Crea una cuenta gratuita"
        echo "3. Obtén tu authtoken en https://dashboard.ngrok.com/get-started/your-authtoken"
        echo ""
        read -p "Ingresa tu authtoken de ngrok (o Enter para usar modo anónimo): " AUTHTOKEN
        
        if [ ! -z "$AUTHTOKEN" ]; then
            ngrok config add-authtoken "$AUTHTOKEN"
            echo -e "${GREEN}✅ Authtoken configurado${NC}"
        fi
        
        # Crear script de inicio
        cat > start-ngrok-tunnel.sh << 'EOF'
#!/bin/bash
echo "🌐 Iniciando ngrok tunnel..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Tu aplicación estará disponible en la URL que aparezca abajo"
echo "Presiona Ctrl+C para detener el túnel"
echo ""
ngrok http 80
EOF
        chmod +x start-ngrok-tunnel.sh
        
        echo ""
        echo -e "${GREEN}✅ Configuración completada${NC}"
        echo ""
        echo "Para iniciar el túnel, ejecuta:"
        echo "  ./start-ngrok-tunnel.sh"
        echo ""
        echo "O ejecuta directamente:"
        echo "  ngrok http 80"
        ;;
        
    3)
        echo ""
        echo -e "${BLUE}📦 Configurando localtunnel...${NC}"
        echo ""
        
        # Verificar si npm está instalado
        if ! command -v npm &> /dev/null; then
            echo -e "${RED}❌ npm no está instalado. Instala Node.js primero.${NC}"
            exit 1
        fi
        
        # Instalar localtunnel globalmente
        if ! command -v lt &> /dev/null; then
            echo "Instalando localtunnel..."
            sudo npm install -g localtunnel
            echo -e "${GREEN}✅ localtunnel instalado${NC}"
        else
            echo -e "${GREEN}✅ localtunnel ya está instalado${NC}"
        fi
        
        # Crear script de inicio
        cat > start-localtunnel.sh << 'EOF'
#!/bin/bash
echo "🌐 Iniciando localtunnel..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Tu aplicación estará disponible en la URL que aparezca abajo"
echo "Presiona Ctrl+C para detener el túnel"
echo ""
lt --port 80
EOF
        chmod +x start-localtunnel.sh
        
        echo ""
        echo -e "${GREEN}✅ Configuración completada${NC}"
        echo ""
        echo "Para iniciar el túnel, ejecuta:"
        echo "  ./start-localtunnel.sh"
        echo ""
        echo "O ejecuta directamente:"
        echo "  lt --port 80"
        echo ""
        echo -e "${YELLOW}💡 Tip: Puedes usar un subdominio personalizado:${NC}"
        echo "  lt --port 80 --subdomain procleanerp"
        ;;
        
    *)
        echo -e "${RED}❌ Opción inválida${NC}"
        exit 1
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 Configuración completada${NC}"
echo ""
echo "📝 Notas importantes:"
echo "  • El túnel debe estar corriendo para que tu app sea accesible"
echo "  • Si cierras el túnel, la URL dejará de funcionar"
echo "  • Para uso permanente, considera crear un servicio systemd"
echo ""

