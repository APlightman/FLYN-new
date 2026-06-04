import React, { useState, useEffect } from "react";
import { isElectronApp } from "../../hooks/useElectronIntegration";

interface TraySettingsProps {
  closeBehavior: "exit" | "minimize-to-tray";
  onUpdateCloseBehavior: (behavior: "exit" | "minimize-to-tray") => void;
}

export function TraySettings({
  closeBehavior,
  onUpdateCloseBehavior,
}: TraySettingsProps) {
  const [electronAPI, setElectronAPI] = useState(false);

  useEffect(() => {
    setElectronAPI(isElectronApp());
  }, []);

  const handleChange = async (behavior: "exit" | "minimize-to-tray") => {
    onUpdateCloseBehavior(behavior);

    // Синхронизируем с main process через IPC
    if (window.electronAPI?.setCloseBehavior) {
      await window.electronAPI.setCloseBehavior(behavior);
    }
  };

  if (!electronAPI) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Настройка доступна только в десктопном приложении.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Выберите, что должно происходить при закрытии окна приложения:
      </p>

      <div className="space-y-3">
        <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
          <input
            type="radio"
            name="closeBehavior"
            value="minimize-to-tray"
            checked={closeBehavior === "minimize-to-tray"}
            onChange={() => handleChange("minimize-to-tray")}
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <div>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              Сворачивать в системный трей
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Приложение продолжит работать в фоне. Чтобы открыть его снова,
              дважды кликните по иконке в трее или используйте горячие клавиши{" "}
              <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">
                Ctrl+Shift+F
              </kbd>
              .
            </p>
          </div>
        </label>

        <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
          <input
            type="radio"
            name="closeBehavior"
            value="exit"
            checked={closeBehavior === "exit"}
            onChange={() => handleChange("exit")}
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <div>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              Закрывать приложение
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Приложение полностью завершится при закрытии окна.
            </p>
          </div>
        </label>
      </div>

      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          <strong>Горячие клавиши:</strong>
          <br />
          <kbd className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-800 rounded">
            Ctrl+H
          </kbd>{" "}
          — свернуть окно в трей
          <br />
          <kbd className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-800 rounded">
            Ctrl+Shift+F
          </kbd>{" "}
          — показать окно из трея
        </p>
      </div>
    </div>
  );
}
