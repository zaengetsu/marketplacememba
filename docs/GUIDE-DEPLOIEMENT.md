# 🚀 Guide de Déploiement - URLs Dynamiques

Ce projet a été refactorisé pour utiliser des variables d'environnement au lieu d'URLs hardcodées. Cela facilite grandement le déploiement sur différents environnements.

## 📋 Variables d'environnement importantes

### Backend (.env)
```bash
FRONTEND_URL=http://localhost:5173    # URL du frontend
BACKEND_URL=http://localhost:4000     # URL du backend (pour les emails/images)
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:4000/api  # URL de l'API backend
VITE_BASE_URL=http://localhost:5173     # URL de base du frontend
```

## 🛠️ Déploiement rapide

### Option 1: Script automatique (recommandé)

**Windows (PowerShell):**
```powershell
# Configuration locale
.\deploy-config.ps1 -env local

# Configuration production
.\deploy-config.ps1 -env production -frontend https://monsite.com -backend https://api.monsite.com

# Configuration personnalisée
.\deploy-config.ps1 -frontend https://test.com -backend https://api.test.com
```

**Linux/Mac (Bash):**
```bash
# Configuration locale
./deploy-config.sh --env local

# Configuration production
./deploy-config.sh --env production --frontend https://monsite.com --backend https://api.monsite.com

# Configuration personnalisée
./deploy-config.sh --frontend https://test.com --backend https://api.test.com
```

### Option 2: Configuration manuelle

#### 1. Backend (.env)
```bash
# Remplacez par vos URLs de production
FRONTEND_URL=https://votre-domaine.com
BACKEND_URL=https://api.votre-domaine.com
```

#### 2. Frontend (.env)
```bash
# Remplacez par vos URLs de production
VITE_API_URL=https://api.votre-domaine.com/api
VITE_BASE_URL=https://votre-domaine.com
```

#### 3. Docker Compose (si utilisé)
```yaml
environment:
  - FRONTEND_URL=https://votre-domaine.com
  - BACKEND_URL=https://api.votre-domaine.com
  - VITE_API_URL=https://api.votre-domaine.com/api
```

## 🚀 Déploiement sur VPS

### 1. Préparation
```bash
# Sur votre machine locale
npm run build  # Dans le dossier frontend
```

### 2. Copie vers le VPS
```bash
# Exemple avec scp
scp -r . user@votre-vps:/path/to/app/

# Ou avec rsync (plus efficace)
rsync -av --exclude node_modules --exclude .git . user@votre-vps:/path/to/app/
```

### 3. Configuration sur le VPS
```bash
# Sur le VPS
cd /path/to/app

# Configuration pour production
./deploy-config.sh --env production --frontend https://yourdomain.com --backend https://api.yourdomain.com

# Installation des dépendances
cd backend && npm install --production
cd ../frontend && npm install && npm run build

# Redémarrage avec Docker
docker-compose down && docker-compose up -d

# Ou redémarrage avec PM2
pm2 restart all
```

## 🔧 Cas d'usage courants

### Développement local
```bash
./deploy-config.sh --env local
```
- Frontend: http://localhost:5173
- Backend: http://localhost:4000

### Serveur de test
```bash
./deploy-config.sh --frontend https://test.monsite.com --backend https://api-test.monsite.com
```

### Production
```bash
./deploy-config.sh --env production --frontend https://monsite.com --backend https://api.monsite.com
```

### Changement de port sur VPS
```bash
# Si votre VPS utilise un port différent
./deploy-config.sh --frontend https://monsite.com:8080 --backend https://monsite.com:4000
```

## 📁 Fichiers modifiés par la refactorisation

### Backend
- `src/routes/payments.js` - URLs Stripe checkout
- `src/services/emailService.js` - URLs dans les emails
- `.env` - Variables d'environnement

### Frontend
- `src/views/ResetPassword.vue` - API calls
- `src/views/admin/AdminProductForm.vue` - API calls
- `src/utils/image.ts` - URLs des images
- `.env` - Variables d'environnement

### Configuration
- `docker-compose.yml` - Variables d'environnement Docker
- Nouveaux scripts de déploiement

## ⚠️ Points d'attention

1. **CORS**: Assurez-vous que votre backend accepte les requêtes depuis votre domaine frontend
2. **HTTPS**: En production, utilisez toujours HTTPS
3. **Variables sensibles**: Ne commitez jamais vos clés API en production
4. **Backup**: Sauvegardez vos fichiers .env avant modification

## 🐳 Docker en production

Pour utiliser Docker en production avec des URLs personnalisées:

```yaml
# docker-compose.prod.yml
services:
  backend:
    environment:
      - FRONTEND_URL=https://votre-domaine.com
      - BACKEND_URL=https://api.votre-domaine.com
  
  frontend:
    environment:
      - VITE_API_URL=https://api.votre-domaine.com/api
      - VITE_BASE_URL=https://votre-domaine.com
```

Puis:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🔍 Vérification

Après déploiement, vérifiez:
1. Les emails contiennent les bonnes URLs
2. Stripe redirige vers les bonnes pages
3. Les images s'affichent correctement
4. L'API est accessible depuis le frontend

## 📞 Support

Si vous rencontrez des problèmes:
1. Vérifiez les logs: `docker-compose logs` ou `pm2 logs`
2. Vérifiez que les variables d'environnement sont bien définies
3. Testez les URLs manuellement dans le navigateur
