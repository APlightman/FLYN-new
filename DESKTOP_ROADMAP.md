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

- **Приоритет продукта**: desktop-first/local-first релиз. Cloud/server/TimeWeb/Firebase Sync остаются в кодовой базе, но отложены и не входят в критический путь релиза.
- **Движок БД**: `better-sqlite3` v11.7.0 (нативный Node.js модуль) — данные пишутся на диск синхронно.
- **Режим БД**: WAL (Write-Ahead Log) — повышает устойчивость данных при аварийном завершении.
- **Сборка**: `dist-electron/win-unpacked/` — портативная Electron-сборка.
- **Установщик**: `npx electron-builder --win` успешно создаёт NSIS-установщик `dist-electron/FinanceTracker Setup 1.0.42.exe`.
- **Путь БД**: `%APPDATA%/financetracker-desktop/data/finance-tracker.sqlite`.
- **Нативный бинарник**: распаковывается в `app.asar.unpacked/node_modules/better-sqlite3/build/Release/better_sqlite3.node`.

## ✅ Этап 8. Актуализация desktop-first релизного состояния (2026-07-08)

- ✅ восстановлены повреждённые TSX-файлы и битый test setup.
- ✅ `electron:dev` отвязан от server/cloud; старый cloud workflow сохранён как `electron:dev:cloud`.
- ✅ `server/.env.example` очищен от реальных/похожих на реальные секретов и заменён безопасными placeholder-значениями.
- ✅ добавлены/исправлены TypeScript-контракты renderer ↔ Electron preload API.
- ✅ `src/lib/timeWebApi.ts` переведён в desktop-first compatibility layer поверх Electron/SQLite IPC; cloud auth в этом слое является no-op.
- ✅ устранены блокеры TypeScript в формах, настройках, импорте/экспорте, уведомлениях, Firebase-auth compatibility и UI-компонентах.
- ✅ Electron validation приведена к текущей desktop data model:
  - `Budget`: `categoryId`, `amount`, `spent`, `remaining`, `period`, `group`, `percentage`.
  - `FinancialGoal`: `targetAmount`, `currentAmount`, `monthlyContribution`, `priority`, inflation-поля.
  - `Category`: только `income | expense`; устаревший `both` больше не принимается.
  - `RecurringPayment`: без поля `type`; поддерживаются `daily | weekly | monthly | yearly | custom`, для `custom` требуется `cronExpression`.
- ✅ валидатор сохраняет валидный `id` в sanitized payload, чтобы IPC-create корректно доходил до SQLite repositories.
- ✅ обновлены Electron validation-тесты под актуальную desktop/SQLite модель.

## Проверки на 2026-07-14

| Проверка | Статус | Примечание |
|----------|--------|------------|
| `node node_modules/typescript/bin/tsc -b --noEmit` | ✅ PASS | TypeScript ошибок нет |
| `npm run lint` | ✅ PASS | 5 warning'ов `react-refresh/only-export-components`, без ошибок |
| `npx vitest run --config vitest.electron.config.ts` | ✅ PASS | 124 теста, 4 файла |
| `npm run build:desktop` | ✅ PASS | Vite production build успешен |
| `npx electron-builder --dir --config.win.signAndEditExecutable=false` | ✅ PASS | `win-unpacked` собирается без Windows code-sign helper |
| `npx electron-builder --dir` | ✅ PASS | Стандартная x64 portable-сборка успешно завершена в сеансе с повышенными правами |
| `npx electron-builder --win` | ✅ PASS | Создан NSIS-установщик `FinanceTracker Setup 1.0.42.exe` для x64 и ia32 |
| Silent NSIS install в изолированную папку | ✅ PASS | Установщик завершился с кодом 0, установленный `FinanceTracker.exe` присутствует |
| Первый GUI-запуск установленного приложения | ✅ PASS | Процесс оставался активен 12 секунд в изолированном профиле |
| `--init-db` установленного приложения | ✅ PASS | Создана SQLite БД, применены 3 миграции и все доменные таблицы |
| WAL recovery smoke | ✅ PASS | После принудительного завершения: `integrity_check = ok`, WAL, 3 миграции и тестовая транзакция сохранены |
| CSV import/export и полный JSON backup | ✅ PASS | Round-trip CSV и наличие `recurringPayments` в backup покрыты тестами |
| Исправление import/export после ручной проверки | ✅ Автоматически проверено | Единый Electron export: CSV/JSON/TSV/PDF; PDF создаётся через `webContents.printToPDF`; имена включают время и миллисекунды, занятый файл даёт понятную инструкцию; UI-повторная проверка готового installer ещё требуется |

