# 🛒 E-Commerce Platform - Vue.js & Node.js

Une plateforme e-commerce complète avec architecture hybride PostgreSQL + MongoDB, système de rôles avancé, et conformité RGPD.

## 🚀 Fonctionnalités

### ✨ Frontend (Vue.js 3 + TypeScript)
- **Interface moderne** avec TailwindCSS
- **Gestion d'état** avec Pinia
- **Système de panier** avec réservation temporaire (15 min)
- **Recherche et filtres** avancés
- **Dashboard admin** avec gestion des rôles
- **Modale de détail produit** interactive
- **Conformité RGPD** avec gestion des cookies

### 🔧 Backend (Node.js + Express)
- **Architecture hybride** : PostgreSQL (données principales) + MongoDB (recherche)
- **Synchronisation automatique** PostgreSQL ↔ MongoDB
- **Système de rôles** : Admin, Store Keeper, Compta, User
- **API RESTful** complète avec validation
- **Authentification JWT** + sessions Redis
- **Intégration Stripe** pour les paiements
- **Logs structurés** avec Winston

### 🗄️ Base de données
- **PostgreSQL** : Utilisateurs, Produits, Commandes, Factures
- **MongoDB** : Recherche full-text, cache, analytics
- **Redis** : Sessions, cache temporaire
- **Synchronisation temps réel** avec hooks Sequelize

## 📋 Prérequis

- **Node.js** 18+ 
- **PostgreSQL** 14+
- **MongoDB** 6+
- **Redis** 7+
- **Docker** (optionnel)

## 🛠️ Installation

### 1. Cloner le projet
```bash
git clone <votre-repo>
cd VUEJS
```

### 2. Configuration des bases de données

#### Avec Docker (Recommandé)
```bash
# Démarrer PostgreSQL, MongoDB et Redis
docker-compose up -d
```

#### Installation manuelle
- PostgreSQL : Créer une base `ecommerce`
- MongoDB : Démarrer sur le port 27017
- Redis : Démarrer sur le port 6379

### 3. Configuration Backend

```bash
cd backend

# Installer les dépendances
npm install

# Configurer l'environnement
cp env.example .env
# Éditer .env avec vos configurations

# Exécuter les migrations
npx sequelize-cli db:migrate

# Insérer les données de démonstration
npx sequelize-cli db:seed:all

# Démarrer le serveur
npm run dev
```

### 4. Configuration Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Configurer l'environnement
cp env.example .env
# Éditer .env avec vos configurations

# Démarrer le serveur de développement
npm run dev
```

## 🔑 Configuration Stripe

1. Créer un compte sur [Stripe](https://stripe.com)
2. Récupérer vos clés API
3. Configurer dans les fichiers `.env` :

**Backend (.env)**
```env
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret
```

**Frontend (.env)**
```env
VITE_STRIPE_PUBLIC_KEY=pk_test_votre_cle_publique
```

## 👥 Comptes de démonstration

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@ecommerce.com | password123 | ROLE_ADMIN |
| john.doe@example.com | password123 | ROLE_USER |
| marie.martin@example.com | password123 | ROLE_USER |

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Databases     │
│   Vue.js 3      │◄──►│   Node.js       │◄──►│   PostgreSQL    │
│   TypeScript    │    │   Express       │    │   MongoDB       │
│   Pinia         │    │   Sequelize     │    │   Redis         │
│   TailwindCSS   │    │   JWT + Redis   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Synchronisation des données
```
PostgreSQL (Source de vérité)
     ↓ Hooks Sequelize
MongoDB (Recherche + Cache)
     ↓ Index full-text
