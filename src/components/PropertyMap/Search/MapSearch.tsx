import React, { useState } from 'react';
import type { EnhancedPlot } from '../../../types/propertyMap';
import { Search, X } from 'lucide-react';

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
    <div style={{ position: 'relative', width: '280px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: '#0f172a',
          border: '1.5px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '9999px',
          padding: '6px 14px',
          gap: '8px',
        }}
      >
        <Search size={16} color="#10b981" />
        <input
          type="text"
          placeholder="Search A-101, Commercial..."
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
      {showSuggestions && suggestions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 99999,
            background: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '14px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
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
        </div>
      )}
    </div>
  );
};
