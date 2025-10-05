# Script PowerShell pour consulter les données via l'API REST
param(
    [string]$Endpoint = "stats",
    [int]$Limit = 10
)

$API_BASE = "http://localhost:3001/api"

Write-Host "🎬 Netflim API Data Viewer" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host ""

function Test-Backend {
    try {
        $response = Invoke-WebRequest -Uri "$API_BASE/likes/stats/global" -UseBasicParsing -TimeoutSec 5
        return $true
    } catch {
        return $false
    }
}

function Show-Stats {
    Write-Host "📊 STATISTIQUES GLOBALES" -ForegroundColor Yellow
    Write-Host "========================" -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "$API_BASE/likes/stats/global" -UseBasicParsing
        $data = $response.Content | ConvertFrom-Json
        
        if ($data.success) {
            $stats = $data.data
            Write-Host "👥 Utilisateurs uniques: $($stats.uniqueUsers)" -ForegroundColor Green
            Write-Host "🎭 Films uniques: $($stats.uniqueMovies)" -ForegroundColor Green
            Write-Host "❤️ Interactions totales: $($stats.totalInteractions)" -ForegroundColor Green
            Write-Host "👍 Likes: $($stats.totalLikes)" -ForegroundColor Green
            Write-Host "👎 Dislikes: $($stats.totalDislikes)" -ForegroundColor Green
        } else {
            Write-Host "❌ Erreur API: $($data.message)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Erreur de connexion: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

function Show-TopMovies {
    Write-Host "🏆 FILMS LES PLUS AIMÉS" -ForegroundColor Yellow
    Write-Host "=======================" -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "$API_BASE/likes/movies/most-liked?limit=$Limit" -UseBasicParsing
        $data = $response.Content | ConvertFrom-Json
        
        if ($data.success -and $data.data.movies) {
            $data.data.movies | ForEach-Object {
                Write-Host "🎭 $($_.title) - $($_.likes_count) likes" -ForegroundColor Green
            }
        } else {
            Write-Host "Aucun film trouvé" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Erreur de connexion: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

function Show-Users {
    Write-Host "👥 UTILISATEURS (via API Admin)" -ForegroundColor Yellow
    Write-Host "===============================" -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "$API_BASE/admin/users" -UseBasicParsing
        $data = $response.Content | ConvertFrom-Json
        
        if ($data.success -and $data.data) {
            $data.data | Select-Object -First $Limit | ForEach-Object {
                Write-Host "👤 ID: $($_.id)" -ForegroundColor White
                Write-Host "   Session: $($_.session_id)" -ForegroundColor Gray
                Write-Host "   Créé: $($_.created_at)" -ForegroundColor Gray
                Write-Host "---" -ForegroundColor DarkGray
            }
        } else {
            Write-Host "Aucun utilisateur trouvé" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Erreur de connexion: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

function Show-Movies {
    Write-Host "🎭 FILMS (via API Admin)" -ForegroundColor Yellow
    Write-Host "========================" -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "$API_BASE/admin/movies" -UseBasicParsing
        $data = $response.Content | ConvertFrom-Json
        
        if ($data.success -and $data.data) {
            $data.data | Select-Object -First $Limit | ForEach-Object {
                Write-Host "🎬 ID: $($_.id)" -ForegroundColor White
                Write-Host "   Titre: $($_.title)" -ForegroundColor Cyan
                Write-Host "   Date: $($_.release_date) | Note: $($_.vote_average)" -ForegroundColor Gray
                Write-Host "   Ajouté: $($_.created_at)" -ForegroundColor Gray
                Write-Host "---" -ForegroundColor DarkGray
            }
        } else {
            Write-Host "Aucun film trouvé" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Erreur de connexion: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

function Show-Likes {
    Write-Host "❤️ LIKES (via API Admin)" -ForegroundColor Yellow
    Write-Host "========================" -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "$API_BASE/admin/likes" -UseBasicParsing
        $data = $response.Content | ConvertFrom-Json
        
        if ($data.success -and $data.data) {
            $data.data | Select-Object -First $Limit | ForEach-Object {
                $likeType = if ($_.is_liked -eq 1) { "👍 LIKE" } else { "👎 DISLIKE" }
                Write-Host "❤️ ID: $($_.id) | $likeType" -ForegroundColor White
                Write-Host "   Film: $($_.movie_title)" -ForegroundColor Cyan
                Write-Host "   Utilisateur: $($_.session_id)" -ForegroundColor Gray
                Write-Host "   Date: $($_.created_at)" -ForegroundColor Gray
                Write-Host "---" -ForegroundColor DarkGray
            }
        } else {
            Write-Host "Aucun like trouvé" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Erreur de connexion: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Vérifier si le backend est accessible
if (-not (Test-Backend)) {
    Write-Host "❌ Backend non accessible sur $API_BASE" -ForegroundColor Red
    Write-Host "💡 Assurez-vous que le serveur backend est démarré" -ForegroundColor Yellow
    Write-Host "   Commande: cd netflim-back && npm start" -ForegroundColor Yellow
    exit 1
}

# Afficher les données selon le paramètre
switch ($Endpoint.ToLower()) {
    "stats" { Show-Stats }
    "users" { Show-Users }
    "movies" { Show-Movies }
    "likes" { Show-Likes }
    "top" { Show-TopMovies }
    "all" { 
        Show-Stats
        Show-TopMovies
        Show-Users
        Show-Movies
        Show-Likes
    }
    default {
        Write-Host "❌ Endpoint inconnu: $Endpoint" -ForegroundColor Red
        Write-Host "💡 Utilisez: stats, users, movies, likes, top, ou all" -ForegroundColor Yellow
    }
}

Write-Host "✅ Consultation terminée" -ForegroundColor Green
