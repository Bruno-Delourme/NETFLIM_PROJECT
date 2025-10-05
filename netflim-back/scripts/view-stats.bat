@echo off
echo 🎬 Netflim Database Stats
echo ========================
echo.

cd /d "%~dp0.."
set DB_PATH=database\netflim.db

if not exist "%DB_PATH%" (
    echo ❌ Base de données non trouvée : %DB_PATH%
    pause
    exit /b 1
)

echo 📊 STATISTIQUES GLOBALES
echo ========================
echo.

echo 👥 Utilisateurs:
sqlite3 "%DB_PATH%" "SELECT COUNT(*) FROM users;"

echo 🎭 Films:
sqlite3 "%DB_PATH%" "SELECT COUNT(*) FROM movies;"

echo ❤️ Likes:
sqlite3 "%DB_PATH%" "SELECT COUNT(*) FROM likes;"

echo 👍 Likes vs 👎 Dislikes:
sqlite3 "%DB_PATH%" "SELECT 'Likes: ' || COUNT(*) FROM likes WHERE is_liked = 1;"
sqlite3 "%DB_PATH%" "SELECT 'Dislikes: ' || COUNT(*) FROM likes WHERE is_liked = 0;"

echo.
echo 🏆 TOP 5 FILMS LES PLUS AIMÉS
echo =============================
sqlite3 "%DB_PATH%" "SELECT m.title || ' - ' || COUNT(l.id) || ' likes' FROM movies m LEFT JOIN likes l ON m.id = l.movie_id AND l.is_liked = 1 GROUP BY m.id, m.title ORDER BY COUNT(l.id) DESC LIMIT 5;"

echo.
echo ✅ Stats terminées
pause
