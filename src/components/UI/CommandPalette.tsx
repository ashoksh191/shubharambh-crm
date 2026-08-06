import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map,
  DollarSign,
  User,
  CheckSquare,
  QrCode,
  FileCheck,
  PhoneCall,
  LogOut,
  X,
  Command,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import type { EnhancedPlot } from '../../types/propertyMap';

import type { NavTabId } from '../Navigation/Sidebar';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: NavTabId) => void;
  onSelectPlot?: (plot: EnhancedPlot) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onSelectPlot,
}) => {
  const { plots } = useApp();
  const { logout } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Command palette actions & plot search results
  const items = useMemo(() => {
    const actions = [
      { id: 'nav-map', label: 'Go to Dashboard & Layout Map', category: 'Navigation', icon: Map, action: () => onNavigateTab('map') },
      { id: 'nav-finance', label: 'Go to Accounting & Payments', category: 'Navigation', icon: DollarSign, action: () => onNavigateTab('finance') },
      { id: 'nav-profile', label: 'Go to My Profile', category: 'Navigation', icon: User, action: () => onNavigateTab('profile') },
      { id: 'nav-approvals', label: 'Go to Pending Approvals', category: 'Navigation', icon: CheckSquare, action: () => onNavigateTab('approvals') },
      { id: 'act-qr', label: 'QR Receipt Verification', category: 'Quick Action', icon: QrCode, action: () => { onNavigateTab('map'); } },
      { id: 'act-bond', label: 'Agreement Bond Generator', category: 'Quick Action', icon: FileCheck, action: () => { onNavigateTab('map'); } },
      { id: 'act-support', label: 'Call 24x7 Support Helpline', category: 'Quick Action', icon: PhoneCall, action: () => alert('Support: +91 98765 43210') },
      { id: 'act-logout', label: 'Sign Out of Enterprise System', category: 'Quick Action', icon: LogOut, action: () => logout() },
    ];

    if (!query.trim()) return actions;

    const lowerQuery = query.toLowerCase();
    const filteredActions = actions.filter(
      (a) => a.label.toLowerCase().includes(lowerQuery) || a.category.toLowerCase().includes(lowerQuery)
    );

    const matchingPlots = plots
      .filter((p) => p.plotNo.toLowerCase().includes(lowerQuery) || p.block.toLowerCase().includes(lowerQuery))
      .slice(0, 6)
      .map((p) => ({
        id: `plot-${p.id}`,
        label: `Plot ${p.plotNo} (${p.block}, ${p.totalArea} sq.ft) — ₹${p.totalPrice.toLocaleString('en-IN')}`,
        category: 'Township Plot Inventory',
        icon: Map,
        action: () => {
          onNavigateTab('map');
          if (onSelectPlot) onSelectPlot(p as unknown as EnhancedPlot);
        },
      }));

    return [...filteredActions, ...matchingPlots];
  }, [query, plots, onNavigateTab, onSelectPlot, logout]);

  // Keyboard navigation inside command palette (ArrowUp, ArrowDown, Enter, Esc)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (items.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + items.length) % (items.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (items[selectedIndex]) {
          items[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, items, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999999,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: '100px',
        }}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(12px)',
          }}
        />

        {/* Command Palette Card Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '640px',
            background: 'rgba(7, 41, 31, 0.96)',
            backdropFilter: 'blur(24px)',
            border: '1px solid #D4AF37',
            borderRadius: '24px',
            boxShadow: '0 25px 70px rgba(0, 0, 0, 0.7)',
            overflow: 'hidden',
            color: '#f8fafc',
            margin: '0 16px',
          }}
        >
          {/* Search Header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: '#07291F',
            }}
          >
            <Command size={20} color="#D4AF37" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a command or search plots (Ctrl + K)..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: 500,
              }}
            />
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Results List */}
          <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '10px 0' }}>
            {items.length > 0 ? (
              items.map((item, idx) => {
                const IconComp = item.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      item.action();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    style={{
                      padding: '12px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(2, 132, 199, 0.2)' : 'transparent',
                      borderLeft: isSelected ? '3px solid #0284c7' : '3px solid transparent',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: isSelected ? '#0284c7' : 'rgba(255, 255, 255, 0.08)',
                          color: isSelected ? '#ffffff' : '#38bdf8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IconComp size={16} />
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: '#ffffff', display: 'block' }}>{item.label}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.category}</span>
                      </div>
                    </div>

                    {isSelected && <ArrowRight size={16} color="#38bdf8" />}
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                No commands or plot inventory matching "{query}"
              </div>
            )}
          </div>

          {/* Footer Shortcuts Info */}
          <div
            style={{
              padding: '10px 20px',
              background: '#0b1329',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: '#64748b',
            }}
          >
            <div style={{ display: 'flex', gap: '12px' }}>
              <span><kbd style={kbdStyle}>↑↓</kbd> Navigate</span>
              <span><kbd style={kbdStyle}>↵</kbd> Select</span>
              <span><kbd style={kbdStyle}>Esc</kbd> Close</span>
            </div>
            <span style={{ color: '#0284c7', fontWeight: 600 }}>Shubharambh Command Center v1.0</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const kbdStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '4px',
  padding: '1px 5px',
  fontSize: '0.7rem',
  color: '#cbd5e1',
};
