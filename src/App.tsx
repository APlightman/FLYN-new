import { AppProvider } from './contexts/AppContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AppContent } from './components/layout/AppContent';
import { UpdateModal } from './components/desktop/UpdateModal';
import { isElectronApp } from './hooks/useElectronIntegration';

function App() {
  return (
    <AppProvider>
      <NotificationProvider>
        <AppContent />
        {isElectronApp() && <UpdateModal />}
      </NotificationProvider>
    </AppProvider>
  );
}

export default App;
