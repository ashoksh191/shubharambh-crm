import React, { useState } from 'react';
import type { EnhancedPlot } from '../../../types/propertyMap';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MapSearchProps {
  plots: EnhancedPlot[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectPlot: (plot: EnhancedPlot) => void;
}

export const MapSearch: React.FC<MapSearchProps> = ({
  plots,
  searchQuery,
  onSearchChange,
  onSelectPlot,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = searchQuery.trim().length > 0
    ? plots.filter((p) =>
        p.plotNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.facing.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  return (
    <div role="search" aria-label="Master Blueprint Plot Search" style={{ position: 'relative', width: '280px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(2, 132, 199, 0.4)',
          borderRadius: '9999px',
          padding: '6px 14px',
          gap: '8px',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Search size={16} color="#0284c7" />
        <input
          type="text"
          placeholder="Search A-101, Commercial..."
          aria-label="Search Plot Number or Sector"
          aria-autocomplete="list"
          aria-expanded={showSuggestions && suggestions.length > 0}
          value={searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#ffffff',
            fontSize: '0.85rem',
            width: '100%',
          }}
        />
        {searchQuery && (
          <button
            onClick={() => {
              onSearchChange('');
              setShowSuggestions(false);
            }}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Auto-suggest dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              zIndex: 99999,
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
              overflow: 'hidden',
            }}
          >
            {suggestions.map((plot) => (
              <div
                key={plot.id}
                onClick={() => {
                  onSelectPlot(plot);
                  onSearchChange(plot.plotNo);
                  setShowSuggestions(false);
                }}
                style={{
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  transition: 'background 0.2s ease',
                }}
                className="search-suggestion-item"
              >
                <div>
                  <strong style={{ fontSize: '0.88rem', color: '#ffffff', display: 'block' }}>Plot {plot.plotNo}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{plot.block} • {plot.category}</span>
                </div>
                <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700 }}>₹{plot.totalPrice.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
