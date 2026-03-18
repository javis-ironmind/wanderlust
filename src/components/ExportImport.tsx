'use client';

import { useRef, useState } from 'react';
import { Trip } from '@/lib/types';
import { exportTrips, importTrips } from '@/lib/storage';

interface ExportImportProps {
  trips: Trip[];
  onImport: (trips: Trip[]) => void;
}

export function ExportImport({ trips, onImport }: ExportImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  const handleExport = () => {
    try {
      exportTrips(trips);
      setImportStatus('Export successful!');
      setError('');
      setTimeout(() => setImportStatus(''), 3000);
    } catch {
      setError('Export failed');
      setImportStatus('');
    }
  };
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setError('');
      setImportStatus('Importing...');
      const importedTrips = await importTrips(file);
      onImport(importedTrips);
      setImportStatus(`Imported ${importedTrips.length} trip(s) successfully!`);
      setTimeout(() => setImportStatus(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
      setImportStatus('');
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="flex items-center gap-3">
      {importStatus && (
        <span className="text-sm text-green-600">{importStatus}</span>
      )}
      {error && (
        <span className="text-sm text-red-600">{error}</span>
      )}
      
      <button
        onClick={handleExport}
        className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        title="Export trips as JSON"
      >
        Export
      </button>
      
      <button
        onClick={handleImportClick}
        className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        title="Import trips from JSON"
      >
        Import
      </button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
