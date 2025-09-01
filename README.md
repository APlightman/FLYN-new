# FinanceTracker - Desktop & Web Edition

Современное кроссплатформенное приложение для управления личными финансами с Firebase backend и Electron desktop версией.

## 🚀 Технологический стек

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Firebase (Firestore + Auth + Hosting)
- **Desktop**: Electron с системной интеграцией
- **PWA**: Service Worker для офлайн работы
- **State Management**: React Context + useReducer

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

## 🔥 Firebase Services

- **Firebase Auth** - аутентификация пользователей
- **Firestore** - NoSQL база данных в реальном времени
- **Firebase Hosting** - хостинг веб-версии
- **Firebase Analytics** - аналитика использования

## 📦 Установка и разработка

### 1. Клонирование и установка зависимостей

```bash
git clone <repository-url>
cd financetracker
npm install
```

### 2. Веб-разработка

```bash
# Запуск веб-версии
npm run dev

# Сборка веб-версии
npm run build
```

### 3. Десктопная разработка

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

### 4. Настройка Firebase

1. Создайте проект в [Firebase Console](https://console.firebase.google.com/)
2. Включите Authentication (Email/Password)
3. Создайте Firestore Database
4. Скопируйте конфигурацию в `.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-ABCDEF1234
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
    ├── Firebase интеграция
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

## 🗄️ Структура базы данных Firestore

### Collections:

**users** - профили пользователей
- `id`, `email`, `fullName`, `avatarUrl`
- `createdAt`, `updatedAt`

**transactions** - финансовые операции
- `userId`, `type`, `amount`, `category`
- `description`, `date`, `tags[]`

**categories** - категории доходов/расходов
- `userId`, `name`, `type`, `color`
- `parent`, `budget`

**budgets** - бюджетные лимиты
- `userId`, `categoryId`, `amount`, `period`
- `spent`

**goals** - финансовые цели
- `userId`, `name`, `targetAmount`, `currentAmount`
- `deadline`, `monthlyContribution`, `priority`

**recurringPayments** - регулярные платежи
- `userId`, `name`, `amount`, `category`
- `frequency`, `nextDate`, `isActive`

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
- **Real-time sync**: автоматическая синхронизация с Firebase
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
