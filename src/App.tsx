import React, { useState, useMemo, useEffect, lazy, Suspense, memo, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { RoleGuard } from './components/Auth/RoleGuard';
import { Sidebar } from './components/Navigation/Sidebar';
import { InteractiveMap } from './components/Map/InteractiveMap';
import { CommandPalette } from './components/UI/CommandPalette';
import { ToastContainer, type ToastMessage } from './components/UI/ToastContainer';
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Search,
  Bell,
  Calendar as CalendarIcon,
  DollarSign,
  TrendingDown,
  FileText,
  UserCheck,
  PieChart as PieChartIcon,
  Award,
  MapPin,
  FileCheck,
  CreditCard,
  Building,
  UserPlus,
  CloudSun,
  Database,
  CheckCircle,
  Download,
  PlusCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Plot } from './types';
import type { EnhancedPlot } from './types/propertyMap';
import './styles/App.css';

// Lazy Loaded Heavy Modules & Views
const AssociateDashboard = lazy(() =>
  import('./components/MLM/AssociateDashboard').then((m) => ({ default: m.AssociateDashboard }))
);
const FinancialDashboard = lazy(() =>
  import('./components/Admin/FinancialDashboard').then((m) => ({ default: m.FinancialDashboard }))
);
const USPShowcase = lazy(() =>
  import('./components/Public/USPShowcase').then((m) => ({ default: m.USPShowcase }))
);
const UserProfileDashboard = lazy(() =>
  import('./components/Dashboard/UserProfileDashboard').then((m) => ({ default: m.UserProfileDashboard }))
);
const AuditLogViewer = lazy(() =>
  import('./components/Admin/AuditLogViewer').then((m) => ({ default: m.AuditLogViewer }))
);
const PendingApprovals = lazy(() =>
  import('./components/Admin/PendingApprovals').then((m) => ({ default: m.PendingApprovals }))
);
const BookingFormModal = lazy(() =>
  import('./components/Booking/BookingFormModal').then((m) => ({ default: m.BookingFormModal }))
);
const ReceiptPDF = lazy(() =>
  import('./components/Documents/ReceiptPDF').then((m) => ({ default: m.ReceiptPDF }))
);
const AgreementBond = lazy(() =>
  import('./components/Documents/AgreementBond').then((m) => ({ default: m.AgreementBond }))
);
const QRVerificationModal = lazy(() =>
  import('./components/Documents/QRVerificationModal').then((m) => ({ default: m.QRVerificationModal }))
);

const ComponentFallback = memo(() => (
  <div className="component-fallback-container">
    <Loader2 className="animate-spin" size={26} color="#0EA5E9" />
    <span>Loading Enterprise Module...</span>
  </div>
));
ComponentFallback.displayName = 'ComponentFallback';

// Live Animated Counter Helper Component
const AnimatedCount: React.FC<{ value: number; prefix?: string; suffix?: string }> = memo(({ value, prefix = '', suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }
    const duration = 650;
    const stepTime = 16;
    const steps = Math.ceil(duration / stepTime);
    const increment = (end - start) / steps;
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
});
AnimatedCount.displayName = 'AnimatedCount';

// MEMOIZED ENTERPRISE ANALYTICS KPI CARD COMPONENT
interface KpiData {
  id: string;
  title: string;
  value: number;
  prefix: string;
  suffix: string;
  trend: string;
  isUp: boolean;
  icon: React.FC<{ size?: number }>;
  color: string;
  gradient: string;
  desc: string;
  sparkline: string;
}

