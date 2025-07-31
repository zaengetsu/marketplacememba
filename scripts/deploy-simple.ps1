# Script de déploiement vers VPS
param(
    [string]$server = "ubuntu@162.19.78.55",
    [string]$remotePath = "/home/ubuntu/marketplacememba",
    [switch]$help,
    [switch]$skipBuild,
    [switch]$dryRun
)

function Show-Help {
    Write-Host "Usage: .\deploy-to-vps.ps1 [OPTIONS]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -server USER@IP    Serveur SSH (defaut: ubuntu@162.19.78.55)"
    Write-Host "  -remotePath PATH   Chemin sur le serveur (defaut: /home/ubuntu/marketplacememba)"
    Write-Host "  -skipBuild         Ne pas construire les images Docker"
    Write-Host "  -dryRun           Simulation sans execution"
    Write-Host "  -help             Afficher cette aide"
}

if ($help) {
    Show-Help
    exit 0
}

Write-Host "Deploiement vers VPS" -ForegroundColor Cyan
Write-Host "Serveur: $server" -ForegroundColor Yellow
Write-Host "Chemin distant: $remotePath" -ForegroundColor Yellow

if ($dryRun) {
    Write-Host "MODE SIMULATION - Aucune action ne sera executee" -ForegroundColor Yellow
}

# Test de connexion SSH
Write-Host "Test de connexion SSH..." -ForegroundColor Cyan
if (-not $dryRun) {
    try {
        ssh $server 'echo "Connection OK"' | Out-Null
        if ($LASTEXITCODE -ne 0) {
            throw "Connexion echouee"
        }
        Write-Host "Connexion SSH OK" -ForegroundColor Green
    }
    catch {
        Write-Host "Impossible de se connecter au serveur $server" -ForegroundColor Red
        Write-Host "Verifiez votre cle SSH et la connectivite reseau" -ForegroundColor Red
        exit 1
    }
}

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

Write-Host "Synchronisation des fichiers..." -ForegroundColor Green

if (-not $dryRun) {
    # Créer le répertoire distant
    ssh $server "mkdir -p $remotePath"
    
    # Synchroniser les fichiers
    rsync -avz --exclude-from=$excludeFile ./ "$server`:$remotePath/"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erreur lors de la synchronisation" -ForegroundColor Red
        exit 1
    }
    Write-Host "Fichiers synchronises" -ForegroundColor Green
}

# Script de déploiement pour le serveur
$deployCommands = @(
    "cd $remotePath",
    "echo 'Configuration du serveur...'",
    "mkdir -p backend/uploads backend/logs",
    "chmod +x *.sh 2>/dev/null || true",
    "echo 'Arret des services existants...'",
    "docker-compose down 2>/dev/null || true"
)

if (-not $skipBuild) {
    $deployCommands += "echo 'Construction des images...'"
    $deployCommands += "docker-compose build --no-cache"
}

$deployCommands += @(
    "echo 'Demarrage des services...'",
    "docker-compose up -d",
    "sleep 10",
    "echo 'Etat des services:'",
    "docker-compose ps",
    "echo 'Deploiement termine!'",
    "echo 'Frontend: http://162.19.78.55:8002'",
    "echo 'Backend: http://162.19.78.55:8001/api'"
)

$fullCommand = $deployCommands -join " && "

if ($dryRun) {
    Write-Host "Script qui serait execute:" -ForegroundColor Gray
    $deployCommands | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }
} else {
    Write-Host "Deploiement Docker sur le serveur..." -ForegroundColor Green
    ssh $server $fullCommand
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erreur lors du deploiement" -ForegroundColor Red
        exit 1
    }
}

# Nettoyage
if (Test-Path $excludeFile) {
    Remove-Item $excludeFile -Force
}

Write-Host "Deploiement termine avec succes!" -ForegroundColor Green
Write-Host "Frontend: http://162.19.78.55:8002" -ForegroundColor Cyan
Write-Host "Backend: http://162.19.78.55:8001/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "Commandes utiles:" -ForegroundColor Yellow
Write-Host "  ssh $server 'cd $remotePath && docker-compose logs -f'" -ForegroundColor Gray
Write-Host "  ssh $server 'cd $remotePath && docker-compose ps'" -ForegroundColor Gray
