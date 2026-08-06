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
      color: '#10b981',
      time: '12 mins ago',
      title: 'Token Amount Received for Plot A-104',
      desc: 'Buyer: Vikram Sharma • Token: ₹51,000 • Verified by Accountant',
    },
    {
      id: 2,
      badge: 'REGISTRY EXECUTED',
      color: '#38bdf8',
      time: '1 hour ago',
      title: 'Sub-Registrar Deed Signed for Plot C-201',
      desc: 'Buyer: Ramesh Gupta • Stamp Duty Verified • Sub-Registrar Office',
    },
    {
      id: 3,
      badge: 'UTR VERIFICATION',
      color: '#f59e0b',
      time: '3 hours ago',
      title: 'HDFC Bank UTR #9823719283 Verification Queued',
      desc: 'Advance Instalment ₹2,50,000 pending manager sign-off.',
    },
    {
      id: 4,
      badge: 'NEW REGISTRATION',
      color: '#a855f7',
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
        <div style={{ background: 'rgba(15, 22, 36, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '22px', padding: '20px', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="#34d399" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                Recent Township Bookings
              </h3>
            </div>
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('bookings')}
                style={{ background: 'none', border: 'none', color: '#34d399', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                View All Bookings <ArrowRight size={14} />
              </button>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
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
                    <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                      No recent bookings recorded.
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((b) => (
                    <tr key={b.bookingId} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#34d399' }}>{b.plotNo}</td>
                      <td style={{ padding: '12px', color: '#ffffff', fontWeight: 600 }}>{b.customerName}</td>
                      <td style={{ padding: '12px', color: '#38bdf8', fontWeight: 700 }}>₹{(b.bookingAmount || 0).toLocaleString()}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                          CONFIRMED
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          {onOpenReceipt && (
                            <button
                              onClick={() => onOpenReceipt(b.bookingId)}
                              style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', fontSize: '0.74rem', cursor: 'pointer' }}
                            >
                              Receipt
                            </button>
                          )}
                          {onOpenBond && (
                            <button
                              onClick={() => onOpenBond(b.bookingId)}
                              style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#34d399', fontSize: '0.74rem', cursor: 'pointer' }}
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
          <div style={{ background: 'rgba(15, 22, 36, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '22px', padding: '20px', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="#f59e0b" />
                <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#ffffff' }}>
                  Pending Queue (5 Items)
                </h4>
              </div>
              {onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab('approvals')}
                  style={{ background: 'none', border: 'none', color: '#f59e0b', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Review Queue →
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '12px', background: 'rgba(10, 14, 26, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.82rem' }}>
                <span style={{ color: '#cbd5e1' }}>Associate Registrations</span>
                <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '2px 8px', borderRadius: '9999px', fontWeight: 700, fontSize: '0.75rem' }}>2 Pending</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '12px', background: 'rgba(10, 14, 26, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.82rem' }}>
                <span style={{ color: '#cbd5e1' }}>Bank UTR Verifications</span>
                <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '9999px', fontWeight: 700, fontSize: '0.75rem' }}>3 Pending</span>
              </div>
            </div>
          </div>

          {/* Quick Layout Map Navigation Card */}
          <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 22, 36, 0.8) 100%)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: '22px', padding: '20px', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '0.76rem', color: '#34d399', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>GIS SPATIAL ENGINE</span>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
              60-Bigha Interactive Layout Map
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
              Explore full-screen interactive 980-plot canvas with zoom, pan, CAD blueprint & live availability.
            </p>
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('map')}
                style={{
                  marginTop: '6px',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)',
                }}
              >
                Launch Layout Map Canvas <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: LIVE TRANSACTION ACTIVITY & PROJECT HEALTH */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Realtime Activity Stream */}
        <div style={{ background: 'rgba(15, 22, 36, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '22px', padding: '20px', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="#f59e0b" />
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                Live System Activity Stream
              </h3>
            </div>
            <span style={{ fontSize: '0.74rem', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', padding: '3px 10px', borderRadius: '9999px', fontWeight: 700 }}>
              Realtime
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentActivities.map((act) => (
              <div key={act.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 12px', borderRadius: '12px', background: 'rgba(10, 14, 26, 0.4)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: act.color, marginTop: '6px', flexShrink: 0, boxShadow: `0 0 8px ${act.color}` }}></div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: act.color }}>{act.badge}</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{act.time}</span>
                  </div>
                  <strong style={{ fontSize: '0.84rem', color: '#ffffff' }}>{act.title}</strong>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>{act.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Health Progress */}
        <div style={{ background: 'rgba(15, 22, 36, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '22px', padding: '20px', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PieChartIcon size={18} color="#0ea5e9" />
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                Township Inventory & Health
              </h3>
            </div>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>980 Master Plots</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'rgba(10, 14, 26, 0.5)', borderRadius: '14px', padding: '14px', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
              <span style={{ fontSize: '0.74rem', color: '#34d399', fontWeight: 700 }}>OCCUPANCY RATE</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: '4px 0 2px 0' }}>{occupancyRate}%</div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>{bookedCount + soldCount} of {plots.length} plots allocated</p>
            </div>

            <div style={{ background: 'rgba(10, 14, 26, 0.5)', borderRadius: '14px', padding: '14px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <span style={{ fontSize: '0.74rem', color: '#ef4444', fontWeight: 700 }}>EXECUTED REGISTRIES</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: '4px 0 2px 0' }}>{soldCount}</div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Sub-Registrar Signed</p>
            </div>

            <div style={{ background: 'rgba(10, 14, 26, 0.5)', borderRadius: '14px', padding: '14px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <span style={{ fontSize: '0.74rem', color: '#f59e0b', fontWeight: 700 }}>TOKENS ON HOLD</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: '4px 0 2px 0' }}>{bookedCount}</div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Awaiting registry deed</p>
            </div>

            <div style={{ background: 'rgba(10, 14, 26, 0.5)', borderRadius: '14px', padding: '14px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              <span style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 700 }}>INFRASTRUCTURE</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: '4px 0 2px 0' }}>88%</div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Roads, Gate & Power done</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
