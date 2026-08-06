import React from 'react';
import { useApp } from '../../context/AppContext';
import type { Plot } from '../../types';
import {
  TrendingUp,
  Zap,
  Clock,
  PieChart as PieChartIcon,
  ArrowRight,
} from 'lucide-react';
import '../../styles/App.css';

interface ExecutiveDashboardViewProps {
  onOpenBookingPlot?: (plot: Plot) => void;
  onOpenReceipt?: (bookingId: string) => void;
  onOpenBond?: (bookingId: string) => void;
  onNavigateToTab?: (tab: any) => void;
}

export const ExecutiveDashboardView: React.FC<ExecutiveDashboardViewProps> = ({
  onOpenReceipt,
  onOpenBond,
  onNavigateToTab,
}) => {
  const { plots, bookings } = useApp();

  const bookedCount = plots.filter((p) => p.status === 'booked').length;
  const soldCount = plots.filter((p) => p.status === 'sold').length;
  const occupancyRate = Math.round(((bookedCount + soldCount) / plots.length) * 100);

  const recentBookings = bookings.slice(0, 5);

  const recentActivities = [
    {
      id: 1,
      badge: 'BOOKING CONFIRMED',
      color: '#0B3D2E', // Forest Green
      time: '12 mins ago',
      title: 'Token Amount Received for Plot A-104',
      desc: 'Buyer: Vikram Sharma • Token: ₹51,000 • Verified by Accountant',
    },
    {
      id: 2,
      badge: 'REGISTRY EXECUTED',
      color: '#475569', // Slate Gray
      time: '1 hour ago',
      title: 'Sub-Registrar Deed Signed for Plot C-201',
      desc: 'Buyer: Ramesh Gupta • Stamp Duty Verified • Sub-Registrar Office',
    },
    {
      id: 3,
      badge: 'UTR VERIFICATION',
      color: '#D4AF37', // Gold
      time: '3 hours ago',
      title: 'HDFC Bank UTR #9823719283 Verification Queued',
      desc: 'Advance Instalment ₹2,50,000 pending manager sign-off.',
    },
    {
      id: 4,
      badge: 'NEW REGISTRATION',
      color: '#E8C96A', // Light Gold
      time: '5 hours ago',
      title: 'Associate Registration Submitted',
      desc: 'Phone: +91 98123 45670 • KYC Documents Uploaded',
    },
  ];

  return (
    <div className="executive-dashboard-view" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* SECTION 1: RECENT BOOKINGS ACTIVITY STREAM */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px' }}>
        {/* Recent Bookings Table */}
        <div style={{ background: 'rgba(7, 41, 31, 0.85)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '20px', padding: '20px', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 10px 30px rgba(7, 41, 31, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="#D4AF37" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#F8F7F3' }}>
                Recent Township Bookings
              </h3>
            </div>
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('bookings')}
                style={{ background: 'none', border: 'none', color: '#E8C96A', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                View All Bookings <ArrowRight size={14} />
              </button>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ color: '#A3B1AC', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(212, 175, 55, 0.15)' }}>
                  <th style={{ padding: '10px 12px' }}>Plot</th>
                  <th style={{ padding: '10px 12px' }}>Buyer</th>
                  <th style={{ padding: '10px 12px' }}>Token Paid</th>
                  <th style={{ padding: '10px 12px' }}>Status</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Document</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#A3B1AC' }}>
                      No recent bookings recorded.
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((b) => (
                    <tr key={b.bookingId} style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.1)' }}>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#E8C96A' }}>{b.plotNo}</td>
                      <td style={{ padding: '12px', color: '#F8F7F3', fontWeight: 600 }}>{b.customerName}</td>
                      <td style={{ padding: '12px', color: '#D4AF37', fontWeight: 700 }}>₹{(b.bookingAmount || 0).toLocaleString()}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(11, 61, 46, 0.5)', color: '#E8C96A', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                          CONFIRMED
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          {onOpenReceipt && (
                            <button
                              onClick={() => onOpenReceipt(b.bookingId)}
                              style={{ padding: '4px 10px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #D4AF37', color: '#07291F', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                              Receipt
                            </button>
                          )}
                          {onOpenBond && (
                            <button
                              onClick={() => onOpenBond(b.bookingId)}
                              style={{ padding: '4px 10px', borderRadius: '8px', background: '#07291F', border: '1px solid #D4AF37', color: '#F8F7F3', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                              Bond
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Approvals & Quick Telemetry Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Pending Approvals Summary Widget */}
          <div style={{ background: 'rgba(7, 41, 31, 0.85)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '20px', padding: '20px', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 10px 30px rgba(7, 41, 31, 0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="#D4AF37" />
                <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#F8F7F3' }}>
                  Pending Queue (5 Items)
                </h4>
              </div>
              {onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab('approvals')}
                  style={{ background: 'none', border: 'none', color: '#E8C96A', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Review Queue →
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '12px', background: 'rgba(4, 25, 19, 0.6)', border: '1px solid rgba(212, 175, 55, 0.15)', fontSize: '0.82rem' }}>
                <span style={{ color: '#F8F7F3' }}>Associate Registrations</span>
                <span style={{ background: 'rgba(212, 175, 55, 0.2)', color: '#E8C96A', padding: '2px 8px', borderRadius: '9999px', fontWeight: 700, fontSize: '0.75rem', border: '1px solid rgba(212, 175, 55, 0.4)' }}>2 Pending</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '12px', background: 'rgba(4, 25, 19, 0.6)', border: '1px solid rgba(212, 175, 55, 0.15)', fontSize: '0.82rem' }}>
                <span style={{ color: '#F8F7F3' }}>Bank UTR Verifications</span>
                <span style={{ background: 'rgba(11, 61, 46, 0.6)', color: '#E8C96A', padding: '2px 8px', borderRadius: '9999px', fontWeight: 700, fontSize: '0.75rem', border: '1px solid rgba(212, 175, 55, 0.4)' }}>3 Pending</span>
              </div>
            </div>
          </div>

          {/* Quick Layout Map Navigation Card */}
          <div style={{ background: 'linear-gradient(135deg, rgba(11, 61, 46, 0.9) 0%, rgba(7, 41, 31, 0.95) 100%)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '20px', padding: '20px', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 10px 30px rgba(7, 41, 31, 0.06)' }}>
            <span style={{ fontSize: '0.76rem', color: '#E8C96A', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>TOWNSHIP MASTERPLAN</span>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#F8F7F3' }}>
              60-Bigha Interactive Layout Map
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#A3B1AC', margin: 0, lineHeight: 1.4 }}>
              Explore full-screen interactive 980-plot layout map with zoom, pan, architectural blueprint & live inventory status.
            </p>
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('map')}
                style={{
                  marginTop: '6px',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  background: '#07291F',
                  color: '#F8F7F3',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  border: '1px solid #D4AF37',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(7, 41, 31, 0.3)',
                }}
              >
                Launch Layout Map Canvas <ArrowRight size={15} color="#D4AF37" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: LIVE TRANSACTION ACTIVITY & PROJECT HEALTH */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Realtime Activity Stream */}
        <div style={{ background: 'rgba(7, 41, 31, 0.85)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '20px', padding: '20px', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 10px 30px rgba(7, 41, 31, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="#D4AF37" />
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#F8F7F3' }}>
                Live System Activity Stream
              </h3>
            </div>
            <span style={{ fontSize: '0.74rem', background: 'rgba(212, 175, 55, 0.2)', color: '#E8C96A', padding: '3px 10px', borderRadius: '9999px', fontWeight: 700, border: '1px solid rgba(212, 175, 55, 0.4)' }}>
              Realtime
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentActivities.map((act) => (
              <div key={act.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 12px', borderRadius: '12px', background: 'rgba(4, 25, 19, 0.5)', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: act.color, marginTop: '6px', flexShrink: 0 }}></div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#E8C96A' }}>{act.badge}</span>
                    <span style={{ fontSize: '0.72rem', color: '#A3B1AC' }}>{act.time}</span>
                  </div>
                  <strong style={{ fontSize: '0.84rem', color: '#F8F7F3' }}>{act.title}</strong>
                  <p style={{ fontSize: '0.78rem', color: '#A3B1AC', margin: 0 }}>{act.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Health Progress */}
        <div style={{ background: 'rgba(7, 41, 31, 0.85)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '20px', padding: '20px', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 10px 30px rgba(7, 41, 31, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PieChartIcon size={18} color="#D4AF37" />
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#F8F7F3' }}>
                Township Inventory & Health
              </h3>
            </div>
            <span style={{ fontSize: '0.74rem', color: '#A3B1AC' }}>980 Master Plots</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'rgba(4, 25, 19, 0.6)', borderRadius: '14px', padding: '14px', border: '1px solid rgba(11, 61, 46, 0.6)' }}>
              <span style={{ fontSize: '0.74rem', color: '#E8C96A', fontWeight: 700 }}>OCCUPANCY RATE</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F8F7F3', margin: '4px 0 2px 0' }}>{occupancyRate}%</div>
              <p style={{ fontSize: '0.75rem', color: '#A3B1AC', margin: 0 }}>{bookedCount + soldCount} of {plots.length} plots allocated</p>
            </div>

            <div style={{ background: 'rgba(4, 25, 19, 0.6)', borderRadius: '14px', padding: '14px', border: '1px solid rgba(71, 85, 105, 0.6)' }}>
              <span style={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: 700 }}>EXECUTED REGISTRIES</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F8F7F3', margin: '4px 0 2px 0' }}>{soldCount}</div>
              <p style={{ fontSize: '0.75rem', color: '#A3B1AC', margin: 0 }}>Sub-Registrar Signed (Sold)</p>
            </div>

            <div style={{ background: 'rgba(4, 25, 19, 0.6)', borderRadius: '14px', padding: '14px', border: '1px solid rgba(128, 0, 32, 0.6)' }}>
              <span style={{ fontSize: '0.74rem', color: '#F87171', fontWeight: 700 }}>BOOKINGS CONFIRMED</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F8F7F3', margin: '4px 0 2px 0' }}>{bookedCount}</div>
              <p style={{ fontSize: '0.75rem', color: '#A3B1AC', margin: 0 }}>Awaiting registry deed</p>
            </div>

            <div style={{ background: 'rgba(4, 25, 19, 0.6)', borderRadius: '14px', padding: '14px', border: '1px solid rgba(212, 175, 55, 0.4)' }}>
              <span style={{ fontSize: '0.74rem', color: '#E8C96A', fontWeight: 700 }}>INFRASTRUCTURE</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F8F7F3', margin: '4px 0 2px 0' }}>88%</div>
              <p style={{ fontSize: '0.75rem', color: '#A3B1AC', margin: 0 }}>Roads, Gate & Power done</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