Frontend (Recherche rapide)
```

## 📁 Structure du projet

```
VUEJS/
├── backend/
│   ├── src/
│   │   ├── models/          # Modèles Sequelize & Mongoose
│   │   ├── routes/          # Routes API
│   │   ├── middlewares/     # Middlewares (auth, CORS, etc.)
│   │   ├── services/        # Services métier
│   │   ├── utils/           # Utilitaires
│   │   └── database/        # Configuration DB
│   ├── migrations/          # Migrations Sequelize
│   ├── seeders/            # Données de démonstration
│   └── env.example         # Configuration exemple
├── frontend/
│   ├── src/
│   │   ├── components/      # Composants Vue
│   │   ├── views/          # Pages
│   │   ├── stores/         # Stores Pinia
│   │   ├── services/       # Services API
│   │   ├── types/          # Types TypeScript
│   │   └── composables/    # Composables Vue
│   └── env.example         # Configuration exemple
└── docker-compose.yml      # Services Docker
```

## 🔐 Système de permissions

| Rôle | Produits | Utilisateurs | Commandes | Factures | Analytics |
|------|----------|--------------|-----------|----------|-----------|
| **ROLE_ADMIN** | ✅ CRUD | ✅ CRUD | ✅ CRUD | ✅ CRUD | ✅ Toutes |
| **ROLE_STORE_KEEPER** | ✅ CRUD | ❌ | ✅ Lecture | ❌ | ❌ |
| **ROLE_COMPTA** | ❌ | ❌ | ✅ Lecture | ✅ CRUD | ✅ Financières |
| **ROLE_USER** | ✅ Lecture | ❌ | ✅ Ses commandes | ❌ | ❌ |

## 🛒 Fonctionnalités du panier

- **Réservation temporaire** : 15 minutes par défaut
- **Vérification de stock** en temps réel
- **Persistance** localStorage + session backend
- **Nettoyage automatique** des réservations expirées

## 📊 Monitoring et logs

- **Winston** pour les logs structurés
- **Statistiques** de synchronisation
- **Métriques** de performance
- **Alertes** de stock faible

## 🔒 Sécurité et RGPD

- **Chiffrement** des mots de passe (bcrypt)
- **Validation** des données (Joi/Zod)
- **Rate limiting** anti-spam
- **Headers de sécurité** (Helmet)
- **Gestion des cookies** conforme RGPD
- **Droit à l'oubli** implémenté

## 🚀 Déploiement

### Variables d'environnement production

**Backend**
```env
NODE_ENV=production
JWT_SECRET=votre-secret-jwt-super-securise
SESSION_SECRET=votre-secret-session-super-securise
DATABASE_URL=postgresql://user:pass@host:5432/db
MONGODB_URI=mongodb://host:27017/db
REDIS_URL=redis://host:6379
STRIPE_SECRET_KEY=sk_live_votre_cle_live
```

**Frontend**
```env
VITE_API_URL=https://votre-api.com/api
VITE_STRIPE_PUBLIC_KEY=pk_live_votre_cle_publique_live
```

### Docker Production
```bash
# Build et déploiement
docker-compose -f docker-compose.prod.yml up -d
```

## 📚 API Documentation

### Endpoints principaux

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/api/products` | Liste des produits | Public |
| `POST` | `/api/products` | Créer un produit | Admin/Store |
| `GET` | `/api/cart` | Récupérer le panier | Session |
| `POST` | `/api/cart/add` | Ajouter au panier | Session |
| `POST` | `/api/auth/login` | Connexion | Public |
| `GET` | `/api/admin/stats` | Statistiques | Admin |

### Exemples d'utilisation

```javascript
// Récupérer les produits avec filtres
const products = await productService.getProducts({
  category: 'electronique',
  search: 'iPhone',
  minPrice: 100,
  maxPrice: 2000,
  onSale: true,
  page: 1,
  limit: 12
})

// Ajouter au panier
await cartService.addToCart('product-id', 2)
```

## 🐛 Dépannage

### Problèmes courants

**Erreur de connexion PostgreSQL**
```bash
# Vérifier que PostgreSQL est démarré
sudo service postgresql status

# Créer la base de données
createdb ecommerce
```

**Erreur de synchronisation MongoDB**
```bash
# Vérifier la connexion MongoDB
mongosh mongodb://localhost:27017/ecommerce_search

# Relancer la synchronisation
npm run sync:force
```

**Erreur Redis**
```bash
# Démarrer Redis
redis-server

# Vérifier la connexion
redis-cli ping
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit (`git commit -am 'Ajouter nouvelle fonctionnalité'`)
4. Push (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

- **Issues** : [GitHub Issues](https://github.com/votre-repo/issues)
- **Documentation** : [Wiki](https://github.com/votre-repo/wiki)
- **Email** : support@votre-domaine.com

---

**Développé avec ❤️ par [Votre Nom]** 