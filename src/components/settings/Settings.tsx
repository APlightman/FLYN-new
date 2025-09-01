import React from 'react';
import { SettingsContainer } from './SettingsContainer';
import { UIDDebugPanel } from '../auth/UIDDebugPanel';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';

export function Settings() {
  const { user } = useFirebaseAuth();
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-6">
      <SettingsContainer />
      
      {user && isDev && (
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
          <UIDDebugPanel />
        </div>
      )}
    </div>
  );
}
