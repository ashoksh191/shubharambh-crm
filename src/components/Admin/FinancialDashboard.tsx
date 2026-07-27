import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Search,
  ArrowUpRight,
  Receipt
} from 'lucide-react';
import '../../styles/Dashboard.css';

export const FinancialDashboard: React.FC = () => {
  const { transactions, bookings, plots, users, currentUser, verifyPayment, wipeOutBooking } = useApp();
  const [activeTab, setActiveTab] = useState<'verification' | 'ledger' | 'reset'>('verification');
  const [searchUtr, setSearchUtr] = useState('');

  // Calculate Financial Metrics as per SRS Module 4
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

  return (
    <div>
      {/* Financial Overview Header */}
      <div style={{
        background: 'var(--bg-card)',
        padding: '24px',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border-color)',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-forest)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Receipt color="var(--accent-gold)" /> Financial & Accounting Command Center
          </h2>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Logged in as: <strong style={{ color: 'var(--primary-forest)' }}>{currentUser.name}</strong> ({currentUser.role.toUpperCase()})
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
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
            <RotateCcw size={16} /> Inventory Wipe-Out Control
          </button>
        </div>
      </div>

      {/* SRS Required 4 Key Financial Metrics */}
      <div className="dashboard-grid">
        <div className="kpi-card green">
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
        </div>

        <div className="kpi-card amber">
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
        </div>

        <div className="kpi-card gold">
          <div className="kpi-icon">
            <ArrowUpRight size={24} />
          </div>
          <div className="kpi-info">
            <h4>Total Payouts Distributed</h4>
            <div className="kpi-value">₹{(totalPayoutsDistributed / 100000).toFixed(2)} Lakhs</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Commissions Paid to Associates
            </span>
          </div>
        </div>

        <div className="kpi-card red">
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
        </div>
      </div>

      {/* Tab 1: UTR Verification Queue (Accountant Feature) */}
      {activeTab === 'verification' && (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-color)'
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
                      <td style={{ fontWeight: 700, color: 'var(--primary-forest)' }}>
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
                            title="Approve UTR & mark plot as officially Sold Out (Red)"
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
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
              🎉 All pending bank UTR transactions have been verified and processed!
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Full Transaction Ledger */}
      {activeTab === 'ledger' && (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-color)'
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
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.verifiedBy || 'System'}</td>
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
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--status-sold)' }}>
              Admin Inventory Reset ("Wipe Out" Stale Bookings)
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              SRS Rule: Reset plot status back to "Available" (Green) if customer fails to complete registry within 2-3 months.
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
    </div>
  );
};
