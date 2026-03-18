'use client';

import { useState } from 'react';
import { 
  shareTrip, 
  getAccessList, 
  revokeAccess, 
  getShareableUrl, 
  SharePermission 
} from '@/lib/shareTrip';

interface ShareModalProps {
  tripId: string;
  tripName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ tripId, tripName, isOpen, onClose }: ShareModalProps) {
  const [permission, setPermission] = useState<SharePermission>('read');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [accessList, setAccessList] = useState(() => getAccessList(tripId));

  if (!isOpen) return null;

  const handleShare = () => {
    const code = shareTrip(tripId, permission);
    setGeneratedCode(code);
    setAccessList(getAccessList(tripId));
  };

  const handleRevoke = (code: string) => {
    revokeAccess(tripId, code);
    setAccessList(getAccessList(tripId));
    if (generatedCode === code) {
      setGeneratedCode(null);
    }
  };

  const handleCopy = () => {
    if (generatedCode) {
      const url = getShareableUrl(tripId, generatedCode);
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          width: '100%',
          maxWidth: '450px',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: '#1e3a5f', fontSize: '1.25rem', fontWeight: '700' }}>
            🔗 Share "{tripName}"
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#64748b',
              padding: '0.25rem',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Generate new share link */}
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem', color: '#1e3a5f' }}>
            Access Permission
          </label>
          <select
            value={permission}
            onChange={(e) => setPermission(e.target.value as SharePermission)}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '8px',
              border: '2px solid #e2e8f0',
              fontSize: '0.875rem',
              marginBottom: '0.75rem',
              background: 'white',
            }}
          >
            <option value="read">Read Only - View trip details</option>
            <option value="write">Write - Edit trip activities</option>
          </select>
          <button
            onClick={handleShare}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Generate Share Link
          </button>
        </div>

        {/* Generated link display */}
        {generatedCode && (
          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#eff6ff', borderRadius: '12px', border: '2px solid #3b82f6' }}>
            <p style={{ margin: '0 0 0.5rem', fontWeight: '600', fontSize: '0.875rem', color: '#1e3a5f' }}>
              Shareable Link Generated! 🎉
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                readOnly
                value={getShareableUrl(tripId, generatedCode)}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.75rem',
                  background: 'white',
                }}
              />
              <button
                onClick={handleCopy}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: copied ? '#10b981' : '#3b82f6',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
              Access Code: <strong>{generatedCode}</strong> ({permission})
            </p>
          </div>
        )}

        {/* Current access list */}
        <div>
          <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', fontWeight: '600', color: '#1e3a5f' }}>
            People with Access ({accessList.length})
          </h4>
          
          {accessList.length === 0 ? (
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#94a3b8', textAlign: 'center', padding: '1rem' }}>
              No one has access yet. Generate a link above to share!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {accessList.slice().reverse().map((access) => (
                <div
                  key={access.accessCode}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div>
                    <span style={{ 
                      display: 'inline-block',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      background: access.permission === 'write' ? '#fef3c7' : '#e0f2fe',
                      color: access.permission === 'write' ? '#92400e' : '#0369a1',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      marginRight: '0.5rem',
                    }}>
                      {access.permission}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                      {access.accessCode}
                    </span>
                    <br />
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      Shared {formatDate(access.sharedAt)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRevoke(access.accessCode)}
                    style={{
                      padding: '0.375rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #fecaca',
                      background: 'white',
                      color: '#dc2626',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
