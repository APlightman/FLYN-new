import React from 'react';
import { AppProvider } from './contexts/AppContext';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import { AuthForm } from './components/auth/AuthForm';
import { AppContent } from './components/layout/AppContent';

function App() {
  const { user, loading, isFirebaseEnabled } = useFirebaseAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (isFirebaseEnabled && !user) {
    return <AuthForm />;
  }

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
