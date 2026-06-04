@echo off
chcp 65001 >nul
title FinanceTracker — Установка

:: Проверка прав администратора
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ВНИМАНИЕ] Для установки требуются права администратора.
    echo Перезапустите файл от имени администратора.
    echo.
    echo Нажмите любую клавишу для выхода...
    pause >nul
    exit /b 1
)

echo ============================================
echo   FinanceTracker — Установка на ПК
echo ============================================
echo.
echo Запуск графического установщика...
echo.

:: Запуск PowerShell установщика
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0install.ps1"

if %errorLevel% equ 0 (
    echo.
    echo Установка завершена.
) else (
    echo.
    echo Установка прервана или завершилась с ошибкой.
)

pause