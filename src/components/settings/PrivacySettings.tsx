interface PrivacySettingsProps {
  privacy: {
    dataCollection: boolean;
    analytics: boolean;
  };
  onUpdatePrivacy: (
    updates: Partial<PrivacySettingsProps["privacy"]>,
  ) => void;
}

export function PrivacySettings({
  privacy,
  onUpdatePrivacy,
}: PrivacySettingsProps) {
  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center justify-between rounded-xl bg-slate-50 p-4 transition-colors hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700">
        <div>
          <div className="font-medium text-slate-900 dark:text-slate-100">
            Сбор анонимных данных
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Помогает улучшить приложение
          </div>
        </div>
        <input
          type="checkbox"
          checked={privacy.dataCollection}
          onChange={(event) =>
            onUpdatePrivacy({ dataCollection: event.target.checked })
          }
          className="rounded"
        />
      </label>

      <label className="flex cursor-pointer items-center justify-between rounded-xl bg-slate-50 p-4 transition-colors hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700">
        <div>
          <div className="font-medium text-slate-900 dark:text-slate-100">
            Аналитика использования
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Статистика использования функций
          </div>
        </div>
        <input
          type="checkbox"
          checked={privacy.analytics}
          onChange={(event) =>
            onUpdatePrivacy({ analytics: event.target.checked })
          }
          className="rounded"
        />
      </label>
    </div>
  );
}
