import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, Book, MessageCircle, Mail, Star, Clock, Users, Zap } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  views?: number;
}

const FAQ_DATA_RU: FAQItem[] = [
  {
    id: '1',
    question: 'Как начать пользоваться FinanceTracker?',
    answer: 'Для начала работы создайте свои первые категории доходов и расходов в разделе "Категории", затем добавьте несколько транзакций через кнопку "+" или раздел "Транзакции". Рекомендуем использовать мастер настройки бюджета в разделе "Бюджет" для автоматического распределения средств по правилу 50/30/20.',
    category: 'Начало работы',
    tags: ['начало', 'настройка', 'первые шаги', 'категории'],
    priority: 'high',
    views: 1250
  },
  {
    id: '2',
    question: 'Как настроить бюджет по методу конвертов?',
    answer: 'Перейдите в раздел "Бюджет" и нажмите "Мастер бюджета". Укажите ваш месячный доход, выберите систему бюджетирования (рекомендуем 50/30/20: 50% на потребности, 30% на желания, 20% на сбережения) и распределите категории по группам. Система автоматически рассчитает лимиты для каждой категории.',
    category: 'Бюджет и планирование',
    tags: ['бюджет', 'конверты', 'планирование', '50/30/20'],
    priority: 'high',
    views: 980
  },
  {
    id: '3',
    question: 'Можно ли использовать приложение без интернета?',
    answer: 'Да! FinanceTracker работает в оффлайн режиме. Все данные сохраняются локально на вашем устройстве в браузере. При восстановлении соединения данные автоматически синхронизируются с облаком, если вы авторизованы.',
    category: 'Технические вопросы',
    tags: ['оффлайн', 'синхронизация', 'данные', 'интернет'],
    priority: 'medium',
    views: 750
  },
  {
    id: '4',
    question: 'Как установить приложение на телефон?',
    answer: 'Откройте приложение в браузере на телефоне. В Chrome появится предложение "Установить приложение" - нажмите "Установить". Для iOS Safari: нажмите кнопку "Поделиться" → "На экран Домой" → "Добавить". После установки приложение будет работать как обычное мобильное приложение.',
    category: 'Установка и настройка',
    tags: ['установка', 'PWA', 'мобильное приложение', 'телефон'],
    priority: 'high',
    views: 890
  },
  {
    id: '5',
    question: 'Как создать регулярные платежи?',
    answer: 'В разделе "Регулярные" нажмите "Добавить платеж". Укажите название (например, "Аренда квартиры"), сумму, выберите категорию и частоту (ежедневно, еженедельно, ежемесячно, ежегодно). Система автоматически создаст транзакции по расписанию. Вы можете приостановить или изменить любой регулярный платеж.',
    category: 'Функции приложения',
    tags: ['регулярные платежи', 'автоматизация', 'аренда', 'подписки'],
    priority: 'medium',
    views: 650
  },
  {
    id: '6',
    question: 'Как экспортировать данные?',
    answer: 'Перейдите в раздел "Импорт/Экспорт" и выберите тип данных (транзакции, категории, цели) и формат экспорта (CSV, Excel, PDF). Нажмите "Экспортировать" - файл автоматически загрузится на ваше устройство. Это полезно для создания резервных копий или анализа в других программах.',
    category: 'Импорт и экспорт',
    tags: ['экспорт', 'резервная копия', 'данные', 'CSV', 'Excel'],
    priority: 'medium',
    views: 420
  },
  {
    id: '7',
    question: 'Безопасны ли мои финансовые данные?',
    answer: 'Да, абсолютно безопасны. Все данные хранятся только на вашем устройстве и в зашифрованном виде в облаке (если вы авторизованы). Мы не собираем, не анализируем и не имеем доступа к вашей финансовой информации. Данные передаются только по защищенному HTTPS соединению.',
    category: 'Безопасность и приватность',
    tags: ['безопасность', 'приватность', 'данные', 'шифрование'],
    priority: 'high',
    views: 1100
  },
  {
    id: '8',
    question: 'Как настроить финансовые цели?',
    answer: 'В разделе "Цели" нажмите "Добавить цель". Укажите название (например, "Отпуск в Европе"), целевую сумму, дедлайн и планируемый ежемесячный взнос. Система покажет рекомендуемую сумму для достижения цели в срок и будет отслеживать прогресс. Можно учесть инфляцию для долгосрочных целей.',
    category: 'Бюджет и планирование',
    tags: ['цели', 'накопления', 'планирование', 'отпуск'],
    priority: 'medium',
    views: 580
  },
  {
    id: '9',
    question: 'Можно ли импортировать данные из банка?',
    answer: 'Да, вы можете импортировать выписки в формате CSV или Excel. Перейдите в "Импорт/Экспорт", выберите "Импорт данных", загрузите файл выписки из банка и следуйте инструкциям. Система автоматически распознает формат данных большинства российских банков.',
    category: 'Импорт и экспорт',
    tags: ['импорт', 'банк', 'выписки', 'Сбербанк', 'Тинькофф'],
    priority: 'medium',
    views: 720
  },
  {
    id: '10',
    question: 'Как пользоваться фильтрами транзакций?',
    answer: 'В разделе "Транзакции" нажмите кнопку "Фильтры". Используйте быстрые фильтры по датам (сегодня, неделя, месяц), категориям, типу операций и сумме. Для сложных запросов создайте кастомные фильтры с несколькими условиями. Активные фильтры отображаются цветными тегами.',
    category: 'Функции приложения',
    tags: ['фильтры', 'поиск', 'транзакции', 'даты'],
    priority: 'low',
    views: 380
  },
  {
    id: '11',
    question: 'Что делать если забыл пароль?',
    answer: 'На странице входа нажмите "Забыли пароль?", введите ваш email и нажмите "Отправить ссылку". Проверьте почту (включая папку "Спам") и перейдите по ссылке для сброса пароля. Если письмо не пришло, попробуйте отправить запрос повторно через 5 минут.',
    category: 'Аккаунт и авторизация',
    tags: ['пароль', 'восстановление', 'email', 'вход'],
    priority: 'medium',
    views: 450
  },
  {
    id: '12',
    question: 'Как изменить валюту в приложении?',
    answer: 'Перейдите в "Настройки" → "Общие настройки" → "Валюта по умолчанию". Выберите нужную валюту из списка (рубли, доллары, евро, фунты). Изменение валюты повлияет только на отображение новых транзакций, существующие останутся в прежней валюте.',
    category: 'Настройки',
    tags: ['валюта', 'рубли', 'доллары', 'евро', 'настройки'],
    priority: 'low',
    views: 320
  }
];

