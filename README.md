# FinanceTracker - Desktop & Web Edition

Современное desktop-first приложение для управления личными финансами с локальным хранением данных в Electron + SQLite. Cloud/server синхронизация сохранена в кодовой базе, но отложена и не входит в критический путь текущего desktop-релиза.

## Текущий фокус: desktop-first/local-first

На текущем этапе основной релизный путь — **Electron + SQLite**:

- приложение должно запускаться и работать без server/cloud;
- доменные данные хранятся локально в SQLite через Electron main process;
- renderer работает через безопасный preload/IPC API;
- cloud/TimeWeb/Firebase Sync рассматриваются как будущий отдельный этап.

Проверенный статус на 2026-07-20:

- `tsc -b --noEmit` — проходит;
- `npm run lint` — проходит с 5 Fast Refresh warning'ами;
- Electron-тесты — 124 passed;
- `npm run build:desktop` — проходит;
- `npx electron-builder --dir` — успешно собирает `win-unpacked`;
- `npx electron-builder --win` — успешно создаёт NSIS-установщик `dist-electron/FinanceTracker Setup 1.0.42.exe`.
- установленное приложение проходит smoke-проверку первого GUI-запуска, а SQLite работает в WAL-режиме и сохраняет данные после принудительного завершения процесса.
- экспорт в desktop UI использует единый файловый диалог: CSV, JSON, TSV и PDF; полный backup доступен только как JSON, чтобы сохранить все сущности и связи.
- имя экспортируемого файла включает локальные дату, время и миллисекунды; если выбранный файл занят, приложение сообщает, что нужно закрыть его или выбрать другое имя.
- CSV-импорт принимает только `.csv`, корректно обрабатывает BOM, экранированные и многострочные поля; импортируются транзакции и категории.

## 🔄 Миграция на TimeWebCloud

Исторически приложение было адаптировано для работы с TimeWebCloud в качестве облачного бэкенда. Сейчас это направление **отложено** до завершения стабильного desktop-first релиза.

### Изменения в архитектуре:

- **Firebase Auth** - сохранён для будущего cloud/web направления и не требуется для local-first desktop-работы.
- **TimeWebCloud API** - сохранён в кодовой базе как отложенное направление синхронизации; текущий desktop-релиз использует Electron IPC + SQLite.
- **PostgreSQL** - относится к будущему серверному направлению TimeWebCloud и не входит в архитектуру текущего desktop-релиза.

## 🚀 Технологический стек

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: отложенный TimeWebCloud API + Firebase Auth/Firebase Hosting для будущего cloud/web направления
- **Database**:
  - **Desktop**: SQLite с миграциями и индексами производительности
  - **Web**: PostgreSQL (TimeWebCloud)
- **Desktop**: Electron с системной интеграцией (SQLite, IPC безопасность, валидация данных)
- **PWA**: Service Worker для офлайн работы
- **State Management**: React Context + useReducer с разделением UI состояния и domain данных
- **Валидация данных**: Схемы валидации для всех сущностей (transaction, category, budget, goal, recurringPayment)
- **Производительность**: Составные индексы, кэширование репозиториев, оптимизированные запросы

## 🖥️ Десктопная версия (NEW!)

### Особенности:

- **Системная интеграция**: Трей, автозапуск, уведомления
- **Горячие клавиши**: Ctrl+N (новая транзакция), Ctrl+1-5 (навигация)
- **Нативные уведомления**: Превышение бюджета, напоминания о целях
- **Файловая система**: Экспорт прямо в выбранную папку
- **Автообновления**: Через GitHub Releases
- **Кроссплатформенность**: Windows, macOS, Linux

### Горячие клавиши:

```
🎯 Навигация:
Ctrl+1 - Главная панель
Ctrl+2 - Транзакции
Ctrl+3 - Бюджет
Ctrl+4 - Финансовые цели
Ctrl+5 - Аналитика

💰 Быстрые действия:
Ctrl+N - Добавить транзакцию
Ctrl+Shift+I - Добавить доход
Ctrl+Shift+E - Добавить расход
Ctrl+Shift+F - Показать приложение

📊 Данные:
Ctrl+E - Экспорт данных
Ctrl+I - Импорт данных
```

## 🗃️ Архитектура хранения данных (Desktop-first)

### Миграция на SQLite

В рамках развития desktop-версии была реализована полноценная локальная база данных SQLite с системой миграций и оптимизацией производительности.

#### Ключевые компоненты:

- **SQLite драйвер**: better-sqlite3 для синхронного доступа
- **Система миграций**: Версионирование схемы через таблицу `schema_migrations`
- **Репозитории**: Изолированные модули для каждой сущности (transactions, categories, budgets, goals, recurring_payments)
- **Индексы производительности**: 30+ составных индексов для ускорения частых запросов
- **Кэширование**: In-memory кэш для редко изменяемых данных (категории) с TTL 5 минут

