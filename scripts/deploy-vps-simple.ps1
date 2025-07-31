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

# 1. Vérification de la connectivité SSH
Write-Host "1️⃣ Vérification de la connexion SSH..." -ForegroundColor Green
try {
    if (-not $dryRun) {
        $testResult = ssh -o ConnectTimeout=10 "$vpsUser@$vpsHost" "echo 'Connection OK'"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Connexion SSH réussie" -ForegroundColor Green
        } else {
            throw "Connexion échouée"
        }
    } else {
        Write-Host "🔍 [SIMULATION] Test SSH: $vpsUser@$vpsHost" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Impossible de se connecter au VPS" -ForegroundColor Red
    Write-Host "Vérifiez:" -ForegroundColor Yellow
    Write-Host "- Votre connexion internet"
    Write-Host "- L'adresse IP du VPS"
    Write-Host "- Vos clés SSH"
    exit 1
}

# 2. Nettoyage des node_modules
Write-Host ""
Write-Host "2️⃣ Suppression des node_modules..." -ForegroundColor Green

$nodeModulesPaths = @(
    ".\backend\node_modules",
    ".\frontend\node_modules",
    ".\node_modules"
)

foreach ($path in $nodeModulesPaths) {
    if (Test-Path $path) {
        Write-Host "🗑️  Suppression de $path..." -ForegroundColor Yellow
        if (-not $dryRun) {
            Remove-Item $path -Recurse -Force
        }
        Write-Host "✅ $path supprimé" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  $path n'existe pas" -ForegroundColor Gray
    }
}

# 3. Création d'une archive pour le déploiement
Write-Host ""
Write-Host "3️⃣ Création de l'archive de déploiement..." -ForegroundColor Green

$archiveName = "deploy-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"

# Fichiers et dossiers à inclure
$filesToInclude = @(
    "backend\src\*",
    "backend\models\*",
    "backend\migrations\*",
    "backend\config\*",
    "backend\package.json",
    "backend\Dockerfile*",
    "backend\.env",
    "frontend\src\*",
    "frontend\public\*",
    "frontend\package.json",
    "frontend\Dockerfile*",
    "frontend\.env",
    "frontend\*.config.*",
    "frontend\*.html",
    "nginx\*",
    "docker-compose*.yml",
    "*.md",
    "*.sql"
)

if (-not $dryRun) {
    Write-Host "📦 Création de l'archive..." -ForegroundColor Yellow
    try {
        # Créer l'archive
        $compress = @{
            Path = $filesToInclude
            DestinationPath = $archiveName
            Force = $true
        }
        Compress-Archive @compress
        Write-Host "✅ Archive créée: $archiveName" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erreur lors de la création de l'archive: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "🔍 [SIMULATION] Archive qui serait créée: $archiveName" -ForegroundColor Gray
    Write-Host "Fichiers inclus:" -ForegroundColor Gray
    foreach ($file in $filesToInclude) {
        if (Test-Path $file) {
            Write-Host "  ✓ $file" -ForegroundColor Gray
        } else {
            Write-Host "  ⚠ $file (non trouvé)" -ForegroundColor DarkYellow
        }
    }
}

# 4. Envoi vers le VPS
Write-Host ""
Write-Host "4️⃣ Envoi vers le VPS..." -ForegroundColor Green

if (-not $dryRun) {
    Write-Host "📤 Envoi de l'archive via SCP..." -ForegroundColor Yellow
    scp $archiveName "$vpsUser@${vpsHost}:$remotePath/"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Archive envoyée avec succès" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors de l'envoi SCP" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "🔍 [SIMULATION] scp $archiveName $vpsUser@${vpsHost}:$remotePath/" -ForegroundColor Gray
}

# 5. Extraction et installation sur le serveur
Write-Host ""
Write-Host "5️⃣ Installation sur le serveur..." -ForegroundColor Green

$remoteCommands = @(
    "cd $remotePath",
    "unzip -o $archiveName",
    "rm $archiveName",
    "cd backend && npm install --production",
    "cd ../frontend && npm install && npm run build",
    "docker-compose down",
    "docker-compose up -d"
)

if (-not $dryRun) {
    foreach ($cmd in $remoteCommands) {
        Write-Host "🔧 Exécution: $cmd" -ForegroundColor Yellow
        ssh "$vpsUser@$vpsHost" $cmd
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "⚠️  Erreur lors de l'exécution de: $cmd" -ForegroundColor Yellow
        }
    }
    
    Write-Host "⏳ Attente du démarrage des services..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
    
    Write-Host "🔍 Vérification du statut des services..." -ForegroundColor Yellow
    ssh "$vpsUser@$vpsHost" "cd $remotePath && docker-compose ps"
    
} else {
    Write-Host "🔍 [SIMULATION] Commandes qui seraient exécutées:" -ForegroundColor Gray
    foreach ($cmd in $remoteCommands) {
        Write-Host "  - $cmd" -ForegroundColor Gray
    }
}

# 6. Nettoyage local
Write-Host ""
Write-Host "6️⃣ Nettoyage..." -ForegroundColor Green
if (Test-Path $archiveName -and -not $dryRun) {
    Remove-Item $archiveName -Force
    Write-Host "✅ Archive locale supprimée" -ForegroundColor Green
}

# 7. Résumé final
Write-Host ""
Write-Host "🎉 DÉPLOIEMENT TERMINÉ !" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green
Write-Host ""
Write-Host "URLs de votre application:" -ForegroundColor Yellow
Write-Host "🌐 Frontend: http://162.19.78.55:8002" -ForegroundColor Cyan
Write-Host "🔧 Backend:  http://162.19.78.55:8001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Commandes utiles:" -ForegroundColor Yellow
Write-Host "📊 Voir les logs:" -ForegroundColor Gray
Write-Host "   ssh $vpsUser@$vpsHost 'cd $remotePath && docker-compose logs -f'" -ForegroundColor Gray
Write-Host "🔄 Redémarrer:" -ForegroundColor Gray
Write-Host "   ssh $vpsUser@$vpsHost 'cd $remotePath && docker-compose restart'" -ForegroundColor Gray
Write-Host "🛑 Arrêter:" -ForegroundColor Gray
Write-Host "   ssh $vpsUser@$vpsHost 'cd $remotePath && docker-compose down'" -ForegroundColor Gray

if (-not $dryRun) {
    Write-Host ""
    Write-Host "⚠️  N'oubliez pas de:" -ForegroundColor Yellow
    Write-Host "1. Vérifier que les ports 8001 et 8002 sont ouverts sur votre VPS"
    Write-Host "2. Configurer un nom de domaine si nécessaire"
    Write-Host "3. Mettre en place HTTPS en production"
    Write-Host ""
    Write-Host "🔍 Test rapide:" -ForegroundColor Yellow
    Write-Host "   curl -I http://162.19.78.55:8001/api/health" -ForegroundColor Gray
    Write-Host "   curl -I http://162.19.78.55:8002" -ForegroundColor Gray
}
