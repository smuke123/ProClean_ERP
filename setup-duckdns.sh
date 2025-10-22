#!/bin/bash

# Script para configurar DuckDNS automáticamente
# Mantiene tu dominio siempre actualizado con tu IP pública

echo "🦆 Configuración de DuckDNS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Primero, ve a https://www.duckdns.org y:"
echo "1. Regístrate (con Google/GitHub/etc)"
echo "2. Crea un dominio (ejemplo: proclean)"
echo "3. Copia tu TOKEN"
echo ""

# Pedir información al usuario
read -p "Ingresa tu dominio DuckDNS (sin .duckdns.org): " DOMAIN
read -p "Ingresa tu TOKEN de DuckDNS: " TOKEN

# Crear directorio para DuckDNS
mkdir -p ~/duckdns
cd ~/duckdns

# Crear script de actualización
cat > duck.sh << EOF
#!/bin/bash
echo url="https://www.duckdns.org/update?domains=${DOMAIN}&token=${TOKEN}&ip=" | curl -k -o ~/duckdns/duck.log -K -
EOF

chmod +x duck.sh

# Probar que funciona
echo ""
echo "Probando conexión con DuckDNS..."
./duck.sh
sleep 2
cat duck.log
echo ""

if grep -q "OK" duck.log; then
    echo "✅ ¡Funciona! Tu dominio es: ${DOMAIN}.duckdns.org"
    
    # Agregar al crontab para actualizar cada 5 minutos
    echo ""
    echo "Configurando actualización automática cada 5 minutos..."
    
    # Crear entrada de cron
    CRON_CMD="*/5 * * * * ~/duckdns/duck.sh >/dev/null 2>&1"
    
    # Verificar si ya existe
    if crontab -l 2>/dev/null | grep -q "duck.sh"; then
        echo "⚠️  Ya existe una entrada en crontab"
    else
        (crontab -l 2>/dev/null; echo "$CRON_CMD") | crontab -
        echo "✅ Actualización automática configurada"
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎉 ¡Configuración completa!"
    echo ""
    echo "📝 PRÓXIMOS PASOS:"
    echo ""
    echo "1. Configura Port Forwarding en tu router:"
    echo "   - Puerto externo: 80 → IP interna: $(ip addr show | grep "inet " | grep -v 127.0.0.1 | head -n1 | awk '{print $2}' | cut -d'/' -f1):80"
    echo "   - Puerto externo: 443 → IP interna: $(ip addr show | grep "inet " | grep -v 127.0.0.1 | head -n1 | awk '{print $2}' | cut -d'/' -f1):443 (para HTTPS)"
    echo ""
    echo "2. Actualiza la configuración de Nginx:"
    echo "   Edita nginx.conf y cambia 'server_name localhost' por:"
    echo "   server_name ${DOMAIN}.duckdns.org;"
    echo ""
    echo "3. (Opcional pero recomendado) Configura HTTPS:"
    echo "   sudo certbot --nginx -d ${DOMAIN}.duckdns.org"
    echo ""
    echo "4. Tu aplicación estará en:"
    echo "   http://${DOMAIN}.duckdns.org"
    echo ""
else
    echo "❌ Error: No se pudo conectar con DuckDNS"
    echo "Verifica tu dominio y token"
fi