#### Структура данных:

- **Domain данные**: Хранятся в отдельных таблицах с полной историей (created_at, updated_at, version)
- **UI состояние**: Фильтры, тема, выбранная дата сохраняются в таблице `app_state`
- **Разделение данных**: Предотвращение дублирования через явное разделение UI и domain слоёв

#### Безопасность IPC:

- **Валидация данных**: Схемы валидации для всех сущностей перед сохранением
- **Санетизация**: Очистка входных данных от потенциально опасных полей
- **Проверка типов**: Валидация entityType и структуры payload в IPC обработчиках

#### Производительность:

- **Составные индексы**: Для фильтрации по дате, типу, категории, статусу recurring
- **Оптимизированные запросы**: Использование покрывающих индексов (covering indexes)
- **Пакетные операции**: Минимизация количества запросов к базе

### Миграции базы данных

Приложение поддерживает постепенное обновление схемы через систему миграций:

1. **001_initial_schema.sql** - таблица `app_state` для обратной совместимости
2. **002_domain_entities.sql** - таблицы transactions и categories
3. **003_remaining_entities.sql** - budgets, financial_goals, recurring_payments

Миграции применяются автоматически при запуске приложения через `ensureDatabaseReady()`.

## 🔥 Firebase Services (отложенное cloud/web направление)

- **Firebase Auth** - сохранён для будущей пользовательской аутентификации в cloud/web версии; desktop-релиз от него не зависит.
- **Firebase Hosting** - возможный хостинг будущей веб-версии.
- **Firebase Analytics** - возможная аналитика будущего cloud/web направления.

## ☁️ TimeWebCloud Services (отложенное cloud/server направление)

- **REST API** - сохранён для будущей синхронизации данных; не используется в local-first desktop-пути.
- **PostgreSQL** - предполагаемая серверная база данных будущего TimeWebCloud направления.
- **Node.js Server** - сохранённый серверный компонент для будущей обработки cloud-запросов.

## 📦 Установка и разработка

### 1. Клонирование и установка зависимостей

```bash
git clone <repository-url>
cd financetracker
npm install
```

### 2. Настройка Firebase

