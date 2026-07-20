# План: Unit-тесты для критических модулей

## Обоснование

В проекте полностью отсутствуют unit-тесты при том, что Vitest уже настроен в [`vite.config.ts`](vite.config.ts) и [`src/setupTests.ts`](src/setupTests.ts). Три модуля в `electron/` являются критическими для целостности данных и не имеют тестового покрытия.

---

## Цель

Покрыть тестами 3 критических модуля, от которых зависит целостность данных:

1. [`electron/modules/validation.js`](electron/modules/validation.js) — 550 строк, 5 валидаторов
2. [`electron/modules/db/index.js`](electron/modules/db/index.js) — 860 строк, фасад БД
3. [`electron/modules/ipcHandlers.js`](electron/modules/ipcHandlers.js) — 265 строк, 20 IPC-каналов

---

## План действий

### Шаг 1: Настроить тестовую инфраструктуру для Electron-модулей

Создать [`electron/modules/__tests__/setup.js`](electron/modules/__tests__/setup.js) — моки для:
- `better-sqlite3` — in-memory БД для тестов
- `electronRuntime.js` — `app`, `ipcMain`, `dialog`, `Notification`
- `electron-updater` — `autoUpdater`

### Шаг 2: Тесты для validation.js

Создать [`electron/modules/__tests__/validation.test.js`](electron/modules/__tests__/validation.test.js):

| Тест-кейс | Описание |
|-----------|----------|
| `isValidEntityType` | Проверка всех 5 типов + невалидный тип |
| `validateId` | UUID v4, строка 1-100 символов, пустая строка |
| `validateTransaction` | Полный payload, пропущенные поля, невалидные значения |
| `validateCategory` | Название, цвет, тип, пустое название |
| `validateBudget` | Категория, лимит, spent, период |
| `validateGoal` | Название, target, current, deadline |
| `validateRecurringPayment` | Название, сумма, категория, частота |
| `validateUpdates` | Частичные обновления, пустой объект |
| Санитизация | Обрезка строк, trim, теги |

### Шаг 3: Тесты для db/index.js

Создать [`electron/modules/__tests__/db.test.js`](electron/modules/__tests__/db.test.js):

| Тест-кейс | Описание |
|-----------|----------|
| `ensureDatabaseReady` | Успешное открытие БД, повторный вызов (кэш) |
| `loadPersistedAppState` | Загрузка существующего состояния, отсутствующее состояние |
| `savePersistedAppState` | Сохранение нового состояния, обновление существующего |
| `bootstrapDomainDataFromState` | Пустая БД, частично заполненная БД |
| `listDomainData` | Список всех сущностей |
| `createDomainEntity` | Создание для каждого типа сущности |
| `updateDomainEntity` | Обновление существующей, обновление несуществующей |
| `deleteDomainEntity` | Удаление существующей, удаление несуществующей |
| `checkExternalDatabase` | Директория с .db файлами, пустая директория |
| `importFromExternalDatabase` | Импорт из внешней БД, несуществующий файл |

### Шаг 4: Тесты для ipcHandlers.js

Создать [`electron/modules/__tests__/ipcHandlers.test.js`](electron/modules/__tests__/ipcHandlers.test.js):

| Тест-кейс | Описание |
|-----------|----------|
| `show-save-dialog` | Вызов диалога с опциями |
| `show-open-dialog` | Вызов диалога с опциями |
| `save-file` | Успешная запись, ошибка записи |
| `read-file` | Успешное чтение, файл не найден |
| `show-notification` | Показ уведомления, клик по уведомлению |
| `get-system-info` | Возврат информации о системе |
| `storage:create-entity` | Валидный payload, невалидный тип, невалидный payload |
| `storage:update-entity` | Валидные обновления, невалидный ID |
| `storage:delete-entity` | Валидный ID, невалидный тип |
| `storage:check-external-db` | С путём и без пути |
| `storage:import-from-external` | С путём и без пути |

### Шаг 5: Настроить vitest.config.ts для Electron-модулей

Создать [`vitest.electron.config.ts`](vitest.electron.config.ts):

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['electron/modules/**/*.test.js'],
    setupFiles: ['./electron/modules/__tests__/setup.js'],
  },
});
```

### Шаг 6: Добавить скрипты в package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:electron": "vitest --config vitest.electron.config.ts",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch"
  }
}
```

---

## Оценка объёма работ

| Задача | Файлов | Строк кода | Сложность |
|--------|--------|------------|-----------|
| Инфраструктура тестов | 2 файла | ~80 | 🟢 Низкая |
| Тесты validation.js | 1 файл | ~300 | 🟡 Средняя |
| Тесты db/index.js | 1 файл | ~400 | 🔴 Высокая (нужны моки БД) |
| Тесты ipcHandlers.js | 1 файл | ~250 | 🟡 Средняя |
| Скрипты package.json | 1 файл | ~5 | 🟢 Низкая |
| **Итого** | **6 файлов** | **~1035** | |

---

## Порядок выполнения

```mermaid
graph LR
    A[Инфраструктура тестов] --> B[Тесты validation.js]
    B --> C[Тесты db/index.js]
    C --> D[Тесты ipcHandlers.js]
    D --> E[Скрипты package.json]
```

1. **Инфраструктура** — setup-файлы, моки, конфиг vitest
2. **validation.js** — самый независимый модуль, не требует БД
3. **db/index.js** — требует моки для better-sqlite3
4. **ipcHandlers.js** — требует моки для Electron API
5. **Скрипты** — чтобы всё запускалось одной командой