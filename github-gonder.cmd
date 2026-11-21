@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Aeternum GitHuba gonderiliyor...
echo.
if not exist .git git init
git add .
git commit -m "Aeternum guncelleme"
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/Seymabura/aeternum.git
git push -u origin main
echo.
echo Bitti. Bu pencereyi kapatabilirsin.
pause
