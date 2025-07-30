import React from 'react';
import { usePreviewMode } from '../contexts/PreviewModeContext';

export const PreviewDebug: React.FC = () => {
  const { 
    showPreviewPanel, 
    isPreviewMode,
    simulatedRole,
    setShowPreviewPanel 
  } = usePreviewMode();

  return (
    <div className="fixed bottom-4 left-4 bg-red-500 text-white p-2 rounded text-xs z-[200]">
      <div>Preview Mode: {isPreviewMode ? 'ON' : 'OFF'}</div>
      <div>Show Panel: {showPreviewPanel ? 'YES' : 'NO'}</div>
      <div>Role: {simulatedRole}</div>
      <button 
        onClick={() => setShowPreviewPanel(true)}
        className="bg-white text-black px-2 py-1 rounded mt-1"
      >
        Force Show Panel
      </button>
    </div>
  );
};
