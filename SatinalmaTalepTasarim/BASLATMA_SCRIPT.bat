@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ================================
echo Satinalma Talep Sistemi Baslatiliyor...
echo ================================
echo.
echo [1/2] Bagimliliklari kontrol ediliyor...
if not exist "node_modules\" (
    echo Node modules bulunamadi, yukleniyor...
    call npm install
) else (
    echo Bagimlilklar hazir!
)
echo.
echo [2/2] Sunucular baslatiliyor...
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:3001
echo.
echo Durdurmak icin CTRL+C basin
echo.
call npm run dev:full

