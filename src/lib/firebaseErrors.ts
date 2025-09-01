// Расширенная обработка ошибок Firebase (по официальной документации)
export const getFirebaseErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'Пользователь с таким email не найден';
    case 'auth/wrong-password':
      return 'Неверный пароль';
    case 'auth/email-already-in-use':
      return 'Email уже используется другим аккаунтом';
    case 'auth/weak-password':
      return 'Пароль слишком простой (минимум 6 символов)';
    case 'auth/invalid-email':
      return 'Неверный формат email';
    case 'auth/too-many-requests':
      return 'Слишком много попыток. Попробуйте позже';
    case 'auth/network-request-failed':
      return 'Ошибка сети. Проверьте подключение к интернету';
    case 'auth/user-disabled':
      return 'Аккаунт заблокирован администратором';
    case 'auth/operation-not-allowed':
      return 'Операция не разрешена. Проверьте настройки Firebase';
    case 'auth/invalid-credential':
      return 'Неверные учетные данные';
    case 'auth/user-token-expired':
      return 'Сессия истекла. Войдите заново';
    case 'auth/requires-recent-login':
      return 'Требуется повторная аутентификация';
    case 'auth/credential-already-in-use':
      return 'Учетные данные уже используются другим аккаунтом';
    case 'auth/invalid-verification-code':
      return 'Неверный код подтверждения';
    case 'auth/invalid-verification-id':
      return 'Неверный ID подтверждения';
    case 'auth/missing-verification-code':
      return 'Отсутствует код подтверждения';
    case 'auth/missing-verification-id':
      return 'Отсутствует ID подтверждения';
    case 'auth/quota-exceeded':
      return 'Превышена квота запросов. Попробуйте позже';
    case 'auth/app-deleted':
      return 'Приложение Firebase удалено';
    case 'auth/app-not-authorized':
      return 'Приложение не авторизовано для использования Firebase';
    case 'auth/argument-error':
      return 'Неверные аргументы запроса';
    case 'auth/invalid-api-key':
      return 'Неверный API ключ Firebase';
    case 'auth/invalid-user-token':
      return 'Недействительный токен пользователя';
    case 'auth/timeout':
      return 'Превышено время ожидания запроса';
    case 'auth/unauthorized-domain':
      return 'Домен не авторизован для Firebase Auth';
    default:
      return `Ошибка аутентификации: ${errorCode}`;
  }
};

// Утилиты для анализа ошибок
export const isNetworkError = (errorCode: string): boolean => {
  return [
    'auth/network-request-failed',
    'auth/timeout',
    'auth/too-many-requests'
  ].includes(errorCode);
};

export const isCredentialError = (errorCode: string): boolean => {
  return [
    'auth/user-not-found',
    'auth/wrong-password',
    'auth/invalid-credential',
    'auth/invalid-email'
  ].includes(errorCode);
};

export const isConfigurationError = (errorCode: string): boolean => {
  return [
    'auth/invalid-api-key',
    'auth/app-not-authorized',
    'auth/operation-not-allowed',
    'auth/unauthorized-domain'
  ].includes(errorCode);
};