const KpiCardItem = memo<{ kpi: KpiData; index: number }>(({ kpi, index }) => {
  const IconComp = kpi.icon;
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, scale: 1.02 }}
      onMouseMove={handleMouseMove}
      className="enterprise-kpi-card-28px"
      style={{
        background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.75) 80%)`,
        borderColor: `${kpi.color}35`,
      }}
    >
      {/* Top Header: Title & Color-Coded Animated Badge */}
      <div className="kpi-card-top-row">
        <span className="kpi-card-label-title">{kpi.title}</span>
        <motion.div
          whileHover={{ rotate: 12, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="kpi-icon-badge-box"
          style={{ background: `${kpi.color}15`, color: kpi.color, border: `1px solid ${kpi.color}30` }}
        >
          <IconComp size={20} />
        </motion.div>
      </div>

      {/* Center Row: Extra Large Animated Count Value */}
      <div className="kpi-card-center-row">
        <div className="kpi-hero-number-value" style={{ color: '#0F172A' }}>
          <AnimatedCount value={kpi.value} prefix={kpi.prefix} suffix={kpi.suffix} />
        </div>
        <span className="kpi-sub-caption-text">{kpi.desc}</span>
      </div>

      {/* Bottom Row: Trend Pill & Animated SVG Sparkline */}
      <div className="kpi-card-bottom-row">
        <div className={`kpi-change-indicator-pill ${kpi.isUp ? 'up' : 'down'}`}>
          {kpi.isUp ? <ArrowUpRight size={13} /> : <TrendingDown size={13} />}
          <span>{kpi.trend}</span>
        </div>

        <svg className="kpi-animated-sparkline-svg" viewBox="0 0 100 28">
          <defs>
            <linearGradient id={`sparklineGrad-${kpi.id}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={kpi.color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={kpi.color} stopOpacity="1" />
            </linearGradient>
          </defs>
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: index * 0.1 }}
            d={kpi.sparkline}
            fill="none"
            stroke={`url(#sparklineGrad-${kpi.id})`}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </motion.div>
  );
});
KpiCardItem.displayName = 'KpiCardItem';

