# 🛒 E-Commerce Platform - MambaFit

Plateforme e-commerce moderne construite avec Vue.js 3, TypeScript, Node.js, PostgreSQL, MongoDB et Redis.

## 🚀 Configuration rapide pour le VPS

### Ports configurés pour la production :
- **Frontend** : Port 8080
- **Backend API** : Port 8000  
- **PostgreSQL** : Port 5432
- **MongoDB** : Port 27017
- **Redis** : Port 6379
- **Nginx** : Ports 80/443

## 📦 Technologies utilisées

### Frontend
- ✅ **Vue.js 3** - Framework principal
- ✅ **TypeScript** - Types statiques
- ✅ **Pinia** - Gestion d'état moderne
- ✅ **Vue Router** - Routing SPA
- ✅ **Tailwind CSS** - Framework CSS
- ✅ **Vite** - Build tool moderne
- ✅ **Axios** - Client HTTP
- ✅ **Vue Toastification** - Notifications

### Backend
- ✅ **Node.js + Express** - Serveur web
- ✅ **PostgreSQL + Sequelize** - Base de données principale
- ✅ **MongoDB + Mongoose** - Recherche et cache
- ✅ **Redis** - Sessions et cache
- ✅ **JWT** - Authentification
- ✅ **Stripe** - Paiements
- ✅ **Nodemailer** - Emails
- ✅ **Winston** - Logging

### DevOps
- ✅ **Docker + Docker Compose** - Conteneurisation
- ✅ **Nginx** - Reverse proxy et SSL
- ✅ **Multi-stage builds** - Images optimisées

## 🔧 Installation locale

### Prérequis
- Node.js 18+
- Docker et Docker Compose
- Git

### Démarrage rapide
```bash
# Cloner le projet
git clone <your-repo-url>
cd marketplacememba

# Démarrer avec Docker
docker-compose up -d

# Ou installation manuelle
cd backend && npm install
cd ../frontend && npm install

# Démarrer en mode développement
npm run dev
```

## 🌐 Déploiement sur VPS

### 1. Configuration des variables d'environnement

Copiez et configurez les fichiers d'environnement :

```bash
# Fichier principal de production
cp .env.production.example .env.production

# Configuration backend
cp backend/.env.production.example backend/.env.production

# Configuration frontend  
cp frontend/.env.production.example frontend/.env.production
```

### 2. Personnalisation obligatoire

Dans `.env.production`, modifiez :
```bash
# Votre domaine
DOMAIN=votre-domaine.com

# Ports (déjà configurés pour le VPS)
BACKEND_PORT=8000
FRONTEND_PORT=8080

# Mots de passe sécurisés
DB_PASSWORD=votre_mot_de_passe_securise
MONGO_PASSWORD=votre_mot_de_passe_mongo_securise

# Stripe LIVE (production)
VITE_STRIPE_PUBLIC_KEY=pk_live_votre_cle_publique_stripe
```

Dans `backend/.env.production`, modifiez :
```bash
# JWT et sécurité (générér des clés aléatoires)
JWT_SECRET=votre-cle-jwt-super-securisee-256-bits
SESSION_SECRET=votre-cle-session-super-securisee
COOKIE_SECRET=votre-cle-cookie-super-securisee

# Email production
MAIL_USER=votre-email@gmail.com
MAIL_PASSWORD=votre-mot-de-passe-app

# Stripe LIVE
STRIPE_SECRET_KEY=sk_live_votre_cle_secrete_stripe
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret_stripe
```

### 3. Déploiement automatique

**Sur Windows (PowerShell) :**
```powershell
./deploy-production.ps1
```

**Sur Linux/Mac :**
```bash
chmod +x deploy-production.sh
./deploy-production.sh
```

### 4. Configuration SSL (Let's Encrypt)

Après le déploiement, configurez SSL :

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir le certificat SSL
sudo certbot --nginx -d votre-domaine.com

# Renouvellement automatique
sudo crontab -e
# Ajouter : 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔍 Vérification des dépendances

Pour vérifier que toutes les dépendances sont présentes :

```powershell
./check-dependencies.ps1
```

## 📱 URLs de l'application

### Développement
- Frontend : http://localhost:5173
- Backend API : http://localhost:3000/api

### Production (VPS)
- Frontend : https://votre-domaine.com
- Backend API : https://votre-domaine.com/api
- Admin : https://votre-domaine.com/admin

## 🛠️ Commandes utiles

### Développement
```bash
# Logs en temps réel
docker-compose logs -f

# Redémarrer un service
docker-compose restart backend

# Rebuild complet
docker-compose down && docker-compose up --build
```

### Production
```bash
# Voir les logs
docker-compose -f docker-compose.prod.yml logs -f

# Redémarrer
docker-compose -f docker-compose.prod.yml restart

# Mise à jour de l'application
./deploy-production.ps1
```

## 🔐 Sécurité

### Points de sécurité configurés :
- ✅ HTTPS obligatoire en production
- ✅ Headers de sécurité (HSTS, CSP, etc.)
- ✅ Rate limiting sur les APIs
- ✅ Validation des données avec Joi
- ✅ Authentification JWT sécurisée
- ✅ Sessions Redis sécurisées
- ✅ Mots de passe hashés avec bcrypt
- ✅ CORS configuré
- ✅ Helmet.js pour les headers

### À faire après déploiement :
- [ ] Configurer la sauvegarde automatique des bases de données
- [ ] Mettre en place la surveillance (monitoring)
- [ ] Configurer les alertes email
- [ ] Tester les paiements Stripe en mode LIVE

## 📊 Monitoring et logs

### Logs disponibles :
- Application : `docker-compose logs`
- Nginx : `/var/log/nginx/`
- Backend : `backend/logs/`

### Métriques importantes :
- Santé des conteneurs : `docker-compose ps`
- Utilisation ressources : `docker stats`
- Logs erreurs : `docker-compose logs | grep ERROR`

## 🆘 Dépannage

### Problèmes courants :

**Port déjà utilisé :**
```bash
# Voir les ports utilisés
netstat -tulpn | grep :8000

# Arrêter les conteneurs
docker-compose down
```

**Problème de permissions :**
```bash
# Corriger les permissions
sudo chown -R $USER:$USER .
```

**Base de données non accessible :**
```bash
# Redémarrer les services de base de données
docker-compose restart postgres mongodb redis
```

## 📞 Support

Pour toute question ou problème :
1. Vérifiez les logs : `docker-compose logs`
2. Consultez ce README
3. Vérifiez la configuration des ports
4. Assurez-vous que les variables d'environnement sont correctes

---

**🎯 Votre application est maintenant prête pour le VPS avec les ports configurés (Backend: 8000, Frontend: 8080) !**
