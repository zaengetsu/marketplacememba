# Script de déploiement rapide vers VPS
# Supprime les node_modules et déploie via SCP

param(
    [string]$vpsHost = "162.19.78.55",
    [string]$vpsUser = "ubuntu", 
    [string]$remotePath = "/home/ubuntu/marketplacememba",
    [switch]$help,
    [switch]$dryRun
)

if ($help) {
    Write-Host "Usage: .\deploy-rapid.ps1 [OPTIONS]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -vpsHost HOST     Adresse IP du VPS (défaut: 162.19.78.55)"
    Write-Host "  -vpsUser USER     Utilisateur SSH (défaut: ubuntu)"
    Write-Host "  -remotePath PATH  Chemin distant (défaut: /home/ubuntu/marketplacememba)"
    Write-Host "  -dryRun          Simulation sans envoi"
    Write-Host "  -help            Afficher cette aide"
    exit 0
}

Write-Host "🚀 DÉPLOIEMENT VERS VPS" -ForegroundColor Cyan
Write-Host "VPS: $vpsUser@$vpsHost" -ForegroundColor Yellow
Write-Host "Chemin: $remotePath" -ForegroundColor Yellow

if ($dryRun) {
    Write-Host "MODE SIMULATION" -ForegroundColor Yellow
}

# 1. Test connexion SSH
Write-Host "`n1. Test connexion SSH..." -ForegroundColor Green
if (-not $dryRun) {
    ssh -o ConnectTimeout=10 "$vpsUser@$vpsHost" "echo 'Connection OK'"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erreur: Impossible de se connecter" -ForegroundColor Red
        exit 1
    }
    Write-Host "Connexion OK" -ForegroundColor Green
}

# 2. Suppression node_modules
Write-Host "`n2. Suppression des node_modules..." -ForegroundColor Green
$paths = @(".\backend\node_modules", ".\frontend\node_modules")
foreach ($path in $paths) {
    if (Test-Path $path) {
        Write-Host "Suppression: $path" -ForegroundColor Yellow
        if (-not $dryRun) {
            Remove-Item $path -Recurse -Force
        }
    }
}

# 3. Création archive
Write-Host "`n3. Création de l'archive..." -ForegroundColor Green
$archiveName = "deploy-$(Get-Date -Format 'yyyyMMdd-HHmmss').tar.gz"

# Utiliser tar si disponible, sinon zip
$useTar = Get-Command tar -ErrorAction SilentlyContinue
if ($useTar -and -not $dryRun) {
    Write-Host "Utilisation de tar..." -ForegroundColor Cyan
    tar -czf $archiveName --exclude="node_modules" --exclude=".git" --exclude="*.log" --exclude="*.bak" .
} elseif (-not $dryRun) {
    Write-Host "Utilisation de Compress-Archive..." -ForegroundColor Cyan
    $archiveName = "deploy-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"
    Compress-Archive -Path "backend", "frontend", "nginx", "docker-compose*.yml", "*.md" -DestinationPath $archiveName -Force
}

if (-not $dryRun) {
    Write-Host "Archive créée: $archiveName" -ForegroundColor Green
}

# 4. Envoi SCP
Write-Host "`n4. Envoi vers le serveur..." -ForegroundColor Green
if (-not $dryRun) {
    scp $archiveName "$vpsUser@${vpsHost}:$remotePath/"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Envoi réussi" -ForegroundColor Green
    } else {
        Write-Host "Erreur lors de l'envoi" -ForegroundColor Red
        exit 1
    }
}

# 5. Installation sur le serveur
Write-Host "`n5. Installation sur le serveur..." -ForegroundColor Green
if (-not $dryRun) {
    # Extraction
    if ($archiveName.EndsWith(".tar.gz")) {
        ssh "$vpsUser@$vpsHost" "cd $remotePath && tar -xzf $archiveName && rm $archiveName"
    } else {
        ssh "$vpsUser@$vpsHost" "cd $remotePath && unzip -o $archiveName && rm $archiveName"
    }
    
    # Installation des dépendances
    Write-Host "Installation backend..." -ForegroundColor Yellow
    ssh "$vpsUser@$vpsHost" "cd $remotePath/backend && npm install --production"
    
    Write-Host "Installation frontend..." -ForegroundColor Yellow  
    ssh "$vpsUser@$vpsHost" "cd $remotePath/frontend && npm install && npm run build"
    
    # Redémarrage Docker
    Write-Host "Redémarrage Docker..." -ForegroundColor Yellow
    ssh "$vpsUser@$vpsHost" "cd $remotePath && docker-compose down && docker-compose up -d"
    
    # Attente et vérification
    Start-Sleep -Seconds 10
    ssh "$vpsUser@$vpsHost" "cd $remotePath && docker-compose ps"
}

# 6. Nettoyage
Write-Host "`n6. Nettoyage..." -ForegroundColor Green
if ((Test-Path $archiveName) -and (-not $dryRun)) {
    Remove-Item $archiveName -Force
    Write-Host "Archive locale supprimée" -ForegroundColor Green
}

# Résumé
Write-Host "`n🎉 DÉPLOIEMENT TERMINÉ!" -ForegroundColor Green
Write-Host "Frontend: http://162.19.78.55:8002" -ForegroundColor Cyan
Write-Host "Backend:  http://162.19.78.55:8001" -ForegroundColor Cyan

Write-Host "`nCommandes utiles:" -ForegroundColor Yellow
Write-Host "Logs: ssh $vpsUser@$vpsHost 'cd $remotePath && docker-compose logs -f'" -ForegroundColor Gray
Write-Host "Restart: ssh $vpsUser@$vpsHost 'cd $remotePath && docker-compose restart'" -ForegroundColor Gray
