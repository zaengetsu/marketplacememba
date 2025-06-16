#!/bin/bash

echo "🚀 Démarrage de l'environnement de développement local..."

# Vérifier que les fichiers .env existent
if [ ! -f "backend/.env" ]; then
    echo "❌ Fichier backend/.env manquant !"
    echo "📝 Consultez le GUIDE-DEMARRAGE-LOCAL.md pour le créer"
    exit 1
fi

if [ ! -f "frontend/.env" ]; then
    echo "❌ Fichier frontend/.env manquant !"
    echo "📝 Consultez le GUIDE-DEMARRAGE-LOCAL.md pour le créer"
    exit 1
fi

# Vérifier que les services sont démarrés
echo "🔍 Vérification des services..."

# PostgreSQL
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "❌ PostgreSQL n'est pas démarré"
    echo "💡 Lancez : brew services start postgresql@15"
    exit 1
fi

# Redis
if ! redis-cli ping > /dev/null 2>&1; then
    echo "❌ Redis n'est pas démarré"
    echo "💡 Lancez : brew services start redis"
    exit 1
fi

# MongoDB
if ! mongo --eval "quit()" > /dev/null 2>&1; then
    echo "⚠️  MongoDB n'est pas accessible (optionnel)"
fi

echo "✅ Services vérifiés !"

# Installation des dépendances si nécessaire
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installation des dépendances backend..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installation des dépendances frontend..."
    cd frontend && npm install && cd ..
fi

echo "🎯 Démarrage des applications..."
echo "📍 Backend : http://localhost:3000"
echo "📍 Frontend : http://localhost:5173"
echo "📍 API Health : http://localhost:3000/api/health"
echo ""
echo "🔧 Pour arrêter : Ctrl+C dans chaque terminal"
echo ""

# Démarrer en mode développement
echo "Ouvrez 2 terminaux supplémentaires et lancez :"
echo "Terminal 1: cd backend && npm run dev"
echo "Terminal 2: cd frontend && npm run dev" 