import { AppProvider } from './contexts/AppContext';
import { AppContent } from './components/layout/AppContent';
import { UpdateModal } from './components/desktop/UpdateModal';
import { isElectronApp } from './hooks/useElectronIntegration';

function App() {
  return (
    <AppProvider>
      <AppContent />
      {isElectronApp() && <UpdateModal />}
    </AppProvider>
  );
}

export default App;
