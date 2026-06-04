import { useState, useEffect, useCallback } from "react";
import {
  Database,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  FolderOpen,
  FileSearch,
} from "lucide-react";
import { Button } from "../ui/Button";
import {
  checkExternalDatabase,
  importFromExternalDatabase,
} from "../../lib/desktopStorage";

interface ExternalFileInfo {
  name: string;
  path: string;
}

interface ImportResult {
  success: boolean;
  imported?: {
    transactions: number;
    categories: number;
    budgets: number;
    goals: number;
    recurringPayments: number;
    appState: boolean;
  };
  error?: string;
  errors?: string[];
  skipped?: string[];
}

type ImportStatus =
  | "idle"
  | "checking"
  | "ready"
  | "importing"
  | "done"
  | "error";

export function ExternalDataImport() {
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [files, setFiles] = useState<ExternalFileInfo[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchPath, setSearchPath] = useState<string>("C:\\SQLite");

  const checkForDatabases = useCallback(
    async (directoryPath?: string) => {
      setStatus("checking");
      setError(null);
      setResult(null);

      try {
        const targetPath = directoryPath || searchPath;
        const response = await checkExternalDatabase(targetPath);

        if (response.found && response.files.length > 0) {
          const fileList: ExternalFileInfo[] = response.files.map(
            (file: string) => ({
              name: file,
              path: `${targetPath}\\${file}`,
            }),
          );
          setFiles(fileList);
          setSelectedFile(fileList[0]?.path || "");
          setStatus("ready");
        } else {
          setFiles([]);
          setSelectedFile("");
          setStatus("idle");
          setError(
            response.error
              ? `Ошибка доступа: ${response.error}`
              : `SQLite-файлы не найдены в "${targetPath}".\n\nУкажите правильный путь в поле выше или нажмите "Выбрать файл", чтобы указать файл вручную.`,
          );
        }
      } catch (err) {
        setStatus("idle");
        setError(
          err instanceof Error
            ? err.message
            : "Не удалось проверить директорию",
        );
      }
    },
    [searchPath],
  );

  // Автоматическая проверка при монтировании
  useEffect(() => {
    const timer = setTimeout(() => {
      checkForDatabases();
    }, 1000);
    return () => clearTimeout(timer);
  }, [checkForDatabases]);

  const handleImport = useCallback(async () => {
    if (!selectedFile) return;

    setStatus("importing");
    setError(null);
    setResult(null);

    try {
      const response = await importFromExternalDatabase(selectedFile);
      setResult(response);
      setStatus(response.success ? "done" : "error");
      if (!response.success) {
        setError(response.error || "Ошибка импорта");
      }
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Ошибка импорта");
    }
  }, [selectedFile]);

  const handlePathChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchPath(e.target.value);
    },
    [],
  );

  const handleSearch = useCallback(() => {
    checkForDatabases();
  }, [checkForDatabases]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedFile(e.target.value);
    },
    [],
  );

  const handleReset = useCallback(() => {
    setStatus("idle");
    setFiles([]);
    setSelectedFile("");
    setResult(null);
    setError(null);
  }, []);

  /**
   * Открыть диалог выбора файла через Electron API
   */
  const handlePickFile = useCallback(async () => {
    try {
      // Используем showOpenDialog из preload API
      const win = window as unknown as {
        electronAPI?: {
          showOpenDialog: (
            opts: Record<string, unknown>,
          ) => Promise<{ canceled: boolean; filePaths?: string[] }>;
        };
      };
      if (!win.electronAPI?.showOpenDialog) {
        setError("Функция выбора файла доступна только в десктопной версии");
        return;
      }

      const result = await win.electronAPI.showOpenDialog({
        title: "Выберите SQLite-файл базы данных",
        filters: [
          {
            name: "SQLite Database",
            extensions: ["db", "sqlite", "sqlite3"],
          },
          { name: "Все файлы", extensions: ["*"] },
        ],
        properties: ["openFile"],
      });

      if (result.canceled || !result.filePaths?.length) {
        return; // Пользователь отменил выбор
      }

      const filePath = result.filePaths[0];
      setSelectedFile(filePath);

      // Показываем выбранный файл в интерфейсе
      setFiles([
        {
          name: filePath.split("\\").pop() || filePath,
          path: filePath,
        },
      ]);
      setStatus("ready");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при выборе файла");
    }
  }, []);

  const totalImported = result?.imported
    ? result.imported.transactions +
      result.imported.categories +
      result.imported.budgets +
      result.imported.goals +
      result.imported.recurringPayments
    : 0;

  return (
    <div className="space-y-4">
      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
        <div className="flex items-center gap-3 mb-3">
          <Database
            className="text-emerald-600 dark:text-emerald-400"
            size={20}
          />
          <h4 className="font-semibold text-emerald-800 dark:text-emerald-200">
            Импорт данных из прошлой установки
          </h4>
        </div>
        <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-4">
          Перенесите данные из SQLite-файла, оставшегося от предыдущей установки
          FinanceTracker. Импорт проверяет дубликаты — существующие записи не
          будут перезаписаны.
        </p>

        {/* Поле для указания пути поиска */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchPath}
            onChange={handlePathChange}
            placeholder="Например: C:\SQLite"
            className="flex-1 px-3 py-2 text-sm border border-emerald-300 dark:border-emerald-700 
                       rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
                       focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Button
            onClick={handleSearch}
            variant="secondary"
            size="sm"
            disabled={status === "checking" || status === "importing"}
          >
            <FolderOpen size={16} className="mr-1" />
            Поиск
          </Button>
        </div>

        {/* Кнопка выбора файла через диалог */}
        <div className="mb-4">
          <Button
            onClick={handlePickFile}
            variant="secondary"
            size="sm"
            disabled={status === "checking" || status === "importing"}
            className="w-full"
          >
            <FileSearch size={16} className="mr-2" />
            Выбрать файл вручную
          </Button>
        </div>

        {/* Статус проверки */}
        {status === "checking" && (
          <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-lg">
            <Loader2 size={18} className="animate-spin text-emerald-600" />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Поиск SQLite-файлов в {searchPath}...
            </span>
          </div>
        )}

        {/* Найдены файлы */}
        {status === "ready" && files.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-lg">
              <CheckCircle size={18} className="text-emerald-600" />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Найдено {files.length} SQLite-файл
                {files.length > 1 ? "ов" : ""}
              </span>
            </div>

            <div className="flex gap-2">
              <select
                value={selectedFile}
                onChange={handleFileSelect}
                title="Выберите SQLite-файл для импорта"
                className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 
                           rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
                           focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {files.map((file) => (
                  <option key={file.path} value={file.path}>
                    {file.name} — {file.path}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={handleImport}
              variant="primary"
              disabled={
                (status as ImportStatus) === "importing" ||
                (status as ImportStatus) === "checking"
              }
              className="w-full"
            >
              {(status as ImportStatus) === "importing" ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Импорт данных...
                </>
              ) : (
                <>
                  <Upload size={16} className="mr-2" />
                  Импортировать данные из выбранного файла
                </>
              )}
            </Button>
          </div>
        )}

        {/* Процесс импорта */}
        {status === "importing" && (
          <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-lg">
            <Loader2 size={18} className="animate-spin text-emerald-600" />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Импорт данных из {selectedFile.split("\\").pop()}...
            </span>
          </div>
        )}

        {/* Результат импорта */}
        {status === "done" && result?.imported && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle size={20} className="text-green-600" />
              <span className="font-medium text-green-800 dark:text-green-200">
                Импорт завершён успешно!
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <div className="text-center p-2 bg-white dark:bg-slate-800 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {result.imported.transactions}
                </div>
                <div className="text-xs text-slate-500">Транзакций</div>
              </div>
              <div className="text-center p-2 bg-white dark:bg-slate-800 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {result.imported.categories}
                </div>
                <div className="text-xs text-slate-500">Категорий</div>
              </div>
              <div className="text-center p-2 bg-white dark:bg-slate-800 rounded-lg">
                <div className="text-lg font-bold text-orange-600">
                  {result.imported.budgets}
                </div>
                <div className="text-xs text-slate-500">Бюджетов</div>
              </div>
              <div className="text-center p-2 bg-white dark:bg-slate-800 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {result.imported.goals}
                </div>
                <div className="text-xs text-slate-500">Целей</div>
              </div>
              <div className="text-center p-2 bg-white dark:bg-slate-800 rounded-lg">
                <div className="text-lg font-bold text-pink-600">
                  {result.imported.recurringPayments}
                </div>
                <div className="text-xs text-slate-500">Платежей</div>
              </div>
              <div className="text-center p-2 bg-white dark:bg-slate-800 rounded-lg">
                <div className="text-lg font-bold text-slate-600">
                  {result.imported.appState ? "Да" : "Нет"}
                </div>
                <div className="text-xs text-slate-500">Настройки</div>
              </div>
            </div>

            {totalImported === 0 && (
              <p className="text-sm text-slate-500 text-center">
                Все записи уже существуют в текущей БД. Дубликаты не были
                добавлены.
              </p>
            )}

            {result.errors && result.errors.length > 0 && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  Частичные ошибки:
                </p>
                <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-0.5">
                  {result.errors.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.skipped && result.skipped.length > 0 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Таблицы пропущены (отсутствуют в импортируемой БД):
                </p>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-0.5">
                  {result.skipped.map((table, i) => (
                    <li key={i}>• {table}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              onClick={handleReset}
              variant="secondary"
              size="sm"
              className="w-full"
            >
              <FileText size={16} className="mr-2" />
              Импортировать ещё
            </Button>
          </div>
        )}

        {/* Ошибка */}
        {status === "error" && error && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-red-800 dark:text-red-200">
                  Ошибка импорта
                </span>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {error}
                </p>
              </div>
            </div>
            <Button
              onClick={handleReset}
              variant="secondary"
              size="sm"
              className="w-full"
            >
              <FileText size={16} className="mr-2" />
              Попробовать снова
            </Button>
          </div>
        )}

        {/* Нет файлов / ошибка поиска */}
        {status === "idle" && error && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <AlertCircle
                size={20}
                className="text-amber-600 shrink-0 mt-0.5"
              />
              <div>
                <span className="font-medium text-amber-800 dark:text-amber-200">
                  Файлы не найдены
                </span>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1 whitespace-pre-line">
                  {error}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Если у вас есть SQLite-файл от прошлой установки, укажите путь к
              папке с ним и нажмите "Поиск", или нажмите "Выбрать файл вручную"
              чтобы указать файл через стандартный диалог Windows.
              Поддерживаются файлы с расширениями .db, .sqlite, .sqlite3.
            </p>
          </div>
        )}

        {/* Начальное состояние */}
        {status === "idle" && !error && (
          <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-lg">
            <Database size={18} className="text-slate-400" />
            <span className="text-sm text-slate-500">
              Нажмите "Поиск" для проверки наличия файлов от прошлых установок,
              или "Выбрать файл вручную" для указания конкретного файла
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