const CATEGORIES = [
  { id: 'all', name: 'Все вопросы', icon: '📋', color: 'bg-slate-100 text-slate-700' },
  { id: 'Начало работы', name: 'Начало работы', icon: '🚀', color: 'bg-green-100 text-green-700' },
  { id: 'Бюджет и планирование', name: 'Бюджет и планирование', icon: '💰', color: 'bg-blue-100 text-blue-700' },
  { id: 'Функции приложения', name: 'Функции приложения', icon: '⚡', color: 'bg-purple-100 text-purple-700' },
  { id: 'Технические вопросы', name: 'Технические вопросы', icon: '🔧', color: 'bg-orange-100 text-orange-700' },
  { id: 'Безопасность и приватность', name: 'Безопасность', icon: '🔒', color: 'bg-red-100 text-red-700' },
  { id: 'Импорт и экспорт', name: 'Импорт и экспорт', icon: '📊', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'Установка и настройка', name: 'Установка', icon: '📱', color: 'bg-cyan-100 text-cyan-700' },
  { id: 'Аккаунт и авторизация', name: 'Аккаунт', icon: '👤', color: 'bg-pink-100 text-pink-700' },
  { id: 'Настройки', name: 'Настройки', icon: '⚙️', color: 'bg-yellow-100 text-yellow-700' }
];

