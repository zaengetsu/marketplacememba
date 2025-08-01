
# 🛒 MambaFit E-Commerce Platform

Plateforme e-commerce moderne, rapide et sécurisée, développée avec Vue.js 3, Node.js, PostgreSQL et MongoDB. Toutes les fonctionnalités essentielles sont en place : panier robuste, favoris, gestion d’images, paiement Stripe, facturation PDF, conformité RGPD, et dashboard admin avancé.

> **Statut :** Toutes les fonctionnalités principales sont terminées. **Il ne manque que la partie recherche et filtres avancés via MongoDB.**

---

## 👨‍💻 Auteurs

- **Leonce YOPA**
- **Ibrahim OUAHABI**

---


## 🚀 Fonctionnalités principales

### ✨ Frontend (Vue.js 3 + TypeScript)
- **Interface moderne** avec TailwindCSS
- **Gestion d'état** avec Pinia
- **Système de panier** robuste (réservation temporaire, suppression sécurisée, synchronisation locale)
- **Système de favoris** performant
- **Gestion universelle des images produits** (tous formats, fallback, SVG, etc.)
- **Dashboard admin** avec gestion des rôles
- **Modale de détail produit** interactive
- **Conformité RGPD** avec gestion des cookies
- **Affichage des factures** et téléchargement PDF
- **Page de confirmation de commande** après paiement
- **Sécurité renforcée** (vérification des IDs, gestion des erreurs)

### 🔧 Backend (Node.js + Express)
- **Architecture hybride** : PostgreSQL (données principales) + MongoDB (recherche avancée à venir)
- **Synchronisation automatique** PostgreSQL ↔ MongoDB
- **Système de rôles** : Admin, Store Keeper, Compta, User
- **API RESTful** complète avec validation
- **Authentification JWT** + sessions Redis
- **Intégration Stripe** pour les paiements
- **Webhook Stripe** pour confirmation de paiement
- **Génération automatique de factures PDF** après paiement
- **Envoi automatique de la facture par email** au client
- **Logs structurés** avec Winston

---

## 🗺️ Roadmap & Points Restants

- [x] Panier, favoris, paiement, facturation, images, sécurité, dashboard admin : **OK**
- [ ] **Recherche et filtres avancés via MongoDB** : _à finaliser_
  - Recherche full-text, filtres dynamiques, analytics produits

---

### 🗄️ Base de données
- **PostgreSQL** : Utilisateurs, Produits, Commandes, Factures
- **MongoDB** : Recherche full-text, cache, analytics
- **Redis** : Sessions, cache temporaire
- **Synchronisation temps réel** avec hooks Sequelize

---

## 🛠️ Lancer le projet (Guide rapide)

### 1. Cloner le projet
```bash
git clone <votre-repo>
cd marketplacememba
```

### 2. Configuration des bases de données

#### Avec Docker (Recommandé)
```bash
# Démarrer tous les services (PostgreSQL, MongoDB, Redis, backend)
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

# Copier la configuration d'exemple
cp env.example .env
# Éditer .env avec vos clés et infos (Stripe, DB, mail...)

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

# Copier la configuration d'exemple
cp env.example .env
# Éditer .env avec vos configurations

# Démarrer le serveur de développement
npm run dev
```

---

## 🔑 Configuration Stripe & Webhook

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

4. **Configurer le webhook Stripe** :
   - Lancer ngrok :  
     ```bash
     ngrok http 3000
     ```
   - Copier l'URL générée (ex: `https://xxxx.ngrok-free.app`)
   - Dans le dashboard Stripe, ajouter un endpoint webhook :  
     ```
     https://xxxx.ngrok-free.app/api/payments/webhook
     ```
   - Sélectionner l'événement `checkout.session.completed`

---

## 🧾 Fonctionnalités de paiement et facturation

- **Paiement sécurisé Stripe Checkout**
- **Webhook Stripe** pour confirmation de paiement
- **Création automatique de la facture** après paiement
- **Génération du PDF de la facture**
- **Envoi automatique de la facture par email** au client
- **Téléchargement de la facture depuis l'espace client**

---

## 👥 Comptes de démonstration

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@ecommerce.com | password123 | ROLE_ADMIN |
| john.doe@example.com | password123 | ROLE_USER |
| marie.martin@example.com | password123 | ROLE_USER |

---

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

---

## 📁 Structure du projet

```
marketplacememba/
├── backend/
│   ├── src/
│   │   ├── models/          # Modèles Sequelize & Mongoose
│   │   ├── routes/          # Routes API
│   │   ├── middlewares/     # Middlewares (auth, CORS, etc.)
│   │   ├── services/        # Services métier
│   │   ├── utils/           # Utilitaires
│   │   └── database/        # Configuration DB
│   ├── migrations/          # Migrations Sequelize
│   ├── seeders/             # Données de démonstration
│   └── env.example          # Configuration exemple
├── frontend/
│   ├── src/
│   │   ├── components/      # Composants Vue
│   │   ├── views/           # Pages
│   │   ├── stores/          # Stores Pinia
│   │   ├── services/        # Services API
│   │   ├── types/           # Types TypeScript
│   │   └── composables/     # Composables Vue
│   └── env.example          # Configuration exemple
└── docker-compose.yml       # Services Docker
```

---

## 🛠️ Conseils pour les futurs développeurs

- **Toujours utiliser le fichier `.env` pour les variables sensibles** (ne jamais commit de clé secrète dans le code).
- **Pour Stripe en local, utiliser ngrok** et mettre à jour l’URL du webhook à chaque redémarrage de ngrok.
- **Bien vérifier l’ordre des middlewares dans Express** pour Stripe (webhook AVANT le parseur JSON).
- **Pour toute modification de la structure DB, exécuter les migrations et seeds** :
  ```bash
  docker-compose exec ecommerce-backend npx sequelize-cli db:migrate
  docker-compose exec ecommerce-backend npx sequelize-cli db:seed:all
  ```
- **Consultez les logs backend pour tout problème de paiement, facture ou mail.**
- **Pour le support, ouvrez une issue GitHub ou contactez les auteurs.**

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

**Développé avec ❤️ par Leonce YOPA & Ibrahim OUAHABI**