@echo off
echo ============================================
echo Упрощенная установка FinanceTracker Desktop
echo Исправленная версия v1.0.6-fixed
echo ============================================
echo.

echo Шаг 1: Создание папки приложения...
set INSTALL_DIR=C:\FinanceTracker
if not exist "%INSTALL_DIR%" (
    mkdir "%INSTALL_DIR%"
    echo   Создана папка: %INSTALL_DIR%
) else (
    echo   Папка уже существует: %INSTALL_DIR%
)

echo.
echo Шаг 2: Копирование файлов из новой сборки...
if exist "dist-electron-fixed\win-unpacked\*" (
    xcopy "dist-electron-fixed\win-unpacked\*" "%INSTALL_DIR%\" /E /I /Y
    echo   Файлы скопированы в %INSTALL_DIR%
) else if exist "dist-electron-release\win-unpacked\*" (
    echo   ВНИМАНИЕ: Используется старая сборка (dist-electron-release)
    echo   Рекомендуется использовать dist-electron-fixed
    xcopy "dist-electron-release\win-unpacked\*" "%INSTALL_DIR%\" /E /I /Y
    echo   Файлы скопированы в %INSTALL_DIR%
) else (
    echo   Ошибка: Исходные файлы не найдены!
    echo   Убедитесь, что папка dist-electron-fixed\win-unpacked существует
    pause
    exit /b 1
)

echo.
echo Шаг 3: Проверка наличия нативного модуля better-sqlite3...
if exist "%INSTALL_DIR%\resources\app.asar.unpacked\node_modules\better-sqlite3\build\Release\better_sqlite3.node" (
    echo   ✓ Нативный модуль better-sqlite3 найден
) else (
    echo   ✗ Нативный модуль better-sqlite3 НЕ НАЙДЕН!
    echo   Приложение может не запуститься. Проверьте сборку.
)

echo.
echo Шаг 4: Создание ярлыка на рабочем столе...
powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%USERPROFILE%\Desktop\FinanceTracker.lnk'); $s.TargetPath = '%INSTALL_DIR%\FinanceTracker.exe'; $s.WorkingDirectory = '%INSTALL_DIR%'; $s.Save()"

if exist "%USERPROFILE%\Desktop\FinanceTracker.lnk" (
    echo   Ярлык создан на рабочем столе
) else (
    echo   Не удалось создать ярлык (требуются права администратора)
)

echo.
echo Шаг 5: Проверка установки...
if exist "%INSTALL_DIR%\FinanceTracker.exe" (
    echo   ✓ Установка завершена успешно!
    echo.
    echo   Расположение: %INSTALL_DIR%
    echo   Исполняемый файл: FinanceTracker.exe
    for %%F in ("%INSTALL_DIR%\FinanceTracker.exe") do echo   Размер: %%~zF байт
) else (
    echo   ✗ Ошибка: Файл FinanceTracker.exe не найден!
)

echo.
echo ============================================
echo Инструкция по использованию:
echo 1. Запустите FinanceTracker.exe из папки %INSTALL_DIR%
echo 2. Или используйте ярлык на рабочем столе
echo 3. При первом запуске может потребоваться разрешение брандмауэра
echo.
echo Устранение проблем:
echo - Если приложение не запускается, запустите от имени администратора
echo - Проверьте исключения в антивирусе для папки %INSTALL_DIR%
echo - Логи хранятся в %%APPDATA%%\FinanceTracker\logs\
echo - Проверьте наличие app.asar.unpacked\node_modules\better-sqlite3\
echo ============================================
echo.
pause