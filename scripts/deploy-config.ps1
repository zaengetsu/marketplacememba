# Script de déploiement pour marketplace (PowerShell)
# Ce script configure automatiquement les URLs pour différents environnements

param(
    [string]$env = "",
    [string]$frontend = "",
    [string]$backend = "",
    [switch]$help
)

function Show-Help {
    Write-Host "Usage: .\deploy-config.ps1 [OPTIONS]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -env ENV         Environnement (local|production|custom)"
    Write-Host "  -frontend URL    URL du frontend (ex: https://monsite.com)"
    Write-Host "  -backend URL     URL du backend (ex: https://api.monsite.com)"
    Write-Host "  -help           Afficher cette aide"
    Write-Host ""
    Write-Host "Exemples:"
    Write-Host "  .\deploy-config.ps1 -env local"
    Write-Host "  .\deploy-config.ps1 -env production -frontend https://monsite.com -backend https://api.monsite.com"
    Write-Host "  .\deploy-config.ps1 -frontend https://test.com -backend https://api.test.com"
}

if ($help) {
    Show-Help
    exit 0
}

# Configuration par environnement
if ($env -eq "local") {
    $frontend = "http://localhost:5173"
    $backend = "http://localhost:4000"
    Write-Host "Configuration pour l'environnement local" -ForegroundColor Green
}
elseif ($env -eq "production") {
    if (-not $frontend -or -not $backend) {
        Write-Host "Pour l'environnement production, vous devez spécifier -frontend et -backend" -ForegroundColor Red
        exit 1
    }
    Write-Host "Configuration pour l'environnement de production" -ForegroundColor Green
}

# Vérification des URLs
if (-not $frontend -or -not $backend) {
    Write-Host "Erreur: URLs du frontend et backend requises" -ForegroundColor Red
    Show-Help
    exit 1
}

Write-Host "Frontend URL: $frontend" -ForegroundColor Yellow
Write-Host "Backend URL: $backend" -ForegroundColor Yellow

# Mise à jour du backend .env
Write-Host "Mise à jour de backend\.env..." -ForegroundColor Green
if (Test-Path "backend\.env") {
    # Backup
    Copy-Item "backend\.env" "backend\.env.bak" -Force
    
    # Mise à jour
    $content = Get-Content "backend\.env"
    $content = $content -replace "FRONTEND_URL=.*", "FRONTEND_URL=$frontend"
    $content = $content -replace "BACKEND_URL=.*", "BACKEND_URL=$backend"
    $content | Out-File "backend\.env" -Encoding UTF8
    
    Write-Host "✅ backend\.env mis à jour" -ForegroundColor Green
}
else {
    Write-Host "❌ Fichier backend\.env non trouvé" -ForegroundColor Red
    exit 1
}

# Mise à jour du frontend .env
Write-Host "Mise à jour de frontend\.env..." -ForegroundColor Green
if (Test-Path "frontend\.env") {
    # Backup
    Copy-Item "frontend\.env" "frontend\.env.bak" -Force
    
    # Calculer l'URL de l'API
    $apiUrl = "$backend/api"
    
    # Mise à jour
    $content = Get-Content "frontend\.env"
    $content = $content -replace "VITE_API_URL=.*", "VITE_API_URL=$apiUrl"
    $content = $content -replace "VITE_BASE_URL=.*", "VITE_BASE_URL=$frontend"
    $content | Out-File "frontend\.env" -Encoding UTF8
    
    Write-Host "✅ frontend\.env mis à jour" -ForegroundColor Green
}
else {
    Write-Host "❌ Fichier frontend\.env non trouvé" -ForegroundColor Red
    exit 1
}

# Mise à jour de docker-compose.yml
Write-Host "Mise à jour de docker-compose.yml..." -ForegroundColor Green
if (Test-Path "docker-compose.yml") {
    # Backup
    Copy-Item "docker-compose.yml" "docker-compose.yml.bak" -Force
    
    $apiUrl = "$backend/api"
    
    # Mise à jour
    $content = Get-Content "docker-compose.yml"
    $content = $content -replace "VITE_API_URL=.*", "VITE_API_URL=$apiUrl"
    $content = $content -replace "- FRONTEND_URL=.*", "- FRONTEND_URL=$frontend"
    $content = $content -replace "- BACKEND_URL=.*", "- BACKEND_URL=$backend"
    $content | Out-File "docker-compose.yml" -Encoding UTF8
    
    Write-Host "✅ docker-compose.yml mis à jour" -ForegroundColor Green
}
else {
    Write-Host "❌ Fichier docker-compose.yml non trouvé" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Configuration terminée !" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines étapes:" -ForegroundColor Yellow
Write-Host "1. Vérifiez les fichiers .env"
Write-Host "2. Redémarrez vos services Docker:"
Write-Host "   docker-compose down && docker-compose up -d" -ForegroundColor Green
Write-Host "3. Ou redémarrez votre serveur si vous n'utilisez pas Docker"