1. Создайте проект в [Firebase Console](https://console.firebase.google.com/)
2. Включите Authentication (Email/Password)
3. Скопируйте конфигурацию в `.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-ABCDEF1234
```

### 3. Настройка TimeWebCloud

1. Создайте аккаунт в [TimeWebCloud](https://timeweb.cloud/)
2. Создайте базу данных PostgreSQL
3. Разверните серверное приложение из директории `server/`
4. Скопируйте параметры подключения в `.env` сервера:

```env
DATABASE_URL=postgresql://user:password@host:port/database
TIMEWEB_API_URL=your_api_url
```

### 4. Веб-разработка

```bash
# Запуск веб-версии
npm run dev

# Сборка веб-версии
npm run build
```

### 5. Десктопная разработка

```bash
# Запуск в Electron (hot reload)
npm run electron:dev

# Сборка только приложения (без installer)
npm run electron:pack

# Полная сборка с installer
npm run electron:dist

# Сборка для конкретной платформы
npm run electron:dist:win    # Windows
npm run electron:dist:mac    # macOS
npm run electron:dist:linux  # Linux
```

## 🏗️ Архитектура десктопного приложения

```
FinanceTracker Desktop
├── Main Process (electron/main.js)
│   ├── Управление окнами
│   ├── Системный трей
│   ├── Горячие клавиши
│   ├── Автообновления
│   ├── Файловые операции
│   └── Уведомления
├── Preload Script (electron/preload.js)
│   ├── Безопасный API
│   └── IPC коммуникация
└── Renderer Process (React App)
    ├── Firebase Auth интеграция
    ├── TimeWebCloud API интеграция
    ├── Компоненты UI
    ├── Десктопные фичи
    └── Общий код с веб-версией
```

## 📱 Версии приложения

### 🌐 Веб-версия (PWA)

- Работает в любом браузере
- Установка через браузер
- Ограниченные системные возможности
- Полная функциональность

### 🖥️ Десктопная версия

- Нативное приложение для ОС
- Системные уведомления и трей
- Файловая система
- Горячие клавиши
- Автозапуск и автообновления

## 🚀 Сборка и релиз десктопной версии

### Системные требования

- **Node.js**: 18+ (рекомендуется LTS)
- **npm**: 9+ или yarn/pnpm
- **Windows**: Windows 10+ (x64, ia32), Visual Studio Build Tools для сборки native модулей
- **macOS**: 10.15+ (Catalina) с Xcode Command Line Tools
- **Linux**: Ubuntu 18.04+, Debian 10+, Fedora 32+ с библиотеками GTK3 и libnotify

### Подготовка к сборке

1. **Установите зависимости**:

   ```bash
   npm install
   ```

2. **Установите native модули**:

   ```bash
   npm run postinstall
   ```

   Эта команда установит зависимости для electron-builder и пересоберет native модули (better-sqlite3).

3. **Проверьте конфигурацию сборки**:
   ```bash
   npm run test:platforms
   ```
   Скрипт проверит наличие всех необходимых файлов и конфигураций для сборки на всех платформах.

### Создание инсталляторов

#### Windows (NSIS)

```bash
npm run electron:dist:win
```

Создает установочный файл `FinanceTracker Setup X.X.X.exe` в папке `dist-electron`. Поддерживает архитектуры x64 и ia32.

**Особенности**:

- Инсталлятор с выбором директории установки
- Создание ярлыков на рабочем столе и в меню "Пуск"
- Автоматическое удаление предыдущих версий
- Минимальная версия Windows: 10.0.19041

#### macOS (DMG)

```bash
npm run electron:dist:mac
```

Создает образ диска `.dmg` для macOS (требуется macOS для сборки).

**Особенности**:

- Поддержка архитектур x64 и arm64 (Apple Silicon)
- Автоматическое размещение в папке Applications
- Подпись приложения (требуется сертификат разработчика)

#### Linux (AppImage, DEB)

```bash
npm run electron:dist:linux
```

Создает пакеты AppImage и DEB для Linux.

**Особенности**:

- AppImage: portable версия, не требует установки
- DEB: пакет для Debian/Ubuntu
- Поддержка только x64 архитектуры

### Автоматический релиз

Приложение настроено для автоматической публикации релизов на GitHub Releases через electron-updater.

**Скрипты релиза**:

```bash
# Создать патч-релиз (версия X.X.X → X.X.X+1)
npm run release:electron:patch

# Создать минорный релиз (версия X.X.X → X.X+1.0)
npm run release:electron:minor

# Создать мажорный релиз (версия X.X.X → X+1.0.0)
npm run release:electron:major

# Тестовый релиз без публикации
npm run release:electron:dry
```

**Процесс релиза**:

1. Автоматически увеличивает версию в package.json
2. Создает тег Git с версией
3. Собирает приложение для всех платформ
4. Публикует релиз на GitHub Releases
5. Загружает артефакты (установочные файлы)

### Тестирование сборки

Перед релизом рекомендуется протестировать сборку на целевых платформах:

1. **Проверка целостности данных**:

   ```bash
   node test_data_integrity.cjs
   ```

2. **Интеграционное тестирование**:

   ```bash
   node integration_test.cjs
   ```

3. **Тестирование миграций базы данных**:
   ```bash
   node test_apply_migration_005.cjs
   ```

### Устранение проблем сборки

#### Ошибка сборки better-sqlite3

Если возникает ошибка `No prebuilt binaries found`, установите Visual Studio Build Tools (Windows) или Xcode Command Line Tools (macOS) и переустановите модуль:

```bash
npm rebuild better-sqlite3
```

#### Ошибка electron-builder

Если electron-builder не может найти файлы, убедитесь что выполнена сборка веб-версии:

```bash
npm run build:desktop
```

## 🛠️ Команды сборки

```bash
# Разработка
npm run dev              # Веб dev сервер
npm run electron:dev     # Electron dev режим

# Сборка
npm run build           # Веб сборка
npm run electron:pack   # Десктоп (без installer)
npm run electron:dist   # Десктоп с installer

# Platform-specific
npm run electron:dist:win    # Windows (NSIS installer)
npm run electron:dist:mac    # macOS (DMG)
npm run electron:dist:linux  # Linux (AppImage, DEB)

# Firebase
npm run firebase:deploy     # Деплой веб-версии
npm run firebase:emulators  # Локальные эмуляторы
```

## 🧪 Тестирование

### Запуск тестов

```bash
# Запуск unit тестов
npm test

# Запуск e2e тестов
npm run test:e2e

# Запуск тестов с покрытием
npm run test:coverage
```

### Тестирование десктопной версии

```bash
# Запуск e2e тестов для десктопа
npm run test:e2e:desktop
```

## 🗄️ Структура базы данных

### Таблицы PostgreSQL:

**users** - профили пользователей

- `id`, `email`, `full_name`, `avatar_url`
- `created_at`, `updated_at`

**transactions** - финансовые операции

- `id`, `user_id`, `type`, `amount`, `category`
- `description`, `date`, `tags`
- `created_at`, `updated_at`

**categories** - категории доходов/расходов

- `id`, `user_id`, `name`, `type`, `color`
- `parent_id`, `budget`
- `created_at`, `updated_at`

**budgets** - бюджетные лимиты

- `id`, `user_id`, `category_id`, `amount`, `period`
- `spent`
- `created_at`, `updated_at`

**goals** - финансовые цели

- `id`, `user_id`, `name`, `target_amount`, `current_amount`
- `deadline`, `monthly_contribution`, `priority`
- `description`
- `created_at`, `updated_at`

**recurring_payments** - регулярные платежи

- `id`, `user_id`, `name`, `amount`, `category`
- `frequency`, `cron_expression`, `next_date`, `is_active`
- `description`
- `created_at`, `updated_at`

## 🎯 Основные функции

### 💰 Финансовый учет

- ✅ Учет доходов и расходов с категориями
- ✅ Конвертная система бюджетирования (50/30/20)
- ✅ Финансовые цели с учетом инфляции
- ✅ Регулярные автоматические платежи
- ✅ Аналитика и отчеты с графиками
- ✅ Календарный вид транзакций

### 🔧 Инструменты

- ✅ Финансовые калькуляторы (ипотека, депозиты, кредиты)
- ✅ Импорт/экспорт данных (CSV, Excel, PDF)
- ✅ Темная/светлая тема
- ✅ Полная работа в офлайн режиме

### 🖥️ Десктопные возможности (NEW!)

- ✅ Системный трей с быстрыми действиями
- ✅ Глобальные горячие клавиши
- ✅ Умные уведомления о бюджете
- ✅ Автозапуск при старте системы
- ✅ Автоматические резервные копии
- ✅ Нативные диалоги сохранения файлов
- ✅ Автообновления приложения

## 🔔 Система уведомлений (Desktop)

- **Превышение бюджета**: Мгновенные алерты при превышении лимитов
- **Приближение к лимиту**: Предупреждения при 80% использования бюджета
- **Напоминания о целях**: За неделю и день до дедлайна
- **Еженедельные отчеты**: Автоматические сводки по воскресеньям
- **Системный трей**: Счетчик активных предупреждений

## 📊 Архитектурные особенности

- **Offline-first**: все операции сначала выполняются локально
- **Real-time sync**: автоматическая синхронизация с TimeWebCloud
- **Optimistic updates**: мгновенный отклик интерфейса
- **Error resilience**: graceful handling ошибок сети
- **Performance**: мемоизация и оптимизация рендеринга
- **Cross-platform**: общий код для веб и десктопа

## 🔄 Миграция между версиями

### Веб → Десктоп

1. Экспортируйте данные из веб-версии
2. Установите десктопную версию
3. Войдите с тем же аккаунтом Firebase
4. Данные автоматически синхронизируются

### Десктоп → Веб

1. Все данные автоматически доступны в веб-версии
2. Войдите с тем же аккаунтом Firebase
3. Полная синхронизация

## 🚀 Деплой и распространение

### Веб-версия

```bash
npm run build
firebase deploy
```

### Сервер TimeWebCloud

```bash
# Инициализация базы данных
cd server
npm run init-db

# Запуск сервера
npm start

# Или в режиме разработки
npm run dev
```

### Десктопная версия

```bash
# Автоматическая сборка для всех платформ
npm run electron:dist

# Результат:
dist-electron/
├── win-unpacked/           # Windows приложение
├── mac/                    # macOS app
├── linux-unpacked/         # Linux приложение
├── FinanceTracker Setup.exe # Windows installer
├── FinanceTracker.dmg      # macOS installer
└── FinanceTracker.AppImage # Linux installer
```

## 📞 Поддержка

- **Email**: support@financetracker.com
- **Документация**: [docs.financetracker.com](https://docs.financetracker.com)
- **GitHub Issues**: [github.com/financetracker/desktop](https://github.com/financetracker/desktop)
- **Discord**: [discord.gg/financetracker](https://discord.gg/financetracker)

## 🏆 Системные требования

### Минимальные:

- **Windows**: 10 (версия 1903) и выше
- **macOS**: 10.15 Catalina и выше
- **Linux**: Ubuntu 18.04, Fedora 32, Debian 10
- **RAM**: 4GB
- **Место**: 500MB свободного места

### Рекомендуемые:

- **RAM**: 8GB
- **Процессор**: Intel i5 / AMD Ryzen 5 или лучше
- **Разрешение**: 1920x1080 и выше

---

**FinanceTracker** - ваш надежный помощник в управлении личными финансами на любой платформе! 💰🖥️📱

# FLYN-new
