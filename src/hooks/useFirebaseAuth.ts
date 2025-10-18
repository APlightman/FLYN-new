import { useState, useEffect } from 'react';
import { 
  User, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured, COLLECTIONS } from '../lib/firebase';
import { getFirebaseErrorMessage } from '../lib/firebaseErrors';
import { getCachedUser, setCachedUser, clearUserCache } from '../lib/userCache';
import type { FirestoreUser } from '../lib/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isFirebaseEnabled: boolean;
}

export function useFirebaseAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isFirebaseEnabled: isFirebaseConfigured
  });

  useEffect(() => {
    const forceLoadingTimeout = setTimeout(() => {
      console.warn('Force completing auth loading due to timeout');
      setAuthState(prev => ({ ...prev, loading: false }));
    }, 3000);

    if (!isFirebaseConfigured || !auth) {
      clearTimeout(forceLoadingTimeout);
      setAuthState(prev => ({ ...prev, loading: false }));
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          await createOrUpdateUserProfile(user);
        }
        
        setAuthState(prev => ({
          ...prev,
          user,
          loading: false,
          error: null
        }));
      } catch (error) {
        console.error('Auth state change error:', error);
        setAuthState(prev => ({
          ...prev,
          user,
          loading: false,
          error: 'Ошибка обновления профиля'
        }));
      }
      
      clearTimeout(forceLoadingTimeout);
    });

    return () => {
      clearTimeout(forceLoadingTimeout);
      unsubscribe();
    };
  }, []);

  const createOrUpdateUserProfile = async (user: User) => {
    if (!db) return;

    try {
      const userRef = doc(db, COLLECTIONS.USERS, user.uid);
      const userSnap = await getDoc(userRef);

      const userData: FirestoreUser = {
        id: user.uid,
        email: user.email!,
        fullName: user.displayName || null,
        avatarUrl: user.photoURL || null,
        createdAt: userSnap.exists() ? userSnap.data().createdAt : new Date(),
        updatedAt: new Date()
      };

      await setDoc(userRef, userData, { merge: true });
      console.log('User profile updated successfully');
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };

  // Создание новой учетной записи (точно по документации Firebase)
  const signUp = async (email: string, password: string, fullName?: string) => {
    if (!auth) {
      return { user: null, error: { message: 'Firebase не настроен' } };
    }

    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      // Используем официальный метод Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Обновляем профиль пользователя, если указано имя
      if (fullName) {
        await updateProfile(user, { displayName: fullName });
      }

      setAuthState(prev => ({ ...prev, loading: false }));
      return { user, error: null };
    } catch (error: any) {
      const errorMessage = getFirebaseErrorMessage(error.code);
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return { user: null, error: { message: errorMessage } };
    }
  };

  // Вход в систему (точно по документации Firebase)
  const signIn = async (email: string, password: string) => {
    if (!auth) {
      return { user: null, error: { message: 'Firebase не настроен' } };
    }

    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      // Используем официальный метод Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      setAuthState(prev => ({ ...prev, loading: false }));
      return { user, error: null };
    } catch (error: any) {
      const errorMessage = getFirebaseErrorMessage(error.code);
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return { user: null, error: { message: errorMessage } };
    }
  };

  const signInWithUID = async (uid: string) => {
    if (!uid || uid.length < 20) {
      return { user: null, error: { message: 'Неверный формат UID' } };
    }

    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      let userData = null;

      // Сначала проверяем кэш
      const cachedUser = getCachedUser(uid);
      if (cachedUser) {
        console.log('Using cached user data for UID:', uid);
        userData = cachedUser;
      } else if (db && navigator.onLine) {
        // Если онлайн и есть доступ к Firestore, пытаемся загрузить
        try {
          const userRef = doc(db, COLLECTIONS.USERS, uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            setAuthState(prev => ({ 
              ...prev, 
              error: 'Пользователь с таким UID не найден в базе данных', 
              loading: false 
            }));
            return { user: null, error: { message: 'Пользователь с таким UID не найден' } };
          }

          const firestoreData = userSnap.data() as FirestoreUser;
          userData = {
            uid: uid,
            email: firestoreData.email,
            fullName: firestoreData.fullName,
            avatarUrl: firestoreData.avatarUrl
          };

          // Кэшируем данные для оффлайн использования
          setCachedUser(userData);
        } catch (firestoreError: any) {
          console.warn('Firestore error, checking cache:', firestoreError.message);
          
          // Если ошибка Firestore, но есть кэш - используем его
          const fallbackCache = getCachedUser(uid);
          if (fallbackCache) {
            console.log('Using fallback cached data due to Firestore error');
            userData = fallbackCache;
          } else {
            setAuthState(prev => ({ 
              ...prev, 
              error: `Не удалось загрузить данные пользователя: ${firestoreError.message}`, 
              loading: false 
            }));
            return { user: null, error: { message: `Ошибка загрузки: ${firestoreError.message}` } };
          }
        }
      } else {
        // Оффлайн режим без кэша
        setAuthState(prev => ({ 
          ...prev, 
          error: 'Нет подключения к интернету и нет кэшированных данных для этого UID', 
          loading: false 
        }));
        return { user: null, error: { message: 'Требуется подключение к интернету для первого входа по UID' } };
      }

      if (!userData) {
        setAuthState(prev => ({ 
          ...prev, 
          error: 'Не удалось получить данные пользователя', 
          loading: false 
        }));
        return { user: null, error: { message: 'Не удалось получить данные пользователя' } };
      }

      // Создаем mock объект User
      const mockUser = {
        uid: uid,
        email: userData.email,
        displayName: userData.fullName || null,
        photoURL: userData.avatarUrl || null,
        emailVerified: true,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString()
        }
      } as User;

      // Сохраняем информацию о UID сессии
      localStorage.setItem('firebase_uid_session', uid);
      
      setAuthState(prev => ({ 
        ...prev, 
        user: mockUser, 
        loading: false,
        error: null 
      }));

      console.log('UID login successful:', uid);
      return { user: mockUser, error: null };

    } catch (error: any) {
      const errorMessage = `Ошибка входа по UID: ${error.message}`;
      console.error('UID login error:', error);
      
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return { user: null, error: { message: errorMessage } };
    }
  };

  const signOut = async () => {
    if (!auth) return;

    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      // Очищаем UID сессию
      localStorage.removeItem('firebase_uid_session');
      
      // Очищаем кэш пользователей при выходе
      clearUserCache();
      
      if (auth.currentUser) {
        await firebaseSignOut(auth);
      } else {
        setAuthState(prev => ({ ...prev, user: null, loading: false }));
      }
    } catch (error: any) {
      const errorMessage = getFirebaseErrorMessage(error.code);
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }));
    }
  };

  const resetPassword = async (email: string) => {
    if (!auth) {
      return { error: { message: 'Firebase не настроен' } };
    }

    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (error: any) {
      const errorMessage = getFirebaseErrorMessage(error.code);
      return { error: { message: errorMessage } };
    }
  };

  const resendConfirmation = async (email: string) => {
    return resetPassword(email);
  };

  return {
    ...authState,
    signUp,
    signIn,
    signInWithUID,
    signOut,
    resetPassword,
    resendConfirmation
  };
}
