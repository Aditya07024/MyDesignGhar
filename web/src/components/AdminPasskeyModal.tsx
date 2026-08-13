import React, { useState } from 'react';
import { ShieldCheck, Lock, X, ArrowRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminPasskeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AdminPasskeyModal({ isOpen, onClose, onSuccess }: AdminPasskeyModalProps) {
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    const expectedPasskey = import.meta.env.VITE_ADMIN_GATE_PASSKEY || '123456789';

    setTimeout(() => {
      if (passkey.trim() === expectedPasskey.trim()) {
        sessionStorage.setItem('admin_gate_verified', 'true');
        setIsVerifying(false);
        setPasskey('');
        if (onSuccess) {
          onSuccess();
        } else {
          onClose();
          navigate('/admin/login');
        }
      } else {
        setIsVerifying(false);
        setError('Incorrect Admin Passkey. Access Denied.');
      }
    }, 350);
  };

  return (
    <div className="admin-passkey-overlay">
      <div className="admin-passkey-card">
        <button type="button" className="admin-passkey-close-btn" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="admin-passkey-icon-badge">
          <ShieldCheck size={28} />
        </div>

        <h3 className="admin-passkey-title">Admin Security Gate</h3>
        <p className="admin-passkey-subtitle">
          Enter the administrative security passkey to access the Admin Portal login.
        </p>

        {error && (
          <div className="admin-passkey-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-passkey-form">
          <div className="admin-input-group">
            <Lock size={18} className="input-lock-icon" />
            <input
              type="password"
              placeholder="Enter Passkey"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              className="admin-passkey-input"
              maxLength={20}
              required
              autoFocus
            />
          </div>

          <button type="submit" className="admin-passkey-submit-btn" disabled={isVerifying}>
            <span>{isVerifying ? 'Verifying Passkey...' : 'Unlock Admin Portal'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="admin-passkey-footer-note">
          <span>🔒 Protected System • MYDESIGNGHAR Internal Portal</span>
        </div>
      </div>
    </div>
  );
}
