'use client';

import { useState, useRef } from 'react';
import { parseMarkdownToTrip, ParsedTrip, getMarkdownTemplate } from '@/lib/markdown-parser';

interface ImportMarkdownProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (parsed: ParsedTrip) => void;
}

export function ImportMarkdown({ isOpen, onClose, onImport }: ImportMarkdownProps) {
  const [content, setContent] = useState('');
  const [parsed, setParsed] = useState<ParsedTrip | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.md')) {
      setError('Please upload a .md file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setContent(text);
      try {
        const parsed = parseMarkdownToTrip(text);
        setParsed(parsed);
        setError('');
      } catch (err) {
        setError('Failed to parse markdown');
      }
    };
    reader.readAsText(file);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setContent(text);
      const parsed = parseMarkdownToTrip(text);
      setParsed(parsed);
      setError('');
    } catch {
      setError('Failed to read clipboard');
    }
  };

  const handleTemplate = () => {
    const template = getMarkdownTemplate();
    setContent(template);
    const parsed = parseMarkdownToTrip(template);
    setParsed(parsed);
  };

  const handleImport = () => {
    if (parsed) {
      onImport(parsed);
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '1rem',
    }} onClick={onClose}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto',
      }} onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 1rem', fontSize: '1.25rem', fontWeight: '600' }}>
          Import from Markdown
        </h3>
        
        <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '1rem' }}>
          Upload a .md file or paste markdown with day headers and activity items.
        </p>
        
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '8px',
              border: '2px solid #e2e8f0',
              background: 'white',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            📁 Upload .md
          </button>
          <button
            onClick={handlePaste}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '8px',
              border: '2px solid #e2e8f0',
              background: 'white',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            📋 Paste
          </button>
          <button
            onClick={handleTemplate}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '8px',
              border: '2px solid #e2e8f0',
              background: 'white',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            📝 Template
          </button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".md"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        
        {error && (
          <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {error}
          </p>
        )}
        
        {parsed && parsed.days.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Preview ({parsed.days.length} days, {parsed.days.reduce((sum, d) => sum + d.activities.length, 0)} activities)
            </h4>
            <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.75rem', maxHeight: '200px', overflow: 'auto' }}>
              {parsed.days.map((day, i) => (
                <div key={i} style={{ marginBottom: '0.5rem' }}>
                  <strong style={{ fontSize: '0.8rem' }}>{day.title}</strong>
                  {day.activities.map((act, j) => (
                    <div key={j} style={{ fontSize: '0.75rem', color: '#666', paddingLeft: '0.5rem' }}>
                      • {act.time && `${act.time} - `}{act.title}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '8px',
              border: '2px solid #e2e8f0',
              background: 'white',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!parsed || parsed.days.length === 0}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              background: parsed ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' : '#94a3b8',
              color: 'white',
              cursor: parsed ? 'pointer' : 'not-allowed',
              fontWeight: '600',
            }}
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
