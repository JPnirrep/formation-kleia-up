#!/bin/bash
# =============================================================
# Script d'initialisation du VPS pour Kleia-up
# Plateforme e-learning - Déploiement sur OVH
# Usage: bash setup-vps.sh
# =============================================================
set -euo pipefail

# ─── Configuration ───────────────────────────────────────────
DOMAIN="formation.kleia-up.fr"
APP_DIR="/opt/kleia-up"
REPO_URL="git@github.com:kleia-up/formation-kleia-up.git"
IP_ADDRESS="135.125.53.215"

# ─── Couleurs pour les messages ──────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # Pas de couleur

log_info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ─── Vérification des privilèges ─────────────────────────────
if [ "$EUID" -ne 0 ]; then
    log_error "Ce script doit être exécuté en tant que root (sudo)."
    exit 1
fi

# ═════════════════════════════════════════════════════════════
# ÉTAPE 1 : Mise à jour du système
# ═════════════════════════════════════════════════════════════
log_info "Mise à jour du système..."
apt-get update && apt-get upgrade -y

# ═════════════════════════════════════════════════════════════
# ÉTAPE 2 : Installation de Docker
# ═════════════════════════════════════════════════════════════
log_info "Installation de Docker..."
if ! command -v docker &> /dev/null; then
    apt-get install -y ca-certificates curl gnupg lsb-release
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update && apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    log_info "Docker installé avec succès."
else
    log_info "Docker déjà installé."
fi

# ═════════════════════════════════════════════════════════════
# ÉTAPE 3 : Installation de Docker Compose (standalone)
# ═════════════════════════════════════════════════════════════
log_info "Installation de Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    apt-get install -y docker-compose-plugin
    log_info "Docker Compose installé avec succès."
else
    log_info "Docker Compose déjà installé."
fi

# ═════════════════════════════════════════════════════════════
# ÉTAPE 4 : Installation de Nginx et Certbot
# ═════════════════════════════════════════════════════════════
log_info "Installation de Nginx et Certbot..."
apt-get install -y nginx certbot python3-certbot-nginx
systemctl enable nginx
systemctl start nginx
log_info "Nginx et Certbot installés."

# ═════════════════════════════════════════════════════════════
# ÉTAPE 5 : Création du répertoire de l'application
# ═════════════════════════════════════════════════════════════
log_info "Création du répertoire de l'application..."
mkdir -p "$APP_DIR"
mkdir -p /var/www/certbot

# ═════════════════════════════════════════════════════════════
# ÉTAPE 6 : Clonage du dépôt Git
# ═════════════════════════════════════════════════════════════
log_info "Clonage du dépôt Git..."
if [ -d "$APP_DIR/.git" ]; then
    log_info "Dépôt déjà cloné. Mise à jour..."
    cd "$APP_DIR" && git pull origin main
else
    # NOTE: Configurez votre clé SSH deploy dans ~/.ssh avant d'exécuter ce script
    git clone "$REPO_URL" "$APP_DIR"
fi

# ═════════════════════════════════════════════════════════════
# ÉTAPE 7 : Configuration du fichier .env
# ═════════════════════════════════════════════════════════════
log_info "Configuration des variables d'environnement..."
if [ ! -f "$APP_DIR/deploy/.env" ]; then
    cp "$APP_DIR/deploy/.env.template" "$APP_DIR/deploy/.env"
    log_warn "⚠ Fichier .env créé à partir du template."
    log_warn "⚠ Veuillez éditer $APP_DIR/deploy/.env avec les vraies valeurs."
else
    log_info "Fichier .env déjà présent."
fi

# ═════════════════════════════════════════════════════════════
# ÉTAPE 8 : Configuration du pare-feu (UFW)
# ═════════════════════════════════════════════════════════════
log_info "Configuration du pare-feu..."
if command -v ufw &> /dev/null; then
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow 22/tcp comment "SSH"
    ufw allow 80/tcp comment "HTTP"
    ufw allow 443/tcp comment "HTTPS"
    ufw --force enable
    log_info "Pare-feu configuré."
else
    log_warn "UFW non installé. Installation..."
    apt-get install -y ufw
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow 22/tcp comment "SSH"
    ufw allow 80/tcp comment "HTTP"
    ufw allow 443/tcp comment "HTTPS"
    ufw --force enable
    log_info "Pare-feu installé et configuré."
fi

# ═════════════════════════════════════════════════════════════
# ÉTAPE 9 : Démarrage des services Docker
# ═════════════════════════════════════════════════════════════
log_info "Démarrage des services Docker..."
cd "$APP_DIR"
docker-compose -f deploy/docker-compose.yml up -d --build

# ═════════════════════════════════════════════════════════════
# ÉTAPE 10 : Configuration SSL avec Certbot
# ═════════════════════════════════════════════════════════════
log_info "Configuration SSL avec Certbot..."
# Configuration Nginx temporaire pour le challenge ACME
cat > /etc/nginx/sites-available/kleia-up << 'NGINX_CONF'
server {
    listen 80;
    server_name formation.kleia-up.fr;
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    location / {
        return 200 "Kleia-up - En attente de configuration SSL...";
    }
}
NGINX_CONF

ln -sf /etc/nginx/sites-available/kleia-up /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Obtention du certificat SSL
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email admin@kleia-up.fr || {
    log_warn "⚠ Certbot n'a pas pu obtenir le certificat automatiquement."
    log_warn "  Vérifiez que le DNS pointe bien vers $IP_ADDRESS"
    log_warn "  Commande manuelle : certbot --nginx -d $DOMAIN"
}

# ═════════════════════════════════════════════════════════════
# FIN
# ═════════════════════════════════════════════════════════════
log_info "════════════════════════════════════════════════════"
log_info "✅ Initialisation du VPS terminée !"
log_info ""
log_info "📌 Prochaines étapes :"
log_info "  1. Éditez le fichier .env : nano $APP_DIR/deploy/.env"
log_info "  2. Redémarrez les services : docker-compose -f $APP_DIR/deploy/docker-compose.yml up -d --build"
log_info "  3. Vérifiez l'état : docker-compose -f $APP_DIR/deploy/docker-compose.yml ps"
log_info "  4. Accédez au site : https://$DOMAIN"
log_info "════════════════════════════════════════════════════"