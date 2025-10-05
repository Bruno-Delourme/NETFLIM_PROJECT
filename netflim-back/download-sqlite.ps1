# Script pour télécharger SQLite3 directement
Write-Host "🎬 Téléchargement de SQLite3 pour Netflim" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# URL de téléchargement SQLite3 (version récente)
$sqliteUrl = "https://www.sqlite.org/2024/sqlite-tools-win32-x86-3470200.zip"
$zipFile = "sqlite-tools.zip"
$extractPath = "sqlite-tools"

try {
    Write-Host "📥 Téléchargement de SQLite3..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $sqliteUrl -OutFile $zipFile -UseBasicParsing
    
    Write-Host "📦 Extraction de l'archive..." -ForegroundColor Yellow
    Expand-Archive -Path $zipFile -DestinationPath $extractPath -Force
    
    Write-Host "📋 Recherche de sqlite3.exe..." -ForegroundColor Yellow
    $sqliteExe = Get-ChildItem -Path $extractPath -Name "sqlite3.exe" -Recurse | Select-Object -First 1
    
    if ($sqliteExe) {
        $sourcePath = Join-Path $extractPath $sqliteExe
        $destPath = "sqlite3.exe"
        
        Write-Host "📁 Copie de sqlite3.exe..." -ForegroundColor Yellow
        Copy-Item -Path $sourcePath -Destination $destPath -Force
        
        Write-Host "✅ SQLite3 installé avec succès !" -ForegroundColor Green
        Write-Host "📍 Emplacement: $destPath" -ForegroundColor Green
        Write-Host ""
        Write-Host "🧪 Test de l'installation..." -ForegroundColor Yellow
        
        # Test de l'installation
        $testResult = & ".\sqlite3.exe" --version
        if ($testResult) {
            Write-Host "✅ Version SQLite3: $testResult" -ForegroundColor Green
            Write-Host ""
            Write-Host "🎯 Vous pouvez maintenant utiliser:" -ForegroundColor Cyan
            Write-Host "   .\sqlite3.exe database/netflim.db" -ForegroundColor White
            Write-Host ""
            Write-Host "📋 Commandes utiles:" -ForegroundColor Cyan
            Write-Host "   .tables                    - Voir les tables" -ForegroundColor White
            Write-Host "   SELECT COUNT(*) FROM users; - Compter les utilisateurs" -ForegroundColor White
            Write-Host "   .quit                      - Quitter" -ForegroundColor White
        } else {
            Write-Host "❌ Erreur lors du test" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ sqlite3.exe non trouvé dans l'archive" -ForegroundColor Red
    }
    
    # Nettoyage
    Write-Host "🧹 Nettoyage des fichiers temporaires..." -ForegroundColor Yellow
    Remove-Item -Path $zipFile -Force -ErrorAction SilentlyContinue
    Remove-Item -Path $extractPath -Recurse -Force -ErrorAction SilentlyContinue
    
} catch {
    Write-Host "❌ Erreur lors du téléchargement: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Essayez de télécharger manuellement depuis: https://www.sqlite.org/download.html" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Script terminé" -ForegroundColor Green
