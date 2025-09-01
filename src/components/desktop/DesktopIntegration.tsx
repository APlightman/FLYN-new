import React, { useEffect, useState } from 'react';
import { useElectronIntegration } from '../../hooks/useElectronIntegration';
import { Modal } from '../ui/Modal';
import { TransactionForm } from '../transactions/TransactionForm';
import { ImportModal } from '../import-export/ImportModal';
import { UpdateModal } from './UpdateModal';

interface DesktopIntegrationProps {
  onNavigate: (route: string) => void;
  activeTab: string;
}

export function DesktopIntegration({ onNavigate }: DesktopIntegrationProps) {
  const { isElectron, setupElectronListeners } = useElectronIntegration();
  const [showQuickTransaction, setShowQuickTransaction] = useState(false);
  const [quickTransactionType, setQuickTransactionType] = useState<'income' | 'expense'>('expense');
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    if (!isElectron) return;

    setupElectronListeners({
      onQuickAction: (action) => {
        switch (action) {
          case 'add-transaction':
            setQuickTransactionType('expense');
            setShowQuickTransaction(true);
            break;
          case 'add-income':
            setQuickTransactionType('income');
            setShowQuickTransaction(true);
            break;
          case 'add-expense':
            setQuickTransactionType('expense');
            setShowQuickTransaction(true);
            break;
        }
      },
      onNavigateTo: (route) => {
        onNavigate(route);
      },
      onShowImport: () => {
        setShowImportModal(true);
      },
      onDeepLink: (url) => {
        console.log('Deep link received:', url);
        const action = url.replace('financetracker://', '');
        if (action === 'add-transaction') {
          setShowQuickTransaction(true);
        }
      }
    });
  }, [isElectron, setupElectronListeners, onNavigate]);

  if (!isElectron) return null;

  return (
    <>
      <Modal
        isOpen={showQuickTransaction}
        onClose={() => setShowQuickTransaction(false)}
        title={`Быстрое добавление ${quickTransactionType === 'income' ? 'дохода' : 'расхода'}`}
      >
        <TransactionForm
          initialData={{
            id: '',
            type: quickTransactionType,
            amount: 0,
            category: '',
            description: '',
            date: new Date().toISOString().split('T')[0],
            tags: []
          }}
          onSuccess={() => setShowQuickTransaction(false)}
        />
      </Modal>

      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Импорт данных"
      >
        <ImportModal onClose={() => setShowImportModal(false)} />
      </Modal>

      <UpdateModal />
    </>
  );
}
