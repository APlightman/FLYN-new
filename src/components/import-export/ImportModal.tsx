import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { 
  validateFile, 
  readFile, 
  importTransactions, 
  importCategories,
  ImportResult 
} from '../../utils/importUtils';

interface ImportModalProps {
  onClose: () => void;
}

export function ImportModal({ onClose }: ImportModalProps) {
  const { addTransaction, addCategory } = useApp();
  const [dataType, setDataType] = useState('transactions');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dataTypeOptions = [
    { value: 'transactions', label: 'Транзакции' },
    { value: 'categories', label: 'Категории' }
  ];

  const handleFileSelect = (selectedFile: File) => {
    const validation = validateFile(selectedFile);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }
    
    setFile(selectedFile);
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const processFile = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    
    try {
      const fileContent = await readFile(file);
      let importResult: ImportResult;
      
      switch (dataType) {
        case 'transactions':
          importResult = importTransactions(fileContent);
          break;
        case 'categories':
          importResult = importCategories(fileContent);
          break;
        default:
          throw new Error('Неподдерживаемый тип данных');
      }
      
      setResult(importResult);
      
    } catch (error) {
      setResult({
        success: false,
        data: [],
        errors: [`Ошибка обработки файла: ${error}`],
        warnings: []
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmImport = () => {
    if (!result || !result.success) return;
    
    try {
      switch (dataType) {
        case 'transactions':
          result.data.forEach(transaction => addTransaction(transaction));
          break;
        case 'categories':
          result.data.forEach(category => addCategory(category));
          break;
      }
      
      alert(`Успешно импортировано ${result.data.length} записей`);
      onClose();
      
    } catch (error) {
      alert('Ошибка при сохранении данных');
    }
  };

  const resetImport = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Select
        label="Тип данных для импорта"
        value={dataType}
        onChange={(e) => {
          setDataType(e.target.value);
          resetImport();
        }}
        options={dataTypeOptions}
        fullWidth
      />

      {!file && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${dragOver 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
            }
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="mx-auto text-slate-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
            Загрузите файл
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Перетащите файл сюда или нажмите для выбора
          </p>
          <Button onClick={() => fileInputRef.current?.click()}>
            Выбрать файл
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xls,.xlsx"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      )}

      {file && !result && (
        <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100">
                {file.name}
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={resetImport}>
              <X size={16} />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={processFile} 
              disabled={isProcessing}
              fullWidth
            >
              {isProcessing ? 'Обработка...' : 'Обработать файл'}
            </Button>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${
            result.success 
              ? 'bg-green-50 dark:bg-green-900/20' 
              : 'bg-red-50 dark:bg-red-900/20'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {result.success ? (
                <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
              ) : (
                <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
              )}
              <h4 className={`font-medium ${
                result.success 
                  ? 'text-green-800 dark:text-green-200' 
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {result.success ? 'Файл успешно обработан' : 'Ошибки при обработке файла'}
              </h4>
            </div>
            
            {result.success && (
              <p className="text-green-700 dark:text-green-300 text-sm">
                Готово к импорту: {result.data.length} записей
              </p>
            )}
          </div>

          {result.errors.length > 0 && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="text-red-600 dark:text-red-400" size={16} />
                <h5 className="font-medium text-red-800 dark:text-red-200">
                  Ошибки ({result.errors.length})
                </h5>
              </div>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 max-h-32 overflow-y-auto">
                {result.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {result.warnings.length > 0 && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-yellow-600 dark:text-yellow-400" size={16} />
                <h5 className="font-medium text-yellow-800 dark:text-yellow-200">
                  Предупреждения ({result.warnings.length})
                </h5>
              </div>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 max-h-32 overflow-y-auto">
                {result.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={resetImport} variant="secondary" fullWidth>
              Загрузить другой файл
            </Button>
            {result.success && (
              <Button onClick={confirmImport} fullWidth>
                Импортировать данные
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
