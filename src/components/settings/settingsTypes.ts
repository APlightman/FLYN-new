export interface SettingsState {
  language: string;
  currency: string;
  dateFormat: string;
  notifications: {
    budgetAlerts: boolean;
    goalReminders: boolean;
    recurringPayments: boolean;
    weeklyReports: boolean;
  };
  privacy: {
    dataCollection: boolean;
    analytics: boolean;
  };
  export: {
    defaultFormat: string;
    includeCategories: boolean;
    includeGoals: boolean;
  };
  sidebarTabs: {
    dashboard: boolean;
    transactions: boolean;
    filters: boolean;
    budget: boolean;
    goals: boolean;
    recurring: boolean;
    analytics: boolean;
    calendar: boolean;
    categories: boolean;
    calculator: boolean;
    'import-export': boolean;
    faq: boolean;
    settings: boolean;
  };
  mobileMenuItems: {
    dashboard: boolean;
    transactions: boolean;
    analytics: boolean;
    budget: boolean;
    goals: boolean;
    calendar: boolean;
    categories: boolean;
    filters: boolean;
    recurring: boolean;
    calculator: boolean;
    'import-export': boolean;
    faq: boolean;
    settings: boolean;
  };
}

export interface DataStats {
  transactions: number;
  categories: number;
  goals: number;
  budgets: number;
  recurringPayments: number;
  totalItems: number;
  storageSize: number;
}

export const SETTINGS_STORAGE_KEY = 'financeApp_settings';

export const getDefaultSettings = (): SettingsState => ({
  language: 'ru',
  currency: 'RUB',
  dateFormat: 'DD.MM.YYYY',
  notifications: {
    budgetAlerts: true,
    goalReminders: true,
    recurringPayments: true,
    weeklyReports: false,
  },
  privacy: {
    dataCollection: false,
    analytics: false,
  },
  export: {
    defaultFormat: 'csv',
    includeCategories: true,
    includeGoals: true,
  },
  sidebarTabs: {
    dashboard: true,
    transactions: true,
    filters: true,
    budget: true,
    goals: true,
    recurring: true,
    analytics: true,
    calendar: true,
    categories: true,
    calculator: true,
    'import-export': true,
    faq: true,
    settings: true,
  },
  mobileMenuItems: {
    dashboard: true,
    transactions: true,
    analytics: true,
    budget: true,
    settings: true,
    goals: false,
    calendar: false,
    categories: false,
    filters: false,
    recurring: false,
    calculator: false,
    'import-export': false,
    faq: false,
  },
});
