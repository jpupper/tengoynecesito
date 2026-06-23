@echo off
setlocal
echo ===================================================
set PORT=3090
echo Buscando procesos en el puerto %PORT%...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%PORT% ^| findstr LISTENING') do (
    echo Matando proceso anterior con PID: %%a
    taskkill /f /pid %%a >nul 2>&1
)
echo ===================================================
echo Iniciando TengoYNecesito en http://localhost:%PORT%
echo ===================================================
npm run dev
pause
