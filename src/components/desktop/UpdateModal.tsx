import React, { useState, useEffect } from 'react';
import { RefreshCw, Zap } from 'lucide-react';
import { useElectronIntegration } from '../../hooks/useElectronIntegration';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export function UpdateModal() {
  const { updateInfo } = useElectronIntegration();
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    if (updateInfo.available && !showUpdateModal) {
      setShowUpdateModal(true);
    }
  }, [updateInfo.available, showUpdateModal]);

  return (
    <Modal
      isOpen={showUpdateModal}
      onClose={() => setShowUpdateModal(false)}
      title="Доступно обновление"
    >
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <RefreshCw className="text-blue-600 dark:text-blue-400" size={24} />
            <div>
              <div className="font-semibold text-blue-800 dark:text-blue-200">
                Новая версия FinanceTracker
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                {updateInfo.info?.version && `Версия ${updateInfo.info.version} готова к установке`}
              </div>
            </div>
          </div>

          {updateInfo.progress !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Загрузка обновления...</span>
                <span>{updateInfo.progress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${updateInfo.progress}%` }}
                />
              </div>
            </div>
          )}

          {updateInfo.downloaded && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-sm text-green-800 dark:text-green-200">
                ✅ Обновление загружено! Приложение будет перезапущено для установки обновления.
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowUpdateModal(false)}
              fullWidth
            >
              Позже
            </Button>
            {updateInfo.downloaded && (
              <Button
                onClick={() => window.location.reload()}
                fullWidth
              >
                <Zap size={16} className="mr-2" />
                Перезапустить
              </Button>
            )}
          </div>
        </div>
      </Card>
    </Modal>
  );
}
