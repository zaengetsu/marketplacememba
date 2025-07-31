# 🚀 Guide de Déploiement VPS

Ce guide vous explique comment déployer l'application sur votre VPS.

## 📋 Prérequis

### Sur votre machine locale :
- PowerShell
- SSH configuré avec votre clé privée
- rsync installé (via Git Bash ou WSL)

### Sur le VPS (Ubuntu) :
- Docker et Docker Compose installés
- Ports 8001 et 8002 ouverts
- Utilisateur `ubuntu` avec accès sudo

## 🔧 Configuration Initiale

### 1. Configuration des URLs

```powershell
# Configuration automatique pour votre VPS
.\deploy-config.ps1 -frontend "http://162.19.78.55:8002" -backend "http://162.19.78.55:8001"
```

### 2. Vérification des fichiers .env

Vérifiez que les URLs ont été mises à jour dans :
- `backend/.env` : `FRONTEND_URL` et `BACKEND_URL`
- `frontend/.env` : `VITE_API_URL` et `VITE_BASE_URL`

## 🚀 Déploiement

### Déploiement complet (première fois)

```powershell
# Déploiement avec construction des images
.\deploy-to-vps.ps1
```

### Déploiement rapide (mise à jour code uniquement)

```powershell
# Déploiement sans reconstruction des images Docker
.\deploy-to-vps.ps1 -skipBuild
```

### Test avant déploiement

```powershell
# Simulation sans exécution
.\deploy-to-vps.ps1 -dryRun
```

## 🔍 Surveillance et Maintenance

### Connexion SSH au serveur

```bash
ssh ubuntu@162.19.78.55
```

### Commandes utiles sur le serveur

```bash
# Aller dans le répertoire de l'application
cd /home/ubuntu/marketplacememba

# Voir l'état des services
docker-compose ps

# Voir les logs en temps réel
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend

# Redémarrer tous les services
docker-compose restart

# Redémarrer un service spécifique
docker-compose restart backend

# Arrêter tous les services
docker-compose down

# Démarrer tous les services
docker-compose up -d

# Reconstruire et redémarrer
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Monitoring de l'espace disque

```bash
# Vérifier l'espace disque
df -h

# Nettoyer les images Docker inutilisées
docker system prune -f

# Nettoyer complètement Docker (attention !)
docker system prune -a -f
```

## 🌐 URLs de l'Application

- **Frontend** : http://162.19.78.55:8002
- **Backend API** : http://162.19.78.55:8001/api
- **Health Check** : http://162.19.78.55:8001/api/health

## 🔧 Résolution de Problèmes

### Service ne démarre pas

```bash
# Vérifier les logs
docker-compose logs [service-name]

# Vérifier l'état des conteneurs
docker ps -a

# Vérifier l'espace disque
df -h
```

### Base de données

```bash
# Se connecter à PostgreSQL
docker-compose exec postgres psql -U postgres -d ecommerce

# Sauvegarder la base de données
docker-compose exec postgres pg_dump -U postgres ecommerce > backup.sql

# Restaurer la base de données
cat backup.sql | docker-compose exec -T postgres psql -U postgres -d ecommerce
```

### Problèmes de réseau

```bash
# Vérifier que les ports sont ouverts
sudo ufw status
sudo netstat -tlnp | grep :8001
sudo netstat -tlnp | grep :8002

# Tester la connectivité locale
curl http://localhost:8001/api/health
curl http://localhost:8002
```

## 🔄 Mise à Jour

### Mise à jour du code

1. Commitez vos changements localement
2. Exécutez le script de déploiement :

```powershell
.\deploy-to-vps.ps1 -skipBuild  # Si pas de changement Docker
# ou
.\deploy-to-vps.ps1              # Si changement Docker
```

### Mise à jour des dépendances

```bash
# Sur le serveur
cd /home/ubuntu/marketplacememba
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 🔐 Sécurité

### Changement des mots de passe

1. Modifiez les mots de passe dans `backend/.env`
2. Redéployez l'application
3. Les bases de données utiliseront les nouveaux mots de passe

### HTTPS (recommandé pour la production)

Pour activer HTTPS, vous devrez :
1. Obtenir un certificat SSL (Let's Encrypt recommandé)
2. Configurer un reverse proxy (Nginx)
3. Modifier les URLs dans les fichiers .env

## 📞 Support

En cas de problème :
1. Vérifiez les logs : `docker-compose logs`
2. Vérifiez l'état des services : `docker-compose ps`
3. Vérifiez l'espace disque : `df -h`
4. Redémarrez les services : `docker-compose restart`
