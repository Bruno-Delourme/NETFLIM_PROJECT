@echo off
echo ❤️ Likes Netflim
echo ================
echo.

cd /d "%~dp0.."
set DB_PATH=database\netflim.db

if not exist "%DB_PATH%" (
    echo ❌ Base de données non trouvée : %DB_PATH%
    pause
    exit /b 1
)

echo 📋 DERNIERS 10 LIKES
echo ====================
echo.

sqlite3 "%DB_PATH%" "SELECT 'ID: ' || l.id || ' | ' || CASE WHEN l.is_liked = 1 THEN '👍 LIKE' ELSE '👎 DISLIKE' END || ' | Film: ' || COALESCE(m.title, 'N/A') || ' | User: ' || u.session_id || ' | Date: ' || l.created_at FROM likes l LEFT JOIN movies m ON l.movie_id = m.id LEFT JOIN users u ON l.user_id = u.id ORDER BY l.created_at DESC LIMIT 10;"

echo.
echo 📊 RÉPARTITION LIKES/DISLIKES
echo =============================
echo.

sqlite3 "%DB_PATH%" "SELECT 'Likes: ' || COUNT(*) FROM likes WHERE is_liked = 1;"
sqlite3 "%DB_PATH%" "SELECT 'Dislikes: ' || COUNT(*) FROM likes WHERE is_liked = 0;"

echo.
echo ✅ Consultation terminée
pause
