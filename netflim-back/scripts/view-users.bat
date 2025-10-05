@echo off
echo 👥 Utilisateurs Netflim
echo ======================
echo.

cd /d "%~dp0.."
set DB_PATH=database\netflim.db

if not exist "%DB_PATH%" (
    echo ❌ Base de données non trouvée : %DB_PATH%
    pause
    exit /b 1
)

echo 📋 DERNIERS 10 UTILISATEURS
echo ===========================
echo.

sqlite3 "%DB_PATH%" "SELECT 'ID: ' || id || ' | Session: ' || session_id || ' | Créé: ' || created_at FROM users ORDER BY created_at DESC LIMIT 10;"

echo.
echo ✅ Consultation terminée
pause
