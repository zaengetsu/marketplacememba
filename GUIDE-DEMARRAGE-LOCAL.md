# 🚀 Guide de Démarrage Local - E-Commerce

## 🔍 Problèmes identifiés et résolus

### ✅ Problèmes corrigés automatiquement :
- **Configuration Vite** : Le proxy pointe maintenant vers `http://localhost:3000` au lieu de l'URL Docker
- **Architecture backend/frontend** : Routes d'authentification et produits vérifiées

### 🔧 Actions requises de votre part :

## 1. Configuration des fichiers .env

### Backend (.env dans /backend/)
```bash
NODE_ENV=development
PORT=3000

# BASES DE DONNÉES - LOCAL
DATABASE_URL=postgres://postgres:password123@localhost:5432/ecommerce
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce
DB_USER=postgres
DB_PASSWORD=password123

MONGODB_URI=mongodb://localhost:27017/ecommerce
REDIS_URL=redis://localhost:6379

# SÉCURITÉ
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
SESSION_SECRET=your-super-secret-session-key-change-in-production
COOKIE_SECRET=your-super-secret-cookie-key

# RATE LIMITING
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# FRONTEND
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env dans /frontend/)
```bash
# API Backend
VITE_API_URL=http://localhost:3000/api

# PAIEMENTS STRIPE
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key_here

# CONFIGURATION APP
VITE_APP_NAME=E-Commerce Platform
VITE_BASE_URL=http://localhost:5173

# DÉVELOPPEMENT
VITE_DEV_MODE=true
VITE_LOG_LEVEL=info
```

## 2. Installation des bases de données

### Option A : Script automatique (macOS)
```bash
./setup-databases.sh
```

### Option B : Installation manuelle

#### PostgreSQL
```bash
brew install postgresql@15
brew services start postgresql@15
createdb ecommerce
```

#### MongoDB
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Redis
```bash
brew install redis
brew services start redis
```

## 3. Démarrage de l'application

### Terminal 1 - Backend
```bash
cd backend
npm install
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install
npm run dev
```

## 4. Vérification

### URLs d'accès :
- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3000/api
- **Health Check** : http://localhost:3000/api/health

### Test de connexion :
1. Ouvrez http://localhost:5173
2. Testez l'inscription d'un utilisateur
3. Testez la connexion
4. Vérifiez que les produits s'affichent

## 🔧 Diagnostics

### Si l'authentification ne fonctionne pas :
1. Vérifiez que Redis fonctionne : `redis-cli ping`
2. Vérifiez les logs du backend
3. Vérifiez que les cookies sont bien définis dans le navigateur

### Si les produits ne s'affichent pas :
1. Vérifiez que PostgreSQL fonctionne : `psql -d ecommerce -c "SELECT 1;"`
2. Vérifiez les migrations : `cd backend && npm run migrate`
3. Vérifiez les données de test : `cd backend && npm run seed`

### Logs utiles :
```bash
# Backend logs
tail -f backend/logs/app.log

# Vérifier les services
brew services list | grep -E "(postgresql|mongodb|redis)"
```

## 🆘 Support

Si vous rencontrez encore des problèmes :
1. Vérifiez que tous les services sont démarrés
2. Regardez les logs des terminaux backend/frontend
3. Vérifiez la console du navigateur (F12)

## 📝 Notes importantes

- Les configurations Docker ne sont pas utilisées en mode local
- Les URLs pointent vers localhost:3000 et localhost:5173
- Les bases de données doivent tourner en local
- Les fichiers .env sont requis pour le fonctionnement 