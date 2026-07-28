import React from 'react';
import type { FilterState, EnhancedPlotStatus, PlotCategory } from '../../../types/propertyMap';
import type { BlockName } from '../../../types';
import { Filter, RotateCcw } from 'lucide-react';

interface MapFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onReset: () => void;
}

export const MapFilters: React.FC<MapFiltersProps> = ({ filters, onFilterChange, onReset }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
        background: '#15222b',
        padding: '12px 18px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#ffffff',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: '#10b981' }}>
        <Filter size={16} /> Filters:
      </div>

      {/* Block Filter */}
      <select
        value={filters.block}
        onChange={(e) => onFilterChange({ block: e.target.value as BlockName | 'All' })}
        style={{
          padding: '6px 12px',
          borderRadius: '8px',
          background: '#0f172a',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          fontSize: '0.82rem',
          outline: 'none',
        }}
      >
        <option value="All">All Blocks</option>
        <option value="Block A">Block A (40Ft Main Road)</option>
        <option value="Block B">Block B (Park & Club)</option>
        <option value="Block C">Block C (Garden Sector)</option>
      </select>

      {/* Status Filter */}
      <select
        value={filters.status}
        onChange={(e) => onFilterChange({ status: e.target.value as EnhancedPlotStatus | 'All' })}
        style={{
          padding: '6px 12px',
          borderRadius: '8px',
          background: '#0f172a',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          fontSize: '0.82rem',
          outline: 'none',
        }}
      >
        <option value="All">All Statuses</option>
        <option value="available">🟢 Available Only</option>
        <option value="reserved">🟡 Reserved Only</option>
        <option value="booked">🔵 Booked Only</option>
        <option value="sold">🔴 Sold Out</option>
        <option value="unreleased">⚪ Not Released</option>
      </select>

      {/* Category Filter */}
      <select
        value={filters.category}
        onChange={(e) => onFilterChange({ category: e.target.value as PlotCategory | 'All' })}
        style={{
          padding: '6px 12px',
          borderRadius: '8px',
          background: '#0f172a',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          fontSize: '0.82rem',
          outline: 'none',
        }}
      >
        <option value="All">All Categories</option>
        <option value="Residential">🏡 Residential</option>
        <option value="Commercial">🛍️ Commercial Shops</option>
        <option value="Corner">⭐ Corner Plots</option>
        <option value="Park Facing">🌳 Park Facing</option>
        <option value="Road Facing">🚗 Main Road Facing</option>
      </select>

      {/* Facing Filter */}
      <select
        value={filters.facing}
        onChange={(e) => onFilterChange({ facing: e.target.value })}
        style={{
          padding: '6px 12px',
          borderRadius: '8px',
          background: '#0f172a',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          fontSize: '0.82rem',
          outline: 'none',
        }}
      >
        <option value="All">All Facings</option>
        <option value="East">East Facing</option>
        <option value="West">West Facing</option>
        <option value="North">North Facing</option>
        <option value="South">South Facing</option>
      </select>

      {/* Reset Filters */}
      <button
        onClick={onReset}
        style={{
          padding: '6px 12px',
          borderRadius: '8px',
          background: 'rgba(255, 255, 255, 0.05)',
          color: '#94a3b8',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          fontSize: '0.82rem',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <RotateCcw size={14} /> Reset
      </button>
    </div>
  );
};
