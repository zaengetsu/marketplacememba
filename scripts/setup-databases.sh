#!/bin/bash

echo "🔧 Configuration des bases de données locales pour le développement..."

# Vérifier si Homebrew est installé
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew n'est pas installé. Installez-le d'abord : https://brew.sh"
    exit 1
fi

# Installer PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "📦 Installation de PostgreSQL..."
    brew install postgresql@15
    brew services start postgresql@15
else
    echo "✅ PostgreSQL est déjà installé"
fi

# Installer MongoDB
if ! command -v mongod &> /dev/null; then
    echo "📦 Installation de MongoDB..."
    brew tap mongodb/brew
    brew install mongodb-community
    brew services start mongodb-community
else
    echo "✅ MongoDB est déjà installé"
fi

# Installer Redis
if ! command -v redis-server &> /dev/null; then
    echo "📦 Installation de Redis..."
    brew install redis
    brew services start redis
else
    echo "✅ Redis est déjà installé"
fi

# Créer la base de données PostgreSQL
echo "🗄️ Création de la base de données ecommerce..."
createdb ecommerce 2>/dev/null || echo "Base de données ecommerce existe déjà"

echo "✅ Configuration terminée !"
echo ""
echo "🚀 Pour démarrer l'application :"
echo "   1. cd backend && npm run dev"
echo "   2. cd frontend && npm run dev" 