## Архитектура БД

- Адаптер `electron/modules/db/native-adapter.js` — создание/закрытие соединения через better-sqlite3 с WAL-режимом
- Драйвер `electron/modules/db/driver.js` — синхронное управление соединением, WAL checkpoint при закрытии
- Миграции: `electron/modules/db/migrations/` — 3 SQL-файла (001, 002, 003)
- Репозитории: `electron/modules/db/repositories/` — используют `db.prepare().all()/.get()/.run()`
- Валидация: `electron/modules/validation.js`
- `sqljs-adapter.js` — **оставлен** для обратной совместимости (больше не используется)

## План дальнейшей работы

### P0 — перед desktop-релизом

1. **Packaging Windows**
   - ✅ В сеансе с повышенными правами успешно пройдены `npx electron-builder --dir` и `npx electron-builder --win`.
    - ✅ Версия `1.0.42` выделена для исправлений import/export, включая сохранение в занятый файл; SHA-256 installer: `3bf05685c2d7bf235a8490680386df02c78a862509810708463b5c101e7b5d10`.
   - Перед публикацией повторить сборку из чистого рабочего дерева и сверить checksum артефакта.
2. **Завершить metadata релиза**
   - ✅ `author`, `productName`, `appId` и Windows icon проверены; `author` добавлен в `package.json`.
   - Перед публикацией подтвердить publisher/display name и юридические данные владельца продукта.
3. **Проверить чистую установку на Windows**
   - ✅ Silent NSIS-установка, инициализация SQLite, первый GUI-запуск и WAL recovery проверены в изолированной QA-папке.
   - Перед публикацией выполнить ручную установку под новым Windows-профилем: создание БД, CRUD всех сущностей, перезапуск и проверка сохранения.
4. **Проверить сценарии импорта/экспорта**
   - ✅ После ручного отчёта исправлены причины несоответствий: CSV экспортирует одну выбранную сущность, JSON доступен в UI, TSV не маскируется под Excel, PDF создаётся нативно через Electron, полный backup доступен только в JSON.
   - ✅ CSV round-trip, BOM, многострочные/экранированные поля, JSON backup, TSV и IPC PDF покрыты тестами.
   - Перед публикацией вручную проверить готовый installer: CSV, JSON, TSV, PDF и открытие созданного PDF в Windows.
   - Импорт из внешней SQLite БД.
   - Ошибочные файлы и частично валидные данные.
5. **Финальная проверка безопасности**
   - ✅ `.env.example` и `server/.env.example` очищены от похожих на реальные секретов; используются placeholder-значения.
   - Если реальные секреты попадали в историю git — ротировать их вне зависимости от очистки example-файлов.

### P1 — качество релиза

1. Добавить e2e/smoke сценарий запуска Electron-приложения на собранном `win-unpacked`.
2. Расширить Electron-тесты на CRUD через IPC для всех сущностей с реальной validation-моделью.
3. Документировать backup/restore и путь к SQLite-файлу для пользователя.
4. Решить, оставлять ли `@electron/rebuild` в devDependencies, так как electron-builder сообщает, что он избыточен.
5. Разобраться с warning'ами `react-refresh/only-export-components` или оставить их как допустимые dev-warning'и.

### P2 — после первого стабильного desktop-релиза

1. Настроить CI/CD для reproducible desktop builds.
2. Настроить цифровую подпись Windows installer.
3. Подготовить автообновления через `electron-updater` и GitHub Releases.
4. Вернуться к cloud/server синхронизации как отдельному направлению, не смешивая её с local-first desktop core.
