import React, { useState } from 'react';
import { Database, Settings as SettingsIcon } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { DatabaseStatus } from '../admin/DatabaseStatus';

export function DatabaseSettings() {
  const [showDatabaseStatus, setShowDatabaseStatus] = useState(false);

  return (
    <>
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <Database className="text-blue-600 dark:text-blue-400" size={20} />
            <h4 className="font-semibold text-blue-800 dark:text-blue-200">
              База данных Neon
            </h4>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
            Мониторинг состояния PostgreSQL базы данных и управление схемой
          </p>
          
          <Button
            onClick={() => setShowDatabaseStatus(true)}
            variant="secondary"
            size="sm"
          >
            <SettingsIcon size={16} className="mr-2" />
            Открыть панель управления БД
          </Button>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <div className="text-sm text-slate-700 dark:text-slate-300">
            <strong>Доступные функции:</strong>
          </div>
          <ul className="text-sm text-slate-600 dark:text-slate-400 mt-2 space-y-1">
            <li>• Проверка подключения и производительности</li>
            <li>• Мониторинг состояния таблиц и данных</li>
            <li>• Инициализация схемы базы данных</li>
            <li>• Добавление данных по умолчанию</li>
          </ul>
        </div>
      </div>

      <Modal
        isOpen={showDatabaseStatus}
        onClose={() => setShowDatabaseStatus(false)}
        title="Управление базой данных"
        size="xl"
      >
        <DatabaseStatus />
      </Modal>
    </>
  );
}
