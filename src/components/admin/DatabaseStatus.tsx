import { useState, useEffect } from 'react';
import { Database, CheckCircle, AlertTriangle, XCircle, RefreshCw, Activity, HardDrive, Users } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { transactionsApi } from '../../lib/timeWebApi';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';

interface DatabaseHealth {
  status: 'healthy' | 'warning' | 'error';
  timestamp: string;
  database: {
    connected: boolean;
    version: string;
    activeConnections: number;
  };
  environment: {
    platform: string;
  };
  error?: {
    message: string;
    code: string;
  };
}

export function DatabaseStatus() {
  const [health, setHealth] = useState<DatabaseHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const { user } = useFirebaseAuth();

  const checkDatabaseHealth = async () => {
    setLoading(true);
    
    try {
      // Проверяем подключение к TimeWebCloud API
      await transactionsApi.getAll();
      
      setHealth({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: {
          connected: true,
          version: 'TimeWebCloud API v1',
          activeConnections: 1
        },
        environment: {
          platform: 'TimeWebCloud'
        }
      });
      setLastCheck(new Date());
    } catch (error) {
      console.error('Health check failed:', error);
      setHealth({
        status: 'error',
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          version: 'Unknown',
          activeConnections: 0
        },
        environment: {
          platform: 'TimeWebCloud'
        },
        error: {
          message: (error as Error).message || 'Не удалось подключиться к API',
          code: 'NETWORK_ERROR'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkDatabaseHealth();
  }, []);

  const getStatusIcon = () => {
    if (!health) return <Database className="text-slate-400" size={24} />;
    
    switch (health.status) {
      case 'healthy':
        return <CheckCircle className="text-green-600 dark:text-green-400" size={24} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-600 dark:text-yellow-400" size={24} />;
      case 'error':
        return <XCircle className="text-red-600 dark:text-red-400" size={24} />;
      default:
        return <Database className="text-slate-400" size={24} />;
    }
  };

  const getStatusColor = () => {
    if (!health) return 'text-slate-600 dark:text-slate-400';
    
    switch (health.status) {
      case 'healthy':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  const getStatusText = () => {
    if (!health) return 'Проверка...';
    
    switch (health.status) {
      case 'healthy':
        return 'Подключение к TimeWebCloud API установлено';
      case 'warning':
        return 'Подключение с предупреждениями';
      case 'error':
        return 'Проблемы с подключением к TimeWebCloud API';
      default:
        return 'Неизвестный статус';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg shadow-blue-500/25">
          <Database className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Состояние подключения
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Мониторинг подключения к TimeWebCloud API
          </p>
        </div>
      </div>

      {/* Основной статус */}
      <Card variant="elevated">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {getStatusIcon()}
            <div>
              <h3 className={`text-lg font-semibold ${getStatusColor()}`}>
                {getStatusText()}
              </h3>
              {lastCheck && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Последняя проверка: {lastCheck.toLocaleTimeString('ru-RU')}
                </p>
              )}
            </div>
          </div>
          
          <Button
            onClick={checkDatabaseHealth}
            disabled={loading}
            variant="secondary"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Обновить
          </Button>
        </div>

        {health && health.database.connected && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="text-blue-600 dark:text-blue-400" size={16} />
                <span className="font-medium text-blue-800 dark:text-blue-200">Статус</span>
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                Подключено
              </div>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="text-green-600 dark:text-green-400" size={16} />
                <span className="font-medium text-green-800 dark:text-green-200">Платформа</span>
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                {health.environment.platform}
              </div>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Users className="text-purple-600 dark:text-purple-400" size={16} />
                <span className="font-medium text-purple-800 dark:text-purple-200">Подключения</span>
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">
                Активных: {health.database.activeConnections}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Ошибки */}
      {health && health.status === 'error' && health.error && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="text-red-600 dark:text-red-400" size={20} />
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
              Ошибка подключения
            </h3>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <div className="font-medium text-red-800 dark:text-red-200 mb-1">
                {health.error.message}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">
                Код ошибки: {health.error.code}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Детальная информация */}
      {health && health.database.connected && (
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Техническая информация
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">
                Подключение
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Статус:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    Подключено
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Версия API:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {health.database.version}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Активные подключения:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {health.database.activeConnections}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">
                Окружение
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Платформа:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {health.environment.platform}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Пользователь:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {user ? user.email : 'Не авторизован'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
