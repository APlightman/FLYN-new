export interface CachedUser {
  uid: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  cachedAt: number;
}

const USER_CACHE_KEY = 'firebase_user_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 часа

export const getCachedUser = (uid: string): CachedUser | null => {
  try {
    const cached = localStorage.getItem(`${USER_CACHE_KEY}_${uid}`);
    if (cached) {
      const parsedCache = JSON.parse(cached);
      const now = Date.now();
      
      if (now - parsedCache.cachedAt < CACHE_DURATION) {
        return parsedCache;
      } else {
        localStorage.removeItem(`${USER_CACHE_KEY}_${uid}`);
      }
    }
  } catch (error) {
    console.error('Error reading user cache:', error);
  }
  return null;
};

export const setCachedUser = (userData: CachedUser) => {
  try {
    const cacheData = {
      ...userData,
      cachedAt: Date.now()
    };
    localStorage.setItem(`${USER_CACHE_KEY}_${userData.uid}`, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error caching user data:', error);
  }
};

export const clearUserCache = (uid?: string) => {
  try {
    if (uid) {
      localStorage.removeItem(`${USER_CACHE_KEY}_${uid}`);
    } else {
      // Очищаем весь кэш пользователей
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(USER_CACHE_KEY)) {
          localStorage.removeItem(key);
        }
      });
    }
  } catch (error) {
    console.error('Error clearing user cache:', error);
  }
};

export const getAllCachedUsers = (): CachedUser[] => {
  const cached: CachedUser[] = [];
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(USER_CACHE_KEY)) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (data.uid && data.email) {
            cached.push(data);
          }
        } catch (error) {
          console.error('Error parsing cached user:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error reading cached users:', error);
  }
  
  return cached.sort((a, b) => b.cachedAt - a.cachedAt);
};
