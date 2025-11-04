@echo off
chcp 65001 >nul
cls
echo.
echo ================================================
echo   🌌 Timeline of the Universe - Local Server
echo ================================================
echo.

:: Проверяем Python
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo [✓] Python найден
    echo.
    echo Запускаем локальный сервер...
    echo.
    echo 📍 Открой браузер: http://localhost:8000
    echo.
    echo ⚠️  Нажми Ctrl+C чтобы остановить сервер
    echo ================================================
    echo.
    
    :: Открываем браузер
    start http://localhost:8000
    
    :: Запускаем сервер
    python -m http.server 8000
    goto :end
)

:: Python не найден
echo [✗] Python не найден!
echo.
echo Установи Python: https://www.python.org/downloads/
echo.
echo Альтернатива - установи Node.js: https://nodejs.org/
echo Потом запусти: npm install -g http-server
echo                http-server -p 8000
echo.
pause

:end

