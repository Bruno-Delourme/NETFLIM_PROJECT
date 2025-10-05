@echo off
echo 🎭 Films Netflim
echo ================
echo.

cd /d "%~dp0.."
set DB_PATH=database\netflim.db

if not exist "%DB_PATH%" (
    echo ❌ Base de données non trouvée : %DB_PATH%
    pause
    exit /b 1
)

echo 📋 DERNIERS 10 FILMS
echo ====================
echo.

sqlite3 "%DB_PATH%" "SELECT 'ID: ' || id || ' | Titre: ' || title || ' | Date: ' || release_date || ' | Note: ' || vote_average FROM movies ORDER BY created_at DESC LIMIT 10;"

echo.
echo 🏆 TOP 5 FILMS LES PLUS AIMÉS
echo =============================
echo.

sqlite3 "%DB_PATH%" "SELECT m.title || ' - ' || COUNT(l.id) || ' likes' FROM movies m LEFT JOIN likes l ON m.id = l.movie_id AND l.is_liked = 1 GROUP BY m.id, m.title ORDER BY COUNT(l.id) DESC LIMIT 5;"

echo.
echo ✅ Consultation terminée
pause
