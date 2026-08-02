import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
        width: '100%',
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          let bg = '#0f172a';
          let border = '#0284c7';
          let iconColor = '#0284c7';
          let IconComp = Info;

          if (toast.type === 'success') {
            border = '#10b981';
            iconColor = '#10b981';
            IconComp = CheckCircle2;
          } else if (toast.type === 'warning') {
            border = '#f59e0b';
            iconColor = '#f59e0b';
            IconComp = AlertTriangle;
          } else if (toast.type === 'error') {
            border = '#ef4444';
            iconColor = '#ef4444';
            IconComp = XCircle;
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              style={{
                background: bg,
                borderLeft: `4px solid ${border}`,
                borderRadius: '14px',
                padding: '14px 18px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                pointerEvents: 'auto',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div style={{ color: iconColor, marginTop: '2px', flexShrink: 0 }}>
                <IconComp size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '0.88rem', display: 'block', color: '#ffffff' }}>{toast.title}</strong>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.4', display: 'block', marginTop: '2px' }}>
                  {toast.message}
                </span>
              </div>
              <button
                onClick={() => onDismiss(toast.id)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
              >
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
