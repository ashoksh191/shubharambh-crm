import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Search,
  ArrowUpRight,
  Receipt,
  BarChart3,
  Award,
  PieChart,
  Zap,
} from 'lucide-react';
import '../../styles/Dashboard.css';

export const FinancialDashboard: React.FC = () => {
  const { transactions, bookings, plots, users, currentUser, verifyPayment, wipeOutBooking } = useApp();
  const [activeTab, setActiveTab] = useState<'analytics' | 'verification' | 'ledger' | 'reset'>('analytics');
  const [searchUtr, setSearchUtr] = useState('');

  // Calculate Financial Metrics
  const approvedTransactions = transactions.filter((t) => t.verificationStatus === 'approved');
  const pendingTransactions = transactions.filter((t) => t.verificationStatus === 'pending');

  const totalRevenueReceived = approvedTransactions.reduce((sum, t) => sum + t.amount, 0);

  const activeBookings = bookings.filter((b) => b.status !== 'cancelled');
  const totalBalanceDue = activeBookings.reduce((sum, b) => sum + b.balanceDue, 0);

  const totalPayoutsDistributed = users.reduce((sum, u) => sum + u.commissionPaid, 0);
  const pendingCommissions = users.reduce((sum, u) => sum + u.commissionPending, 0);

  // Filtered transactions for verification queue
  const filteredPendingTxns = pendingTransactions.filter(
    (t) =>
      t.utrNumber.toLowerCase().includes(searchUtr.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchUtr.toLowerCase()) ||
      t.bookingId.toLowerCase().includes(searchUtr.toLowerCase())
  );

  // Monthly Revenue Growth Data
  const monthlyRevenueData = useMemo(() => {
    return [
      { month: 'Jan', revenue: 18.5, target: 15 },
      { month: 'Feb', revenue: 24.2, target: 20 },
      { month: 'Mar', revenue: 32.8, target: 25 },
      { month: 'Apr', revenue: 29.4, target: 28 },
      { month: 'May', revenue: 41.0, target: 35 },
      { month: 'Jun', revenue: 48.6, target: 40 },
      { month: 'Jul', revenue: 56.2, target: 45 },
      { month: 'Aug', revenue: 64.0, target: 50 },
    ];
  }, []);

  // Conversion Funnel Metrics
  const funnelStages = useMemo(() => {
    return [
      { stage: 'Site Visits Scheduled', count: 1480, percent: 100, color: '#38bdf8' },
      { stage: 'Plot Inquiries Logged', count: 840, percent: 56.7, color: '#0284c7' },
      { stage: 'Advance Tokens Booked', count: 210, percent: 14.1, color: '#f59e0b' },
      { stage: 'Registries Completed', count: 168, percent: 11.3, color: '#10b981' },
    ];
  }, []);

  // Associate Leaderboard
  const associateLeaderboard = useMemo(() => {
    return [
      { rank: 1, name: 'Rajesh Sharma', level: 'Senior Vice President', volume: '₹1.84 Cr', plots: 14, commission: '₹9.2 Lakhs' },
      { rank: 2, name: 'Priya Verma', level: 'Vice President', volume: '₹1.42 Cr', plots: 11, commission: '₹7.1 Lakhs' },
      { rank: 3, name: 'Amitabh Gupta', level: 'Director', volume: '₹1.15 Cr', plots: 9, commission: '₹5.7 Lakhs' },
      { rank: 4, name: 'Sunita Yadav', level: 'Senior Associate', volume: '₹88 Lakhs', plots: 7, commission: '₹4.4 Lakhs' },
      { rank: 5, name: 'Vikram Singh', level: 'Associate', volume: '₹62 Lakhs', plots: 5, commission: '₹3.1 Lakhs' },
    ];
  }, []);

  // Sector Revenue Heatmap
  const sectorHeatmap = useMemo(() => {
    return [
      { sector: 'Block A (Main Boulevard)', totalPlots: 45, bookedPlots: 38, revenue: '₹3.8 Cr', rate: '94%' },
      { sector: 'Block B (Corner Premium)', totalPlots: 32, bookedPlots: 26, revenue: '₹2.6 Cr', rate: '81%' },
      { sector: 'Commercial Reserve', totalPlots: 18, bookedPlots: 15, revenue: '₹4.5 Cr', rate: '83%' },
      { sector: 'Park Facing Residency', totalPlots: 28, bookedPlots: 22, revenue: '₹2.1 Cr', rate: '78%' },
    ];
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Financial Overview Header */}
      <div style={{
        background: '#ffffff',
        padding: '24px',
        borderRadius: '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e2e8f0',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
            <Receipt color="#0284c7" /> Enterprise Analytics & Command Center
          </h2>
          <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Logged in as: <strong style={{ color: '#0284c7' }}>{currentUser.name}</strong> ({currentUser.role.toUpperCase()})
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className={`filter-chip ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
            style={{ padding: '8px 16px' }}
          >
            <BarChart3 size={16} /> Analytics Dashboard
          </button>
          <button
            className={`filter-chip ${activeTab === 'verification' ? 'active' : ''}`}
            onClick={() => setActiveTab('verification')}
            style={{ padding: '8px 16px' }}
          >
            <Clock size={16} /> UTR Verification Queue ({pendingTransactions.length})
          </button>
          <button
            className={`filter-chip ${activeTab === 'ledger' ? 'active' : ''}`}
            onClick={() => setActiveTab('ledger')}
            style={{ padding: '8px 16px' }}
          >
            <TrendingUp size={16} /> Transaction Ledger
          </button>
          <button
            className={`filter-chip ${activeTab === 'reset' ? 'active' : ''}`}
            onClick={() => setActiveTab('reset')}
            style={{ padding: '8px 16px' }}
          >
            <RotateCcw size={16} /> Wipe-Out Control
          </button>
        </div>
      </div>

      {/* SRS Required Key Financial Metrics */}
      <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="kpi-card green"
        >
          <div className="kpi-icon">
            <DollarSign size={24} />
          </div>
          <div className="kpi-info">
            <h4>Total Revenue Received</h4>
            <div className="kpi-value">₹{(totalRevenueReceived / 100000).toFixed(2)} Lakhs</div>
            <span style={{ fontSize: '0.75rem', color: '#047857' }}>
              Verified UTR Cash Inflow
            </span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="kpi-card amber"
        >
          <div className="kpi-icon">
            <Clock size={24} />
          </div>
          <div className="kpi-info">
            <h4>Total Balance Due</h4>
            <div className="kpi-value">₹{(totalBalanceDue / 100000).toFixed(2)} Lakhs</div>
            <span style={{ fontSize: '0.75rem', color: '#b45309' }}>
              Pending Customer Installments
            </span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="kpi-card gold"
        >
          <div className="kpi-icon">
            <ArrowUpRight size={24} />
          </div>
          <div className="kpi-info">
            <h4>Total Payouts Distributed</h4>
            <div className="kpi-value">₹{(totalPayoutsDistributed / 100000).toFixed(2)} Lakhs</div>
            <span style={{ fontSize: '0.75rem', color: '#0284c7' }}>
              Commissions Paid to Associates
            </span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="kpi-card red"
        >
          <div className="kpi-icon">
            <AlertCircle size={24} />
          </div>
          <div className="kpi-info">
            <h4>Pending Associate Commissions</h4>
            <div className="kpi-value">₹{(pendingCommissions / 100000).toFixed(2)} Lakhs</div>
            <span style={{ fontSize: '0.75rem', color: '#991b1b' }}>
              Awaiting Accountant Disbursement
            </span>
          </div>
        </motion.div>
      </div>

      {/* TAB 0: ENTERPRISE ANALYTICS DASHBOARD */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Revenue Growth Bar Chart & Conversion Funnel Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
            {/* Animated Monthly Revenue Growth Bar Chart */}
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart3 size={18} color="#0284c7" /> Monthly Revenue Growth (₹ Lakhs)
                </h3>
                <span style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0284c7', padding: '3px 10px', borderRadius: '9999px', fontWeight: 700 }}>
                  +28.4% YoY Growth
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '220px', padding: '0 10px 10px 10px', borderBottom: '1px solid #cbd5e1' }}>
                {monthlyRevenueData.map((d) => (
                  <div key={d.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0284c7' }}>₹{d.revenue}L</span>
                    <div style={{ width: '28px', height: '160px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(d.revenue / 70) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        style={{ width: '100%', background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)', borderRadius: '8px 8px 0 0' }}
                      />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>{d.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sales Conversion Funnel */}
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PieChart size={18} color="#f59e0b" /> Sales Conversion Funnel
                </h3>
                <span style={{ fontSize: '0.75rem', background: '#fef3c7', color: '#b45309', padding: '3px 10px', borderRadius: '9999px', fontWeight: 700 }}>
                  11.3% Conversion
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {funnelStages.map((st) => (
                  <div key={st.stage} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                      <span>{st.stage}</span>
                      <span style={{ color: st.color }}>{st.count} ({st.percent}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${st.percent}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        style={{ height: '100%', background: st.color, borderRadius: '9999px' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Associate Sales Leaderboard & Sector Revenue Heatmap */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '24px' }}>
            {/* Associate Sales Leaderboard */}
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} color="#f59e0b" /> Top Associate Sales Leaderboard
                </h3>
                <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#047857', padding: '3px 10px', borderRadius: '9999px', fontWeight: 700 }}>
                  Active Payouts
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="receipt-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Associate Name</th>
                      <th>Level</th>
                      <th>Sales Volume</th>
                      <th>Plots Booked</th>
                      <th>Commission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {associateLeaderboard.map((a) => (
                      <tr key={a.rank}>
                        <td style={{ fontWeight: 800, color: a.rank === 1 ? '#f59e0b' : '#0f172a' }}>#{a.rank}</td>
                        <td><strong>{a.name}</strong></td>
                        <td><span style={{ fontSize: '0.78rem', color: '#64748b' }}>{a.level}</span></td>
                        <td style={{ fontWeight: 700, color: '#0284c7' }}>{a.volume}</td>
                        <td style={{ fontWeight: 700 }}>{a.plots}</td>
                        <td style={{ fontWeight: 700, color: '#10b981' }}>{a.commission}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sector Revenue Density Heatmap */}
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={18} color="#0284c7" /> Sector Revenue Density
                </h3>
                <span style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0284c7', padding: '3px 10px', borderRadius: '9999px', fontWeight: 700 }}>
                  Layout GIS Sync
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sectorHeatmap.map((sec) => (
                  <div key={sec.sector} style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>{sec.sector}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{sec.bookedPlots} / {sec.totalPlots} Plots Sold ({sec.rate})</span>
                    </div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#10b981' }}>{sec.revenue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: UTR Verification Queue (Accountant Feature) */}
      {activeTab === 'verification' && (
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.15rem' }}>
              Pending Payment UTR Verification Queue ({pendingTransactions.length})
            </h3>
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search UTR / Customer / Booking ID..."
                value={searchUtr}
                onChange={(e) => setSearchUtr(e.target.value)}
              />
            </div>
          </div>

          {filteredPendingTxns.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="receipt-table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>Txn ID</th>
                    <th>Booking ID</th>
                    <th>Customer Name</th>
                    <th>Plot ID</th>
                    <th>Deposit Amount</th>
                    <th>Bank UTR Ref</th>
                    <th>Payment Mode</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'center' }}>Accountant Approval Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPendingTxns.map((txn) => (
                    <tr key={txn.txnId}>
                      <td><code>{txn.txnId}</code></td>
                      <td><strong>{txn.bookingId}</strong></td>
                      <td>{txn.customerName}</td>
                      <td>Plot {txn.plotId}</td>
                      <td style={{ fontWeight: 700, color: '#10b981' }}>
                        ₹{txn.amount.toLocaleString('en-IN')}
                      </td>
                      <td>
                        <code style={{ background: '#fef3c7', color: '#92400e', padding: '4px 8px', borderRadius: '4px', fontWeight: 700 }}>
                          {txn.utrNumber}
                        </code>
                      </td>
                      <td>{txn.paymentMode}</td>
                      <td>{txn.date}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            className="btn-gold"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => verifyPayment(txn.txnId, true)}
                            title="Approve UTR & mark plot as officially Sold Out"
                          >
                            <CheckCircle size={14} /> Approve UTR
                          </button>
                          <button
                            className="btn-danger"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => verifyPayment(txn.txnId, false)}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
              🎉 All pending bank UTR transactions have been verified and processed!
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Full Transaction Ledger */}
      {activeTab === 'ledger' && (
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Master Financial Transaction Audit Ledger</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="receipt-table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Txn ID</th>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>UTR Number</th>
                  <th>Mode</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Verified By</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.txnId}>
                    <td><code>{t.txnId}</code></td>
                    <td>{t.bookingId}</td>
                    <td>{t.customerName}</td>
                    <td style={{ fontWeight: 700 }}>₹{t.amount.toLocaleString('en-IN')}</td>
                    <td><code>{t.utrNumber}</code></td>
                    <td>{t.paymentMode}</td>
                    <td>{t.date}</td>
                    <td>
                      {t.verificationStatus === 'approved' && (
                        <span className="badge badge-available">Approved</span>
                      )}
                      {t.verificationStatus === 'pending' && (
                        <span className="badge badge-booked">Pending Audit</span>
                      )}
                      {t.verificationStatus === 'rejected' && (
                        <span className="badge badge-sold">Rejected</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{t.verifiedBy || 'System'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Admin Inventory Wipe-Out Reset Control */}
      {activeTab === 'reset' && (
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#ef4444' }}>
              Admin Inventory Reset ("Wipe Out" Stale Bookings)
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
              Reset plot status back to "Available" if customer fails to complete registry within 2-3 months.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="receipt-table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Plot No</th>
                  <th>Block</th>
                  <th>Current Status</th>
                  <th>Customer Name</th>
                  <th>Booking ID</th>
                  <th>Registry Due Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {plots.filter((p) => p.status !== 'available').map((plot) => {
                  const booking = bookings.find((b) => b.plotId === plot.id || b.bookingId === plot.bookingId);
                  return (
                    <tr key={plot.id}>
                      <td><strong>Plot {plot.plotNo}</strong></td>
                      <td>{plot.block}</td>
                      <td>
                        <span className={`badge badge-${plot.status}`}>
                          {plot.status.toUpperCase()}
                        </span>
                      </td>
                      <td>{booking ? booking.customerName : 'N/A'}</td>
                      <td>{booking ? booking.bookingId : 'N/A'}</td>
                      <td>{booking ? booking.registryDueDate : 'N/A'}</td>
                      <td>
                        <button
                          className="btn-danger"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          onClick={() => {
                            if (window.confirm(`Wipe Out booking for Plot ${plot.plotNo}? Status will reset to Available.`)) {
                              wipeOutBooking(plot.id);
                            }
                          }}
                        >
                          <RotateCcw size={14} /> Wipe Out (Reset to Green)
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
};
