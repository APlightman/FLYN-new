@echo off
chcp 65001 >nul
title FinanceTracker — Сборка установщика

echo ============================================
echo   FinanceTracker — Сборка установщика v1.0.34
echo ============================================
echo.

:: Проверка наличия Inno Setup
set INNO_PATH=
if exist "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" (
    set INNO_PATH="C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
) else if exist "C:\Program Files\Inno Setup 6\ISCC.exe" (
    set INNO_PATH="C:\Program Files\Inno Setup 6\ISCC.exe"
) else (
    echo [ОШИБКА] Inno Setup не найден.
    echo.
    echo Установите Inno Setup: https://jrsoftware.org/isdl.php
    echo.
    pause
    exit /b 1
)

:: Проверка наличия сборки
if not exist "..\dist-electron\win-unpacked\FinanceTracker.exe" (
    echo [ОШИБКА] Сборка приложения не найдена.
    echo.
    echo Сначала соберите приложение: npm run build:desktop
    echo.
    pause
    exit /b 1
)

echo [1/3] Генерация иконки...
if not exist "..\electron\assets\icon.ico" (
    powershell -ExecutionPolicy Bypass -File "generate-icon.ps1"
)

echo [2/3] Сборка установщика...
cd /d "%~dp0"
%INNO_PATH% "build-installer.iss"

if %ERRORLEVEL% equ 0 (
    echo.
    echo [ГОТОВО] Установщик создан:
    echo   ..\dist-electron\FinanceTracker_Setup_1.0.34.exe
    echo.
    echo Размер:
    for %%f in ("..\dist-electron\FinanceTracker_Setup_1.0.34.exe") do echo   %%~zf байт
) else (
    echo.
    echo [ОШИБКА] Сборка установщика не удалась (код: %ERRORLEVEL%)
)

echo.
pause