export function FAQ() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showPopular, setShowPopular] = useState(true);

  const filteredFAQ = FAQ_DATA_RU.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const popularFAQ = FAQ_DATA_RU
    .filter(item => item.priority === 'high')
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 4);

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const expandAll = () => {
    setExpandedItems(new Set(filteredFAQ.map(item => item.id)));
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  const getCategoryInfo = (categoryId: string) => {
    return CATEGORIES.find(cat => cat.id === categoryId) || CATEGORIES[0];
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Star className="text-yellow-500" size={14} />;
      case 'medium': return <Clock className="text-blue-500" size={14} />;
      default: return <Users className="text-slate-400" size={14} />;
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-6">
      {/* Заголовок */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl shadow-lg shadow-blue-500/25 flex-shrink-0">
          <HelpCircle className="text-white" size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Часто задаваемые вопросы
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Найдите ответы на популярные вопросы о FinanceTracker
          </p>
        </div>
      </div>

      {/* Поиск и фильтры */}
      <Card>
        <div className="space-y-4">
          <Input
            placeholder="Поиск по вопросам, ответам и тегам..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={16} />}
            fullWidth
          />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Категории:</span>
              <button
                onClick={() => setShowPopular(!showPopular)}
                className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  showPopular
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                ⭐ Популярные
              </button>
            </div>
            
            {filteredFAQ.length > 0 && (
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={expandAll}>
                  Развернуть все
                </Button>
                <Button variant="secondary" size="sm" onClick={collapseAll}>
                  Свернуть все
                </Button>
              </div>
            )}
          </div>
          
          {/* Категории - адаптивная сетка */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {CATEGORIES.map(category => {
              const count = category.id === 'all' 
                ? FAQ_DATA_RU.length 
                : FAQ_DATA_RU.filter(item => item.category === category.id).length;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                      : `${category.color} hover:scale-105 shadow-sm hover:shadow-md`
                  }`}
                >
                  <span className="text-sm sm:text-base">{category.icon}</span>
                  <div className="text-center sm:text-left min-w-0">
                    <div className="truncate">{category.name}</div>
                    <div className="text-xs opacity-75">({count})</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Популярные вопросы */}
      {showPopular && selectedCategory === 'all' && searchTerm === '' && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Star className="text-yellow-500" size={20} />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Популярные вопросы
            </h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {popularFAQ.map((item) => {
              const categoryInfo = getCategoryInfo(item.category);
              
              return (
                <div
                  key={`popular-${item.id}`}
                  onClick={() => toggleExpanded(item.id)}
                  className="p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <span className="text-base sm:text-lg">{categoryInfo.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 text-sm sm:text-base">
                        {item.question}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className={`px-2 py-1 rounded-full ${categoryInfo.color}`}>
                          {categoryInfo.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={10} />
                          {item.views} просмотров
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Список вопросов */}
      {filteredFAQ.length === 0 ? (
        <Card>
          <div className="text-center py-8 sm:py-12">
            <div className="text-slate-400 mb-4">
              <HelpCircle size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              Вопросы не найдены
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Попробуйте изменить поисковый запрос или выбрать другую категорию
            </p>
            <Button variant="secondary" onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}>
              Сбросить фильтры
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredFAQ.map((item) => {
            const isExpanded = expandedItems.has(item.id);
            const categoryInfo = getCategoryInfo(item.category);
            
            return (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all duration-200">
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex-1 pr-4 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <span className="text-base sm:text-lg flex-shrink-0">{categoryInfo.icon}</span>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                        {item.question}
                      </h3>
                      <div className="flex-shrink-0">{getPriorityIcon(item.priority)}</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className={`px-2 py-1 rounded-full ${categoryInfo.color}`}>
                        {categoryInfo.name}
                      </span>
                      {item.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 2 && (
                        <span className="text-xs text-slate-400">
                          +{item.tags.length - 2}
                        </span>
                      )}
                      {item.views && (
                        <span className="flex items-center gap-1 ml-auto">
                          <Users size={10} />
                          {item.views}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className={`transition-transform duration-300 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown size={20} className="text-slate-400" />
                  </div>
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ${
                  isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                        {item.answer}
                      </p>
                      {item.tags.length > 2 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {item.tags.slice(2).map(tag => (
                            <span key={tag} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Блок поддержки */}
      <Card>
        <div className="text-center py-6 sm:py-8">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Не нашли ответ на свой вопрос?
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <Book className="mx-auto text-blue-600 dark:text-blue-400 mb-2" size={24} />
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1 text-sm sm:text-base">Документация</h4>
              <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">Подробные инструкции по всем функциям</p>
            </div>
            
            <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <MessageCircle className="mx-auto text-green-600 dark:text-green-400 mb-2" size={24} />
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-1 text-sm sm:text-base">Сообщество</h4>
              <p className="text-xs sm:text-sm text-green-700 dark:text-green-300">Обсуждения с другими пользователями</p>
            </div>
            
            <div className="p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <Mail className="mx-auto text-purple-600 dark:text-purple-400 mb-2" size={24} />
              <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-1 text-sm sm:text-base">Поддержка</h4>
              <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-300">Прямая связь с командой разработки</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="secondary" className="flex items-center gap-2">
              <Book size={16} />
              Открыть документацию
            </Button>
            
            <Button variant="secondary" className="flex items-center gap-2">
              <MessageCircle size={16} />
              Перейти в сообщество
            </Button>
            
            <Button className="flex items-center gap-2">
              <Mail size={16} />
              Связаться с поддержкой
            </Button>
          </div>
          
          <div className="mt-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Email поддержки: <a href="mailto:support@financetracker.com" className="text-blue-600 dark:text-blue-400 hover:underline">
              support@financetracker.com
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}