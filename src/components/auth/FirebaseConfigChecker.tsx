import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Settings, ExternalLink, Copy, Check } from 'lucide-react';
import { getFirebaseStatus } from '../../lib/firebase';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export function FirebaseConfigChecker() {
  const [status, setStatus] = useState(getFirebaseStatus());
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setStatus(getFirebaseStatus());
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getExampleConfig = () => {
    return `# Замените на ваши реальные значения из Firebase Console
VITE_FIREBASE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-ABCDEF1234`;
  };

  if (status.available) {
    return (
      <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
        <div className="flex items-center gap-2">
          <CheckCircle className="text-green-600 dark:text-green-400" size={16} />
          <span className="text-sm font-medium text-green-800 dark:text-green-200">
            Firebase подключен успешно
          </span>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-red-200 dark:border-red-800">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
          <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
          <div>
            <div className="font-semibold text-red-800 dark:text-red-200">
              Ошибка конфигурации Firebase
            </div>
            <div className="text-sm text-red-700 dark:text-red-300">
              {status.message}
            </div>
          </div>
        </div>

        {status.details?.configIssues && status.details.configIssues.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-red-800 dark:text-red-200">
              Обнаруженные проблемы:
            </h4>
            <ul className="space-y-1">
              {status.details.configIssues.map((issue: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="font-medium text-slate-900 dark:text-slate-100">
            Как исправить:
          </h4>
          
          <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">1.</span>
              <div>
                <span className="font-medium">Откройте Firebase Console:</span>
                <a 
                  href="https://console.firebase.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  console.firebase.google.com
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">2.</span>
              <span>Создайте новый проект или выберите существующий</span>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">3.</span>
              <span>Перейдите в Project Settings (⚙️) → General</span>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">4.</span>
              <span>В разделе "Your apps" нажмите "Add app" → Web (&lt;/&gt;)</span>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">5.</span>
              <span>Зарегистрируйте приложение с названием "FinanceTracker"</span>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">6.</span>
              <span>Скопируйте конфигурацию из "Firebase SDK snippet"</span>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">7.</span>
              <span>Включите Email/Password аутентификацию в разделе Authentication</span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Пример конфигурации .env:
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(getExampleConfig())}
            >
              {copied ? (
                <>
                  <Check size={14} className="mr-1" />
                  Скопировано!
                </>
              ) : (
                <>
                  <Copy size={14} className="mr-1" />
                  Копировать
                </>
              )}
            </Button>
          </div>
          <pre className="text-xs text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 p-3 rounded overflow-x-auto">
            {getExampleConfig()}
          </pre>
        </div>

        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Важно:</strong> После обновления .env файла перезапустите сервер разработки (Ctrl+C, затем npm run dev)
          </div>
        </div>

        <Button
          variant="secondary"
          onClick={() => setShowDetails(!showDetails)}
          fullWidth
        >
          <Settings size={16} className="mr-2" />
          {showDetails ? 'Скрыть детали' : 'Показать детали конфигурации'}
        </Button>

        {showDetails && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <h5 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
              Текущие переменные окружения:
            </h5>
            <div className="space-y-1 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">VITE_FIREBASE_API_KEY:</span>
                <span className={`${status.details?.hasApiKey ? 'text-green-600' : 'text-red-600'}`}>
                  {status.details?.hasApiKey ? 'Установлен' : 'Отсутствует'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">VITE_FIREBASE_AUTH_DOMAIN:</span>
                <span className={`${status.details?.hasAuthDomain ? 'text-green-600' : 'text-red-600'}`}>
                  {status.details?.hasAuthDomain ? 'Установлен' : 'Отсутствует'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">VITE_FIREBASE_PROJECT_ID:</span>
                <span className={`${status.details?.hasProjectId ? 'text-green-600' : 'text-red-600'}`}>
                  {status.details?.hasProjectId ? 'Установлен' : 'Отсутствует'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
