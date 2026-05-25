# Roadmap: desktop-first переход

## Цель
Собрать устойчивую desktop-версию FinanceTracker без обязательных внешних сервисов.

## Этап 1. Стабилизация запуска
- убрать обязательный Firebase/login flow из критического пути
- отключить старую sync-логику
- перевести приложение на локальное хранение состояния как временную опору
- почистить UI от обязательных cloud-зависимостей

## Этап 2. Локальный слой данных
- добавить SQLite в Electron main process
- определить место хранения БД через `app.getPath('userData')`
- ввести миграции и версионирование схемы
- подготовить repositories/services для доменных сущностей

## Этап 3. Переход данных на SQLite
- transactions
- categories
- budgets
- goals
- recurring payments
- settings

## Этап 4. IPC и preload API
- описать доменные IPC-каналы
- вынести SQL из renderer
- закрыть renderer за безопасным preload API

## Этап 5. Продуктовая стабилизация
- backup / restore
- import / export
- десктопные уведомления
- горячие клавиши
- polishing desktop UX

## Что сделано в этом шаге
- desktop-режим запускается без обязательной авторизации
- временный локальный store переведён на localStorage вместо заглушки sync-слоя
- UI больше не зависит от фоновой облачной синхронизации при старте
- добавлен каркас SQLite-архитектуры в Electron main: driver, migrations, repository, IPC и preload API
- renderer теперь умеет загружать и сохранять app state через desktop storage API с fallback на localStorage

## Следующий практический шаг
- Установить `better-sqlite3` и переключить persistence с fallback-режима на полноценную SQLite-запись.
- После этого вынести доменные CRUD-операции из AppContext в отдельные SQLite repositories и IPC-команды.
