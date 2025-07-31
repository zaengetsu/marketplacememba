# Script de déploiement vers VPS
# Supprime les node_modules et déploie via SCP

param(
    [string]$vpsHost = "162.19.78.55",
    [string]$vpsUser = "ubuntu",
    [string]$remotePath = "/home/ubuntu/marketplacememba",
    [switch]$help,
    [switch]$dryRun
)

function Show-Help {
    Write-Host "Usage: .\deploy-to-vps.ps1 [OPTIONS]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -vpsHost HOST     Adresse IP du VPS (défaut: 162.19.78.55)"
    Write-Host "  -vpsUser USER     Utilisateur SSH (défaut: ubuntu)"
    Write-Host "  -remotePath PATH  Chemin distant (défaut: /home/ubuntu/marketplacememba)"
    Write-Host "  -dryRun          Simulation sans envoi"
    Write-Host "  -help            Afficher cette aide"
    Write-Host ""
    Write-Host "Exemple:"
    Write-Host "  .\deploy-to-vps.ps1"
    Write-Host "  .\deploy-to-vps.ps1 -dryRun"
}

if ($help) {
    Show-Help
    exit 0
}

Write-Host "🚀 DÉPLOIEMENT VERS VPS" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host "VPS: $vpsUser@$vpsHost" -ForegroundColor Yellow
Write-Host "Chemin distant: $remotePath" -ForegroundColor Yellow
Write-Host ""

if ($dryRun) {
    Write-Host "⚠️  MODE SIMULATION - Aucun fichier ne sera envoyé" -ForegroundColor Yellow
    Write-Host ""
}

if ($dryRun) {
    Write-Host "⚠️  MODE SIMULATION - Aucune action ne sera exécutée" -ForegroundColor Yellow
}

# Vérification des prérequis
Write-Host "`n📋 Vérification des prérequis..." -ForegroundColor Green

# Test de connexion SSH
Write-Host "Test de connexion SSH..." -ForegroundColor Cyan
if ($dryRun) {
    Write-Host "[SIMULATION] ssh $server 'echo Connection OK'" -ForegroundColor Gray
} else {
    $sshTest = ssh $server 'echo "Connection OK"' 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Impossible de se connecter au serveur $server" -ForegroundColor Red
        Write-Host "Vérifiez votre clé SSH et la connectivité réseau" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Connexion SSH OK" -ForegroundColor Green
}

# Préparation des fichiers
Write-Host "`n📦 Préparation des fichiers..." -ForegroundColor Green

# Exclusions pour rsync
$excludeFile = "deploy-exclude.txt"
@(
    "node_modules/"
    ".git/"
    "*.log"
    "backend/logs/"
    "backend/uploads/"
    "frontend/dist/"
    "*.bak"
    ".env.bak"
    "docker-compose.yml.bak"
    ".DS_Store"
    "Thumbs.db"
) | Out-File $excludeFile -Encoding UTF8

Write-Host "Fichiers d'exclusion créés" -ForegroundColor Cyan

# Synchronisation des fichiers
Write-Host "`n📤 Synchronisation des fichiers..." -ForegroundColor Green

if ($dryRun) {
    Write-Host "[SIMULATION] rsync -avz --exclude-from=$excludeFile ./ $server`:$remotePath/" -ForegroundColor Gray
} else {
    # Créer le répertoire distant si nécessaire
    ssh $server "mkdir -p $remotePath"
    
    # Synchroniser les fichiers
    rsync -avz --exclude-from=$excludeFile ./ "$server`:$remotePath/"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors de la synchronisation" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Fichiers synchronisés" -ForegroundColor Green
}

# Déploiement sur le serveur
Write-Host "`n🐳 Déploiement Docker sur le serveur..." -ForegroundColor Green

$deployScript = @"
#!/bin/bash
set -e

echo "🔧 Configuration du serveur..."
cd $remotePath

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé"  
    exit 1
fi

echo "✅ Docker et Docker Compose sont installés"

# Créer les répertoires nécessaires
mkdir -p backend/uploads backend/logs

# Permissions
chmod +x *.sh 2>/dev/null || true

# Arrêter les services existants
echo "🛑 Arrêt des services existants..."
docker-compose down 2>/dev/null || true

# Construire et démarrer
if [ "$1" != "skip-build" ]; then
    echo "🏗️  Construction des images..."
    docker-compose build --no-cache
fi

echo "🚀 Démarrage des services..."
docker-compose up -d

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 10

# Vérifier l'état des services
echo "📊 État des services:"
docker-compose ps

# Test de santé
echo "🔍 Test de santé des services..."
timeout 30 bash -c 'until curl -f http://localhost:8001/api/health >/dev/null 2>&1; do sleep 2; done' && echo "✅ Backend OK" || echo "⚠️ Backend non accessible"
timeout 30 bash -c 'until curl -f http://localhost:8002 >/dev/null 2>&1; do sleep 2; done' && echo "✅ Frontend OK" || echo "⚠️ Frontend non accessible"

echo "🎉 Déploiement terminé!"
echo "📍 Frontend: http://162.19.78.55:8002"
echo "📍 Backend: http://162.19.78.55:8001/api"
"@

if ($dryRun) {
    Write-Host "[SIMULATION] Script de déploiement serait exécuté:" -ForegroundColor Gray
    Write-Host $deployScript -ForegroundColor DarkGray
} else {
    # Exécuter le script de déploiement sur le serveur
    $buildFlag = if ($skipBuild) { "skip-build" } else { "" }
    
    $deployScript | ssh $server "cat > $remotePath/deploy.sh && chmod +x $remotePath/deploy.sh && bash $remotePath/deploy.sh $buildFlag"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors du déploiement" -ForegroundColor Red
        exit 1
    }
}

# Nettoyage
Remove-Item $excludeFile -Force

Write-Host "`n🎉 Déploiement terminé avec succès!" -ForegroundColor Green
Write-Host "📍 Frontend: http://162.19.78.55:8002" -ForegroundColor Cyan
Write-Host "📍 Backend: http://162.19.78.55:8001/api" -ForegroundColor Cyan
Write-Host "`n📋 Commandes utiles:" -ForegroundColor Yellow
Write-Host "  ssh $server 'cd $remotePath && docker-compose logs -f'" -ForegroundColor Gray
Write-Host "  ssh $server 'cd $remotePath && docker-compose ps'" -ForegroundColor Gray
Write-Host "  ssh $server 'cd $remotePath && docker-compose restart'" -ForegroundColor Gray
