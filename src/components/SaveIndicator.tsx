'use client';

import { useEffect, useState } from 'react';
import { onSaveStatusChange, SaveStatus } from '@/lib/storage';

export function SaveIndicator() {
  const [status, setStatus] = useState<SaveStatus>('idle');
  
  useEffect(() => {
    return onSaveStatusChange(setStatus);
  }, []);
  
  if (status === 'idle') return null;
  
  const statusConfig = {
    saving: { text: 'Saving...', color: 'text-yellow-600' },
    saved: { text: 'Saved', color: 'text-green-600' },
    error: { text: 'Save failed', color: 'text-red-600' },
  };
  
  const config = statusConfig[status];
  
  return (
    <span className={`text-sm ${config.color} transition-colors`}>
      {config.text}
    </span>
  );
}
