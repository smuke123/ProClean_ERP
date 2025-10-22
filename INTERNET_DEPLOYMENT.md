# 🌍 Guía para Publicar ProClean ERP en Internet

Esta guía te ayudará a hacer tu aplicación accesible desde cualquier lugar del mundo.

## 📋 Índice

1. [Opción 1: IP Pública + Port Forwarding](#opción-1-ip-pública--port-forwarding)
2. [Opción 2: DNS Dinámico (Recomendado)](#opción-2-dns-dinámico-recomendado)
3. [Opción 3: Túneles (Cloudflare/ngrok)](#opción-3-túneles-rápido-y-fácil)
4. [Opción 4: VPS en la Nube (Profesional)](#opción-4-vps-en-la-nube-profesional)
5. [Seguridad - MUY IMPORTANTE](#-seguridad---muy-importante)

---

## Opción 1: IP Pública + Port Forwarding

### ✅ Pros
- Gratis
- Control total
- No depende de terceros

### ❌ Contras
- IP cambia constantemente
- Link feo (números)
- Sin HTTPS
- Requiere configurar router

### 📝 Pasos

#### 1. Obtén tu IP pública
```bash
curl ifconfig.me
# O visita: https://www.whatismyip.com/
```

#### 2. Configura Port Forwarding en tu router

**Varía según el router, pero generalmente:**

1. Accede a tu router (usualmente `192.168.1.1` o `192.168.0.1`)
2. Usuario/Contraseña (suele estar en la etiqueta del router)
3. Busca sección "Port Forwarding" / "NAT" / "Virtual Servers"
4. Agrega regla:
   ```
   Service Name: ProClean-HTTP
   External Port: 80
   Internal IP: [IP de tu PC en la red local]
   Internal Port: 80
   Protocol: TCP
   ```

**Encuentra tu IP local:**
```bash
ip addr show | grep "inet " | grep -v 127.0.0.1
# Busca algo como: 192.168.1.100
```

#### 3. Prueba el acceso

Desde tu teléfono (con datos móviles, no WiFi):
```
http://TU_IP_PUBLICA
```

---

## Opción 2: DNS Dinámico (Recomendado)

### ✅ Pros
- Gratis
- Dominio bonito: `tuapp.duckdns.org`
- IP se actualiza automáticamente
- Fácil de recordar y compartir

### ❌ Contras
- Aún requiere port forwarding
- Subdominio de terceros (.duckdns.org)

### 📝 Pasos

#### 1. Registrarse en DuckDNS

1. Ve a [https://www.duckdns.org](https://www.duckdns.org)
2. Inicia sesión con Google/GitHub/etc
3. Crea un dominio (ejemplo: `proclean` → `proclean.duckdns.org`)
4. Copia tu TOKEN

#### 2. Configurar DuckDNS automáticamente

```bash
# Ejecuta el script que creé
chmod +x setup-duckdns.sh
./setup-duckdns.sh
```

O manualmente:

```bash
# Crear directorio
mkdir -p ~/duckdns
cd ~/duckdns

# Crear script (reemplaza DOMAIN y TOKEN)
echo 'url="https://www.duckdns.org/update?domains=TU_DOMINIO&token=TU_TOKEN&ip=" | curl -k -o ~/duckdns/duck.log -K -' > duck.sh
chmod +x duck.sh

# Probar
./duck.sh
cat duck.log  # Debe decir "OK"

# Agregar a crontab (actualiza cada 5 minutos)
crontab -e
# Agrega esta línea:
*/5 * * * * ~/duckdns/duck.sh >/dev/null 2>&1
```

#### 3. Actualizar Nginx

Edita `nginx.conf`:
```nginx
server {
    listen 80;
    server_name tudominio.duckdns.org;  # <- Cambia esto
    # ... resto igual
}
```

Reinicia Nginx:
```bash
sudo systemctl reload nginx
```

#### 4. Configurar Port Forwarding

Igual que la Opción 1 (puerto 80)

#### 5. Configurar HTTPS (Muy recomendado)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado SSL GRATIS
sudo certbot --nginx -d tudominio.duckdns.org

# Certbot configura todo automáticamente!
```

Ahora tu app está en:
- ✅ `https://tudominio.duckdns.org` (SEGURO)

---

## Opción 3: Túneles (Rápido y Fácil)

### A) Cloudflare Tunnel (Gratis, Recomendado)

**✅ Pros:**
- No requiere port forwarding
- HTTPS automático
- Protección DDoS de Cloudflare
- 100% gratis

**📝 Pasos:**

1. Instalar cloudflared:
```bash
# Descargar
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Autenticar
cloudflared tunnel login
```

2. Crear túnel:
```bash
# Crear
cloudflared tunnel create proclean

# Configurar
mkdir -p ~/.cloudflared
cat > ~/.cloudflared/config.yml << EOF
tunnel: [TU_TUNNEL_ID]
credentials-file: /home/kys/.cloudflared/[TU_TUNNEL_ID].json

ingress:
  - hostname: tudominio.tusubdominio.workers.dev
    service: http://localhost:80
  - service: http_status:404
EOF

# Ejecutar
cloudflared tunnel run proclean
```

3. Configurar como servicio para que corra siempre:
```bash
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

### B) ngrok (Rápido para pruebas)

**⚠️ Limitaciones versión gratis:**
- URL cambia cada vez que reinicias
- Límite de conexiones

```bash
# Instalar
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xvzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/

# Autenticar (regístrate en ngrok.com primero)
ngrok config add-authtoken TU_TOKEN

# Ejecutar
ngrok http 80
```

Te dará una URL como: `https://abc123.ngrok-free.app`

---

## Opción 4: VPS en la Nube (Profesional)

Para aplicaciones serias con dominio propio.

### Proveedores recomendados:

| Proveedor | Precio | Características |
|-----------|--------|-----------------|
| **DigitalOcean** | $4-6/mes | Fácil, buen soporte |
| **Linode/Akamai** | $5/mes | Confiable |
| **Vultr** | $2.50-6/mes | Económico |
| **AWS Lightsail** | $3.50/mes | Parte de AWS |
| **Oracle Cloud** | GRATIS* | 2 VPS gratis para siempre |
| **Google Cloud** | $300 crédito | Prueba gratuita |

### Pasos básicos:

1. Crear VPS con Ubuntu
2. Conectar por SSH
3. Clonar tu repositorio
4. Ejecutar `./deploy.sh`
5. Configurar dominio (DNS A record)
6. Configurar HTTPS con Let's Encrypt

**Ventajas:**
- ✅ IP pública fija
- ✅ Dominio propio (.com, .mx, etc)
- ✅ Mayor rendimiento
- ✅ Disponibilidad 24/7
- ✅ Backups automáticos

---

## 🔒 Seguridad - MUY IMPORTANTE

### ⚠️ Antes de publicar en internet:

1. **Cambia todas las contraseñas por defecto**
   ```bash
   # En env.template o .env
   JWT_SECRET=[genera uno fuerte: openssl rand -base64 64]
   MYSQLDB_PASSWORD=[contraseña fuerte]
   ```

2. **Configura HTTPS (SSL/TLS)**
   ```bash
   sudo certbot --nginx -d tudominio.com
   ```

3. **Configura firewall**
   ```bash
   sudo ufw enable
   sudo ufw allow 22/tcp   # SSH
   sudo ufw allow 80/tcp   # HTTP
   sudo ufw allow 443/tcp  # HTTPS
   ```

4. **Limita intentos de login** (agregar rate limiting)

5. **Mantén todo actualizado**
   ```bash
   sudo apt update && sudo apt upgrade -y
   npm update
   ```

6. **Backups regulares de la base de datos**
   ```bash
   mysqldump -u root -p proclean_erp > backup_$(date +%Y%m%d).sql
   ```

7. **Monitorea logs**
   ```bash
   pm2 logs
   sudo tail -f /var/log/nginx/proclean-error.log
   ```

---

## 📊 Comparación de Opciones

| Opción | Dificultad | Costo | HTTPS | Dominio Bonito | Mejor para |
|--------|------------|-------|-------|----------------|------------|
| IP Pública | Fácil | Gratis | ❌ | ❌ | Pruebas rápidas |
| DuckDNS | Fácil | Gratis | ✅ | ⚠️ Subdominio | Proyectos personales |
| Cloudflare Tunnel | Media | Gratis | ✅ | ⚠️ Subdominio | Proyectos sin port forward |
| ngrok | Muy fácil | Gratis* | ✅ | ❌ | Demos temporales |
| VPS | Media-Alta | $4-6/mes | ✅ | ✅ Tu dominio | Producción seria |

---

## 🎯 Mi Recomendación

**Para empezar (AHORA):**
1. Usa **DuckDNS** (gratis, fácil)
2. Configura **HTTPS con Let's Encrypt** (gratis)
3. Comparte: `https://proclean.duckdns.org`

**Para el futuro (si crece):**
1. Compra un dominio (.com ~$10/año)
2. Contrata VPS ($5/mes)
3. Dominio propio: `https://proclean.com`

---

## 🚀 Inicio Rápido (5 minutos)

```bash
# 1. Configurar DuckDNS
./setup-duckdns.sh

# 2. Configurar port forwarding en tu router
# (Desde 192.168.1.1 o similar)

# 3. Configurar HTTPS
sudo certbot --nginx -d tudominio.duckdns.org

# 4. ¡Listo! Comparte tu link:
echo "https://tudominio.duckdns.org"
```

---

## ❓ Preguntas Frecuentes

**P: ¿Mi portátil debe estar siempre encendido?**
R: Sí, si quieres que esté disponible 24/7. Para eso es mejor un VPS.

**P: ¿Es seguro exponer mi portátil a internet?**
R: Con las medidas de seguridad (HTTPS, firewall, contraseñas fuertes), sí. Pero un VPS es más seguro.

**P: ¿Cuántas personas pueden acceder simultáneamente?**
R: Depende de tu conexión. Con ADSL típico: 10-50 usuarios. Con fibra: 100+.

**P: ¿Qué pasa si mi IP cambia?**
R: DuckDNS se actualiza automáticamente cada 5 minutos.

**P: ¿Puedo usar mi propio dominio con DuckDNS?**
R: No, necesitas un VPS o usar Cloudflare Tunnel.

---

## 📚 Recursos Adicionales

- [DuckDNS Documentación](https://www.duckdns.org/spec.jsp)
- [Let's Encrypt](https://letsencrypt.org/)
- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [DigitalOcean Tutoriales](https://www.digitalocean.com/community/tutorials)
- [Nginx Docs](https://nginx.org/en/docs/)

