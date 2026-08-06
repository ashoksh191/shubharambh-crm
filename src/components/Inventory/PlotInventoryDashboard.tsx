import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import type { Plot } from '../../types';
import {
  Layers,
  Search,
  Compass,
  Maximize2,
  Building,
} from 'lucide-react';
import '../../styles/App.css';

interface PlotInventoryDashboardProps {
  onOpenBookingPlot?: (plot: Plot) => void;
  onNavigateToMap?: () => void;
}

export const PlotInventoryDashboard: React.FC<PlotInventoryDashboardProps> = ({
  onOpenBookingPlot,
  onNavigateToMap,
}) => {
  const { plots } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [showCompactMap, setShowCompactMap] = useState(true);

  // Filtered Plots
  const filteredPlots = useMemo(() => {
    return plots.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.plotNo.toLowerCase().includes(q) ||
        p.block.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q);

      const matchesBlock = selectedBlock === 'ALL' || p.block === selectedBlock;
      const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;

      return matchesSearch && matchesBlock && matchesStatus;
    });
  }, [plots, searchQuery, selectedBlock, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = plots.length;
    const available = plots.filter((p) => p.status === 'available').length;
    const booked = plots.filter((p) => p.status === 'booked').length;
    const sold = plots.filter((p) => p.status === 'sold').length;
    const totalValue = plots.reduce((sum, p) => sum + (p.totalPrice || 0), 0);

    return { total, available, booked, sold, totalValue };
  }, [plots]);

  return (
    <div className="inventory-dashboard-container" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Map Navigation Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="subpage-breadcrumb-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#0ea5e9', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Layers size={14} /> Master Township Plot Inventory
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: '4px 0 0 0', letterSpacing: '-0.02em' }}>
            60-Bigha Plot Inventory & Availability
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
            Real-time status of 980 residential & commercial plots in Shubharambh Green City.
          </p>
        </div>

        {onNavigateToMap && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNavigateToMap}
            style={{
              padding: '12px 20px',
              borderRadius: '14px',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(52, 211, 153, 0.14)',
              color: '#34d399',
              border: '1px solid rgba(52, 211, 153, 0.35)',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.18)',
            }}
          >
            <Maximize2 size={16} /> Open Full GIS Layout Map
          </motion.button>
        )}
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'rgba(15, 22, 36, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '16px 18px', backdropFilter: 'blur(16px)' }}>
          <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 600 }}>TOTAL PLOTS</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>{stats.total}</div>
          <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>60-Bigha Masterplan</span>
        </div>

        <div style={{ background: 'rgba(15, 22, 36, 0.75)', border: '1px solid rgba(52, 211, 153, 0.25)', borderRadius: '18px', padding: '16px 18px', backdropFilter: 'blur(16px)' }}>
          <span style={{ fontSize: '0.76rem', color: '#34d399', fontWeight: 600 }}>AVAILABLE FOR BOOKING</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399', marginTop: '2px' }}>{stats.available}</div>
          <span style={{ fontSize: '0.74rem', color: '#34d399' }}>Ready for immediate token</span>
        </div>

        <div style={{ background: 'rgba(15, 22, 36, 0.75)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '18px', padding: '16px 18px', backdropFilter: 'blur(16px)' }}>
          <span style={{ fontSize: '0.76rem', color: '#38bdf8', fontWeight: 600 }}>BOOKED PLOTS</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>{stats.booked}</div>
          <span style={{ fontSize: '0.74rem', color: '#38bdf8' }}>Token advance paid</span>
        </div>

        <div style={{ background: 'rgba(15, 22, 36, 0.75)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '18px', padding: '16px 18px', backdropFilter: 'blur(16px)' }}>
          <span style={{ fontSize: '0.76rem', color: '#ef4444', fontWeight: 600 }}>SOLD / REGISTERED</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444', marginTop: '2px' }}>{stats.sold}</div>
          <span style={{ fontSize: '0.74rem', color: '#ef4444' }}>Deed executed & registered</span>
        </div>

        <div style={{ background: 'rgba(15, 22, 36, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '16px 18px', backdropFilter: 'blur(16px)' }}>
          <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 600 }}>TOTAL INVENTORY VALUATION</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>
            ₹{(stats.totalValue / 10000000).toFixed(2)} Cr
          </div>
          <span style={{ fontSize: '0.74rem', color: '#f59e0b' }}>Base valuation</span>
        </div>
      </div>

      {/* COMPACT COLLAPSIBLE PREVIEW MAP CARD */}
      <div style={{ background: 'rgba(15, 22, 36, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '22px', padding: '18px 20px', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={16} color="#34d399" />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
              Layout Spatial Preview (60-Bigha Masterplan)
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setShowCompactMap(!showCompactMap)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {showCompactMap ? 'Hide Preview' : 'Show Preview'}
            </button>
            {onNavigateToMap && (
              <button
                onClick={onNavigateToMap}
                style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#34d399', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Launch Interactive GIS Map ↗
              </button>
            )}
          </div>
        </div>

        {showCompactMap && (
          <div
            style={{
              height: '180px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #090e1a 0%, #0d1627 100%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'radial-gradient(#34d399 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
            
            <div style={{ textAlign: 'center', zIndex: 2, padding: '16px' }}>
              <Building size={32} color="#34d399" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>Shubharambh Green City Blueprint</div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 12px 0' }}>
                980 Plots across Block A (Residential), Block B (Villas) & Block C (Commercial Main Road)
              </p>
              {onNavigateToMap && (
                <button
                  onClick={onNavigateToMap}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '10px',
                    background: '#34d399',
                    color: '#0b0f19',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  View Full Screen GIS Map Canvas
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div style={{ background: 'rgba(15, 22, 36, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', backdropFilter: 'blur(16px)' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search by Plot No (e.g. A-101, B-45)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '40px',
              padding: '0 14px 0 40px',
              borderRadius: '10px',
              background: 'rgba(10, 14, 26, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              fontSize: '0.85rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Sector Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>Block:</span>
          {['ALL', 'Block A', 'Block B', 'Block C'].map((bl) => (
            <button
              key={bl}
              onClick={() => setSelectedBlock(bl)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.76rem',
                fontWeight: 700,
                border: selectedBlock === bl ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                background: selectedBlock === bl ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                color: selectedBlock === bl ? '#34d399' : '#94a3b8',
                cursor: 'pointer',
              }}
            >
              {bl}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>Status:</span>
          {['ALL', 'available', 'booked', 'sold'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.76rem',
                fontWeight: 700,
                border: selectedStatus === st ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                background: selectedStatus === st ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                color: selectedStatus === st ? '#38bdf8' : '#94a3b8',
                cursor: 'pointer',
              }}
            >
              {st.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Plot Master Inventory Table */}
      <div style={{ background: 'rgba(15, 22, 36, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '22px', overflow: 'hidden', backdropFilter: 'blur(16px)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
            Plot Directory ({filteredPlots.length} Plots)
          </h3>
        </div>

        <div style={{ overflowX: 'auto', maxHeight: '520px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'rgba(10, 14, 26, 0.4)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em', position: 'sticky', top: 0, zIndex: 5, backdropFilter: 'blur(10px)' }}>
                <th style={{ padding: '14px 18px' }}>Plot ID & Block</th>
                <th style={{ padding: '14px 18px' }}>Dimensions & Area</th>
                <th style={{ padding: '14px 18px' }}>Facing & Road</th>
                <th style={{ padding: '14px 18px' }}>Rate / Sq.Ft</th>
                <th style={{ padding: '14px 18px' }}>Total Cost</th>
                <th style={{ padding: '14px 18px' }}>Status</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlots.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    No plots found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredPlots.slice(0, 100).map((p) => (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '12px 18px', fontWeight: 700, color: '#34d399' }}>
                      {p.plotNo} <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>({p.block})</span>
                    </td>
                    <td style={{ padding: '12px 18px', color: '#ffffff', fontWeight: 600 }}>
                      {p.dimensions} <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>({p.totalArea} sq.ft)</span>
                    </td>
                    <td style={{ padding: '12px 18px', color: '#cbd5e1' }}>
                      {p.facing} Facing <span style={{ fontSize: '0.75rem', color: '#64748b' }}>• {p.roadWidth}</span>
                    </td>
                    <td style={{ padding: '12px 18px', color: '#cbd5e1' }}>
                      ₹{p.ratePerSqFt}
                    </td>
                    <td style={{ padding: '12px 18px', fontWeight: 700, color: '#ffffff' }}>
                      ₹{p.totalPrice.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 18px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          background: p.status === 'available' ? 'rgba(52, 211, 153, 0.15)' : p.status === 'booked' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: p.status === 'available' ? '#34d399' : p.status === 'booked' ? '#38bdf8' : '#ef4444',
                          border: `1px solid ${p.status === 'available' ? 'rgba(52, 211, 153, 0.3)' : p.status === 'booked' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                        }}
                      >
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                      {p.status === 'available' && onOpenBookingPlot ? (
                        <button
                          onClick={() => onOpenBookingPlot(p)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.76rem',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          Book Plot
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
