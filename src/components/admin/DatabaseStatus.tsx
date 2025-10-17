import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, AlertTriangle, XCircle, RefreshCw, Activity, HardDrive, Users } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface DatabaseHealth {
  status: 'healthy' | 'warning' | 'error';
  timestamp: string;
  database: {
    connected: boolean;
    connectionTime: string | null;
    version: string;
    size: string;
    activeConnections: number;
  };
  schema: {
    expectedTables: number;
    existingTables: number;
    missingTables: string[];
    tableStats: Record<string, number | string>;
  };
  environment: {
    nodeVersion: string;
    platform: string;
    netlifyRegion: string;
  };
  error?: {
    message: string;
    code: string;
    details: string | null;
  };
  troubleshooting?: {
    commonCauses: string[];
    nextSteps: string[];
  };
}

export function DatabaseStatus() {
  const [health, setHealth] = useState<DatabaseHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkDatabaseHealth = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/.netlify/functions/health-check');
      const data = await response.json();
      
      setHealth(data);
      setLastCheck(new Date());
    } catch (error) {
      console.error('Health check failed:', error);
      setHealth({
        status: 'error',
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          connectionTime: null,
          version: 'Unknown',
          size: 'Unknown',
          activeConnections: 0
        },
        schema: {
          expectedTables: 0,
          existingTables: 0,
          missingTables: [],
          tableStats: {}
        },
        environment: {
          nodeVersion: 'Unknown',
          platform: 'Unknown',
          netlifyRegion: 'Unknown'
        },
        error: {
          message: 'Не удалось подключиться к функции проверки',
          code: 'NETWORK_ERROR',
          details: null
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeDatabase = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/.netlify/functions/init-database', {
        method: 'POST'
      });
      const result = await response.json();
      
      if (result.success) {
        alert('База данных успешно инициализирована!');
        await checkDatabaseHealth();
      } else {
        alert(`Ошибка инициализации: ${result.error}`);
      }
    } catch (error) {
      console.error('Initialization failed:', error);
      alert('Ошибка при инициализации базы данных');
    } finally {
      setLoading(false);
    }
  };

  const seedDefaultData = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/.netlify/functions/seed-data', {
        method: 'POST'
      });
      const result = await response.json();
      
      if (result.success) {
        alert('Данные по умолчанию добавлены!');
        await checkDatabaseHealth();
      } else {
        alert(`Ошибка добавления данных: ${result.error}`);
      }
    } catch (error) {
      console.error('Seeding failed:', error);
      alert('Ошибка при добавлении данных');
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
        return 'База данных работает нормально';
      case 'warning':
        return 'База данных работает с предупреждениями';
      case 'error':
        return 'Проблемы с базой данных';
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
            Состояние базы данных
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Мониторинг подключения к Neon PostgreSQL
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
                <span className="font-medium text-blue-800 dark:text-blue-200">Производительность</span>
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                Время подключения: {health.database.connectionTime}
              </div>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="text-green-600 dark:text-green-400" size={16} />
                <span className="font-medium text-green-800 dark:text-green-200">Размер БД</span>
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                {health.database.size}
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

      {/* Информация о схеме */}
      {health && (
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Схема базы данных
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">
                Статистика таблиц
              </h4>
              <div className="space-y-2">
                {Object.entries(health.schema.tableStats).map(([table, count]) => (
                  <div key={table} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {table}
                    </span>
                    <span className={`text-sm font-semibold ${
                      typeof count === 'number' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {typeof count === 'number' ? `${count} записей` : count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">
                Информация о системе
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">PostgreSQL:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {health.database.version.split(' ')[1]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Node.js:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {health.environment.nodeVersion}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Регион:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {health.environment.netlifyRegion}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {health.schema.missingTables.length > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-yellow-600 dark:text-yellow-400" size={16} />
                <span className="font-medium text-yellow-800 dark:text-yellow-200">
                  Отсутствующие таблицы
                </span>
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">
                {health.schema.missingTables.join(', ')}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Ошибки и устранение неполадок */}
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

            {health.troubleshooting && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Возможные причины:
                  </h4>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    {health.troubleshooting.commonCauses.map((cause, index) => (
                      <li key={index}>• {cause}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Рекомендуемые действия:
                  </h4>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    {health.troubleshooting.nextSteps.map((step, index) => (
                      <li key={index}>• {step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Действия администратора */}
      <Card>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Действия администратора
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={initializeDatabase}
            disabled={loading}
            variant="secondary"
            fullWidth
          >
            <Database size={16} className="mr-2" />
            Инициализировать схему БД
          </Button>
          
          <Button
            onClick={seedDefaultData}
            disabled={loading}
            variant="secondary"
            fullWidth
          >
            <HardDrive size={16} className="mr-2" />
            Добавить данные по умолчанию
          </Button>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Примечание:</strong> Эти функции следует использовать только при первом развертывании 
            или для восстановления схемы базы данных.
          </div>
        </div>
      </Card>

      {/* Детальная информация */}
      {health && health.database.connected && (
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Техническая информация
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">
                База данных
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Версия:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {health.database.version.split(' ')[0]} {health.database.version.split(' ')[1]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Размер:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {health.database.size}
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
                  <span className="text-slate-600 dark:text-slate-400">Node.js:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {health.environment.nodeVersion}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Платформа:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {health.environment.platform}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Регион:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {health.environment.netlifyRegion}
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
