@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js bulunamadi. https://nodejs.org adresinden LTS surumunu kur. & pause & exit /b)
if not exist node_modules\next (echo Paketler kuruluyor, 1-2 dakika surebilir... & call npm install)
echo.
echo Aeternum baslatiliyor. Hazir olunca tarayici kendiliginden acilacak.
echo Durdurmak icin bu pencereyi kapat.
start "" cmd /c "timeout /t 12 >nul & start http://localhost:3000"
call npm run dev
pause
