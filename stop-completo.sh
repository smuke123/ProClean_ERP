#!/bin/bash

# Script para detener ProClean ERP completamente
# Incluye detener el túnel de Cloudflare

echo "🛑 Deteniendo ProClean ERP completamente..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Detener túnel de Cloudflare
echo -e "${BLUE}🌐 Deteniendo túnel de Cloudflare...${NC}"
if pgrep -f "cloudflared tunnel" > /dev/null; then
    pkill -f "cloudflared tunnel"
    sleep 1
    if ! pgrep -f "cloudflared tunnel" > /dev/null; then
        echo -e "${GREEN}✅ Túnel de Cloudflare detenido${NC}"
    else
        echo -e "${YELLOW}⚠️  Algunos procesos de cloudflared pueden seguir corriendo${NC}"
        pkill -9 -f "cloudflared" 2>/dev/null || true
    fi
else
    echo -e "${YELLOW}⚠️  Túnel de Cloudflare no está corriendo${NC}"
fi

# Verificar si hay servicio systemd de cloudflared
if systemctl is-active --quiet cloudflared-tunnel 2>/dev/null; then
    echo -e "${BLUE}🔄 Deteniendo servicio systemd de cloudflared...${NC}"
    sudo systemctl stop cloudflared-tunnel 2>/dev/null
    echo -e "${GREEN}✅ Servicio cloudflared detenido${NC}"
fi

echo ""

# 2. Detener backend (PM2)
echo -e "${BLUE}🔄 Deteniendo backend...${NC}"
if pm2 describe proclean-backend > /dev/null 2>&1; then
    pm2 stop proclean-backend
    pm2 delete proclean-backend
    echo -e "${GREEN}✅ Backend detenido${NC}"
else
    echo -e "${YELLOW}⚠️  Backend no está corriendo${NC}"
fi

echo ""

# 3. Detener Nginx (OPCIONAL)
echo -e "${BLUE}🔄 Deteniendo Nginx...${NC}"
read -p "¿Deseas detener Nginx también? (s/N): " STOP_NGINX
if [[ $STOP_NGINX =~ ^[Ss]$ ]]; then
    if sudo systemctl is-active --quiet nginx; then
        sudo systemctl stop nginx
        echo -e "${GREEN}✅ Nginx detenido${NC}"
    else
        echo -e "${YELLOW}⚠️  Nginx no está corriendo${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Nginx se mantendrá corriendo${NC}"
fi

echo ""

# 4. Detener MariaDB (OPCIONAL - normalmente se deja corriendo)
echo -e "${BLUE}🔄 Deteniendo MariaDB...${NC}"
read -p "¿Deseas detener MariaDB también? (s/N): " STOP_DB
if [[ $STOP_DB =~ ^[Ss]$ ]]; then
    if sudo systemctl is-active --quiet mariadb; then
        sudo systemctl stop mariadb
        echo -e "${GREEN}✅ MariaDB detenido${NC}"
    else
        echo -e "${YELLOW}⚠️  MariaDB no está corriendo${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  MariaDB se mantendrá corriendo (recomendado)${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Proceso de detención completado${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Estado final de los servicios:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar estado final
echo -e "${BLUE}🌐 Túnel Cloudflare:${NC}"
if pgrep -f "cloudflared tunnel" > /dev/null; then
    echo -e "   ${RED}❌ Aún corriendo${NC}"
else
    echo -e "   ${GREEN}✅ Detenido${NC}"
fi

echo -e "${BLUE}🔧 Backend (PM2):${NC}"
if pm2 describe proclean-backend > /dev/null 2>&1; then
    echo -e "   ${RED}❌ Aún corriendo${NC}"
else
    echo -e "   ${GREEN}✅ Detenido${NC}"
fi

echo -e "${BLUE}🌐 Nginx:${NC}"
if sudo systemctl is-active --quiet nginx; then
    echo -e "   ${YELLOW}⚠️  Corriendo${NC}"
else
    echo -e "   ${GREEN}✅ Detenido${NC}"
fi

echo -e "${BLUE}🗄️  MariaDB:${NC}"
if sudo systemctl is-active --quiet mariadb; then
    echo -e "   ${YELLOW}⚠️  Corriendo${NC}"
else
    echo -e "   ${GREEN}✅ Detenido${NC}"
fi

echo ""
echo "🔄 Para volver a iniciar todo:"
echo "   ./inicio-completo.sh"
echo ""
echo "💡 Tips:"
echo "   • MariaDB normalmente se deja corriendo"
echo "   • Nginx puede dejarse corriendo si no molesta"
echo "   • El túnel de Cloudflare debe detenerse siempre"
echo ""
```

Guárdalo como `stop-completo.sh` y hazlo ejecutable:

```bash
chmod +x stop-completo.sh
```

## Procedimiento para cerrar el portátil

### Opción 1: Script automático (recomendado)

```bash
<code_block_to_apply_changes_from>
```

El script:
- Detiene el túnel de Cloudflare
- Detiene el backend (PM2)
- Pregunta si quieres detener Nginx (opcional)
- Pregunta si quieres detener MariaDB (normalmente se deja corriendo)

### Opción 2: Manual (rápido)

```bash
# 1. Detener túnel de Cloudflare
pkill -f "cloudflared tunnel"

# 2. Detener backend
pm2 stop proclean-backend
pm2 delete proclean-backend

# 3. (Opcional) Detener Nginx
sudo systemctl stop nginx

# 4. (Opcional) Detener MariaDB (normalmente NO se detiene)
# sudo systemctl stop mariadb
```

## Recomendaciones

1. Siempre detener:
   - Túnel de Cloudflare (para liberar recursos)
   - Backend (PM2)

2. Opcional detener:
   - Nginx (puede quedarse si no molesta)
   - MariaDB (normalmente se deja corriendo)

3. Al reiniciar:
   - Ejecuta `./inicio-completo.sh` para iniciar todo de nuevo

## Resumen rápido

```bash
# Detener todo
./stop-completo.sh

# O manualmente:
pkill -f "cloudflared tunnel"
pm2 stop proclean-backend && pm2 delete proclean-backend
```

¿Quieres que cree el script `stop-completo.sh` ahora?