const MainLayout: React.FC = () => {
  const { plots } = useApp();
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'map' | 'mlm' | 'finance' | 'usps' | 'profile' | 'audit' | 'approvals'>('map');
  const [chartTimeframe, setChartTimeframe] = useState<'7D' | '30D' | '90D' | '1Y'>('30D');

  // Command Palette & Toast System States
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modal States
  const [selectedBookingPlot, setSelectedBookingPlot] = useState<Plot | null>(null);
  const [activeReceiptBookingId, setActiveReceiptBookingId] = useState<string | null>(null);
  const [activeBondBookingId, setActiveBondBookingId] = useState<string | null>(null);
  const [activeQRBookingId, setActiveQRBookingId] = useState<string | null>(null);

  // Time & Date Clock State
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Global Ctrl + K Keyboard Shortcut Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addToast = useCallback((type: ToastMessage['type'], title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Memoized Inventory Metrics
  const { availableCount, bookedCount, soldCount, occupancyRate } = useMemo(() => {
    let available = 0;
    let booked = 0;
    let sold = 0;
    for (let i = 0; i < plots.length; i++) {
      const status = plots[i].status;
      if (status === 'available') available++;
      else if (status === 'booked') booked++;
      else if (status === 'sold') sold++;
    }
    const total = plots.length || 1;
    const rate = Math.round(((booked + sold) / total) * 100);
    return { availableCount: available, bookedCount: booked, soldCount: sold, occupancyRate: rate };
  }, [plots]);

  const userName = authUser?.fullName || authUser?.username || 'Vikramaditya Singh';

  // 6 Premium Enterprise KPI Cards Data
  const kpiCards: KpiData[] = useMemo(() => {
    return [
      { id: 'available', title: 'Available Inventory', value: availableCount, prefix: '', suffix: ' Plots', trend: '+4.2%', isUp: true, icon: CheckCircle2, color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #059669)', desc: 'Ready for instant booking', sparkline: 'M0,20 Q25,8 50,16 T100,4' },
      { id: 'booked', title: 'Booked Today', value: 3, prefix: '', suffix: ' Plots', trend: '+12.5%', isUp: true, icon: Clock, color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)', desc: 'Advance token confirmed', sparkline: 'M0,22 Q25,14 50,8 T100,2' },
      { id: 'today-rev', title: "Today's Revenue", value: 150000, prefix: '₹', suffix: '', trend: '+18.4%', isUp: true, icon: DollarSign, color: '#0EA5E9', gradient: 'linear-gradient(135deg, #0EA5E9, #2563EB)', desc: 'Verified UTR inflow', sparkline: 'M0,24 Q25,18 50,10 T100,2' },
      { id: 'monthly-rev', title: 'Monthly Revenue', value: 6400000, prefix: '₹', suffix: '', trend: '+28.4%', isUp: true, icon: TrendingUp, color: '#A855F7', gradient: 'linear-gradient(135deg, #A855F7, #7C3AED)', desc: 'Target: ₹75.0 Lakhs', sparkline: 'M0,20 Q25,12 50,14 T100,4' },
      { id: 'approvals', title: 'Pending Approvals', value: 2, prefix: '', suffix: ' Requests', trend: '-2.4%', isUp: false, icon: UserCheck, color: '#EF4444', gradient: 'linear-gradient(135deg, #EF4444, #DC2626)', desc: 'Registration & KYC Audit', sparkline: 'M0,4 Q25,10 50,16 T100,24' },
      { id: 'collection', title: 'Collection Rate', value: 94.8, prefix: '', suffix: '%', trend: '+3.1%', isUp: true, icon: ShieldCheck, color: '#38BDF8', gradient: 'linear-gradient(135deg, #38BDF8, #0284C7)', desc: 'Installment UTR Efficiency', sparkline: 'M0,18 Q25,10 50,6 T100,2' },
    ];
  }, [availableCount]);

  // Recent Activity Timeline
  const recentActivities = useMemo(() => {
    return [
      { id: '1', title: 'New Plot 104 Booked', desc: 'Customer Ramesh Kumar paid ₹50,000 token via Bank HDFC UTR', time: '10 mins ago', badge: 'NEW BOOKING', color: '#10B981' },
      { id: '2', title: 'Payment UTR Verified', desc: 'Accountant approved ₹4,50,000 second installment for Plot A-12', time: '35 mins ago', badge: 'PAYMENT RECEIVED', color: '#0EA5E9' },
      { id: '3', title: 'Sub-Registrar Deed Executed', desc: 'Plot B-45 Registry Deed successfully completed & signed', time: '2 hours ago', badge: 'REGISTRY COMPLETED', color: '#A855F7' },
      { id: '4', title: 'User Registration Pending', desc: 'Level-2 Associate request queued for Super Admin approval', time: '3 hours ago', badge: 'APPROVAL PENDING', color: '#F59E0B' },
    ];
  }, []);

  // Top Performing Associates Leaderboard
  const topAssociates = useMemo(() => {
    return [
      { rank: 1, name: 'Rajesh Sharma', level: 'Senior VP', sales: 14, revenue: '₹1.84 Cr', conversion: '32.4%', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
      { rank: 2, name: 'Priya Verma', level: 'Vice President', sales: 11, revenue: '₹1.42 Cr', conversion: '28.1%', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80' },
      { rank: 3, name: 'Amitabh Gupta', level: 'Director', sales: 9, revenue: '₹1.15 Cr', conversion: '24.6%', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
      { rank: 4, name: 'Sunita Yadav', level: 'Senior Associate', sales: 7, revenue: '₹88 Lakhs', conversion: '21.0%', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
    ];
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const formattedTime = currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="sidebar-app-layout">
      {/* Left Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Right Main Viewport */}
      <div className="main-viewport-container">
        {/* REDESIGNED EXECUTIVE COMMAND CENTER MAIN HEADER */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="executive-command-center-header"
        >
          {/* Ambient Soft Glowing Radial Blobs */}
          <div className="header-ambient-glow-blob top-left"></div>
          <div className="header-ambient-glow-blob bottom-right"></div>
          <div className="header-subtle-grid-overlay"></div>

          {/* LEFT SIDE: HERO GREETING & SYNOPSIS */}
          <div className="header-left-hero-block">
            <div className="header-small-label-tag">
              <span className="live-status-pulse-dot"></span>
              EXECUTIVE COMMAND CENTER
            </div>

            <h1 className="header-hero-greeting-title">
              Good Morning,<br />
              <span className="greeting-user-name">{userName}</span>
              <motion.span
                animate={{ rotate: [0, 14, -8, 14, 0] }}
                transition={{ repeat: Infinity, repeatDelay: 3, duration: 1.5 }}
                style={{ display: 'inline-block', marginLeft: '10px', transformOrigin: '70% 70%' }}
              >
                👋
              </motion.span>
            </h1>

            <p className="header-synopsis-sentence">
              Real-time township monitoring, sales analytics, booking intelligence and financial overview.
            </p>
          </div>

          {/* RIGHT SIDE: TELEMETRY GLASS PILLS & ANIMATED QUICK ACTIONS */}
          <div className="header-right-telemetry-block">
            {/* TOP ROW: TELEMETRY GLASS PILLS */}
            <div className="header-top-telemetry-pills-row">
              <div className="telemetry-glass-pill">
                <CalendarIcon size={14} color="#0EA5E9" />
                <span>{formattedDate}</span>
              </div>

              <div className="telemetry-glass-pill">
                <Clock size={14} color="#10B981" />
                <strong>{formattedTime}</strong>
              </div>

              <div className="telemetry-glass-pill">
                <CloudSun size={14} color="#F59E0B" />
                <span>⛅ 28°C Lucknow</span>
              </div>

              <div className="telemetry-glass-pill">
                <span className="live-online-user-dot"></span>
                <span>48 Active</span>
              </div>

              <div className="telemetry-glass-pill">
                <Database size={13} color="#10B981" />
                <span>🟢 Connected</span>
              </div>

              <div className="telemetry-glass-pill">
                <CheckCircle size={13} color="#10B981" />
                <span>🟢 Operational</span>
              </div>

              <div className="header-icon-actions-group">
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  className="glass-icon-btn notification"
                  onClick={() => addToast('info', 'Notifications', '2 Pending User Approvals & 3 UTR Verifications queued.')}
                  title="Notification Center"
                >
                  <Bell size={18} />
                  <span className="glass-badge-counter">2</span>
                </motion.button>

                <div className="header-user-avatar-glass" title={`${userName} (Super Admin)`}>
                  <span>{userName.charAt(0)}</span>
                </div>
              </div>
            </div>

            {/* BELOW ROW: ANIMATED QUICK ACTION BUTTONS */}
            <div className="header-below-quick-actions-row">
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="header-quick-action-btn primary"
                onClick={() => {
                  setActiveTab('map');
                  addToast('info', 'New Booking', 'Select an available plot on the layout map grid to book');
                }}
              >
                <PlusCircle size={15} /> + New Booking
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="header-quick-action-btn"
                onClick={() => {
                  setActiveTab('approvals');
                  addToast('info', 'Add Customer', 'Navigated to Pending User Approvals & Customer Registration');
                }}
              >
                <UserPlus size={15} /> + Add Customer
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="header-quick-action-btn"
                onClick={() => setActiveTab('map')}
              >
                <MapPin size={15} /> Open GIS Map
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="header-quick-action-btn"
                onClick={() => {
                  setActiveTab('finance');
                  addToast('success', 'Report Generated', 'Master Financial & Inventory Report ready');
                }}
              >
                <FileText size={15} /> Generate Report
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="header-quick-action-btn"
                onClick={() => {
                  addToast('info', 'Export Started', 'Exporting township inventory dataset to CSV...');
                }}
              >
                <Download size={15} /> Export Data
              </motion.button>
            </div>
          </div>
        </motion.header>

        {/* FIRST ROW: REDESIGNED ENTERPRISE ANALYTICS KPI CARDS (28px Glassmorphism) */}
        <div className="kpi-cards-grid-28px">
          {kpiCards.map((kpi, idx) => (
            <KpiCardItem key={kpi.id} kpi={kpi} index={idx} />
          ))}
        </div>

        {/* SECOND ROW & RIGHT PANEL GRID (ANALYTICS AREA CHART + LIVE RECENT ACTIVITY) */}
        {activeTab === 'map' && (
          <div className="dashboard-second-row-grid">
            {/* Revenue & Booking Trend Area Chart Widget */}
            <div className="analytics-chart-card glass">
              <div className="chart-header">
                <div>
                  <h3 className="chart-title">Revenue & Booking Conversion Velocity</h3>
                  <span className="chart-subtitle">Real-time revenue inflow vs monthly target benchmark</span>
                </div>
                <div className="chart-timeframe-selector">
                  {(['7D', '30D', '90D', '1Y'] as const).map((tf) => (
                    <button
                      key={tf}
                      className={`timeframe-chip ${chartTimeframe === tf ? 'active' : ''}`}
                      onClick={() => setChartTimeframe(tf)}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Large Area Chart Visualisation */}
              <div className="area-chart-container">
                <svg className="area-chart-svg" viewBox="0 0 800 220" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0,180 Q 100,120 200,150 T 400,80 T 600,100 T 800,20 L 800,220 L 0,220 Z"
                    fill="url(#areaGradient)"
                  />
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    d="M 0,180 Q 100,120 200,150 T 400,80 T 600,100 T 800,20"
                    fill="none"
                    stroke="#0EA5E9"
                    strokeWidth="3.5"
                  />
                </svg>
                <div className="chart-x-axis-labels">
                  <span>Week 1</span>
                  <span>Week 2</span>
                  <span>Week 3</span>
                  <span>Week 4</span>
                  <span>Week 5</span>
                </div>
              </div>
            </div>

            {/* Right Activity Timeline Panel */}
            <div className="activity-timeline-card glass">
              <div className="timeline-header">
                <h3 className="timeline-title">
                  <Zap size={18} color="#F59E0B" /> Live Transaction Activity
                </h3>
                <span className="pulse-tag">Realtime Stream</span>
              </div>

              <div className="timeline-items-wrapper">
                {recentActivities.map((act) => (
                  <div key={act.id} className="timeline-item">
                    <div className="timeline-dot-connector" style={{ background: act.color }}></div>
                    <div className="timeline-content">
                      <div className="timeline-badge-row">
                        <span className="activity-badge" style={{ background: `${act.color}15`, color: act.color, border: `1px solid ${act.color}40` }}>
                          {act.badge}
                        </span>
                        <span className="activity-time">{act.time}</span>
                      </div>
                      <strong className="activity-item-title">{act.title}</strong>
                      <p className="activity-item-desc">{act.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* THIRD ROW: TOP PERFORMING ASSOCIATES LEADERBOARD */}
        {activeTab === 'map' && (
          <div className="dashboard-third-row">
            <div className="associates-leaderboard-card glass">
              <div className="leaderboard-header">
                <h3 className="leaderboard-title">
                  <Award size={18} color="#F59E0B" /> Top Performing Sales Associates
                </h3>
                <span className="leaderboard-badge">Monthly Revenue Rank</span>
              </div>

              <div className="associates-grid">
                {topAssociates.map((assoc) => (
                  <div key={assoc.rank} className="associate-rank-card">
                    <div className="rank-badge-number">#{assoc.rank}</div>
                    <img src={assoc.photo} alt={assoc.name} className="associate-avatar-img" />
                    <div className="associate-info-block">
                      <strong>{assoc.name}</strong>
                      <span>{assoc.level}</span>
                    </div>
                    <div className="associate-stat-pill">
                      <span className="stat-label">Sales</span>
                      <strong className="stat-val">{assoc.sales} Plots</strong>
                    </div>
                    <div className="associate-stat-pill">
                      <span className="stat-label">Revenue</span>
                      <strong className="stat-val green">{assoc.revenue}</strong>
                    </div>
                    <div className="associate-stat-pill">
                      <span className="stat-label">Conversion</span>
                      <strong className="stat-val blue">{assoc.conversion}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FOURTH ROW: PROJECT HEALTH PROGRESS RADIAL RINGS */}
        {activeTab === 'map' && (
          <div className="dashboard-fourth-row">
            <div className="project-health-card glass">
              <div className="health-header">
                <h3 className="health-title">
                  <PieChartIcon size={18} color="#0EA5E9" /> 60-Bigha Township Inventory & Project Health
                </h3>
                <span className="health-badge">Master Layout Allocation</span>
              </div>

              <div className="health-metrics-row">
                <div className="health-progress-item">
                  <div className="radial-progress green">
                    <span>{occupancyRate}%</span>
                  </div>
                  <strong>Inventory Occupancy</strong>
                  <p>{bookedCount + soldCount} of {plots.length} plots allocated</p>
                </div>

                <div className="health-progress-item">
                  <div className="radial-progress red">
                    <span>{Math.round((soldCount / plots.length) * 100)}%</span>
                  </div>
                  <strong>Executed Registries</strong>
                  <p>{soldCount} Plots Sub-Registrar Signed</p>
                </div>

                <div className="health-progress-item">
                  <div className="radial-progress amber">
                    <span>{Math.round((bookedCount / plots.length) * 100)}%</span>
                  </div>
                  <strong>Tokens & UTR Hold</strong>
                  <p>{bookedCount} Plots Awaiting Registry</p>
                </div>

                <div className="health-progress-item">
                  <div className="radial-progress blue">
                    <span>88%</span>
                  </div>
                  <strong>Construction Progress</strong>
                  <p>Roads, Electricity & Gate complete</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM FLOATING QUICK ACTIONS TOOLBAR */}
        <div className="bottom-quick-actions-bar">
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="quick-action-pill primary"
            onClick={() => setActiveTab('map')}
          >
            <Sparkles size={16} /> Book Plot
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="quick-action-pill"
            onClick={() => {
              setActiveTab('map');
              addToast('info', 'Receipt PDF', 'Select a plot or booking to generate PDF Receipt');
            }}
          >
            <FileText size={16} /> Generate Receipt
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="quick-action-pill"
            onClick={() => setIsCommandPaletteOpen(true)}
          >
            <Search size={16} /> Customer Search
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="quick-action-pill"
            onClick={() => setActiveTab('map')}
          >
            <MapPin size={16} /> View Map
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="quick-action-pill"
            onClick={() => setActiveTab('finance')}
          >
            <CreditCard size={16} /> Payment Entry
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="quick-action-pill"
            onClick={() => {
              setActiveTab('map');
              addToast('info', 'Registry Status', 'Inspect plot sub-registrar status on GIS canvas');
            }}
          >
            <Building size={16} /> Registry
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="quick-action-pill"
            onClick={() => {
              setActiveTab('map');
              addToast('info', 'Agreement Bond', 'Agreement Bond Generator ready');
            }}
          >
            <FileCheck size={16} /> Create Agreement
          </motion.button>
        </div>

        {/* Dynamic Module Content View */}
        <main className="main-content-body">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
            >
              <Suspense fallback={<ComponentFallback />}>
                {activeTab === 'map' && (
                  <InteractiveMap
                    onOpenBooking={(plot) => setSelectedBookingPlot(plot)}
                    onOpenReceipt={(bId) => setActiveReceiptBookingId(bId)}
                    onOpenBond={(bId) => setActiveBondBookingId(bId)}
                  />
                )}

                {activeTab === 'mlm' && <AssociateDashboard />}

                {activeTab === 'finance' && (
                  <RoleGuard
                    requiredPermissions="payments:approve"
                    fallback={
                      <div className="access-denied-card">
                        <h3>⛔ Access Denied</h3>
                        <p>You need the <strong>FINANCE</strong> or <strong>SUPER_ADMIN</strong> role to view payment approvals & financial dashboards.</p>
                      </div>
                    }
                  >
                    <FinancialDashboard />
                  </RoleGuard>
                )}

                {activeTab === 'usps' && <USPShowcase />}

                {activeTab === 'profile' && <UserProfileDashboard />}

                {activeTab === 'approvals' && (
                  <RoleGuard
                    requiredPermissions="users:manage_roles"
                    fallback={
                      <div className="access-denied-card">
                        <h3>⛔ Access Denied</h3>
                        <p>Only <strong>ADMIN</strong> and <strong>SUPER_ADMIN</strong> roles can review pending user registration requests.</p>
                      </div>
                    }
                  >
                    <PendingApprovals />
                  </RoleGuard>
                )}

                {activeTab === 'audit' && (
                  <RoleGuard
                    requiredPermissions="audit_logs:read"
                    fallback={
                      <div className="access-denied-card">
                        <h3>⛔ Access Denied</h3>
                        <p>Only <strong>ADMIN</strong> and <strong>SUPER_ADMIN</strong> roles can inspect enterprise security audit trails.</p>
                      </div>
                    }
                  >
                    <AuditLogViewer />
                  </RoleGuard>
                )}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Global Command Palette (Ctrl+K) */}
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onNavigateTab={(tab) => {
            setActiveTab(tab);
            addToast('success', 'Navigation', `Switched view to ${tab.toUpperCase()}`);
          }}
          onSelectPlot={(plot: EnhancedPlot) => {
            setSelectedBookingPlot(plot);
            addToast('info', 'Plot Selected', `Inspecting Plot ${plot.plotNo} (${plot.block})`);
          }}
        />

        {/* Global Toast System */}
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />

        {/* Lazy Loaded Modals */}
        <Suspense fallback={null}>
          {selectedBookingPlot && (
            <BookingFormModal
              plot={selectedBookingPlot}
              onClose={() => setSelectedBookingPlot(null)}
              onSuccess={(bId) => {
                setSelectedBookingPlot(null);
                setActiveReceiptBookingId(bId);
                addToast('success', 'Booking Confirmed', `Booking ${bId} created successfully! Token verified.`);
              }}
            />
          )}

          {activeReceiptBookingId && (
            <ReceiptPDF
              bookingId={activeReceiptBookingId}
              onClose={() => setActiveReceiptBookingId(null)}
              onOpenVerification={(bId) => setActiveQRBookingId(bId)}
            />
          )}

          {activeBondBookingId && (
            <AgreementBond
              bookingId={activeBondBookingId}
              onClose={() => setActiveBondBookingId(null)}
            />
          )}

          {activeQRBookingId && (
            <QRVerificationModal
              bookingId={activeQRBookingId}
              onClose={() => setActiveQRBookingId(null)}
            />
          )}
        </Suspense>

        {/* Mobile Bottom Navigation */}
        <div className="mobile-bottom-nav">
          <div className="mobile-bottom-nav-inner">
            <button
              className={`mobile-nav-btn ${activeTab === 'map' ? 'active' : ''}`}
              onClick={() => setActiveTab('map')}
            >
              <span style={{ fontSize: '1.2rem' }}>🗺️</span>
              <span>Map Grid</span>
            </button>
            <button
              className={`mobile-nav-btn ${activeTab === 'mlm' ? 'active' : ''}`}
              onClick={() => setActiveTab('mlm')}
            >
              <span style={{ fontSize: '1.2rem' }}>👥</span>
              <span>MLM Tree</span>
            </button>
            <button
              className={`mobile-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <span style={{ fontSize: '1.2rem' }}>👤</span>
              <span>Profile</span>
            </button>
            <button
              className={`mobile-nav-btn ${activeTab === 'usps' ? 'active' : ''}`}
              onClick={() => setActiveTab('usps')}
            >
              <span style={{ fontSize: '1.2rem' }}>🌟</span>
              <span>USPs</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="app-footer">
          <p>
            © 2026 <span>Shubharambh Green City</span> Advanced Enterprise Security System. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;
