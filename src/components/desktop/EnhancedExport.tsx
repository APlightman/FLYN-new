import React from 'react';
import { ExportModal } from '../import-export/ExportModal';

interface EnhancedExportProps {
  onClose: () => void;
}

export function EnhancedExport({ onClose }: EnhancedExportProps) {
  return <ExportModal onClose={onClose} />;
}
