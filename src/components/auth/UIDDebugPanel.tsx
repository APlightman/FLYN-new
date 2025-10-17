import React, { useState } from 'react';
import { Key, User, Database, Copy, Check, Wifi, WifiOff, Clock } from 'lucide-react';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

export function UIDDebugPanel() {
  const { user, signInWithUID } = useFirebaseAuth();
  const { state, isOnline } = useApp();
  const [testUID, setTestUID] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUIDLogin = async () => {
    if (!testUID.trim()) {
      alert('Введите UID пользователя');
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithUID(testUID.trim());
      if (result.error) {
        alert(`Ошибка: ${result.error.message}`);
      } else {
        alert('Успешный вход по UID!');
      }
    } catch (error) {
      console.error('UID login failed:', error);
      alert('Произошла ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  const copyCurrentUID = async () => {
    if (user?.uid) {
      try {
        await navigator.clipboard.writeText(user.uid);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy UID:', error);
      }
    }
  };

  const generateSampleUIDs = () => [
    'abc123def456ghi789jkl012',
    'user_' + Math.random().toString(36).substr(2, 20),
    'test_' + Date.now().toString(36),
  ];

  const getCachedUsers = () => {
    const cached = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('firebase_user_cache_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          cached.push({
            uid: data.uid,
            email: data.email,
            cachedAt: new Date(data.cachedAt).toLocaleString('ru-RU')
          });
        } catch (error) {
          console.error('Error parsing cached user:', error);
        }
      }
    }
    return cached;
  };

  const clearUserCache = () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('firebase_user_cache_')) {
        localStorage.removeItem(key);
      }
    });
    alert('Кэш пользователей очищен');
  };

  if (!user) return null;

  const cachedUsers = getCachedUsers();

  return (
    <Card className="mt-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <Key className="text-blue-600 dark:text-blue-400" size={24} />
          <div>
            <div className="font-semibold text-blue-800 dark:text-blue-200">
              Панель разработчика
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              Управление пользователями через UID
            </div>
          </div>
        </div>

        {/* Статус подключения */}
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          isOnline 
            ? 'bg-green-50 dark:bg-green-900/20' 
            : 'bg-orange-50 dark:bg-orange-900/20'
        }`}>
          {isOnline ? (
            <Wifi className="text-green-600 dark:text-green-400" size={16} />
          ) : (
            <WifiOff className="text-orange-600 dark:text-orange-400" size={16} />
          )}
          <span className={`text-sm font-medium ${
            isOnline 
              ? 'text-green-800 dark:text-green-200' 
              : 'text-orange-800 dark:text-orange-200'
          }`}>
            {isOnline ? 'Онлайн - данные загружаются из Firestore' : 'Оффлайн - используется локальный кэш'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="text-green-600 dark:text-green-400" size={16} />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Текущий пользователь
              </span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="text-green-700 dark:text-green-300">
                <strong>UID:</strong> {user.uid}
              </div>
              <div className="text-green-700 dark:text-green-300">
                <strong>Email:</strong> {user.email}
              </div>
              <div className="text-green-700 dark:text-green-300">
                <strong>Имя:</strong> {user.displayName || 'Не указано'}
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={copyCurrentUID}
              className="mt-2 w-full"
            >
              {copied ? (
                <>
                  <Check size={14} className="mr-1" />
                  Скопировано!
                </>
              ) : (
                <>
                  <Copy size={14} className="mr-1" />
                  Копировать UID
                </>
              )}
            </Button>
          </div>

          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Database className="text-purple-600 dark:text-purple-400" size={16} />
              <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                Статистика данных
              </span>
            </div>
            <div className="space-y-1 text-sm text-purple-700 dark:text-purple-300">
              <div>Транзакций: {state.transactions.length}</div>
              <div>Категорий: {state.categories.length}</div>
              <div>Целей: {state.goals.length}</div>
              <div>Бюджетов: {state.budgets.length}</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Тестовый вход по UID
            </label>
            <div className="flex gap-2">
              <Input
                value={testUID}
                onChange={(e) => setTestUID(e.target.value)}
                placeholder="Введите UID пользователя..."
                fullWidth
              />
              <Button
                onClick={handleUIDLogin}
                disabled={loading || !testUID.trim()}
                className="flex-shrink-0"
              >
                {loading ? 'Вход...' : 'Войти'}
              </Button>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              <strong>Примеры UID для тестирования:</strong>
            </div>
            <div className="space-y-1">
              {generateSampleUIDs().map((sampleUID, index) => (
                <button
                  key={index}
                  onClick={() => setTestUID(sampleUID)}
                  className="block w-full text-left text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  {sampleUID}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Кэшированные пользователи */}
        {cachedUsers.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="text-slate-600 dark:text-slate-400" size={16} />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Кэшированные пользователи ({cachedUsers.length})
                </span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={clearUserCache}
              >
                Очистить кэш
              </Button>
            </div>
            
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {cachedUsers.map((cachedUser, index) => (
                <button
                  key={index}
                  onClick={() => setTestUID(cachedUser.uid)}
                  className="w-full text-left p-2 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
                    {cachedUser.uid}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {cachedUser.email} • {cachedUser.cachedAt}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <div className="text-sm text-orange-800 dark:text-orange-200">
            <strong>Важно:</strong> Функция входа по UID предназначена только для разработки и тестирования. 
            В production используйте стандартную аутентификацию через email/пароль.
          </div>
        </div>

        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Оффлайн режим:</strong> При первом входе по UID данные кэшируются локально. 
            В дальнейшем можно входить даже без интернета.
          </div>
        </div>
      </div>
    </Card>
  );
}
