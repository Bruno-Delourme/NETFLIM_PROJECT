# Script PowerShell pour consulter les données Netflim
param(
    [string]$Table = "all",
    [int]$Limit = 10
)

$dbPath = "database/netflim.db"

if (-not (Test-Path $dbPath)) {
    Write-Host "❌ Base de données non trouvée : $dbPath" -ForegroundColor Red
    exit 1
}

Write-Host "🎬 Netflim Database Viewer" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

function Show-Stats {
    Write-Host "📊 STATISTIQUES GLOBALES" -ForegroundColor Yellow
    Write-Host "========================" -ForegroundColor Yellow
    
    # Compter les utilisateurs
    $userCount = sqlite3 $dbPath "SELECT COUNT(*) FROM users;"
    Write-Host "👥 Utilisateurs: $userCount" -ForegroundColor Green
    
    # Compter les films
    $movieCount = sqlite3 $dbPath "SELECT COUNT(*) FROM movies;"
    Write-Host "🎭 Films: $movieCount" -ForegroundColor Green
    
    # Compter les likes
    $likeCount = sqlite3 $dbPath "SELECT COUNT(*) FROM likes;"
    Write-Host "❤️ Likes: $likeCount" -ForegroundColor Green
    
    # Likes vs Dislikes
    $likes = sqlite3 $dbPath "SELECT COUNT(*) FROM likes WHERE is_liked = 1;"
    $dislikes = sqlite3 $dbPath "SELECT COUNT(*) FROM likes WHERE is_liked = 0;"
    Write-Host "👍 Likes: $likes | 👎 Dislikes: $dislikes" -ForegroundColor Green
    Write-Host ""
}

function Show-Users {
    Write-Host "👥 UTILISATEURS (derniers $Limit)" -ForegroundColor Yellow
    Write-Host "================================" -ForegroundColor Yellow
    
    $users = sqlite3 $dbPath "SELECT id, session_id, created_at FROM users ORDER BY created_at DESC LIMIT $Limit;"
    if ($users) {
        $users | ForEach-Object {
            $parts = $_ -split '\|'
            Write-Host "ID: $($parts[0])" -ForegroundColor White
            Write-Host "Session: $($parts[1])" -ForegroundColor Gray
            Write-Host "Créé: $($parts[2])" -ForegroundColor Gray
            Write-Host "---" -ForegroundColor DarkGray
        }
    } else {
        Write-Host "Aucun utilisateur trouvé" -ForegroundColor Red
    }
    Write-Host ""
}

function Show-Movies {
    Write-Host "🎭 FILMS (derniers $Limit)" -ForegroundColor Yellow
    Write-Host "=========================" -ForegroundColor Yellow
    
    $movies = sqlite3 $dbPath "SELECT id, title, release_date, vote_average, created_at FROM movies ORDER BY created_at DESC LIMIT $Limit;"
    if ($movies) {
        $movies | ForEach-Object {
            $parts = $_ -split '\|'
            Write-Host "ID: $($parts[0])" -ForegroundColor White
            Write-Host "Titre: $($parts[1])" -ForegroundColor Cyan
            Write-Host "Date: $($parts[2]) | Note: $($parts[3])" -ForegroundColor Gray
            Write-Host "Ajouté: $($parts[4])" -ForegroundColor Gray
            Write-Host "---" -ForegroundColor DarkGray
        }
    } else {
        Write-Host "Aucun film trouvé" -ForegroundColor Red
    }
    Write-Host ""
}

function Show-Likes {
    Write-Host "❤️ LIKES (derniers $Limit)" -ForegroundColor Yellow
    Write-Host "=========================" -ForegroundColor Yellow
    
    $likes = sqlite3 $dbPath "SELECT l.id, l.is_liked, m.title, u.session_id, l.created_at FROM likes l LEFT JOIN movies m ON l.movie_id = m.id LEFT JOIN users u ON l.user_id = u.id ORDER BY l.created_at DESC LIMIT $Limit;"
    if ($likes) {
        $likes | ForEach-Object {
            $parts = $_ -split '\|'
            $likeType = if ($parts[1] -eq "1") { "👍 LIKE" } else { "👎 DISLIKE" }
            Write-Host "ID: $($parts[0]) | $likeType" -ForegroundColor White
            Write-Host "Film: $($parts[2])" -ForegroundColor Cyan
            Write-Host "Utilisateur: $($parts[3])" -ForegroundColor Gray
            Write-Host "Date: $($parts[4])" -ForegroundColor Gray
            Write-Host "---" -ForegroundColor DarkGray
        }
    } else {
        Write-Host "Aucun like trouvé" -ForegroundColor Red
    }
    Write-Host ""
}

function Show-TopMovies {
    Write-Host "🏆 FILMS LES PLUS AIMÉS" -ForegroundColor Yellow
    Write-Host "=======================" -ForegroundColor Yellow
    
    $topMovies = sqlite3 $dbPath "SELECT m.title, COUNT(l.id) as likes_count FROM movies m LEFT JOIN likes l ON m.id = l.movie_id AND l.is_liked = 1 GROUP BY m.id, m.title ORDER BY likes_count DESC LIMIT $Limit;"
    if ($topMovies) {
        $topMovies | ForEach-Object {
            $parts = $_ -split '\|'
            Write-Host "$($parts[0]) - $($parts[1]) likes" -ForegroundColor Green
        }
    } else {
        Write-Host "Aucun film aimé trouvé" -ForegroundColor Red
    }
    Write-Host ""
}

# Vérifier si sqlite3 est disponible
try {
    $null = sqlite3 --version
} catch {
    Write-Host "❌ SQLite3 n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    Write-Host "💡 Installez SQLite3 ou utilisez l'interface web" -ForegroundColor Yellow
    exit 1
}

# Afficher les données selon le paramètre
switch ($Table.ToLower()) {
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
        Write-Host "❌ Table inconnue: $Table" -ForegroundColor Red
        Write-Host "💡 Utilisez: stats, users, movies, likes, top, ou all" -ForegroundColor Yellow
    }
}

Write-Host "✅ Consultation terminée" -ForegroundColor Green
