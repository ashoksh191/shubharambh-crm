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
          <div className="subpage-breadcrumb-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#D4AF37', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#07291F',
              color: '#F8F7F3',
              border: '1px solid #D4AF37',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(7, 41, 31, 0.3)',
            }}
          >
            <Maximize2 size={16} color="#D4AF37" /> Open Full GIS Layout Map
          </motion.button>
        )}
      </div>

      {/* Metrics Row (20px Rounded Cards with Thin Gold Border) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'rgba(7, 41, 31, 0.85)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '20px', padding: '16px 18px', backdropFilter: 'blur(16px)', boxShadow: '0 10px 30px rgba(7, 41, 31, 0.06)' }}>
          <span style={{ fontSize: '0.76rem', color: '#A3B1AC', fontWeight: 600 }}>TOTAL PLOTS</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>{stats.total}</div>
          <span style={{ fontSize: '0.74rem', color: '#A3B1AC' }}>60-Bigha Masterplan</span>
        </div>

        <div style={{ background: 'rgba(7, 41, 31, 0.85)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '20px', padding: '16px 18px', backdropFilter: 'blur(16px)', boxShadow: '0 10px 30px rgba(7, 41, 31, 0.06)' }}>
          <span style={{ fontSize: '0.76rem', color: '#E8C96A', fontWeight: 700 }}>AVAILABLE FOR BOOKING</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#E8C96A', marginTop: '2px' }}>{stats.available}</div>
          <span style={{ fontSize: '0.74rem', color: '#E8C96A' }}>Ready for immediate token</span>
        </div>

        <div style={{ background: 'rgba(7, 41, 31, 0.85)', border: '1px solid rgba(128, 0, 32, 0.4)', borderRadius: '20px', padding: '16px 18px', backdropFilter: 'blur(16px)', boxShadow: '0 10px 30px rgba(7, 41, 31, 0.06)' }}>
          <span style={{ fontSize: '0.76rem', color: '#F87171', fontWeight: 700 }}>BOOKED PLOTS</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F87171', marginTop: '2px' }}>{stats.booked}</div>
          <span style={{ fontSize: '0.74rem', color: '#F87171' }}>Token advance paid</span>
        </div>

        <div style={{ background: 'rgba(7, 41, 31, 0.85)', border: '1px solid rgba(71, 85, 105, 0.4)', borderRadius: '20px', padding: '16px 18px', backdropFilter: 'blur(16px)', boxShadow: '0 10px 30px rgba(7, 41, 31, 0.06)' }}>
          <span style={{ fontSize: '0.76rem', color: '#94A3B8', fontWeight: 700 }}>SOLD / REGISTERED</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#CBD5E1', marginTop: '2px' }}>{stats.sold}</div>
          <span style={{ fontSize: '0.74rem', color: '#CBD5E1' }}>Deed executed & registered</span>
        </div>

        <div style={{ background: 'rgba(7, 41, 31, 0.85)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '20px', padding: '16px 18px', backdropFilter: 'blur(16px)', boxShadow: '0 10px 30px rgba(7, 41, 31, 0.06)' }}>
          <span style={{ fontSize: '0.76rem', color: '#D4AF37', fontWeight: 700 }}>TOTAL INVENTORY VALUATION</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#D4AF37', marginTop: '2px' }}>
            ₹{(stats.totalValue / 10000000).toFixed(2)} Cr
          </div>
          <span style={{ fontSize: '0.74rem', color: '#D4AF37' }}>Base valuation</span>
        </div>
      </div>

      {/* COMPACT COLLAPSIBLE PREVIEW MAP CARD */}
      <div style={{ background: 'rgba(7, 41, 31, 0.85)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '20px', padding: '18px 20px', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={16} color="#D4AF37" />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
              Layout Spatial Preview (60-Bigha Masterplan)
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setShowCompactMap(!showCompactMap)}
              style={{ background: 'none', border: 'none', color: '#E8C96A', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {showCompactMap ? 'Hide Preview' : 'Show Preview'}
            </button>
            {onNavigateToMap && (
              <button
                onClick={onNavigateToMap}
                style={{ padding: '6px 12px', borderRadius: '8px', background: '#07291F', border: '1px solid #D4AF37', color: '#F8F7F3', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
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
              background: 'linear-gradient(135deg, #07291F 0%, #041913 100%)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ textAlign: 'center', zIndex: 2, padding: '16px' }}>
              <Building size={32} color="#D4AF37" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>Shubharambh Green City Master Blueprint</div>
              <p style={{ fontSize: '0.8rem', color: '#A3B1AC', margin: '4px 0 12px 0' }}>
                980 Plots across Block A (Residential), Block B (Villas) & Block C (Commercial Main Road)
              </p>
              {onNavigateToMap && (
                <button
                  onClick={onNavigateToMap}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '10px',
                    background: '#FFFFFF',
                    color: '#07291F',
                    border: '1px solid #D4AF37',
                    fontWeight: 800,
                    fontSize: '0.8rem',
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

      {/* FILTER BAR & INVENTORY TABLE */}
      <div style={{ background: 'rgba(7, 41, 31, 0.85)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '20px', padding: '20px', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#A3B1AC' }} />
            <input
              type="text"
              placeholder="Search plot number, block..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '9px 14px 9px 36px', borderRadius: '10px', background: 'rgba(4, 25, 19, 0.7)', border: '1px solid rgba(212, 175, 55, 0.25)', color: '#F8F7F3', fontSize: '0.84rem', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              style={{ padding: '8px 14px', borderRadius: '10px', background: '#07291F', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#F8F7F3', fontSize: '0.82rem', fontWeight: 600, outline: 'none' }}
            >
              <option value="ALL">All Blocks</option>
              <option value="Block A">Block A</option>
              <option value="Block B">Block B</option>
              <option value="Block C">Block C</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ padding: '8px 14px', borderRadius: '10px', background: '#07291F', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#F8F7F3', fontSize: '0.82rem', fontWeight: 600, outline: 'none' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="available">Available (Forest Green)</option>
              <option value="reserved">Reserved (Gold)</option>
              <option value="booked">Booked (Burgundy)</option>
              <option value="sold">Sold (Slate Gray)</option>
            </select>
          </div>
        </div>

        {/* Inventory Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ color: '#A3B1AC', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(212, 175, 55, 0.2)' }}>
                <th style={{ padding: '12px' }}>Plot No</th>
                <th style={{ padding: '12px' }}>Block</th>
                <th style={{ padding: '12px' }}>Dimensions</th>
                <th style={{ padding: '12px' }}>Area (Sq.Ft)</th>
                <th style={{ padding: '12px' }}>Facing</th>
                <th style={{ padding: '12px' }}>Rate / Sq.Ft</th>
                <th style={{ padding: '12px' }}>Total Price</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlots.map((plot) => {
                const isAvailable = plot.status === 'available';
                const isBooked = plot.status === 'booked';
                const isReserved = (plot.status as string) === 'reserved';

                return (
                  <tr key={plot.id} style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.1)' }}>
                    <td style={{ padding: '12px', fontWeight: 800, color: '#E8C96A' }}>{plot.plotNo}</td>
                    <td style={{ padding: '12px', color: '#F8F7F3' }}>{plot.block}</td>
                    <td style={{ padding: '12px', color: '#A3B1AC' }}>{plot.dimensions}</td>
                    <td style={{ padding: '12px', color: '#F8F7F3', fontWeight: 600 }}>{plot.totalArea.toLocaleString()}</td>
                    <td style={{ padding: '12px', color: '#D4AF37' }}>{plot.facing}</td>
                    <td style={{ padding: '12px', color: '#A3B1AC' }}>₹{plot.ratePerSqFt}</td>
                    <td style={{ padding: '12px', fontWeight: 800, color: '#D4AF37' }}>₹{plot.totalPrice.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          background: isAvailable
                            ? 'rgba(11, 61, 46, 0.6)'
                            : isReserved
                            ? 'rgba(212, 175, 55, 0.25)'
                            : isBooked
                            ? 'rgba(128, 0, 32, 0.4)'
                            : 'rgba(71, 85, 105, 0.4)',
                          color: isAvailable
                            ? '#E8C96A'
                            : isReserved
                            ? '#E8C96A'
                            : isBooked
                            ? '#F87171'
                            : '#CBD5E1',
                          border: `1px solid ${
                            isAvailable
                              ? 'rgba(212, 175, 55, 0.4)'
                              : isReserved
                              ? 'rgba(212, 175, 55, 0.5)'
                              : isBooked
                              ? 'rgba(128, 0, 32, 0.6)'
                              : 'rgba(71, 85, 105, 0.6)'
                          }`,
                        }}
                      >
                        {plot.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {isAvailable && onOpenBookingPlot ? (
                        <button
                          onClick={() => onOpenBookingPlot(plot)}
                          style={{ padding: '6px 14px', borderRadius: '8px', background: '#07291F', border: '1px solid #D4AF37', color: '#FFFFFF', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
                        >
                          Book Plot
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: '#A3B1AC' }}>Allocated</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
