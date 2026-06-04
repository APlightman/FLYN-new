# Roadmap: desktop-first переход

## Цель

Собрать устойчивую desktop-версию FinanceTracker без обязательных внешних сервисов.

## ✅ Этап 1. Стабилизация запуска

- ✅ убрать обязательный Firebase/login flow из критического пути
- ✅ отключить старую sync-логику
- ✅ перевести приложение на локальное хранение состояния как временную опору
- ✅ почистить UI от обязательных cloud-зависимостей

## ✅ Этап 2. Локальный слой данных

- ✅ добавить SQLite в Electron main process
- ✅ определить место хранения БД через `app.getPath('userData')`
- ✅ ввести миграции и версионирование схемы
- ✅ подготовить repositories/services для доменных сущностей

## ✅ Этап 3. Переход данных на SQLite

- ✅ transactions
- ✅ categories
- ✅ budgets
- ✅ goals
- ✅ recurring payments
- ✅ settings

## ✅ Этап 4. IPC и preload API

- ✅ описать доменные IPC-каналы
- ✅ вынести SQL из renderer
- ✅ закрыть renderer за безопасным preload API

## ✅ Этап 5. Продуктовая стабилизация

- ✅ backup / restore
- ✅ import / export
- ✅ десктопные уведомления
- ✅ горячие клавиши
- ✅ polishing desktop UX

## ✅ Этап 6. Сборка и установка на ПК

- ✅ замена `better-sqlite3` на `sql.js` (WebAssembly) — решение проблемы ABI-несовместимости
- ✅ сборка установщика через electron-builder
- ✅ тестирование на ПК: приложение запускается и работает стабильно

## ✅ Этап 7. Переход на нативный SQLite (better-sqlite3)

- ✅ замена `sql.js` (WebAssembly) на `better-sqlite3` (нативный модуль Node.js)
- ✅ создание `native-adapter.js` — адаптер с WAL-режимом и оптимальными прагмами
- ✅ переписан `driver.js` — убран таймер автосохранения, данные пишутся сразу на диск
- ✅ обновлён `index.js` — убран импорт sql.js, `importFromExternalDatabase` использует better-sqlite3
- ✅ обновлён `package.json` — sql.js удалён, better-sqlite3 добавлен, asarUnpack исправлен
- ✅ сборка `electron:pack` — Vite (1556 modules) + electron-builder успешно
- ✅ `better_sqlite3.node` в `app.asar.unpacked` — нативный бинарник под Electron 28.3.3
- ✅ `sql.js` полностью отсутствует в сборке
- ✅ тестирование: приложение запущено, БД создана в WAL-режиме, данные сохраняются после `taskkill /f`

## Текущее состояние

- **Движок БД**: `better-sqlite3` v11.7.0 (нативный Node.js модуль) — данные пишутся на диск синхронно
- **Режим БД**: WAL (Write-Ahead Log) — гарантирует целостность данных даже при аварийном завершении
- **Сборка**: `dist-electron/win-unpacked/` — портативная сборка
- **Установщик**: `dist-electron/FinanceTracker Setup 1.0.20.exe`
- **Путь БД**: `%APPDATA%/financetracker-desktop/data/finance-tracker.sqlite`
- **Нативный бинарник**: распакован в `app.asar.unpacked/node_modules/better-sqlite3/build/Release/better_sqlite3.node`

## Архитектура БД

- Адаптер `electron/modules/db/native-adapter.js` — создание/закрытие соединения через better-sqlite3 с WAL-режимом
- Драйвер `electron/modules/db/driver.js` — синхронное управление соединением, WAL checkpoint при закрытии
- Миграции: `electron/modules/db/migrations/` — 3 SQL-файла (001, 002, 003)
- Репозитории: `electron/modules/db/repositories/` — используют `db.prepare().all()/.get()/.run()`
- Валидация: `electron/modules/validation.js`
- `sqljs-adapter.js` — **оставлен** для обратной совместимости (больше не используется)

## Следующий практический шаг

- Настроить автоматическую сборку через CI/CD (GitHub Actions)
- Добавить автообновления через electron-updater
- Подписать установщик цифровой подписью
