#!/bin/bash

# Script de déploiement pour marketplace
# Ce script configure automatiquement les URLs pour différents environnements

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction d'aide
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --env ENV         Environnement (local|production|custom)"
    echo "  -f, --frontend URL    URL du frontend (ex: https://monsite.com)"
    echo "  -b, --backend URL     URL du backend (ex: https://api.monsite.com)"
    echo "  -h, --help           Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0 --env local                           # Configuration locale"
    echo "  $0 --env production -f https://monsite.com -b https://api.monsite.com"
    echo "  $0 --frontend https://test.com --backend https://api.test.com"
}

# Variables par défaut
ENV=""
FRONTEND_URL=""
BACKEND_URL=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env)
            ENV="$2"
            shift 2
            ;;
        -f|--frontend)
            FRONTEND_URL="$2"
            shift 2
            ;;
        -b|--backend)
            BACKEND_URL="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}Option inconnue: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Configuration par environnement
if [[ "$ENV" == "local" ]]; then
    FRONTEND_URL="http://localhost:5173"
    BACKEND_URL="http://localhost:4000"
    echo -e "${GREEN}Configuration pour l'environnement local${NC}"
elif [[ "$ENV" == "production" ]]; then
    if [[ -z "$FRONTEND_URL" || -z "$BACKEND_URL" ]]; then
        echo -e "${RED}Pour l'environnement production, vous devez spécifier --frontend et --backend${NC}"
        exit 1
    fi
    echo -e "${GREEN}Configuration pour l'environnement de production${NC}"
fi

# Vérification des URLs
if [[ -z "$FRONTEND_URL" || -z "$BACKEND_URL" ]]; then
    echo -e "${RED}Erreur: URLs du frontend et backend requises${NC}"
    show_help
    exit 1
fi

echo -e "${YELLOW}Frontend URL: $FRONTEND_URL${NC}"
echo -e "${YELLOW}Backend URL: $BACKEND_URL${NC}"

# Mise à jour du backend .env
echo -e "${GREEN}Mise à jour de backend/.env...${NC}"
if [[ -f "backend/.env" ]]; then
    sed -i.bak "s|FRONTEND_URL=.*|FRONTEND_URL=$FRONTEND_URL|g" backend/.env
    sed -i.bak "s|BACKEND_URL=.*|BACKEND_URL=$BACKEND_URL|g" backend/.env
    echo "✅ backend/.env mis à jour"
else
    echo -e "${RED}❌ Fichier backend/.env non trouvé${NC}"
    exit 1
fi

# Mise à jour du frontend .env
echo -e "${GREEN}Mise à jour de frontend/.env...${NC}"
if [[ -f "frontend/.env" ]]; then
    # Calculer l'URL de l'API (backend + /api)
    API_URL="${BACKEND_URL}/api"
    sed -i.bak "s|VITE_API_URL=.*|VITE_API_URL=$API_URL|g" frontend/.env
    sed -i.bak "s|VITE_BASE_URL=.*|VITE_BASE_URL=$FRONTEND_URL|g" frontend/.env
    echo "✅ frontend/.env mis à jour"
else
    echo -e "${RED}❌ Fichier frontend/.env non trouvé${NC}"
    exit 1
fi

# Mise à jour de docker-compose.yml
echo -e "${GREEN}Mise à jour de docker-compose.yml...${NC}"
if [[ -f "docker-compose.yml" ]]; then
    API_URL="${BACKEND_URL}/api"
    sed -i.bak "s|VITE_API_URL=.*|VITE_API_URL=$API_URL|g" docker-compose.yml
    sed -i.bak "s|- FRONTEND_URL=.*|- FRONTEND_URL=$FRONTEND_URL|g" docker-compose.yml
    sed -i.bak "s|- BACKEND_URL=.*|- BACKEND_URL=$BACKEND_URL|g" docker-compose.yml
    echo "✅ docker-compose.yml mis à jour"
else
    echo -e "${RED}❌ Fichier docker-compose.yml non trouvé${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Configuration terminée !${NC}"
echo ""
echo -e "${YELLOW}Prochaines étapes:${NC}"
echo "1. Vérifiez les fichiers .env"
echo "2. Redémarrez vos services Docker:"
echo "   ${GREEN}docker-compose down && docker-compose up -d${NC}"
echo "3. Ou redémarrez votre serveur si vous n'utilisez pas Docker"
